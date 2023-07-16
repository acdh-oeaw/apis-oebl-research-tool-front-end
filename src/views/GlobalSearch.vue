<template>
	<div>
		<v-dialog
			overlay-color="black"
			:overlay-opacity="$vuetify.theme.dark ? '.8' : '.5'"
			transition="fade-transition"
			max-width="1000"
			content-class="elevation-0"
			:value="value"
			@input="$emit('input', $event)"
		>
			<v-card v-if="value" class="pa-0 rounded-lg" color="transparent" flat>
				<v-card-title class="pa-0 background rounded-tl-lg rounded-tr-lg d-flex flex-nowrap">
					<v-icon style="opacity: 50%" class="ml-3" large>mdi-magnify</v-icon>
					<input
						ref="input"
						v-model="searchText"
						aria-label="Suche"
						class="pl-2 py-4 rounded-lg global-search"
						placeholder="Suchen…"
						type="text"
						@keydown.down.prevent="selectResult(1)"
						@keydown.up.prevent="selectResult(-1)"
						@keydown.esc.capture.prevent.stop="onEsc"
						@keydown.enter.prevent="openSelectedResult"
						@input="onInput"
					/>
				</v-card-title>
				<v-card-text
					class="overflow-hidden pa-0"
					style="position: relative; height: 450px; background: transparent"
				>
					<v-divider />
					<div class="d-flex flex-row rounded-bl-lg rounded-br-lg background darken-2 fill-height">
						<v-list
							ref="list"
							style="width: 60%"
							class="overflow-y-auto fill-height pa-0"
							color="background darken-2"
							dense
						>
							<v-subheader
								class="sticky px-2 ma-0"
								style="z-index: 1; background: var(--v-background-darken2)"
							>
								{{ searchText === "" ? "Zuletzt gesucht" : "Lemmata" }}
							</v-subheader>
							<v-list-item
								v-for="(result, i) in results"
								:key="i"
								:input-value="i === selectedResult"
								@click="selectedResult = i"
							>
								<v-list-item-avatar width="15">
									<span v-if="result.item.selected === true" style="color: var(--v-primary-base)">
										★
									</span>
									<span v-if="result.item.selected === false" style="opacity: 50%">☆</span>
								</v-list-item-avatar>
								<v-list-item-content>
									<v-list-item-title>
										{{ result.item.firstName }} {{ result.item.lastName }}
									</v-list-item-title>
									<!--
                    Only check for borth date valid …
                    -> If only birth date valid: "01.01.2000 –",
                      else "01.01.1900 - 01.01.1980" -->
									<v-list-item-subtitle v-if="result.item.dateOfBirth.isValid()">
										{{ [result.item.dateOfBirth, result.item.dateOfDeath].join(" – ") }}
									</v-list-item-subtitle>
								</v-list-item-content>
								<v-list-item-action-text
									style="overflow: hidden; max-width: 50%; white-space: nowrap"
								>
									<div v-if="result.item.list" class="text-right font-weight-bold">
										<v-icon x-small>mdi-format-list-bulleted</v-icon>
										{{ result.item.list.title }}
									</div>
								</v-list-item-action-text>
							</v-list-item>
						</v-list>
						<div style="width: 40%" class="preview-panel background">
							<lemma-detail
								v-if="selectedLemma != null"
								:value="selectedLemma.item"
								:show-tooggle-side-bar-button="false"
								@update="updateLemma"
							/>
						</div>
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>
	</div>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import store from "@/store";
import { type SearchItem } from "@/store/search";
import { type LemmaRow } from "@/types/lemma";

import LemmaDetail from "./LemmaManager/LemmaDetail.vue";

@Component({
	components: {
		LemmaDetail,
	},
})
export default class GlobalSearch extends Vue {
	@Prop({ default: false }) value!: boolean;
	selectedResult = 0;
	searchText = "";

	get selectedLemma() {
		return this.results[this.selectedResult] || null;
	}

