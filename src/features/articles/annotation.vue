<script lang="ts" setup>
import { debounce } from "@acdh-oeaw/lib";
import { type Editor } from "@tiptap/vue-2";
import { computed, ref, watch } from "vue";

import { type AnnotationAttributes } from "@/features/articles/extension-annotation";
import LobidPreviewCard from "@/features/lemmata/lobid-preview-card.vue";
import LoadingSpinner from "@/features/ui/loading-spinner.vue";
import TextField from "@/features/ui/text-field.vue";
import { entityTranslations } from "@/lib/labels";
import * as apis_autocomplete from "@/service/apis_autocomplete";

const props = defineProps<{
	id: string | null;
	entityId: string | null;
	entityType: string | null;
	relationTypeId: string | null;
	relationEndTime: string | null;
	relationStartTime: string | null;
	isConfirmed: string;
	editor: Editor;
	cachedEntity: { type: string; name: string; id: string } | null;
}>();

const showOverlay = ref(false);
const page = ref(0);
const searchQueries = ref<{ [annotationId: string]: string }>({});
const loading = ref(false);
const showDetailsForGnd = ref<string | null>(null);
const results = ref<Array<{ type: string; name: string; id: string }>>([]);
const availableRelations = ref<Array<{ id: string; text: string }>>([]);
const annotation = ref<{ entityId: string | null }>({ entityId: null });

const entityTypes = [
	{ value: "person", text: entityTranslations.person!.de },
	{ value: "place", text: entityTranslations.place!.de },
	{ value: "institution", text: entityTranslations.institution!.de },
	{ value: "work", text: entityTranslations.work!.de },
	{ value: "event", text: entityTranslations.event!.de },
];

const selectedRelationType = ref<string | null>(null);

const isConfirmedAnnotation = computed(() => {
	return props.isConfirmed === "true";
});

const searchTerm = computed({
	get() {
		// if possible, use the cached search term
		if (props.id != null && searchQueries.value[props.id] != null) {
			return searchQueries.value[props.id]!;
			// otherwise it’s empty
		} else {
			return "";
		}
	},
	set(t) {
		// cache it
		searchQueries.value[props.id!] = t;
	},
});

function updateProps(p: Partial<AnnotationAttributes>) {
	console.log(p);
	const _res = props.editor.commands.updateAttributes("annotation", {
		entityId: props.entityId,
		entityType: props.entityType,
		id: props.id,
		relationTypeId: props.relationTypeId,
		relationStartTime: props.relationStartTime,
		relationEndTime: props.relationEndTime,
		isConfirmed: props.isConfirmed,
		...p,
	} as AnnotationAttributes);
}

function selectEntity(id: string) {
	if (props.entityId !== id) {
		updateProps({ entityId: id });
	} else {
		updateProps({ entityId: null });
	}
}

function removeAnnotation() {
	props.editor.commands.unsetMark("annotation");
	props.editor.commands.focus();
}

watch(
	() => props.id,
	async () => {
		results.value = [];
		selectedRelationType.value = null;

		// update search to the selected text
		if (props.entityId == null && props.relationTypeId == null) {
			const selectedText = props.editor.state.doc.textBetween(
				props.editor.state.selection.from,
				props.editor.state.selection.to,
			);
			searchTerm.value = selectedText;
		}

		if (props.entityId != null && props.entityType != null) {
			//this.results = [await lobid.get(this.entityId)]
			results.value = await apis_autocomplete.searchEntity(props.entityType, props.entityId);
		}

		// reset overlay
		showOverlay.value = false;
	},
	{ immediate: true },
);

watch(
	() => props.entityId,
	(newVal, oldVal) => {
		console.log(newVal, oldVal);
	},
);

const debouncedSearchEntity = debounce(searchEntity, 300);

async function searchEntity(v: string | null) {
	if (props.entityType != null) {
		loading.value = true;

		if (v != null && v.trim() !== "") {
			results.value = await apis_autocomplete.searchEntity(props.entityType, v);
		} else {
			searchTerm.value = "";
			results.value = [];
		}

		loading.value = false;
	}
}

async function getAvailableRelations(relation: string) {
	availableRelations.value = await apis_autocomplete.getAvailableRelationTypes(relation);
}

watch(results, (newV: Array<any>, oldV: Array<any>) => {
	if (newV.length !== oldV.length) {
		window.dispatchEvent(new Event("resize"));
	}
});

watch(
	() => props.entityType,
	async () => {
		updateProps({ entityType: props.entityType });

		const relation = `person${props.entityType}relation`;
		if (props.entityType != null) {
			await getAvailableRelations(relation);

			if (props.relationTypeId != null) {
				selectedRelationType.value =
					availableRelations.value.find((rel) => {
						return (rel.id = String(props.relationTypeId));
					})?.id || null;
			}
		}
	},
	{ immediate: true },
);

const textFieldRef = ref<typeof TextField | null>(null);

watch(
	selectedRelationType,
	() => {
		if (selectedRelationType.value != null) {
			updateProps({ relationTypeId: selectedRelationType.value });

			// FIXME: ???
			const SearchTextField = textFieldRef.value as typeof TextField;
			if (SearchTextField.value !== "") {
				SearchTextField.$emit("input", SearchTextField.localValue);
			}
		}
	},
	{ immediate: true },
);
</script>

