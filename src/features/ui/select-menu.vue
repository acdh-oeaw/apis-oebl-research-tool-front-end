<script lang="ts" setup>
import { get } from "lodash";
import { computed, ref } from "vue";

type Item = any;

const props = withDefaults(
	defineProps<{
		items: Array<Item>;
		value?: Item | null;
		keyName: string;
		keyValue: string;
		keyDescription?: string | null;
		returnValue?: boolean;
		width?: number;
		btnClass?: string;
		label?: string | null;
		showChevron?: boolean;
		hideSearchbar?: boolean;
		prependIcon?: string | null;
		addNullOption?: string | null;
		searchPlaceholder?: string;
		noSelectionText?: string;
	}>(),
	{
		keyName: "name",
		keyValue: "value",
		searchPlaceholder: "Suchen...",
		noSelectionText: "nichts ausgewählt",
	},
);

const emit = defineEmits<{
	(event: "input", value: Item): void;
}>();

const searchText = ref<string | null>(null);
const input = ref<HTMLInputElement | null>(null);

function onKeyDownSearch(e: KeyboardEvent) {
	if (e.key === "Escape" && searchText.value !== "" && searchText.value != null) {
		e.preventDefault();
		e.stopPropagation();
		searchText.value = "";
	}
}

function returnNull() {
	if (props.returnValue === true) {
		return null;
	} else {
		return {
			[props.keyValue]: null,
			[props.keyName]: props.addNullOption,
		};
	}
}

function selectItem(item: Item) {
	if (props.returnValue) {
		emit("input", item[props.keyValue]);
	} else {
		emit("input", item);
	}
}

async function focusInput() {
	setTimeout(() => {
		if (input.value instanceof HTMLInputElement) {
			input.value.focus();
			input.value.select();
		}
	}, 100);
}

async function onClickActivator() {
	focusInput();
}

const displayValue = computed(() => {
	if (props.value == null) {
		return props.noSelectionText;
	}
	if (typeof props.value === "string" || typeof props.value === "number") {
		const item = props.items.find((i) => i[props.keyValue] === props.value);
		if (item && item[props.keyName]) {
			return item[props.keyName];
		} else {
			return props.noSelectionText;
		}
	} else {
		return props.value[props.keyName];
	}
});

const filteredItems = computed(() => {
	if (searchText.value != null) {
		const searchTextLow = searchText.value.toLowerCase();

		return props.items.filter((i) => {
			return (
				i[props.keyName].toLowerCase().indexOf(searchTextLow) > -1 ||
				(props.keyDescription !== null &&
					get(i, props.keyDescription).toLowerCase().indexOf(searchTextLow) > -1)
			);
		});
	} else {
		return props.items;
	}
});
</script>

<template>
	<VMenu max-height="80vh" content-class="soft-shadow">
		<template #activator="{ on, attrs }">
			<VBtn
				small
				:width="width"
				text
				class="px-1 ellipsis select-button rounded-lg"
				:class="[btnClass, value === null && 'muted']"
				v-bind="attrs"
				@click="onClickActivator"
				v-on="on"
			>
				<VIcon v-if="prependIcon !== null" class="mr-1" small>{{ prependIcon }}</VIcon>
				{{ label ? label + ": " : "" }}
				{{ displayValue }}
				<VIcon v-if="showChevron" small>mdi-unfold-more-horizontal</VIcon>
			</VBtn>
		</template>
		<VCard
			class="pa-0 fill-height d-flex flex-column rounded-lg"
			color="background"
			style="max-height: inherit"
		>
			<VCardTitle v-if="!hideSearchbar" class="py-2 px-3 d-flex flex-row flex-nowrap">
				<VIcon class="mr-2" small>mdi-magnify</VIcon>
				<input
					ref="input"
					v-model.trim="searchText"
					:placeholder="searchPlaceholder"
					class="search-input text-body-2"
					@keydown="onKeyDownSearch"
					@click.prevent.stop=""
				/>
				<VBtn
					v-if="searchText !== null && searchText !== ''"
					color="primary"
					icon
					x-small
					text
					@click.prevent.stop="searchText = ''"
				>
					<VIcon small>mdi-close</VIcon>
				</VBtn>
			</VCardTitle>
			<VDivider class="ma-0" />
			<VList
				v-if="filteredItems.length > 0"
				color="transparent"
				class="overflow-y-auto x-dense"
				:two-line="keyDescription !== null"
				nav
			>
				<VListItem v-for="item in filteredItems" :key="item[keyValue]" @click="selectItem(item)">
					<VListItemAvatar>
						<VIcon
							v-if="
								value === item[keyValue] || (value !== null && value[keyValue] === item[keyValue])
							"
							small
						>
							mdi-check
						</VIcon>
					</VListItemAvatar>
					<VListItemContent>
						<VListItemTitle>
							{{ item[keyName] }}
						</VListItemTitle>
						<VListItemSubtitle v-if="keyDescription !== null">
							{{ get(item, keyDescription) }}
						</VListItemSubtitle>
					</VListItemContent>
				</VListItem>
				<VDivider v-if="addNullOption" />
				<VListItem v-if="addNullOption" @click="returnNull">
					<VListItemAvatar>
						<VIcon v-if="value === null || value[keyValue] === null" small>mdi-check</VIcon>
					</VListItemAvatar>
					<VListItemContent>
						<VListItemTitle>
							{{ addNullOption }}
						</VListItemTitle>
					</VListItemContent>
				</VListItem>
			</VList>
			<VList v-else color="transparent" class="overflow-y-auto x-dense" nav>
				<VListItem>
					<VListItemContent class="caption text-center muted">
						<VListItemTitle>nichts gefunden</VListItemTitle>
					</VListItemContent>
				</VListItem>
			</VList>
		</VCard>
	</VMenu>
</template>

<style>
.theme--dark .search-input {
	color: hsl(0deg 0% 100%);
}

.select-button .v-btn__content {
	display: block;
	overflow: hidden;
	max-width: 100%;
	text-overflow: ellipsis;
}
</style>

<style scoped>
.search-input {
	width: 100%;
	outline: 0;
}
</style>
