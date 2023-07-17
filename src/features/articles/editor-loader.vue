<script lang="ts" setup>
import TipTapStarterKit from "@tiptap/starter-kit";
import { type Content as TipTapContent, Editor as TipTapEditor } from "@tiptap/vue-2";
import { computed, ref, watch } from "vue";

import { type LemmaArticleVersion } from "@/api";
import Editor from "@/features/articles/editor.vue";
import { Annotation as AnnotationExtension } from "@/features/articles/extension-annotation";
import { Comment as CommentExtension } from "@/features/articles/extension-comment";
import ResizableDrawer from "@/features/ui/resizable-drawer.vue";
import {
	type ArticleStore,
	loadArticle,
	loadAssignments,
	type UserArticleAssignmentStoreInterface,
} from "@/store/article";

/**
 * A container for loading and passing data to the editor and conditionaly rendering it.
 */

const props = defineProps<{
	id: number;
}>();

const articleStore = ref<ArticleStore | null>(null);
const assignmentStore = ref<UserArticleAssignmentStoreInterface | null>(null);
const tipTapEditor = ref<TipTapEditor | null>(null);
const versionToEdit = ref<LemmaArticleVersion | null>(null);
const loadingState = ref<"ERROR" | "LOADED" | "LOADING">("LOADING");
const errorMessage = ref("");

const userCanView = ref(false);
const userCanComment = ref(false);
const userCanAnnotate = ref(false);
const userCanEditInAnyWay = ref(false);

const tab = ref(null);

/**
 * Setting the whole state of the start up of the module in a method, to avoid forgetting states on the way.
 */
function setState(
	_loadingState: "ERROR" | "LOADED" | "LOADING",
	_errorMessage = "",
	_articleStore: ArticleStore | null = null,
	_assignmentStore: UserArticleAssignmentStoreInterface | null = null,
	_tipTapEditor: TipTapEditor | null = null,
	_versionToEdit: LemmaArticleVersion | null = null,
): void {
	loadingState.value = _loadingState;
	errorMessage.value = _errorMessage;
	articleStore.value = _articleStore;
	assignmentStore.value = _assignmentStore;
	tipTapEditor.value = _tipTapEditor;
	versionToEdit.value = _versionToEdit;

	if (assignmentStore.value != null) {
		userCanView.value = assignmentStore.value.userCanView;
		userCanComment.value = assignmentStore.value.userCanComment;
		userCanAnnotate.value = assignmentStore.value.userCanAnnotate;
		userCanEditInAnyWay.value = assignmentStore.value.userCanEditInAnyWay;
	}
}

watch(
	() => props.id,
	async () => {
		// Reset
		setState("LOADING");

		// The url param could not be parsed into a number, for example http://localhost:8080/article/THIS_IS_NOT_NUMBER
		if (props.id == null) {
			setState(
				"ERROR",
				// This URL is wrong. Contact the technical support team.
				`Diese URL ist leider nicht korrekt. Bitte nehmen Sie mit dem technischen Support-Team Kontakt auf.`,
			);
			return;
		}

		const assignmentStore = await loadAssignments(props.id);

		if (!assignmentStore.userCanView) {
			setState(
				"ERROR",
				// You can't read this article. Contact the technical support team.
				"Sie können diesen Artikel leider nicht betrachten. Bitte wenden Sie sich an die Chefredaktion oder den techischen Support.",
			);
			return;
		}

		// Try to load data – inform the user on failure
		// Unfortunatly, there is nothing to catch here,
		// because errors get catched in scr/api/core/requests.ts or src/service/requests.ts
		// and the user gets a global message,
		// but this component has no idea about that.
		const articleStore: ArticleStore = await loadArticle(props.id);

		// If anything went wrong however, we have no data,
		const newestVersion: LemmaArticleVersion | undefined = articleStore.newestVersion;

		// and give the user great feedback!
		if (newestVersion == null) {
			setState(
				"ERROR",
				// We could not load any version for this article.
				"Es konnte keine Version dieses Artikels geladen werden.",
			);
			return;
		}

		// Create tap editor
		const tipTapEditor = createTipTapEditor(
			newestVersion.markup as TipTapContent,
			assignmentStore.userCanWrite,
		);

		setState(
			"LOADED",
			"Alles geladen.", // "Everything is loaded." – This will not been displayed.
			articleStore,
			assignmentStore,
			tipTapEditor,
			newestVersion,
		);
		return;
	},
	{ immediate: true },
);