	async selectResult(dir: -1 | 1) {
		if (dir === -1) {
			this.selectedResult = Math.max(this.selectedResult - 1, 0);
		} else {
			this.selectedResult = Math.min(this.selectedResult + 1, this.results.length - 1);
		}
		await this.$nextTick();
		(this.$refs.list as Vue).$el.scrollBy({ top: 50 * dir, behavior: "smooth" });
	}

	openSelectedResult() {
		this.$emit("input", false);
		store.lemma.selectedLemmas = [this.selectedLemma.item];
		console.log(this.selectedLemma.item.list, "this.selectedLemma.item.list");
		// open a list
		if (this.selectedLemma.item.list != null) {
			this.$router
				.push({
					path: `/lemmas/list/${this.selectedLemma.item.list.id}`,
					query: {
						focus: String(this.selectedLemma.item.id),
					},
				})
				.catch(console.log);
			// open all lemmas
		} else {
			this.$router.push({
				path: "/lemmas",
				query: {
					focus: String(this.selectedLemma.item.id),
				},
			});
		}
		store.search.addRecentSearchItem(this.selectedLemma);
	}

	@Watch("value")
	async onChangeVisibility() {
		await this.$nextTick();
		if (this.$refs.input instanceof HTMLInputElement) {
			await this.$nextTick();
			this.$refs.input.focus();
			this.$refs.input.select();
		}
	}

	updateLemma(u: Partial<LemmaRow>) {
		if (this.selectedLemma != null) {
			store.lemma.updateLemmas([this.selectedLemma.item], u);
		}
	}

	async resetScroll() {
		await this.$nextTick();
		if (this.$refs.list instanceof Vue) {
			(this.$refs.list as Vue).$el.scrollTop = 0;
		}
	}

	async onInput() {
		this.selectedResult = 0;
		this.resetScroll();
	}

	onEsc() {
		if (this.searchText !== "") {
			this.searchText = "";
		} else {
			this.$emit("input", false);
		}
	}

	get results(): Array<SearchItem> {
		if (this.searchText === "") {
			return store.search.recentSearchItems;
		}

		const searchTerms = this.searchText.split(/\s/).map((term) => term.toLocaleLowerCase());

		const foundItems: Array<SearchItem> = [];
		const limitItems = 40;

		for (const lemma of store.lemma.allLemmas) {
			if (this.lemmaPassesOrSearch(lemma, searchTerms)) {
				foundItems.push({
					type: "lemma",
					item: lemma,
				});
			}

			if (foundItems.length > limitItems) {
				break;
			}
		}

		return foundItems;
	}

	/**
	 * Check if any of the values include the searcht term.
	 */
	lemmaPassesOrSearch(lemma: LemmaRow, searchTerms: Array<string>): boolean {
		for (let value of this.yieldLemmaSearchFields(lemma)) {
			if (value == null || value === "") {
				continue;
			}

			value = value.toLocaleLowerCase();

			for (const searchTerm of searchTerms) {
				if (value.includes(searchTerm)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Flat yield all values relevant for this component's global search: Go deeper for `columns_user`
	 */
	*yieldLemmaSearchFields(lemma: LemmaRow): Generator<string | null | undefined> {
		// 1. Hard coded yields for known – I was tired of dynamic string conversion
		yield lemma.lastName;
		yield lemma.dateOfBirth.toString();
		yield lemma.dateOfBirth.toString();
		yield lemma.firstName;
		if (lemma.gnd.length > 0) {
			yield JSON.stringify(lemma.gnd);
		}
		for (const alternativeName of lemma.alternativeNames) {
			yield alternativeName.firstName;
			yield alternativeName.lastName;
		}

		// 2. Go down the road

		for (let value of Object.values(lemma.columns_user)) {
			value = typeof value === "number" ? String(value) : value; // Cast numbers to strings
			// and let everything else go:
			if (typeof value !== "string") {
				continue;
			}
			yield value;
		}
	}
}
</script>

<style lang="stylus" scoped>
.global-search
  width 100%
  outline 0
  font-size 1.7em
</style>

<style lang="stylus">
.theme--dark .global-search
  color #fff
</style>
