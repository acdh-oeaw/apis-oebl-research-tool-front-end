<script lang="ts" setup>
import { mapKeys, startCase } from "lodash";
import { computed, ref } from "vue";
import colors from "vuetify/lib/util/colors";

import store from "@/store";
import confirm from "@/store/confirm";
import { type Label } from "@/types/issue";

const props = withDefaults(
	defineProps<{
		value: Array<number>;
	}>(),
	{
		value: () => [],
	},
);

const emit = defineEmits<{
	(event: "update", value: any): void;
}>();

const searchText = ref<string | null>(null);
const editingLabel = ref<Label | null>(null);
const defaultLabelColor = colors.blueGrey.base;

const labelNameRules = [
	(n: unknown) =>
		(n == null || (typeof n === "string" && n.trim() === "")) && "Geben Sie einen Namen ein.",
	(n: string) =>
		labels.value.findIndex(
			(l) => l.name.trim().toLocaleLowerCase() === n.trim().toLocaleLowerCase(),
		) > -1 && "Dieses Label exisitiert bereits.",
];

const _colors = computed(() => {
	return mapKeys(colors, (v, k) => startCase(k));
});

const selectedLabels = computed(() => {
	return props.value.map((id) => labels.value.find((l) => l.id === id)).filter((v) => v != null);
});

const labels = computed(() => {
	return store.issue.labels;
});

function isNewLabel(l: Label | string): l is string {
	return typeof l === "string";
}

function addLabel(name: string) {
	editingLabel.value = {
		name: name,
		color: defaultLabelColor,
		id: -1,
	};
}

function onChange(ls: Array<Label | string>) {
	searchText.value = "";

	const newLabel = ls.find(isNewLabel);

	if (newLabel != null) {
		addLabel(newLabel);
	}

	emit(
		"update",
		ls.filter((l): l is Label => !isNewLabel(l)).map((l) => l.id),
	);
}

async function deleteEditingLabel() {
	const i = editingLabel.value;
	if (i != null && i.id != null && i.id > -1) {
		if (
			await confirm.confirm(
				"Wollen Sie dieses Label löschen? Das Label wird von allen Einträgen entfernt.",
				{ icon: "mdi-delete-outline" },
			)
		) {
			store.issue.deleteLabel(i.id);
			editingLabel.value = null;
		}
	}
}

async function editLabel(item: Label) {
	editingLabel.value = item;
}

async function saveLabel() {
	if (editingLabel.value != null) {
		if (editingLabel.value.id === -1) {
			const { id } = await store.issue.createLabel(
				editingLabel.value.name,
				editingLabel.value.color || defaultLabelColor,
			);
			if (id != null) {
				emit("update", props.value.concat(id));
			}
		} else {
			await store.issue.updateLabel(
				editingLabel.value.id!,
				editingLabel.value.color || defaultLabelColor,
				editingLabel.value.name,
			);
		}
		editingLabel.value = null;
	}
}

function onRemove(label: Label) {
	emit(
		"update",
		props.value.filter((id) => id !== label.id),
	);
}
</script>