const sortedVersionViews = computed(() => {
	if (articleStore.value == null) {
		return [];
	}

	type SavedArticleVersionWithDate = {
		id: number;
		date_created: Date;
		date_modified: Date;
	};

	const versionsWithDate: Array<SavedArticleVersionWithDate> = articleStore.value.versions.map(
		(version) => {
			return {
				id: version.id,
				date_created: new Date(version.date_created),
				date_modified: new Date(version.date_modified),
			};
		},
	);

	const sortedVersions = versionsWithDate.sort((version1, version2) => {
		if (version1.date_created > version2.date_created) {
			return 1;
		} else if (version1.date_created < version2.date_created) {
			return -1;
		}
		return 0;
	});

	return sortedVersions.map((version, index) => {
		return {
			id: version.id,
			ordinalNumber: index + 1,
			dateCreatedDELocale: version.date_created.toLocaleDateString("de"),
			dateModifiedDELocale: version.date_modified.toLocaleDateString("de"),
			isShownInEditor: versionToEdit.value != null && version.id === versionToEdit.value.id,
		};
	});
});

function selectVersion(versionId: number): void {
	if (articleStore.value == null) {
		console.error({
			message:
				"There must be some programming error. Article store should be loaded, when calling this method. Check it out.",
		});
		return;
	}

	const versionToSelect = articleStore.value.versions.find((version) => version.id === versionId);

	if (versionToSelect == null) {
		console.error({
			message:
				"There must be some programming error. This method should only be called with existing versions. Check it out.",
		});
		return;
	}

	versionToEdit.value = versionToSelect;

	tipTapEditor.value = createTipTapEditor(
		versionToEdit.value.markup as TipTapContent,
		versionToEdit.value.id != null &&
			articleStore.value.newestVersion != null &&
			versionToEdit.value.id === articleStore.value.newestVersion.id,
	);
}

function createTipTapEditor(content: TipTapContent, editable: boolean): TipTapEditor {
	if (tipTapEditor.value != null) {
		tipTapEditor.value.destroy();
	}

	return new TipTapEditor({
		content: content,
		editable: editable,
		extensions: [CommentExtension, AnnotationExtension, TipTapStarterKit],
	});
}

async function createNewVersion(): Promise<void> {
	if (articleStore.value == null || tipTapEditor.value == null) {
		console.error({
			message:
				"There must be some programming error. Article store and editor should be loaded, when calling this method. Check it out.",
		});
		return;
	}

	// Creatre a local copy of the objects
	const localStore = articleStore.value;
	const localEditor = tipTapEditor.value;

	// because the properties are set to null on loading
	setState("LOADING");

	// Adding a version, creates a new version / copy of the store
	const newStore = await localStore.addVersion(localEditor.getJSON());

	setState(
		"LOADED",
		"Alles geladen.", // "Everything is loaded." – This will not been displayed.
		newStore,
		assignmentStore.value,
		createTipTapEditor(
			newStore.newestVersion
				? (newStore.newestVersion.markup as TipTapContent)
				: "Fehler beim laden",
			true,
		),
		newStore.newestVersion,
	);
}

function toggleSidebar() {
	if (articleStore.value) {
		articleStore.value.showSidebar = !articleStore.value.showSidebar;
	}
}
</script>

