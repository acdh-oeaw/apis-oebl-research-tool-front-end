<template>
	<div>
		<v-combobox
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
			@change="onChange"
			:value="selectedLabels"
			:items="labels"
		>
			<template #selection="{ selected, select, item }">
				<v-chip
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
				</v-chip>
			</template>
			<template #item="{ item, on, props }">
				<v-list-item :ripple="false" class="label-list-item" v-bind="props" v-on="on">
					<v-list-item-avatar size="15">
						<v-icon v-if="value.find((id) => id === item.id) !== undefined" :color="item.color">
							mdi-checkbox-marked-circle
						</v-icon>
						<v-icon v-else :color="item.color">mdi-checkbox-blank-circle</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						{{ item.name }}
					</v-list-item-content>
					<v-list-item-action-text class="action">
						<v-btn depressed small rounded @click.stop.prevent="editLabel(item)">bearbeiten</v-btn>
					</v-list-item-action-text>
				</v-list-item>
			</template>
			<template #prepend-item>
				<v-list-item
					style="border-bottom: 1px solid rgb(0 0 0 / 10%)"
					@click="addLabel(searchText || 'unbenanntes Label')"
				>
					<v-list-item-avatar size="15">
						<v-icon>mdi-plus</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>Label erstellen…</v-list-item-content>
				</v-list-item>
				<!-- <v-divider /> -->
			</template>
		</v-combobox>
		<v-dialog
			v-if="editingLabel !== null"
			scrollable
			max-width="620"
			:value="editingLabel !== null"
			@input="editingLabel = null"
		>
			<v-card color="background" class="rounded-lg elevation-25">
				<v-card-title class="px-3 py-2">
					<v-row dense>
						<v-col class="">
							<v-btn
								color="background darken-2"
								class="rounded-lg px-4"
								elevation="0"
								@click="editingLabel = null"
							>
								Abbrechen
							</v-btn>
						</v-col>
						<v-col class="text-center">Label erstellen</v-col>
						<v-col class="text-right">
							<v-btn
								class="rounded-lg px-4"
								color="primary"
								:disabled="!editingLabel.name"
								elevation="0"
								@click="saveLabel"
							>
								Speichern
							</v-btn>
						</v-col>
					</v-row>
				</v-card-title>
				<v-card-title class="pt-0 px-3 pb-0">
					<v-text-field
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
					</v-text-field>
				</v-card-title>
				<v-divider />
				<v-card-text class="overflow-y-auto pt-3 background lighten-2" style="height: 300px">
					<div v-for="(color, name) in colors" :key="name">
						<v-subheader class="pl-0">{{ name }}</v-subheader>
						<v-btn
							v-for="(shade, shadeName) in color"
							:key="shadeName"
							icon
							class="mr-1 mb-1"
							:style="{ backgroundColor: shade }"
							@click="editingLabel.color = shade"
						/>
					</div>
				</v-card-text>
				<v-divider />
				<v-card-actions>
					<v-row dense>
						<v-col cols="2">
							<v-btn
								v-if="
									editingLabel !== undefined &&
									editingLabel.id !== undefined &&
									editingLabel.id > -1
								"
								depressed
								class="rounded-lg"
								color="background darken-2"
								@click="deleteEditingLabel"
							>
								Label löschen
							</v-btn>
						</v-col>
						<v-col cols="8" class="text-center">
							<v-chip
								style="color: white; font-weight: 500"
								class="label mx-auto"
								:color="editingLabel.color"
							>
								{{ editingLabel.name }}
							</v-chip>
						</v-col>
						<v-col cols="2"></v-col>
					</v-row>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import colors from "vuetify/lib/util/colors";

import store from "@/store";
import confirm from "@/store/confirm";
import { type Label } from "@/types/issue";

@Component
export default class LemmaLabels extends Vue {
	@Prop({ default: [] }) value!: Array<number>;

	searchText: string | null = null;
	editingLabel: Label | null = null;
	defaultLabelColor = colors.blueGrey.base;

	labelNameRules = [
		(n: string) =>
			(n === null || (typeof n === "string" && n.trim() === "")) && "Geben Sie einen Namen ein.",
		(n: string) =>
			this.labels.findIndex(
				(l) => l.name.trim().toLocaleLowerCase() === n.trim().toLocaleLowerCase(),
			) > -1 && "Dieses Label exisitiert bereits.",
	];

	get colors() {
		return _.mapKeys(colors, (v, k) => _.startCase(k));
	}

	get selectedLabels() {
		return this.value
			.map((id) => this.labels.find((l) => l.id === id))
			.filter((v) => v !== undefined);
	}

	get labels() {
		return store.issue.labels;
	}

	isNewLabel(l: Label | string): l is string {
		return typeof l === "string";
	}

	addLabel(name: string) {
		this.editingLabel = {
			name: name,
			color: this.defaultLabelColor,
			id: -1,
		};
	}

	onChange(ls: Array<Label | string>) {
		this.searchText = "";
		const newLabel = ls.find(this.isNewLabel);
		if (newLabel !== undefined) {
			this.addLabel(newLabel);
		}
		this.$emit(
			"update",
			ls.filter((l): l is Label => !this.isNewLabel(l)).map((l) => l.id),
		);
	}

	async deleteEditingLabel() {
		const i = this.editingLabel;
		if (i !== null && i.id !== undefined && i.id > -1) {
			if (
				await confirm.confirm(
					"Wollen Sie dieses Label löschen? Das Label wird von allen Einträgen entfernt.",
					{ icon: "mdi-delete-outline" },
				)
			) {
				store.issue.deleteLabel(i.id);
				this.editingLabel = null;
			}
		}
	}

	async editLabel(item: Label) {
		this.editingLabel = item;
	}

	async saveLabel() {
		if (this.editingLabel !== null) {
			if (this.editingLabel.id === -1) {
				const { id } = await store.issue.createLabel(
					this.editingLabel.name,
					this.editingLabel.color || this.defaultLabelColor,
				);
				if (id !== undefined) {
					this.$emit("update", this.value.concat(id));
				}
			} else {
				await store.issue.updateLabel(
					this.editingLabel.id!,
					this.editingLabel.color || this.defaultLabelColor,
					this.editingLabel.name,
				);
			}
			this.editingLabel = null;
		}
	}

	onRemove(label: Label) {
		this.$emit(
			"update",
			this.value.filter((id) => id !== label.id),
		);
	}
}
</script>

<style lang="stylus" scoped>
.label
  color white
  font-weight 600

.label-box /deep/ .v-input__slot
  padding 3px !important

.label-list-item .action
  opacity 0%

.label-list-item:hover .action
  opacity 100%
</style>
