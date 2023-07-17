<script lang="ts" setup>
import { type Editor as TipTapEditor, EditorContent as TipTapEditorContent } from "@tiptap/vue-2";
import { computed, onScopeDispose, ref } from "vue";

import { type LemmaArticleVersion } from "@/api";
import CharPicker from "@/features/articles/char-picker.vue";
import SelectMenu from "@/features/ui/select-menu.vue";
import { type ArticleStore, type Markup } from "@/store/article";

/**
 * Edits a single version of an article.
 */

const props = defineProps<{
	articleStore: ArticleStore;
	version: LemmaArticleVersion;
	tipTapEditor: TipTapEditor;
	userCanAnnotate: boolean;
	userCanComment: boolean;
}>();

function dateToLocale(isoDate?: string): string {
	return isoDate == null
		? "(Das Datum konnte nicht ermittelt werden)"
		: new Date(isoDate).toLocaleString("de");
}

const formattingItems = [
	{
		name: "Text",
		value: "paragraph",
		isActive: (e: TipTapEditor) => e.isActive("paragraph"),
		onSelect: (e: TipTapEditor) => e.chain().focus().setParagraph().run(),
	},
	{
		name: "Überschrift 1",
		value: "heading-1",
		isActive: (e: TipTapEditor) => e.isActive("heading", { level: 1 }),
		onSelect: (e: TipTapEditor) => e.chain().focus().setHeading({ level: 1 }).run(),
	},
	{
		name: "Überschrift 2",
		value: "heading-2",
		isActive: (e: TipTapEditor) => e.isActive("heading", { level: 2 }),
		onSelect: (e: TipTapEditor) => e.chain().focus().setHeading({ level: 2 }).run(),
	},
];

const activeFormatting = ref(formattingItems[0]);

async function save(): Promise<void> {
	const markup = props.tipTapEditor.getJSON();
	if (markup == null) {
		return;
	}
	await props.articleStore.updateMarkup(markup as Markup);
}

function onSelectFormatting(v: any) {
	// FIXME: ???
	v.onSelect(props.tipTapEditor);
}

function insertAnnotation(): void {
	props.tipTapEditor.chain().focus().toggleAnnotation().run();
}

function insertComment(): void {
	props.tipTapEditor.chain().focus().toggleComment().run();
}

function insertSpecialChar(char: string): void {
	props.tipTapEditor.commands.insertContentAt(props.tipTapEditor.view.state.selection, char);
}

const undoPossible = computed(() => {
	return props.tipTapEditor.can().undo();
});

function undo(): void {
	props.tipTapEditor.chain().focus().undo().run();
}

function redoPossible(): boolean {
	return props.tipTapEditor.can().redo();
}

function redo(): void {
	props.tipTapEditor.chain().focus().redo().run();
}

onScopeDispose(() => {
	props.tipTapEditor.destroy();
});
</script>

<template>
	<div class="editor-container">
		<div>
			<div>
				<h1 class="editor-title text-h5">Version vom {{ dateToLocale(version.date_created) }}</h1>
			</div>

			<VSpacer />

			<VSlideGroup class="">
				<VSlideItem>
					<VCard color="background darken-2" elevation="0" class="ml-5 rounded-lg pa-1">
						<div class="tb-tooltip caption muted">
							<div>Zuletzt gespeichert</div>
							<div>{{ dateToLocale(version.date_modified) }}</div>
						</div>
					</VCard>
				</VSlideItem>

				<VSlideItem>
					<VCard color="background darken-2" elevation="0" class="ml-5 rounded-lg pa-1">
						<div class="tb-tooltip caption muted">Format</div>
						<SelectMenu
							:hide-searchbar="true"
							:show-chevron="true"
							class="rounded-lg"
							btn-class="pl-2"
							style="width: 100px"
							:items="formattingItems"
							:value="activeFormatting"
							@input="onSelectFormatting"
						/>
					</VCard>
				</VSlideItem>

				<VSlideItem>
					<VCard color="background darken-2" elevation="0" class="rounded-lg pa-1 ml-5 mr-5">
						<div class="tb-tooltip caption muted">Einfügen</div>
						<VBtn class="rounded-lg" small text @click="insertAnnotation">
							<VIcon small left>mdi-earth</VIcon>
							Annotation
						</VBtn>
						<VBtn class="rounded-lg" small text @click="insertComment">
							<VIcon small left>mdi-message-outline</VIcon>
							Kommentar
						</VBtn>
						<CharPicker @input="insertSpecialChar" />
					</VCard>
				</VSlideItem>

				<VSlideItem>
					<VCard color="background darken-2" elevation="0" class="rounded-lg pa-1 ml-5 mr-5">
						<div class="tb-tooltip caption muted transparent--text">Speichern</div>
						<VBtn class="rounded-lg" small text @click="save">
							<VIcon small left>mdi-content-save</VIcon>
							Speichern
						</VBtn>
					</VCard>
				</VSlideItem>

				<VSlideItem>
					<VMenu :close-on-content-click="false">
						<template #activator="{ on, attrs }">
							<VBtn v-bind="attrs" tile class="rounded-lg ml-5" icon v-on="on">
								<VIcon>mdi-dots-horizontal-circle-outline</VIcon>
							</VBtn>
						</template>

						<VList class="text-body-2 rounded-lg elevation-0 x-dense" dense nav>
							<VListItem :disabled="!undoPossible" @click="undo">
								<VListItemAvatar><VIcon small>mdi-undo</VIcon></VListItemAvatar>
								<VListItemContent>Rückgängig</VListItemContent>
								<VListItemActionText class="ml-3">STRG+Z</VListItemActionText>
							</VListItem>

							<VListItem :disabled="!redoPossible" @click="redo">
								<VListItemAvatar><VIcon small>mdi-redo</VIcon></VListItemAvatar>
								<VListItemContent>Wiederholen</VListItemContent>
								<VListItemActionText class="ml-3">STRG+Y</VListItemActionText>
							</VListItem>
							<v-divider />
						</VList>
					</VMenu>
				</VSlideItem>
			</VSlideGroup>
		</div>

		<VMain class="px-0">
			<div class="px-5 mt-5 pb-5 mb-5 outer-editor mx-auto">
				<TipTapEditorContent class="tiptap-editor" :editor="tipTapEditor" />
			</div>
		</VMain>
	</div>
</template>

<style scoped>
.editor-container :deep(comment) {
	background: var(--v-comment-base);
}

.editor-container :deep(mark[data-entitytype-type="person"]) {
	background: var(--v-annotation_person-base);
}

.editor-container :deep(mark[data-entitytype-type="place"]) {
	background: var(--v-annotation_place-base);
}

.editor-container :deep(mark[data-entitytype-type="institution"]) {
	background: var(--v-annotation_institution-base);
}

.editor-container :deep(mark[data-entitytype-type="event"]) {
	background: var(--v-annotation_event-base);
}

.editor-container :deep(mark[data-entitytype-type="work"]) {
	background: var(--v-annotation_work-base);
}
</style>
