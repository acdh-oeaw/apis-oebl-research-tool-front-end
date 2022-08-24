  <template>
  <div class="editor-loader-container">
    <v-main>
      <v-container>
        <v-row class="version-list-row">
          <v-col class="version-list-col">
            <v-expansion-panels v-if="articleStore">
              <v-expansion-panel>
                <v-expansion-panel-header>
                  <span>Versionen ({{sortedVersionViews.length}})</span>
                  <span v-if="userCanEditInAnyWay">
                    <v-btn @click="createNewVersion()">Neue Version erstellen</v-btn>
                  </span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-container>
                    <v-row 
                      v-for="(version, index) in sortedVersionViews" 
                      :key="index" 
                      :class="version.isShownInEditor ? 'version-in-list grey lighten-2' : 'version-in-list'"
                    >
                      <v-col>
                        <span class="version-nr">Version Nr. {{version.ordinalNumber}} </span>  
                        <span>erstellt am {{version.dateCreatedDELocale}} </span>
                        <span v-if="version.dateCreatedDELocale !== version.dateModifiedDELocale">(bearbeitet: {{version.dateModifiedDELocale}}) </span>
                      </v-col>
                      <v-col>
                        <v-simple-checkbox
                          :disabled="version.isShownInEditor"
                          :value="version.isShownInEditor"
                          @click="selectVersion(version.id)"
                        />
                      </v-col>
                  </v-row>
                  </v-container>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <div v-else>
              <div class="loading">
                <v-progress-circular indeterminate />
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row class="editor-row">
          <v-col class="editor-col">
            <!-- We have three basic states: Loading, loaded and error -->
            <div v-if="loadingState === 'LOADING'">
              <div class="loading">
                <v-progress-circular indeterminate />
              </div>
            </div>
            <div v-else-if="loadingState === 'LOADED' && userCanView">
              <div class="loaded-editor">
                <editor
                  :articleStore="articleStore"
                  :version="versionToEdit"
                  :tipTapEditor="tipTapEditor"
                  :userCanAnnotate="userCanAnnotate"
                  :userCanComment="userCanComment"

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
import { LemmaArticleVersion } from "@/api";
import {
  Content as TipTapContent,
  Editor as TipTapEditor,
} from "@tiptap/vue-2";

import TipTapStarterKit from "@tiptap/starter-kit";

import { Comment as CommentExtension } from "./extensionComment";
import { Annotation as AnnotationExtension } from "./extensionAnnotation";

