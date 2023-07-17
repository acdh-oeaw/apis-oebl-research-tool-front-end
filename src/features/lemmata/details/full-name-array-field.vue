<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import FullNameField from "@/features/lemmata/details/full-name-field.vue";
import { lemmaRowTranslations } from "@/lib/labels";
import { type FullName as FullNameType } from "@/types/lemma";

const props = defineProps<{
	fullNames: Array<FullNameType>;
}>();

const emit = defineEmits<{
	(event: "submit", value: Array<FullNameType>): void;
}>();

// A new or existing full name, selected to edit.
const selectedToEdit = ref<FullNameType | null>(null);

// When editing, do not sync
const isLocked = computed(() => {
	return selectedToEdit.value != null;
});

const disregardText = computed(() => {
	if (selectedToEdit.value == null) {
		throw new ErrorEvent("Nothing to disregard: No Item selected");
	}

	if (selectedToEdit.value.firstName || selectedToEdit.value.lastName) {
		return "Löschen";
	}

	return "Abbrechen";
});

// Local copy of the props
const localFullNames = ref<Array<FullNameType>>([]);

/**
 * Fill and change on parent update, when not locked
 *
 * Do so on at start up, and also deep / when only a part of the name is changed
 */
watch(
	() => props.fullNames,
	(fullNames) => {
		if (isLocked.value) return;

		localFullNames.value = fullNames;
	},
	{ immediate: true, deep: true },
);

// FIXME: use @input event from full-name-field
// Whenever edit state is over, pass data to parent
watch(selectedToEdit, () => {
	if (isLocked.value) return;

	emit("submit", localFullNames.value);
});

function createEmptyItem() {
	selectedToEdit.value = {};
}

function deleteSelectedItem() {
	selectedToEdit.value = null;
}

function saveSelectedItem() {
	if (selectedToEdit.value == null) {
		throw new Error("Can not save selected FullName, it is null.");
	}

	localFullNames.value.unshift(selectedToEdit.value);
	selectedToEdit.value = null;
}

function editItem(edit_index: number) {
	selectedToEdit.value = localFullNames.value[edit_index]!;
	localFullNames.value = localFullNames.value.filter((_, index) => index !== edit_index);
}
</script>

<template>
	<div>
		<VCard class="transparent" elevation="0">
			<h4 class="py-2">
				{{ lemmaRowTranslations.alternativeNames.de }}
			</h4>
			<VCardActions :class="{ 'justify-center': selectedToEdit == null }">
				<div v-if="selectedToEdit == null" class="add-new-full-name-btn">
					<VBtn class="rounded-lg" icon @click.stop="createEmptyItem()">
						Weiteren Namen hinzufügen
						<VIcon class="pl-6">mdi-plus-circle-outline</VIcon>
					</VBtn>
				</div>
				<div v-else class="edit-full-name-input">
					<FullNameField :full-name="selectedToEdit" />
					<VBtnToggle class="transparent mt-1 ml-1 justify-center" borderless>
						<VBtn text class="rounded-lg" @click="saveSelectedItem()">Speichern</VBtn>
						<VBtn text class="rounded-lg ml-3" @click="deleteSelectedItem()">
							{{ disregardText }}
						</VBtn>
					</VBtnToggle>
				</div>
			</VCardActions>
			<VCardText class="full-name-array py-0">
				<VContainer class="py-0 px-0">
					<div
						v-for="(fullName, index) in localFullNames"
						:key="index"
						class="full-name-array-item"
					>
						<VRow>
							<VCol cols="11">
								<full-name-field :full-name="fullName" :disabled="true"></full-name-field>
							</VCol>
							<VCol cols="1">
								<VContainer fill-height class="px-0 justify">
									<VBtn
										class="rounded-lg"
										icon
										small
										:disabled="isLocked"
										@click.stop="editItem(index)"
									>
										<VIcon>mdi-pencil-circle-outline</VIcon>
									</VBtn>
								</VContainer>
							</VCol>
						</VRow>
					</div>
				</VContainer>
			</VCardText>
		</VCard>
		<VDivider class="pb-6"></VDivider>
	</div>
</template>

<style lang="css" scoped>
.full-name-array {
	padding-left: 0;
}

.edit-full-name-input {
	width: 100%;
}
</style>
@/lib/labels