<template>
	<div>
		<VCombobox
			multiple
			flat
			solo
			hide-details
			class="rounded-lg label-box text-body-2"
			background-color="background darken-2"
			return-object
			text
			placeholder="  Labels hinzufügen …"
			item-text="name"
			item-value="id"
			:menu-props="{
				rounded: 'lg',
				contentClass: 'soft-shadow text-body-2 v-list--dense background lighten-1',
			}"
			:search-input.sync="searchText"
			:value="selectedLabels"
			:items="labels"
			@change="onChange"
		>
			<template #selection="{ selected, select, item }">
				<VChip
					:key="item.id"
					:input-value="selected"
					close
					small
					class="font-weight-medium label"
					text-color="white"
					close-icon="mdi-close"
					:color="item.color"
					@click="select"
					@click:close="onRemove(item)"
				>
					{{ item.name }}
				</VChip>
			</template>
			<template #item="{ item, on, props }">
				<VListItem :ripple="false" class="label-list-item" v-bind="props" v-on="on">
					<VListItemAvatar size="15">
						<VIcon v-if="value.find((id) => id === item.id) != null" :color="item.color">
							mdi-checkbox-marked-circle
						</VIcon>
						<VIcon v-else :color="item.color">mdi-checkbox-blank-circle</VIcon>
					</VListItemAvatar>
					<VListItemContent>
						{{ item.name }}
					</VListItemContent>
					<VListItemActionText class="action">
						<VBtn depressed small rounded @click.stop.prevent="editLabel(item)">bearbeiten</VBtn>
					</VListItemActionText>
				</VListItem>
			</template>
			<template #prepend-item>
				<VListItem
					style="border-bottom: 1px solid hsl(0deg 0% 0% / 10%)"
					@click="addLabel(searchText || 'unbenanntes Label')"
				>
					<VListItemAvatar size="15">
						<VIcon>mdi-plus</VIcon>
					</VListItemAvatar>
					<VListItemContent>Label erstellen…</VListItemContent>
				</VListItem>
			</template>
		</VCombobox>

		<VDialog
			v-if="editingLabel != null"
			scrollable
			max-width="620"
			:value="editingLabel != null"
			@input="editingLabel = null"
		>
			<VCard color="background" class="rounded-lg elevation-25">
				<VCardTitle class="px-3 py-2">
					<VRow dense>
						<VCol class="">
							<VBtn
								color="background darken-2"
								class="rounded-lg px-4"
								elevation="0"
								@click="editingLabel = null"
							>
								Abbrechen
							</VBtn>
						</VCol>
						<VCol class="text-center">Label erstellen</VCol>
						<VCol class="text-right">
							<VBtn
								class="rounded-lg px-4"
								color="primary"
								:disabled="!editingLabel.name"
								elevation="0"
								@click="saveLabel"
							>
								Speichern
							</VBtn>
						</VCol>
					</VRow>
				</VCardTitle>
				<VCardTitle class="pt-0 px-3 pb-0">
					<VTextField
						v-model="editingLabel.name"
						solo
						flat
						class="rounded-lg"
						background-color="background darken-2"
						autofocus
						:rules="labelNameRules"
						label="Label Name"
					>
						<template #prepend-inner>
							<span class="caption pr-2">Labelname</span>
						</template>
					</VTextField>
				</VCardTitle>

				<VDivider />

				<VCardText class="overflow-y-auto pt-3 background lighten-2" style="height: 300px">
					<div v-for="(color, name) in colors" :key="name">
						<VSubheader class="pl-0">{{ name }}</VSubheader>
						<VBtn
							v-for="(shade, shadeName) in color"
							:key="shadeName"
							icon
							class="mr-1 mb-1"
							:style="{ backgroundColor: shade }"
							@click="editingLabel.color = shade"
						/>
					</div>
				</VCardText>

				<VDivider />

				<VCardActions>
					<VRow dense>
						<VCol cols="2">
							<VBtn
								v-if="editingLabel != null && editingLabel.id != null && editingLabel.id > -1"
								depressed
								class="rounded-lg"
								color="background darken-2"
								@click="deleteEditingLabel"
							>
								Label löschen
							</VBtn>
						</VCol>
						<VCol cols="8" class="text-center">
							<VChip
								style="color: #fff; font-weight: 500"
								class="label mx-auto"
								:color="editingLabel.color"
							>
								{{ editingLabel.name }}
							</VChip>
						</VCol>
						<VCol cols="2"></VCol>
					</VRow>
				</VCardActions>
			</VCard>
		</VDialog>
	</div>
</template>

<style scoped>
.label {
	color: hsl(0deg 0% 100%);
	font-weight: 600;
}

.label-box :deep(.v-input__slot) {
	padding: 3px !important;
}

.label-list-item .action {
	opacity: 0%;
}

.label-list-item:hover .action {
	opacity: 100%;
}
</style>
