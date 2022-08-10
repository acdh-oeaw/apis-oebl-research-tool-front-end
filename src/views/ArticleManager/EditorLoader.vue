  <template>
  <div class="editor-loader-container">
    <v-main>
      <v-container>
        <v-row>
          <v-col>
            <!-- We have three basic states: Loading, loaded and error -->
            <div v-if="loadingState === 'LOADING'">
              <div class="loading">
                <v-progress-circular indeterminate />
              </div>
            </div>
            <div v-else-if="loadingState === 'LOADED'">
              <div class="loaded-editor">
                <editor
                  :articleStore="articleStore"
                  :version="versionToEdit"
                  :tipTapEditor="tipTapEditor"
                />
              </div>
            </div>
            <div v-else-if="loadingState === 'ERROR'">
              <div class="loading-error">
                <v-alert type="error">{{ errorMessage }}</v-alert>
              </div>
            </div>
            <div v-else>
              <div class="state-error">
                <!-- There was an error. Please contact the technical support-team -->
                <v-alert type="error"
                  >Es gab leider einen internen Fehler. Bitte kontaktieren Sie
                  das technische Support-Team.</v-alert
                >
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import { ApiError, LemmaArticleVersion } from "@/api";
import {
  Content as TipTapContent,
  Editor as TipTapEditor,
} from "@tiptap/vue-2";

import TipTapStarterKit from "@tiptap/starter-kit";

import { Comment as CommentExtension } from "./extensionComment";
import { Annotation as AnnotationExtension } from "./extensionAnnotation";

import { ArticleStoreInterface, loadArticle } from "@/store/article";
import Editor from "./Editor.vue";

/**
 * A container for loading and passing data to the editor and conditionaly rendering it.
 */
@Component({
  components: {
    Editor,
  },
})
export default class EditorLoader extends Vue {
  @Prop() issueLemmaId!: number | null;

  articleStore: ArticleStoreInterface | null = null;
  tipTapEditor: TipTapEditor | null = null;
  versionToEdit: LemmaArticleVersion | null = null;
  loadingState: "LOADING" | "LOADED" | "ERROR" = "LOADING";
  errorMessage: string = "";

  /**
   * Setting the whole state of the module in a method, to avoid forgetting states on the way.
   */
  setState(
    loadingState: "LOADING" | "LOADED" | "ERROR",
    errorMessage: string = "",
    articleStore: ArticleStoreInterface | null = null,
    tipTapEditor: TipTapEditor | null = null,
    versionToEdit: LemmaArticleVersion | null = null
  ): void {
    this.loadingState = loadingState;
    this.errorMessage = errorMessage;
    this.articleStore = articleStore;
    this.tipTapEditor = tipTapEditor;
    this.versionToEdit = versionToEdit;
  }

  @Watch("issueLemmaId", { immediate: true })
  async loadArticleData(): Promise<void> {
    // This is almost poetical ;-)

    // Reset
    this.setState("LOADING");

    // The url param could not be parsed into a number, for example http://localhost:8080/article/THIS_IS_NOT_NUMBER
    if (this.issueLemmaId === null) {
      this.setState(
        "ERROR",
        // This URL is wrong. Contact the technical support team.
        `Diese URL ist leider nicht korrekt. Bitte nehmen Sie mit dem technischen Support-Team Kontakt auf.`
      );
      return;
    }

    // Try to load data – inform the user on failure
    // Unfortunatly, there is nothing to catch here,
    // because errors get catched in scr/api/core/requests.ts or src/service/requests.ts
    // and the user gets a global message,
    // but this component has no idea about that.
    let articleStore: ArticleStoreInterface = await loadArticle(this.issueLemmaId);

    // If anything went wrong however, we have no data,
    const newestVersion: LemmaArticleVersion | undefined =articleStore.newestVersion;

    // and give the user great feedback!
    if (newestVersion === undefined) {
      this.setState(
        "ERROR",
        // We could not load any version for this article.
        "Es konnte keine Version dieses Artikels geladen werden."
      );
      return;
    }

    // Create tap editor
    const tipTapEditor = new TipTapEditor({
      content: newestVersion.markup as TipTapContent,
      extensions: [CommentExtension, AnnotationExtension, TipTapStarterKit],
    });

    this.setState(
      "LOADED",
      "Alles geladen.",  // "Everything is loaded." – This will not been displayed.
      articleStore,
      tipTapEditor,
      newestVersion
    );
    return;
  }
}
</script>
