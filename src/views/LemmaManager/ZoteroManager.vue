<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { convertZoteroItemToView, ZoteroLemmaManagmentController } from "@/service/zotero";
import { type ZoteroItem, type ZoteroView } from "@/types/zotero";
import ZoteroSearch from "@/views/lib/ZoteroSearch.vue";

/**
 * Manage Zotero Items from and about a lemma (https://gitlab.com/acdh-oeaw/oebl/oebl-research-tool-front-end/-/issues/17):
 *
 * - List items
 * - … more to come
 */
@Component({
	components: {
		ZoteroSearch,
	},
})
export default class ZoteroManager extends Vue {
	@Prop({ default: () => [] }) zoteroKeysFromServer!: Array<string>;
	@Prop() lemmaName!: string;
	@Prop() listName!: string;

	detailedView = true;
	loading = false;
	updating = false;

	zoteroItems: Array<ZoteroItem> = [];
	_zoteroLemmaManagmentController?: ZoteroLemmaManagmentController = undefined; // make it not reactive

	getZoteroController(): ZoteroLemmaManagmentController {
		if (this._zoteroLemmaManagmentController === undefined) {
			this._zoteroLemmaManagmentController = new ZoteroLemmaManagmentController();
		}
		return this._zoteroLemmaManagmentController;
	}

	@Watch("zoteroKeysFromServer", { deep: false, immediate: true })
	loadAndUpdateZoteroItems() {
		this.loading = true;
		this.getZoteroController()
			.load(this.zoteroKeysFromServer)
			.then((zoteroLemmaManagmentController) => {
				this.loading = false;
				this.updating = true;
				this.zoteroItems = zoteroLemmaManagmentController.zoteroItems;
				zoteroLemmaManagmentController.update().then((zoteroLemmaManagmentController) => {
					this.updating = false;
					this.zoteroItems = zoteroLemmaManagmentController.zoteroItems;
				});
			});
	}

	addNewZoteroItem(zoteroItem: ZoteroItem) {
		// Early return if zoteroItem aleady in component
		if (
			this.zoteroItems.find((zoteroArrayItem) => zoteroArrayItem.key === zoteroItem.key) !==
			undefined
		) {
			return;
		}
		// Keep track of items in component
		this.zoteroItems.push(zoteroItem);
		// Add items to cache:
		this.getZoteroController().add([zoteroItem]);
		// Notify parent component of new zoteroItems
		this.emitZoteroItems();
	}

	removeZoteroItem(zoteroKey: string) {
		this.zoteroItems = this.getZoteroController().remove(zoteroKey).zoteroItems;
		this.emitZoteroItems();
	}

	emitZoteroItems() {
		this.$emit(
			"submit",
			this.zoteroItems.map((item) => item.key),
		);
	}

	get zoteroItemsView(): Array<ZoteroView> {
		return this.zoteroItems.map(convertZoteroItemToView);
	}
}
</script>

<template>
	<v-card class="transparent" flat>
		<v-card-title class="zotero-list-title pb-0">
			{{ listName }} Lemma

			<span v-if="loading" class="loading-zotero">…</span>
			<span v-else class="zotero-results">{{ zoteroItems.length }}</span>
			<div class="add-more-zotero-items">
				<zotero-search :exclude="zoteroItems" @submit="addNewZoteroItem($event)"></zotero-search>
			</div>
		</v-card-title>
		<div v-if="detailedView" class="detailed-zotero-view">
			<v-card-text class="pt-0 pl-2">
				<v-list class="zotero-citation-list pt-0" dense>
					<v-list-item v-for="(zoteroView, key) in zoteroItemsView" :key="key">
						{{ zoteroView.citation }}
						<v-btn :href="zoteroView.url" target="_blank" icon x-small class="pl-1">
							<v-icon x-small>mdi-open-in-new</v-icon>
						</v-btn>
						<v-spacer></v-spacer>
						<v-btn icon x-small class="rounded-lg" @click="removeZoteroItem(zoteroView.key)">
							<v-icon class="pl-6">mdi-minus-circle-outline</v-icon>
						</v-btn>
					</v-list-item>
				</v-list>
			</v-card-text>
		</div>
	</v-card>
</template>

<style scoped>
.loading-zotero {
	margin: 0 1em;
}

.zotero-results {
	margin: 0;
	padding: 0;
}

.zotero-results::before {
	content: "(";
	margin-left: 1em;
}

.zotero-results::after {
	content: ")";
}

.zotero-list-title {
	font-weight: 500;
	font-size: 100%;
}
</style>
