<template>
	<v-menu max-height="80vh" content-class="soft-shadow">
		<template #activator="{ on, attrs }">
			<v-btn
				small
				:width="width"
				text
				class="px-1 ellipsis select-button rounded-lg"
				:class="[btnClass, value == null && 'muted']"
				v-bind="attrs"
				@click="onClickActivator"
				v-on="on"
			>
				<v-icon v-if="prependIcon != null" class="mr-1" small>{{ prependIcon }}</v-icon>
				{{ label ? label + ": " : "" }}
				{{ displayValue }}
				<v-icon v-if="showChevron" small>mdi-unfold-more-horizontal</v-icon>
			</v-btn>
		</template>
		<v-card
			class="pa-0 fill-height d-flex flex-column rounded-lg"
			color="background"
			style="max-height: inherit"
		>
			<v-card-title v-if="!hideSearchbar" class="py-2 px-3 d-flex flex-row flex-nowrap">
				<v-icon class="mr-2" small>mdi-magnify</v-icon>
				<input
					ref="input"
					v-model.trim="searchText"
					:placeholder="searchPlaceholder"
					class="search-input text-body-2"
					@keydown="onKeyDownSearch"
					@click.prevent.stop=""
				/>
				<v-btn
					v-if="searchText != null && searchText !== ''"
					color="primary"
					icon
					x-small
					text
					@click.prevent.stop="searchText = ''"
				>
					<v-icon small>mdi-close</v-icon>
				</v-btn>
			</v-card-title>
			<v-divider class="ma-0" />
			<v-list
				v-if="filteredItems.length > 0"
				color="transparent"
				class="overflow-y-auto x-dense"
				:two-line="keyDescription != null"
				nav
			>
				<v-list-item v-for="item in filteredItems" :key="item[keyValue]" @click="selectItem(item)">
					<v-list-item-avatar>
						<v-icon
							v-if="
								value === item[keyValue] || (value != null && value[keyValue] === item[keyValue])
							"
							small
						>
							mdi-check
						</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>
							{{ item[keyName] }}
						</v-list-item-title>
						<v-list-item-subtitle v-if="keyDescription != null">
							{{ get(item, keyDescription) }}
						</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
				<v-divider v-if="addNullOption" />
				<v-list-item v-if="addNullOption" @click="returnNull">
					<v-list-item-avatar>
						<v-icon v-if="value == null || value[keyValue] == null" small>mdi-check</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>
							{{ addNullOption }}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
			<v-list v-else color="transparent" class="overflow-y-auto x-dense" nav>
				<v-list-item>
					<v-list-item-content class="caption text-center muted">
						<v-list-item-title>nichts gefunden</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-card>
	</v-menu>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Prop, Vue } from "vue-property-decorator";

type Item = any;

@Component
export default class SelectMenu extends Vue {
	@Prop({ default: () => [] }) items!: Array<Item>;
	@Prop({ default: null }) value!: Item | null;
	@Prop({ default: "name" }) keyName!: string;
	@Prop({ default: "value" }) keyValue!: string;
	@Prop({ default: null }) keyDescription!: string | null;
	@Prop({ default: false }) returnValue!: boolean;
	@Prop({ default: null }) width!: number;
	@Prop({ default: "" }) btnClass!: string;
	@Prop({ default: null }) label!: string | null;
	@Prop({ default: false }) showChevron!: boolean;
	@Prop({ default: false }) hideSearchbar!: boolean;
	@Prop({ default: null }) prependIcon!: string | null;
	@Prop({ default: null }) addNullOption!: string | null;
	@Prop({ default: "Suchen …" }) searchPlaceholder!: string;
	@Prop({ default: "nichts ausgewählt" }) noSelectionText!: string;

	searchText: string | null = null;

	get(item: any, path: string) {
		return _.get(item, path);
	}

	onKeyDownSearch(e: KeyboardEvent) {
		if (e.key === "Escape" && this.searchText !== "" && this.searchText != null) {
			e.preventDefault();
			e.stopPropagation();
			this.searchText = "";
		}
	}

	returnNull() {
		if (this.returnValue === true) {
			return null;
		} else {
			return {
				[this.keyValue]: null,
				[this.keyName]: this.addNullOption,
			};
		}
	}

	selectItem(item: Item) {
		console.log(item[this.keyName]);
		if (this.returnValue) {
			this.$emit("input", item[this.keyValue]);
		} else {
			this.$emit("input", item);
		}
	}

	async focusInput() {
		await this.$nextTick();
		setTimeout(() => {
			if (this.$refs.input instanceof HTMLInputElement) {
				this.$nextTick();
				this.$refs.input.focus();
				this.$refs.input.select();
			}
		}, 100);
	}

	async onClickActivator() {
		this.focusInput();
	}

	get displayValue() {
		if (this.value == null) {
			return this.noSelectionText;
		}
		if (typeof this.value === "string" || typeof this.value === "number") {
			const item = this.items.find((i) => i[this.keyValue] === this.value);
			if (item && item[this.keyName]) {
				return item[this.keyName];
			} else {
				return this.noSelectionText;
			}
		} else {
			return this.value[this.keyName];
		}
	}

	get filteredItems() {
		if (this.searchText != null) {
			const searchTextLow = this.searchText.toLowerCase();
			return this.items.filter((i) => {
				return (
					i[this.keyName].toLowerCase().indexOf(searchTextLow) > -1 ||
					(this.keyDescription != null &&
						this.get(i, this.keyDescription).toLowerCase().indexOf(searchTextLow) > -1)
				);
			});
		} else {
			return this.items;
		}
	}
}
</script>

<style lang="stylus" scoped>
.search-input
  width 100%
  outline 0
</style>

<style lang="stylus">
.theme--dark .search-input
  color white

.select-button .v-btn__content
  display block
  overflow hidden
  max-width 100%
  text-overflow ellipsis
</style>