<template>
	<div class="editor-loader-container">
		<VAppBar app flat>
			<VSpacer />
			<div v-if="articleStore">
				<VBtn
					v-if="!articleStore.showSidebar"
					tile
					class="rounded-lg"
					icon
					@click="toggleSidebar()"
				>
					<VIcon>mdi-dock-right</VIcon>
				</VBtn>
			</div>
		</VAppBar>

		<ResizableDrawer
			v-if="articleStore"
			color="background darken-1"
			:initial-width="articleStore.sideBarWidth"
			:min-width="300"
			:right="true"
			:visible="articleStore.showSidebar"
			@update:width="articleStore.sideBarWidth = $event"
		>
			<VCard
				class="transparent flex-column d-flex fill-height lemma-detail"
				elevation="0"
				@dragover.prevent=""
			>
				<VCardTitle class="flex-column pb-2">
					<div class="d-flex flex-row align-self-stretch">
						<VBtn
							style="margin-top: -8px; margin-right: -10px"
							width="48"
							height="48"
							tile
							class="rounded-lg"
							icon
							@click="toggleSidebar()"
						>
							<VIcon>mdi-dock-right</VIcon>
						</VBtn>
					</div>
				</VCardTitle>

				<VTabs v-model="tab" background-color="transparent">
					<VTab>Versionen ({{ sortedVersionViews.length }})</VTab>
					<VTab>Annotationen</VTab>
					<VTab>Kommentare</VTab>
					<VTabsSlider color="transparent"></VTabsSlider>

					<VTabsItems v-model="tab">
						<VTabItem>
							<span v-if="userCanEditInAnyWay" class="pl-3">
								<VBtn class="rounded-lg" elevation="0" color="primary" @click="createNewVersion()">
									Neue Version erstellen
								</VBtn>
							</span>
							<VList v-if="articleStore">
								<VListItem v-for="version in sortedVersionViews" :key="version.id">
									<template #default>
										<VListItemAction>
											<VSimpleCheckbox
												:disabled="version.isShownInEditor"
												:value="version.isShownInEditor"
												@click="selectVersion(version.id)"
											/>
										</VListItemAction>
										<VListItemContent>
											<VListItemTitle>Version Nr. {{ version.ordinalNumber }}</VListItemTitle>
											<VListItemSubtitle>
												erstellt am {{ version.dateCreatedDELocale }}
											</VListItemSubtitle>
											<VListItemSubtitle
												v-if="version.dateCreatedDELocale !== version.dateModifiedDELocale"
											>
												(bearbeitet: {{ version.dateModifiedDELocale }})
											</VListItemSubtitle>
										</VListItemContent>
									</template>
								</VListItem>
							</VList>
						</VTabItem>

						<VTabItem>
							<VCard flat>
								<VCardText>Annotationen</VCardText>
							</VCard>
						</VTabItem>

						<VTabItem>
							<VCard flat>
								<VCardText>Kommentare</VCardText>
							</VCard>
						</VTabItem>
					</VTabsItems>
				</VTabs>

				<VDivider />
			</VCard>
			<!--<article-detail :articleStore="articleStore">
      </article-detail>-->
		</ResizableDrawer>

		<VMain>
			<VContainer>
				<VRow class="editor-row">
					<VCol class="editor-col">
						<!-- We have three basic states: Loading, loaded and error -->
						<div v-if="loadingState === 'LOADING'">
							<div class="loading">
								<VProgressCircular indeterminate />
							</div>
						</div>
						<div v-else-if="loadingState === 'LOADED' && userCanView">
							<div class="loaded-editor">
								<Editor
									:article-store="articleStore"
									:version="versionToEdit"
									:tip-tap-editor="tipTapEditor"
									:user-can-annotate="userCanAnnotate"
									:user-can-comment="userCanComment"
								/>
							</div>
						</div>
						<div v-else-if="loadingState === 'ERROR'">
							<div class="loading-error">
								<VAlert type="error">{{ errorMessage }}</VAlert>
							</div>
						</div>
						<div v-else>
							<div class="state-error">
								<!-- There was an error. Please contact the technical support-team -->
								<VAlert type="error">
									Es gab leider einen internen Fehler. Bitte kontaktieren Sie das technische
									Support-Team.
								</VAlert>
							</div>
						</div>
					</VCol>
				</VRow>
			</VContainer>
		</VMain>
	</div>
</template>

<style scoped>
.v-tab {
	height: 36px;
	border-radius: 4px;
	letter-spacing: normal;
	text-transform: capitalize;
}

.v-tab--active {
	background-color: var(--v-background-darken5);
	color: hsl(0deg 0% 0%) !important;
	font-weight: 700;
}

.theme--light.v-list,
.theme--light.v-tabs-items {
	background: transparent;
}

.v-list-item__action:first-child {
	margin-right: 18px !important;
}

.v-list-item__title {
	font-size: 0.9rem;
}

.v-list-item__subtitle {
	font-size: 0.8rem;
}

.v-list-item__action .v-icon.v-icon {
	font-size: 18px;
}
</style>
