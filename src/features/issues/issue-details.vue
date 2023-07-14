<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { type IssueLemma, type LemmaNote } from "@/api";
import FormRow from "@/features/ui/form-row.vue";
import SelectMenu from "@/features/ui/select-menu.vue";
import { getRelativeTime } from "@/lib/get-relative-time";
import { getYear } from "@/lib/get-year";
import store from "@/store";
import LemmaLabels from "@/views/IssueManager/LemmaLabels.vue";

const props = defineProps<{
	lemma: IssueLemma;
}>();

const emit = defineEmits<{
	(event: "delete-issue-lemma", id: number): void;
	(event: "update", id: number, data: Partial<IssueLemma>): void;
}>();

const notes = ref<Array<LemmaNote>>([]);
const newNote = ref("");
const isAddingNote = ref(false);
const isLoadingNotes = ref(false);

const labels = computed(() => store.labels.labels);

const lemmaStatuses = computed(() => store.issue.statuses);

const lemmaStatus = computed(() => {
	return store.issue.statuses.find((s) => s.id === props.lemma.status) || null;
});

const lemmaEditor = computed(() => {
	if (props.lemma.editor) {
		return store.editors.getById(props.lemma.editor) || null;
	}

	return null;
});

const lemmaAuthor = "TODO:";

const researchLemma = computed(() => props.lemma.lemma);

function formatTimeDistance(date: string | undefined): string {
	return getRelativeTime(date) || "";
}

function getUserName(id: number): string {
	const u = store.editors.getById(id);

	return u?.name || "";
}

async function loadNotes() {
	if (props.lemma.id && props.lemma.notes !== undefined && props.lemma.notes.length > 0) {
		isLoadingNotes.value = true;
		notes.value = (await store.issue.loadNotes(props.lemma.id)).reverse();
		isLoadingNotes.value = false;
	}
}

watch(
	() => props.lemma,
	() => {
		loadNotes();
	},
	{ immediate: true },
);

function deleteIssueLemma() {
	emit("delete-issue-lemma", props.lemma.id!);
}

function updateLemma(issue: Partial<IssueLemma>) {
	emit("update", props.lemma.id!, issue);
}

function updateLabels(labels: Array<number>) {
	updateLemma({ labels });
}

async function addNote() {
	if (newNote.value.trim() === "") return;

	if (props.lemma.id) {
		isAddingNote.value = true;
		await store.issue.addNote(props.lemma.id, newNote.value.trim());
		loadNotes();
		newNote.value = "";
		isAddingNote.value = false;
	}
}
</script>

<template>
	<VCard v-if="lemma" class="transparent flex-column d-flex fill-height" flat>
		<VCardTitle v-if="researchLemma !== null">
			<VContainer class="pa-0">
				<VRow no-gutters>
					<VCol cols="2"></VCol>
					<VCol :key="lemma.id" class="text-center" cols="8">
						{{ researchLemma.lastName }}, {{ researchLemma.firstName }}
					</VCol>
					<VCol cols="2"></VCol>
				</VRow>
				<VRow no-gutters>
					<VCol cols="12" class="text-caption text-center">
						{{ getYear(researchLemma.dateOfBirth) }} -
						{{ getYear(researchLemma.dateOfDeath) }}
					</VCol>
				</VRow>
			</VContainer>
		</VCardTitle>
		<VCardTitle v-else>
			<span class="caption">Lemma nicht gefunden.</span>
		</VCardTitle>
		<VDivider />
		<div class="flex-grow-1 overflow-y-auto">
			<VCardText class="px-5 py-2 flex-grow-1">
				<FormRow label="Status">
					<SelectMenu
						:show-chevron="true"
						btn-class="px-4 float-right background darken-2"
						:items="lemmaStatuses"
						search-placeholder="Status suchen …"
						:value="lemmaStatus"
						key-value="id"
						key-name="name"
						:return-value="true"
						background-color="transparent"
						@input="updateLemma({ status: $event })"
					/>
				</FormRow>
				<FormRow label="Redakteur">
					<SelectMenu
						:show-chevron="true"
						btn-class="px-4 float-right background darken-2"
						:items="store.editors.editors"
						search-placeholder="Redakteur suchen …"
						:value="lemmaEditor"
						key-value="userId"
						key-name="name"
						background-color="transparent"
						@input="updateLemma({ editor: $event.userId })"
					/>
				</FormRow>
				<FormRow label="Autor">
					<!--
						TODO:
            This is a reminder, how this used to look like.

            :items="store.authors.authors"
            @input="updateLemma({ author: $event })"
           -->
					<SelectMenu
						:show-chevron="true"
						btn-class="px-4 float-right background darken-2"
						:items="[]"
						search-placeholder="Autor suchen …"
						:value="lemmaAuthor"
						add-null-option="Kein Autor"
						key-value="userId"
						:return-value="true"
						background-color="transparent"
					/>
				</FormRow>
				<FormRow label="Wortanzahl">
					<!-- FIXME: -->
					<div class="pr-4 text-right">{{ 0 }} Wörter</div>
				</FormRow>
				<FormRow label="Entitäten">
					<!-- FIXME: -->
					<div class="pr-4 text-right">{{ 0 }} Entitäten</div>
				</FormRow>
			</VCardText>
			<VDivider />
			<h4
				class="pt-2 pb-2 pl-5 background lighten-1"
				:style="{
					zIndex: 1,
					position: 'sticky',
					top: 0,
				}"
			>
				Labels
			</h4>
			<VCardText class="pt-0">
				<LemmaLabels :value="lemma.labels" @update="updateLabels" />
			</VCardText>
			<VDivider />
			<h4
				class="pl-5 pt-2 pb-2 background lighten-1"
				:style="{
					zIndex: 1,
					position: 'sticky',
					top: 0,
				}"
			>
				Notizen
			</h4>
			<VCardText style="position: relative" class="pt-0">
				<VTextarea
					v-model="newNote"
					placeholder="Notiz hinzufügen..."
					rows="1"
					hide-details
					class="mb-2 rounded-lg text-body-2"
					auto-grow
					solo
					flat
					:disabled="isAddingNote || isLoadingNotes"
					background-color="background darken-2"
					@keydown.meta.enter.prevent="addNote"
					@keydown.ctrl.enter.prevent="addNote"
				>
					<template #append>
						<VBtn
							small
							:disabled="newNote === null || newNote.trim() === ''"
							elevation="0"
							class="rounded-lg"
							icon
							tile
							@click="addNote"
						>
							<v-icon small>mdi-send</v-icon>
						</VBtn>
					</template>
				</VTextarea>
				<div v-for="(note, i) in notes" :key="i" class="rounded-lg background darken-1 pa-2 mb-1">
					<div style="opacity: 70%" class="px-1 caption note">
						{{ getUserName(note.user) }} — {{ formatTimeDistance(note.created) }}
					</div>
					<div class="px-1 pb-2" v-text="note.text" />
				</div>
			</VCardText>
		</div>
		<VDivider />
		<VCardActions>
			<slot />
		</VCardActions>
	</VCard>
</template>

<style scoped>
.note {
	white-space: break-spaces;
}

.roll-enter-active,
.roll-leave-active {
	position: relative;
	transition: all 0.3s ease;
}

.roll-enter,
.roll-leave-to {
	position: absolute;
	opacity: 0%;
}

.roll-enter {
	transform: translateY(20px);
}

.roll-leave-to {
	transform: translateY(-20px);
}
</style>
