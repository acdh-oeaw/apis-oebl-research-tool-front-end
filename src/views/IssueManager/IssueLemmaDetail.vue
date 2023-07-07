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
						{{ dateToYear(researchLemma.dateOfBirth) }} -
						{{ dateToYear(researchLemma.dateOfDeath) }}
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
					<div style="display: none">
						{{
							temporary_warn_method(
								'Auto complete for author select is currentlx not implemented. This is a TODO!"',
							)
						}}
					</div>
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

<script lang="ts">
// eslint-disable-next-line import/no-duplicates
import { format, formatDistanceToNow } from "date-fns";
// eslint-disable-next-line import/no-duplicates
import { de } from "date-fns/locale";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { type Author, type Editor, type IssueLemma, type LemmaNote } from "@/api";
import { type LemmaStatus } from "@/types/issue";
import SelectMenu from "@/views/lib/SelectMenu.vue";

import store from "../../store";
import FormRow from "../lib/FormRow.vue";
import LoadingSpinner from "../lib/LoadingSpinner.vue";
import LemmaLabels from "./LemmaLabels.vue";

@Component({
	components: {
		FormRow,
		LemmaLabels,
		LoadingSpinner,
		SelectMenu,
	},
})
export default class IssueLemmaDetail extends Vue {
	// TODO: Remove me!
	temporary_warn_method = window.console.warn;

	@Prop({ required: true }) lemma!: IssueLemma;

	notes: Array<LemmaNote> = [];
	newNote = "";
	store = store;

	isAddingNote = false;
	isLoadingNotes = false;

	dateToYear(d: string | null | undefined): string | null {
		if (d !== null && d !== undefined) {
			try {
				return format(new Date(d), "yyyy");
			} catch (e) {
				return null;
			}
		} else {
			return null;
		}
	}

	get lemmaStatuses(): Array<LemmaStatus> {
		return store.issue.statuses;
	}

	get lemmaStatus(): LemmaStatus | null {
		return store.issue.statuses.find((s) => s.id === this.lemma.status) || null;
	}

	get lemmaEditor(): Editor | null {
		if (this.lemma.editor) {
			return store.editors.getById(this.lemma.editor) || null;
		} else {
			return null;
		}
	}

	get lemmaAuthor(): Author | null {
		console.warn("This author feature is currently not implemented. This is a TODO!");
		return null;
		// This is is a reminder, how this used to look like. TODO. Remove this comment.
		// if (this.lemma.author) {
		//   return store.authors.getById(this.lemma.author) || null
		// } else {
		//   return null
		// }
	}

	get researchLemma() {
		return this.lemma.lemma || null;
	}

	formatTimeDistance(d: string | undefined): string {
		if (d !== undefined) {
			return `${formatDistanceToNow(new Date(d), { locale: de, addSuffix: true })}`;
		} else {
			return "";
		}
	}

	getUserName(id: number): string {
		const u = store.editors.getById(id);
		if (u !== undefined) {
			return u.name || "";
		} else {
			return "";
		}
	}

	@Watch("lemma", { immediate: true })
	async onSwitchLemma() {
		this.loadNotes();
	}

	async loadNotes() {
		if (this.lemma.id && this.lemma.notes !== undefined && this.lemma.notes.length > 0) {
			this.isLoadingNotes = true;
			this.notes = (await store.issue.loadNotes(this.lemma.id)).reverse();
			this.isLoadingNotes = false;
		}
	}

	deleteIssueLemma() {
		this.$emit("delete-issue-lemma", this.lemma.id);
	}

	updateLemma(l: Partial<IssueLemma>) {
		this.$emit("update", this.lemma.id, l);
	}

	updateLabels(labels: Array<number>) {
		this.updateLemma({ labels });
	}

	async addNote() {
		if (this.newNote.trim() !== "") {
			this.isAddingNote = true;
			// this.lemma.notes.unshift({ user: { name: 'arni', userId: '1', email: 'yoyoyo.test', role: { id: '1', name: 'yo' } }, date: 'gerade eben', text: this.newNote, id: 'test' })
			if (this.lemma.id) {
				await store.issue.addNote(this.lemma.id, this.newNote.trim());
				this.loadNotes();
				this.newNote = "";
				this.isAddingNote = false;
			}
		}
	}

	get labels() {
		return store.labels.labels;
	}
}
</script>

<style lang="stylus" scoped>
// allow whitespace in notes
.note
  white-space break-spaces

.roll-enter-active
.roll-leave-active
  position relative
  transition all 0.3s ease

.roll-enter
.roll-leave-to
  position absolute
  opacity 0%

.roll-enter
  transform translateY(20px)

.roll-leave-to
  transform translateY(-20px)
</style>
