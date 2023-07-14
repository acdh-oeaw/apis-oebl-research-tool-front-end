<script lang="ts" setup>
import { groupBy, isNonEmptyArray } from "@acdh-oeaw/lib";
import fileDialog from "file-dialog";
import { debounce } from "lodash";
import { ref } from "vue";

import { GenderAe0Enum, type List } from "@/api";
import LemmaPrintPreviewButton from "@/features/common/lemma-print-preview-button.vue";
import FullNameArrayField from "@/features/lemmata/details/full-name-array-field.vue";
import ProfessionGroupField from "@/features/lemmata/details/profession-group-field.vue";
import LemmaScrapeResult from "@/features/lemmata/lemma-scrape-result.vue";
import LobidPreviewCard from "@/features/lemmata/lobid-preview-card.vue";
import DateField from "@/features/ui/date-field.vue";
import SelectMenu from "@/features/ui/select-menu.vue";
import TextField from "@/features/ui/text-field.vue";
import TextFieldAlternatives from "@/features/ui/text-field-alternatives.vue";
import { getYear } from "@/lib/get-year";
import { lemmaRowTranslations } from "@/lib/labels";
import store from "@/store";
import confirm from "@/store/confirm";
import { type LemmaRow } from "@/types/lemma";
import VueFileList from "@/views/LemmaManager/FileList.vue";
import LobidGndSearch from "@/views/LemmaManager/LobidGndSearch.vue";
import ZoteroManager from "@/views/LemmaManager/ZoteroManager.vue";

const dragClassName = "drag-over";

const props = withDefaults(
	defineProps<{
		showHeader?: boolean;
		showToggleSideBarButton?: boolean;
		value: LemmaRow;
	}>(),
	{
		showHeader: true,
		showToggleSideBarButton: true,
	},
);

const emit = defineEmits<{
	(event: "update", lemma: Partial<LemmaRow>): void;
}>();

const showGndSearch = ref(false);
const detailPage = ref(0); /** "Dateien" tab. */
const genderOptions = Object.values(GenderAe0Enum);

const zoteroSections = [
	{
		listName: "Literatur von",
		lemmaName: `${props.value.lastName}, ${props.value.firstName}`,
		zoteroKeys: props.value.zoteroKeysBy,
		column: "zoteroKeysBy",
	},
	{
		listName: "Literatur über",
		lemmaName: `${props.value.lastName}, ${props.value.firstName}`,
		zoteroKeys: props.value.zoteroKeysAbout,
		column: "zoteroKeysAbout",
	},
];

//

let dragEventDepth = 0;

function onDragEnter(event: DragEvent) {
	if (
		event.currentTarget != null &&
		event.dataTransfer != null &&
		// during the "drag" phase, the "files" prop is still empty
		// so we use the items prop instead to check _what_ is being dragged.
		event.dataTransfer.items[0] != null &&
		event.dataTransfer.items[0].kind === "file"
	) {
		const target = event.currentTarget as HTMLElement;
		dragEventDepth++;
		target.classList.add(dragClassName);
		detailPage.value = 1; /** "Dateien" tab. */
	}
}

function onDragLeave(event: DragEvent) {
	dragEventDepth--;

	if (dragEventDepth === 0 && event.currentTarget) {
		const target = event.currentTarget as HTMLElement;
		target.classList.remove(dragClassName);
	}
}

function onDrop(event: DragEvent) {
	if (
		event.currentTarget != null &&
		event.dataTransfer != null &&
		event.dataTransfer.files.length > 0
	) {
		const target = event.currentTarget as HTMLElement;
		target.classList.remove(dragClassName);
		uploadFiles(event.dataTransfer.files);
	}
}

//

const files = ref<Array<File>>([]);

async function pickFile() {
	const fileList = await fileDialog({ multiple: true });
	files.value = files.value.concat(Array.from(fileList));
}

function isValidFile(file: File) {
	return file.type !== "";
}

// FIXME: how are these actually uploaded?
function uploadFiles(fileList: FileList) {
	const { valid, invalid } = groupBy([...fileList], (file) =>
		isValidFile(file) ? "valid" : "invalid",
	);

	if (isNonEmptyArray(invalid)) {
		confirm.confirm(
			`${invalid.length} Datei(en) können nicht hochgeladen werden, weil sie zu groß sind (${invalid
				.map((f) => f.name)
				.join(", ")}).`,
		);
	}

	if (isNonEmptyArray(valid)) {
		files.value = files.value.concat(valid);
	}
}