import { ArticleStoreInterface, loadArticle, loadAssignments, UserArticleAssignmentStoreInterface } from "@/store/article";
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
  assignmentStore: UserArticleAssignmentStoreInterface | null = null;
  tipTapEditor: TipTapEditor | null = null;
  versionToEdit: LemmaArticleVersion | null = null;
  loadingState: "LOADING" | "LOADED" | "ERROR" = "LOADING";
  errorMessage: string = "";

  userCanView: boolean = false;
  userCanComment: boolean = false;
  userCanAnnotate: boolean = false;
  userCanEditInAnyWay: boolean = false;


  /**
   * Setting the whole state of the start up of the module in a method, to avoid forgetting states on the way.
   */
  setState(
    loadingState: "LOADING" | "LOADED" | "ERROR",
    errorMessage: string = "",
    articleStore: ArticleStoreInterface | null = null,
    assignmentStore: UserArticleAssignmentStoreInterface | null = null,
    tipTapEditor: TipTapEditor | null = null,
    versionToEdit: LemmaArticleVersion | null = null
  ): void {
    this.loadingState = loadingState;
    this.errorMessage = errorMessage;
    this.articleStore = articleStore;
    this.assignmentStore = assignmentStore;
    this.tipTapEditor = tipTapEditor;
    this.versionToEdit = versionToEdit;

    if (this.assignmentStore !== null) {
      this.userCanView = this.assignmentStore.userCanView;
      this.userCanComment = this.assignmentStore.userCanComment;
      this.userCanAnnotate = this.assignmentStore.userCanAnnotate;
      this.userCanEditInAnyWay = this.assignmentStore.userCanEditInAnyWay;
    }
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

    const assignmentStore = await loadAssignments(this.issueLemmaId);

    if (!assignmentStore.userCanView) {
      this.setState(
        "ERROR",
        // You can't read this article. Contact the technical support team.
        "Sie können diesen Artikel leider nicht betrachten. Bitte wenden Sie sich an die Chefredaktion oder den techischen Support."
      );
      return;
    }


    // Try to load data – inform the user on failure
    // Unfortunatly, there is nothing to catch here,
    // because errors get catched in scr/api/core/requests.ts or src/service/requests.ts
    // and the user gets a global message,
    // but this component has no idea about that.
    const articleStore: ArticleStoreInterface = await loadArticle(this.issueLemmaId);

    // If anything went wrong however, we have no data,
    const newestVersion: LemmaArticleVersion | undefined = articleStore.newestVersion;

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
    const tipTapEditor = this.createTipTapEditor(newestVersion.markup as TipTapContent, assignmentStore.userCanWrite);

    this.setState(
      "LOADED",
      "Alles geladen.",  // "Everything is loaded." – This will not been displayed.
      articleStore,
      assignmentStore,
      tipTapEditor,
      newestVersion
    );
    return;
  }

  get sortedVersionViews(): Array<
    {
      id: number, 
      ordinalNumber: number,
      dateCreatedDELocale: string,
      dateModifiedDELocale: string,
      isShownInEditor: boolean,
      }
  > {
      if (this.articleStore === null) {
        return [];
      }
      type SavedArticleVersionWithDate = { 
          id: number,
          date_created: Date, date_modified: Date,
        };
      const versionsWithDate: SavedArticleVersionWithDate[] = this.articleStore.versions.map(
        version => {
          return {
            id: version.id, 
            date_created: new Date(version.date_created), 
            date_modified: new Date(version.date_modified),
          };
        }
      );
       const sortedVersions = versionsWithDate.sort(
         (version1, version2) => {
           if (version1.date_created > version2.date_created) {
             return 1;
           } else if (version1.date_created < version2.date_created) {
             return -1;
           }
           return 0;
         }
        );

      return sortedVersions.map(
        (version, index) => {
          return {
            id: version.id,
            ordinalNumber: index + 1,
            dateCreatedDELocale: version.date_created.toLocaleDateString('de'),
            dateModifiedDELocale: version.date_modified.toLocaleDateString('de'),
            isShownInEditor: this.versionToEdit !== null &&   version.id === this.versionToEdit.id
          };
        }
      );
     }

     selectVersion(versionId: number): void {
       if (this.articleStore === null) {
         console.error({message: 'There must be some programming error. Article store should be loaded, when calling this method. Check it out.'});
         return;
       }
       const versionToSelect = this.articleStore.versions.find(version => version.id === versionId);
      if (versionToSelect === undefined) {
         console.error({message: 'There must be some programming error. This method should only be called with existing versions. Check it out.'});
         return;
       }
       this.versionToEdit = versionToSelect;
       this.tipTapEditor = this.createTipTapEditor(
         this.versionToEdit.markup as TipTapContent, 
         (
           this.versionToEdit.id !== undefined
          && this.articleStore.newestVersion !== undefined 
          && this.versionToEdit.id === this.articleStore.newestVersion.id
          )
        );
  }

  createTipTapEditor(content: TipTapContent, editable: boolean): TipTapEditor{
    if (this.tipTapEditor !== null) {
      this.tipTapEditor.destroy();
    }
    return new TipTapEditor({
      content: content,
      editable: editable,
      extensions: [CommentExtension, AnnotationExtension, TipTapStarterKit],
    });;
  }

  async createNewVersion(): Promise<void> {
    if (this.articleStore === null || this.tipTapEditor === null) {
         console.error({message: 'There must be some programming error. Article store and editor should be loaded, when calling this method. Check it out.'});
         return;
    }
    // Creatre a local copy of the objects
    const localStore = this.articleStore;
    const localEditor = this.tipTapEditor;
    // because the properties are set to null on loading
    this.setState("LOADING");
    // Adding a version, creates a new version / copy of the store
    const newStore = await localStore.addVersion(localEditor.getJSON());
    this.setState(
      "LOADED",
      "Alles geladen.",  // "Everything is loaded." – This will not been displayed.
      newStore,
      this.assignmentStore,
      this.createTipTapEditor(
        newStore.newestVersion ? newStore.newestVersion.markup as TipTapContent : 'Fehler beim laden', true
      ),
      newStore.newestVersion,
    );
  }
}
</script>