<template>
	<div class="pb-1" style="width: 320px; min-height: 250px">
		<VOverlay
			v-if="showOverlay"
			opacity=".9"
			style="border-radius: 11px"
			color="background darken-1"
		>
			<VBtn elevation="0" class="mb-1 rounded-lg" block color="red" @click="removeAnnotation">
				Annotation entfernen
			</VBtn>
			<VBtn block outlined class="rounded-lg" color="grey" @click="showOverlay = false">
				Abbrechen
			</VBtn>
		</VOverlay>

		<VWindow v-model="page" reverse>
			<VWindowItem>
				<div class="d-flex flex-row align-self-stretch">
					<VBtn icon tile class="rounded-lg" small></VBtn>
					<div class="text-center muted caption mb-1 flex-grow-1 align-self-end">Annotation</div>
					<VBtn icon tile class="rounded-lg" small @click="showOverlay = true">
						<VIcon>mdi-dots-horizontal</VIcon>
					</VBtn>
				</div>
				<div
					v-if="entityTypes"
					class="d-flex flex-row rounded-lg background darken-2 px-2 mt-1 mb-1"
				>
					<VSelect
						v-model="entityType"
						class="pt-0 custom-v-select"
						hide-details
						:items="entityTypes"
						attach
						placeholder="Entität"
					/>
				</div>
				<div
					v-if="entityTypes"
					class="d-flex flex-row rounded-lg background darken-2 px-2 mt-1 mb-1"
				>
					<VSelect
						v-model="selectedRelationType"
						class="pt-0 custom-v-select"
						hide-details
						:items="availableRelations"
						attach
						placeholder="Relation"
						item-value="id"
					/>
				</div>
				{{ searchTerm }}
				<TextField
					ref="textFieldRef"
					v-model="searchTerm"
					class="flex-grow-1"
					:clearable="true"
					placeholder="Enität suchen …"
					@input="debouncedSearchEntity"
				>
					<template #prepend>
						<div v-if="loading === true" class="mt-1 ml-2">
							<LoadingSpinner :size="25" />
						</div>
						<VIcon v-else size="16" class="ml-3">mdi-magnify</VIcon>
					</template>
				</TextField>
				<VList v-if="results.length > 0" dense nav color="transparent" class="pa-0 result-list">
					<VListItem v-for="result in results" :key="result.id">
						<VListItemAvatar class="pr-0 mr-2" min-width="30" max-width="30" width="30">
							<template>
								<VBtn
									tile
									icon
									class="rounded-lg"
									elevation="0"
									@click.stop.prevent.capture="selectEntity(result.id)"
								>
									<VIcon v-if="result.id === entityId" color="primary">mdi-check-circle</VIcon>
									<VIcon v-else>mdi-circle-outline</VIcon>
								</VBtn>
							</template>
						</VListItemAvatar>
						<!-- eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
						<VListItemContent class="cursor-pointer ac-result" v-html="result.name" />
						<!-- eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
					</VListItem>
				</VList>
				<div
					v-else-if="results.length === 0 && searchTerm.trim() !== '' && loading === true"
					class="pa-5 my-5 text-center caption muted"
				>
					Suche …
				</div>
				<div
					v-else-if="results.length === 0 && searchTerm.trim() === ''"
					class="pa-5 my-5 text-center caption muted"
				>
					Suchen Sie nach einer Entität
				</div>
				<div
					v-else-if="results.length === 0 && searchTerm.trim() !== ''"
					class="pa-5 my-5 text-center caption muted"
				>
					Nichts gefunden.
				</div>
			</VWindowItem>

			<VWindowItem>
				<div>
					<VBtn elevation="0" color="primary" text class="rounded-lg mb-2" small @click="page = 0">
						<VIcon left>mdi-chevron-left</VIcon>
						Zurück
					</VBtn>
				</div>
				<LobidPreviewCard class="mb-3" :gnd="[showDetailsForGnd]" />
			</VWindowItem>
		</VWindow>

		<div class="d-flex flex-row mt-1">
			<TextField
				v-model="relationStartTime"
				placeholder="YYYY"
				class="mr-1"
				style="width: 49.5%"
				label="von"
				@input="updateProps({ relationStartTime: $event })"
			/>
			<TextField
				v-model="relationEndTime"
				placeholder="YYYY"
				label="bis"
				style="width: 49.5%"
				@input="updateProps({ relationEndTime: $event })"
			/>
		</div>

		<div v-if="isConfirmedAnnotation === false">
			<VDivider class="mb-2 mt-1" />
			<VBtn
				elevation="0"
				block
				class="rounded-lg white--text"
				color="green lighten-1"
				@click="updateProps({ isConfirmed: 'true' })"
			>
				Vorschlag annehmen
			</VBtn>
			<VBtn
				v-if="isConfirmedAnnotation === false"
				elevation="0"
				block
				class="rounded-lg mt-1"
				color="background darken-2"
				@click="removeAnnotation"
			>
				Vorschlag ablehen
			</VBtn>
		</div>
	</div>
</template>

<style scoped>
.result-list {
	overflow-y: auto;
	height: 300px;
}

.custom-v-select :deep(.v-input__slot::after) {
	border-style: none;
}

.custom-v-select :deep(.v-input__slot) {
	font-size: 0.8rem;
}

.ac-result :deep(*) {
	display: flex;
	flex-direction: column;
}

.ac-result > span small:first-child {
	order: 2;
}

.ac-result > span b {
	order: 1;
}
</style>
@/lib/labels