function countScrapedResources(r: LemmaRow["columns_scrape"]) {
	if (r == null) {
		return 0;
	} else {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return Object.values(r).filter((r) => r != null && !Array.isArray(r)).length;
	}
}

function selectGnd(gnd: Array<string>) {
	showGndSearch.value = false;
	emit("update", { gnd });
}

function updateUserColumns(userKey: string, value: Array<string> | number | string) {
	emit("update", {
		columns_user: {
			...props.value.columns_user,
			[userKey]: value,
		},
		[userKey]: value,
	});
}

const debouncedUpdateUserColumns = debounce(updateUserColumns, 300);

function updateList(list: List) {
	updateData({
		list: {
			id: list.id!,
			title: list.title,
			editor: list.editor?.userId,
		},
	});
}

function updateData(u: Partial<LemmaRow>) {
	emit("update", u);
}

const debouncedUpdateData = debounce(updateData, 300);
</script>

<template>
	<VCard
		v-if="value != null"
		class="transparent flex-column d-flex fill-height lemma-detail"
		:elevation="0"
		@dragover.prevent=""
		@dragenter.prevent.capture.stop="onDragEnter"
		@dragleave.prevent.capture.stop="onDragLeave"
		@drop.prevent.capture.stop="onDrop"
	>
		<VCardTitle class="flex-column pb-2">
			<div v-if="showHeader" class="d-flex flex-row align-self-stretch">
				<VBtn
					class="rounded-lg"
					:height="48"
					icon
					style="margin-top: -8px; margin-left: -10px"
					tile
					:width="48"
					@click="emit('update', { selected: !value.selected })"
				>
					<span v-if="value.selected" style="color: var(--v-primary-base)">★</span>
					<span v-else style="opacity: 50%">☆</span>
				</VBtn>
				<div :key="value.id" class="text-center flex-grow-1">
					{{ value.lastName }}, {{ value.firstName }}
				</div>
				<div class="printer">
					<LemmaPrintPreviewButton :lemma-row="value" />
				</div>
				<VBtn
					v-if="showToggleSideBarButton"
					style="margin-top: -8px; margin-right: -10px"
					width="48"
					height="48"
					tile
					class="rounded-lg"
					icon
					@click="store.lemma.showSideBar = false"
				>
					<VIcon>mdi-dock-right</VIcon>
				</VBtn>
			</div>

			<div v-if="showHeader" style="margin-top: -5px" class="text-caption text-center">
				{{ getYear(props.value.dateOfBirth) || "?" }} -
				{{ getYear(props.value.dateOfDeath) || "?" }}
			</div>

			<VBtnToggle
				v-model="detailPage"
				active-class="background darken-3"
				borderless
				class="transparent mx-auto mt-1 mb-0"
				mandatory
			>
				<VBtn text class="rounded-lg mx-1" small>Details</VBtn>
				<VBtn text class="rounded-lg mx-1" small>
					Dateien {{ files.length > 0 ? `(${files.length})` : "" }}
				</VBtn>
				<VBtn text class="rounded-lg mx-1" small>Literatur</VBtn>
				<VBtn text class="rounded-lg mx-1" small>
					Externe Ressourcen
					<template v-if="countScrapedResources(value.columns_scrape) > 0">
						({{ countScrapedResources(value.columns_scrape) }})
					</template>
				</VBtn>
			</VBtnToggle>
		</VCardTitle>

		<VDivider />

		<!-- FIXME: why button-toggle+window instead of tabs? -->
		<div class="overflow-y-auto flex-grow-1">
			<VWindow :value="detailPage">
				<VWindowItem>
					<h4
						class="py-2 px-5 background darken-1 d-flex"
						:style="{
							background: '',
							position: 'sticky',
							top: 0,
							zIndex: 1,
						}"
					>
						Basisdaten
						<VSpacer />
						<SelectMenu
							btn-class="px-2 background darken-2"
							:items="store.lemma.lemmaLists"
							key-description="editor.name"
							key-name="title"
							key-value="id"
							no-selection-text="keine Liste"
							prepend-icon="mdi-format-list-bulleted"
							search-placeholder="Liste suchen …"
							:show-chevron="true"
							:value="value.list || null"
							@input="updateList"
						/>
					</h4>

					<VCardText>
						<TextField
							:label="lemmaRowTranslations.firstName.de"
							:required="true"
							:value="value.firstName"
							@input="debouncedUpdateData({ firstName: $event })"
						/>
						<TextField
							:label="lemmaRowTranslations.lastName.de"
							:required="true"
							:value="value.lastName"
							@input="debouncedUpdateData({ lastName: $event })"
						/>
						<FullNameArrayField
							:key="value.id"
							:full-names="value.alternativeNames"
							:value="value.alternativeNames"
							@submit="updateUserColumns('alternativeNames', $event)"
						/>
						<TextField :label="lemmaRowTranslations.gender.de">
							<template #input>
								<VBtnToggle
									active-class="background darken-3"
									borderless
									class="transparent mt-1 ml-1"
									max="1"
									:value="value.gender"
									@change="debouncedUpdateData({ gender: $event })"
								>
									<div v-for="genderOption in genderOptions" :key="genderOption">
										<VBtn :value="genderOption" text class="rounded-lg" small>
											{{ genderOption }}
										</VBtn>
									</div>
								</VBtnToggle>
								<VBtn
									v-if="value.gender"
									text
									small
									class="rounded-lg ml-5"
									icon
									@click="debouncedUpdateData({ gender: undefined })"
								>
									<VIcon>mdi-close-circle-outline</VIcon>
								</VBtn>
							</template>
						</TextField>
						<!-- @vue-expect-error -->
						<TextField
							tabindex="-1"
							:label="lemmaRowTranslations.nobleTitle.de"
							placeholder="(kein)"
							:value="value.columns_user.nobleTitle"
							@input="updateUserColumns('nobleTitle', $event)"
						>
							<VBtn
								tile
								tabindex="-1"
								class="rounded-lg mt-1 mr-1"
								icon
								small
								@click="
									updateUserColumns(
										'alternativeNobleTitle',
										Array.isArray(value.columns_user.alternativeNobleTitle)
											? [''].concat(value.columns_user.alternativeNobleTitle)
											: [''],
									)
								"
							>
								<v-icon>mdi-plus-circle-outline</v-icon>
							</VBtn>
						</TextField>
						<!-- @vue-expect-error -->
						<TextFieldAlternatives
							:label="lemmaRowTranslations.nobleTitle.de"
							:value="value.columns_user.alternativeNobleTitle"
							@input="updateUserColumns('alternativeNobleTitle', $event)"
						/>
						<VSpacer class="my-5" />
						<DateField
							:key="'dateOfBirth_' + value.id"
							:date="value.dateOfBirth"
							:label="lemmaRowTranslations.dateOfBirth.de"
							@submit="debouncedUpdateData({ dateOfBirth: $event })"
						/>
						<DateField
							:key="'dateOfDeath_' + value.id"
							:date="value.dateOfDeath"
							:label="lemmaRowTranslations.dateOfDeath.de"
							@submit="debouncedUpdateData({ dateOfDeath: $event })"
						/>
						<VSpacer class="my-5" />
						<TextField
							style="min-height: 60px"
							:label="lemmaRowTranslations.kinship.de"
							:allow-new-line="true"
							:value="value.kinship"
							@input="debouncedUpdateData({ kinship: $event })"
						/>
						<TextField
							style="min-height: 60px"
							:label="lemmaRowTranslations.bioNote.de"
							:allow-new-line="true"
							:value="value.bioNote"
							@input="debouncedUpdateData({ bioNote: $event })"
						/>
						<TextField
							style="min-height: 60px"
							:label="lemmaRowTranslations.religion.de"
							:allow-new-line="true"
							:value="value.religion"
							@input="debouncedUpdateData({ religion: $event })"
						/>
						<VSpacer class="my-5" />
						<TextField
							style="min-height: 60px"
							:label="lemmaRowTranslations.professionDetail.de"
							:allow-new-line="true"
							:value="value.professionDetail"
							:maxlength="255"
							@input="debouncedUpdateData({ professionDetail: $event })"
						/>
						<ProfessionGroupField
							:key="value.id + '_professionGroupField'"
							:selected="value.professionGroup"
							@input="debouncedUpdateData({ professionGroup: $event })"
						/>
						<VSpacer class="my-5" />
						<TextField
							style="min-height: 60px"
							:label="lemmaRowTranslations.notes.de"
							:allow-new-line="true"
							:value="value.notes"
							:maxlength="255"
							@input="debouncedUpdateData({ notes: $event })"
						/>
					</VCardText>
					<h4
						class="py-2 px-5 background"
						:style="{
							zIndex: 1,
							position: 'sticky',
							top: 0,
							background: '',
						}"
					>
						{{ lemmaRowTranslations.columns_user.de }}
					</h4>
					<VCardText class="pt-0">
						<TextField
							v-for="(userValue, userKey) in value.columns_user"
							:key="userKey"
							:value="userValue"
							:label="userKey"
							@input="debouncedUpdateUserColumns(String(userKey), $event)"
						/>
					</VCardText>
				</VWindowItem>

				<VWindowItem>
					<h4 class="py-2 px-5 background d-flex">
						Dateien
						<VSpacer />
						<VBtn
							class="droppable rounded-lg mr-2"
							elevation="0"
							text
							small
							color="primary darken-1"
							@click.capture.prevent.stop="pickFile"
						>
							Datei hinzufügen
							<VIcon class="ml-2" small>mdi-plus-circle-outline</VIcon>
						</VBtn>
					</h4>
					<VCardText class="flex-grow-1">
						<VueFileList :value="files" @input="files = $event" />
					</VCardText>
				</VWindowItem>

				<VWindowItem>
					<VExpansionPanels accordion flat>
						<ZoteroManager
							v-for="(zoteroSection, key) in zoteroSections"
							:key="`${value.id}_${key}`"
							:lemma-name="zoteroSection.lemmaName"
							:list-name="zoteroSection.listName"
							:zotero-keys-from-server="zoteroSection.zoteroKeys"
							@submit="debouncedUpdateData({ [zoteroSection.column]: $event })"
						/>
					</VExpansionPanels>

					<VCard flat class="rounded-lg" color="transparent">
						<VCardTitle class="pt-0 background">Legacy (Gideon)</VCardTitle>
						<VCardText class="pt-0 background">
							<div v-if="value.legacyGideonCitations" class="gideon-legacy-result">
								<VList dense class="gideon-legacy-literature pt-0">
									<VListItem
										v-for="(legacyCitation, index) in value.legacyGideonCitations"
										:key="index"
									>
										{{ legacyCitation.value }}
									</VListItem>
								</VList>
							</div>
							<div v-else>Keine Gideon-Literatur gefunden</div>
						</VCardText>
					</VCard>
				</VWindowItem>

				<VWindowItem>
					<h4 class="py-2 px-5 background d-flex">
						GND: {{ value.gnd[0] }}
						<VSpacer />
						<VBadge
							v-if="value.gnd.length > 1"
							color="primary"
							:content="value.gnd.length.toString()"
							inline
						/>
					</h4>
					<VCardText class="pt-1">
						<VWindow reverse style="overflow: visible !important" :value="showGndSearch ? 1 : 0">
							<VWindowItem>
								<LobidPreviewCard
									v-if="value.gnd.length > 0"
									class="mb-2"
									:limit="1"
									:gnd="value.gnd"
								/>
								<VBtn
									v-if="value.gnd.length === 0"
									small
									color="background darken-3"
									class="rounded-lg"
									block
									elevation="0"
									@click="showGndSearch = true"
								>
									GND hinzufügen…
								</VBtn>
								<VBtn
									v-if="value.gnd.length > 0"
									small
									class="rounded-lg"
									color="background darken-3"
									block
									elevation="0"
									@click="showGndSearch = true"
								>
									GND ändern…
								</VBtn>
							</VWindowItem>
							<VWindowItem>
								<LobidGndSearch
									:value="value.gnd"
									:lemma="value"
									:gnd="value.gnd"
									@cancel="showGndSearch = false"
									@input="selectGnd"
								/>
							</VWindowItem>
						</VWindow>
					</VCardText>

					<VDivider />

					<h4 class="py-2 px-5 background d-flex">
						Externe Ressourcen
						<VSpacer />
					</h4>

					<VCardText class="pt-0">
						<VList color="transparent" dense nav class="text-body-2 pa-0">
							<template v-if="value.columns_scrape">
								<LemmaScrapeResult
									v-for="(source, sourceName) in value.columns_scrape"
									:key="sourceName"
									:value="source"
									:title="sourceName"
								/>
							</template>
						</VList>
					</VCardText>
				</VWindowItem>
			</VWindow>
		</div>
	</VCard>
</template>

<style scoped>
.lemma-detail {
	will-change: contents;
}

.drag-over {
	box-shadow: inset 0 0 0 3px var(--v-primary-base) !important;
}

h4 {
	position: sticky;
	top: 0;
	z-index: 1;
	background: transparent;
}

.gideon-legacy-literature > li {
	display: inline;
}

.gideon-legacy-literature > li:not(:last-child)::after {
	content: ", ";
}
</style>
@/lib/labels
