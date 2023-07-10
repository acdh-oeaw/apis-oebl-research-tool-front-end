<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { type IssueLemma, type LemmaNote } from "@/api";
import { getRelativeTime } from "@/lib/get-relative-time";
import { getYear } from "@/lib/get-year";
import store from "@/store";
import LemmaLabels from "@/views/IssueManager/LemmaLabels.vue";
import FormRow from "@/views/lib/FormRow.vue";
import SelectMenu from "@/views/lib/SelectMenu.vue";

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
	if (date == null) return "";

	return getRelativeTime(date);
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
	<v-card v-if="lemma" class="transparent flex-column d-flex fill-height" flat>
		<v-card-title v-if="researchLemma !== null">
			<v-container class="pa-0">
				<v-row no-gutters>
					<v-col cols="2"></v-col>
					<v-col :key="lemma.id" class="text-center" cols="8">
						{{ researchLemma.lastName }}, {{ researchLemma.firstName }}
					</v-col>
					<v-col cols="2"></v-col>
				</v-row>
				<v-row no-gutters>
					<v-col cols="12" class="text-caption text-center">
						{{ getYear(researchLemma.dateOfBirth) }} -
						{{ getYear(researchLemma.dateOfDeath) }}
					</v-col>
				</v-row>
			</v-container>
		</v-card-title>
		<v-card-title v-else>
			<span class="caption">Lemma nicht gefunden.</span>
		</v-card-title>
		<v-divider />
		<div class="flex-grow-1 overflow-y-auto">
			<v-card-text class="px-5 py-2 flex-grow-1">
				<form-row label="Status">
					<select-menu
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
				</form-row>
				<form-row label="Redakteur">
					<select-menu
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
				</form-row>
				<form-row label="Autor">
					<!--
            This is a reminder, how this used to look like. TODO: Remove this comment.

            :items="store.authors.authors"
            @input="updateLemma({ author: $event })"
           -->
					<select-menu
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
				</form-row>
				<form-row label="Wortanzahl">
					<!-- FIXME: -->
					<div class="pr-4 text-right">{{ 0 }} Wörter</div>
				</form-row>
				<form-row label="Entitäten">
					<!-- FIXME: -->
					<div class="pr-4 text-right">{{ 0 }} Entitäten</div>
				</form-row>
			</v-card-text>
			<v-divider />
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
			<v-card-text class="pt-0">
				<lemma-labels :value="lemma.labels" @update="updateLabels" />
			</v-card-text>
			<v-divider />
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
			<v-card-text style="position: relative" class="pt-0">
				<v-textarea
					v-model="newNote"
					placeholder="Notiz hinzufügen…"
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
						<v-btn
							small
							:disabled="newNote === null || newNote.trim() === ''"
							elevation="0"
							class="rounded-lg"
							icon
							tile
							@click="addNote"
						>
							<v-icon small>mdi-send</v-icon>
						</v-btn>
					</template>
				</v-textarea>
				<div v-for="(note, i) in notes" :key="i" class="rounded-lg background darken-1 pa-2 mb-1">
					<div style="opacity: 70%" class="px-1 caption note">
						{{ getUserName(note.user) }} — {{ formatTimeDistance(note.created) }}
					</div>
					<div class="px-1 pb-2" v-text="note.text" />
				</div>
			</v-card-text>
		</div>
		<v-divider />
		<v-card-actions>
			<slot />
		</v-card-actions>
	</v-card>
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
