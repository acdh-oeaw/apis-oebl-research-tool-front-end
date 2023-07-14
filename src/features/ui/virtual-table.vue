<script lang="ts" setup>
import { keyBy, map,toArray } from "lodash";
import Vue, { computed, ref, watch } from "vue";
import Draggable from "vuedraggable";

import SelectMenu from "@/features/ui/select-menu.vue";
import TextField from "@/features/ui/text-field.vue";
import { getValueFromLemmaRowByColumn } from "@/store/lemma";
import { type LemmaColumn, type LemmaRow } from "@/types/lemma";

const props = withDefaults(
	defineProps<{
		columns: Array<LemmaColumn>;
		height: number;
		data: Array<LemmaRow>;
		rowHeight: number;
		sortableColumns?: boolean;
		keyboardSelection?: boolean;
		headerColor?: string;
		scrollToRow?: number;
		selectedRows: Array<LemmaRow>;
		showFilter?: boolean;
	}>(),
	{
		rowHeight: 40,
		sortableColumns: true,
		keyboardSelection: true,
	},
);

const emit = defineEmits<{
	(event: 'click:cell', item: any, e: any, value: any, index: any): void
	(event: "dblclick:row", item: any, e: any): void;
	(event: "update:columns", value: any): void;
	(event: "update:filter", value: { [key: string]: boolean | string | null }): void;
	(event: "update:item", value: any, e: any): void;
	(event: "update:selection", value: Array<any>): void;
}>();

const tableRef = ref<HTMLElement|null>(null)
const scroller = ref<Vue | null>(null);
const selected = ref<{ [key: number]: LemmaRow }>({});
let scrollLeft = 0;
const columnQueries = ref<{ [key: string]: boolean | string | null }>({});
const editPopUp = ref<{
	x: number;
	y: number;
	value: Array<string> | string | null;
	item: LemmaRow;
	column: LemmaColumn;
	el: HTMLElement;
} | null>(null);

// @ts-expect-error Fine.
function getNextSibling(el: HTMLElement, selector: string) {
	// Get the next sibling element.
	let sib = el.nextElementSibling;
	// If the sibling matches our selector, use it.
	// If not, jump to the next sibling and continue the loop.
	while (sib) {
		if (sib.matches(selector) && sib instanceof HTMLElement) {
			return sib;
		} else {
			sib = sib.nextElementSibling;
		}
	}
}

// @ts-expect-error Fine.
function getPreviousSibling(el: HTMLElement, selector: string) {
	// See above.
	let sib = el.previousElementSibling;
	while (sib) {
		if (sib.matches(selector) && sib instanceof HTMLElement) {
			return sib;
		} else {
			sib = sib.previousElementSibling;
		}
	}
}

function editNextField(dir: -1 | 1) {
	if (editPopUp.value != null) {
		const currentColumIndex = editableColumns.value.findIndex(
			(c) => c.value === editPopUp.value?.column.value,
		);
		const nextColumn = editableColumns.value[currentColumIndex + dir];
		const nextSiblingEl =
			dir === 1
				? getNextSibling(editPopUp.value.el, ".table-cell.editable")
				: getPreviousSibling(editPopUp.value.el, ".table-cell.editable");
		if (nextSiblingEl && nextColumn) {
			editPopUp.value = {
				x: nextSiblingEl.getBoundingClientRect().left,
				y: nextSiblingEl.getBoundingClientRect().top,
				value: getStringFromLemmaRowByColumn(editPopUp.value.item, nextColumn),
				item: editPopUp.value.item,
				column: nextColumn,
				el: nextSiblingEl,
			};
		}
	}
}

function getStringFromLemmaRowByColumn(
	lemma: LemmaRow,
	column: LemmaColumn,
): Array<string> | string | null {
	const value = getValueFromLemmaRowByColumn(lemma, column);
	if (value == null) {
		return null;
	}
	if (typeof value === "string") {
		return value;
	}

	if (column.value === "gnd") {
		return value as Array<string>;
	}

	return JSON.stringify(value);
}

function emitFilterEvent(c: LemmaColumn, ev?: boolean | string | null) {
	if (ev !== undefined && ev !== null && ev !== "") {
		columnQueries.value[c.value] = ev;
	} else {
		Vue.delete(columnQueries.value, c.value);
	}
	emit("update:filter", columnQueries.value);
}

const editableColumns = computed(() => {
	return visibleColumns.value.filter((c) => c.editable === true);
});

watch(
	() => props.scrollToRow,
	(scrollToRow) => {
		if (scrollToRow != null && scroller.value instanceof Vue) {
			(scroller.value as Vue).$el.scrollTo({
				top: scrollToRow * props.rowHeight,
			});
		}
	},
);

watch(
	() => props.selectedRows,
	(selectedRows) => {
		selected.value = keyBy(selectedRows, "id");
	},
);

function onEditItem() {
	if (editPopUp.value != null) {
		emit("update:item", editPopUp.value.item, {
			[editPopUp.value.column.value]: editPopUp.value.value,
		});
		editPopUp.value = null;
	}
}

function onDblClickCell(item: LemmaRow, e: MouseEvent, column: LemmaColumn, _index: number) {
	if (column.editable === true && e.currentTarget instanceof HTMLElement) {
		editPopUp.value = {
			x: e.currentTarget.getBoundingClientRect().left,
			y: e.currentTarget.getBoundingClientRect().top,
			value: getStringFromLemmaRowByColumn(item, column),
			el: e.currentTarget,
			column,
			item,
		};
	}
}

function onDblClickRow(e: MouseEvent, item: LemmaRow, _index: number) {
	emit("dblclick:row", item, e);
}

function onScroll(e: MouseEvent) {
	const l = (e.target as HTMLElement).scrollLeft;
	if (l !== scrollLeft) {
		scrollLeft = l;
	}
}

function handleKey(e: KeyboardEvent) {
	const mod = e.ctrlKey || e.metaKey;
	if (e.key === "Escape") {
		e.preventDefault();
		selectNone();
	} else if (e.key === "a" && mod) {
		e.preventDefault();
		selectAll();
	} else if (e.key === "ArrowDown" && mod) {
		e.preventDefault();
		selectLast();
	} else if (e.key === "ArrowUp" && mod) {
		e.preventDefault();
		selectFirst();
	} else if (e.key === "ArrowDown") {
		e.preventDefault();
		selectNext();
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		selectPrevious();
	}
}

function scrollToIndex(i: number) {
	const elOffset = i * props.rowHeight;
	const el = (scroller.value as Vue).$el;
	const sTop = el.scrollTop;
	const sBottom = sTop + el.clientHeight;
	if (elOffset < sTop || elOffset > sBottom) {
		el.scrollTo({ top: elOffset });
	}
}

function selectPrevious() {
	const selectedIndexes = map(selected.value, (v) => props.data.findIndex((r) => r.id === v.id));
	const newIndex = Math.min(...selectedIndexes) - 1;
	const prevItem = props.data[newIndex];
	if (prevItem !== undefined) {
		selected.value = { [prevItem.id]: prevItem };
		emit("update:selection", [prevItem]);
		scrollToIndex(newIndex);
	}
}

function selectNext() {
	const selectedIndexes = map(selected.value, (v) => props.data.findIndex((r) => r.id === v.id));
	const newIndex = Math.max(...selectedIndexes) + 1;
	const nextItem = props.data[newIndex];
	if (nextItem !== undefined) {
		selected.value = { [nextItem.id]: nextItem };
		emit("update:selection", [nextItem]);
		scrollToIndex(newIndex);
	}
}

function selectFirst() {
	const firstItem = props.data[0];
	if (firstItem !== undefined) {
		selected.value = { [firstItem.id]: firstItem };
		emit("update:selection", [firstItem]);
		scrollToIndex(0);
	}
}

function selectLast() {
	const lastItem = props.data[props.data.length - 1];
	if (lastItem !== undefined) {
		selected.value = { [lastItem.id]: lastItem };
		emit("update:selection", [lastItem]);
		scrollToIndex(props.data.length - 1);
	}
}

function selectNone() {
	selected.value = {};
	emit("update:selection", []);
}

function selectAll() {
	selected.value = keyBy(props.data, "id");
	emit("update:selection", props.data);
}

function selectItem(item: LemmaRow, event: MouseEvent) {
	if (event.currentTarget instanceof HTMLElement) {
		if (event.ctrlKey || event.metaKey) {
			// add or remove from selection set
			const isSelected = event.currentTarget.classList.toggle("selected");
			if (isSelected) {
				selected.value[item.id] = item;
			} else {
				Vue.delete(selected, item.id);
				// const updated = { ...selected.value }
				// delete updated[item.id]
				// selected.value = updated
			}
		} else {
			// deselect everything, then select this.
			if (tableRef.value instanceof HTMLElement) {
				tableRef.value.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
			}
			event.currentTarget.classList.add("selected");
			selected.value = { [item.id]: item };
		}
	}
	emit("update:selection", toArray(selected.value));
}

const visibleColumns = computed(() => {
	return props.columns.filter((c) => c.show === true);
});

const defaultWidth = computed(() => {
	return 100 / visibleColumns.value.length + "%";
});

function updateColumnOrder(cs: Array<LemmaColumn>) {
	emit("update:columns", [...cs, ...props.columns.filter((c) => c.show === false)]);
}
</script>

<template>
	<!-- FIXME: a11y -->
	<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
	<div ref="tableRef" class="virtual-table-outer" tabindex="-1" @keydown="handleKey">
		<VMenu
			v-if="editPopUp !== null"
			:close-on-content-click="false"
			min-width="130"
			max-width="400"
			content-class="transition-left"
			class="soft-shadow"
			:value="editPopUp !== null"
			:position-x="editPopUp.x - 3"
			:position-y="editPopUp.y - 10"
			@input="(e) => e === false && (editPopUp = null)"
		>
			<VCard elevation="0" color="background lighten-2" rounded="lg">
				<TextTield
					v-model="editPopUp.value"
					class="mx-2"
					style="min-height: 1em"
					color="background lighten-2"
					:selected="true"
					:placeholder="editPopUp.column.name"
					@keydown.native.tab.exact.prevent="editNextField(1)"
					@keydown.native.tab.shift.exact.prevent="editNextField(-1)"
					@keydown.native.enter="onEditItem"
				/>
				<VDivider />
				<VCardActions>
					<VBtn text rounded x-small @click="editPopUp = null">Abbrechen</VBtn>
					<VSpacer />
					<VBtn elevation="0" rounded x-small @click="onEditItem">Speichern</VBtn>
				</VCardActions>
			</VCard>
		</VMenu>
		<Draggable
			:disabled="sortableColumns === false"
			:value="visibleColumns"
			tag="div"
			:class="['header-row', 'rounded-lg', headerColor]"
			animation="200"
			:style="{ transform: `translateX(-${scrollLeft}px)` }"
			drag-class="header-row-drag"
			ghost-class="header-row-ghost"
			direction="horizontal"
			@start.stop.prevent.capture=""
			@end.stop.prevent.capture=""
			@input="updateColumnOrder"
		>
			<div
				v-for="column in visibleColumns"
				:key="column.value"
				:style="{ width: column.width ? column.width + 'px' : defaultWidth, height: rowHeight }"
				:class="[
					'header-cell',
					$listeners['click:header'] && 'clickable',
					column.sort !== null && column.sort !== undefined && 'sort-active',
				]"
			>
				<!-- FIXME: a11y -->
				<!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
				<div class="column-name" @click="$emit('click:header', column)">
					<span v-if="column.sort === 'asc'" class="header-sort-arrow">
						<VIcon x-small>mdi-chevron-up</VIcon>
					</span>
					<span v-if="column.sort === 'desc'" class="header-sort-arrow">
						<VIcon x-small>mdi-chevron-down</VIcon>
					</span>
					{{ column.name }}
				</div>
				<TextField
					v-if="showFilter && column.type !== 'boolean'"
					placeholder="Suchen…"
					class="mb-0"
					color="background darken-3 mx-0"
					@input="emitFilterEvent(column, $event)"
					@keydown.esc="emitFilterEvent(column, '')"
				/>
				<SelectMenu
					v-else-if="showFilter && column.type === 'boolean'"
					:hide-searchbar="true"
					:items="[
						{ name: 'egal', value: null },
						{ name: 'ja', value: true },
						{ name: 'nein', value: false },
					]"
					@input="emitFilterEvent(column, $event.value)"
				/>
				<!-- <input @keyup.stop="" v-show="showFilter" type="text" placeholder="☉ Suchen…" /> -->
			</div>
		</Draggable>
		<VVirtualScroll
			ref="scroller"
			style="contain: content"
			:bench="10"
			tabindex="-1"
			class="virtual-scroller"
			:items="data"
			:height="height - rowHeight"
			:item-height="rowHeight"
			@keyup="$emit('keyup', $event)"
			@scroll.passive="onScroll"
		>
			<template #default="{ item, index }">
				<!-- FIXME: a11y -->
				<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
				<div
					:draggable="!!$listeners['drag:row']"
					:style="{ height: rowHeight + 'px' }"
					:class="[
						'table-row',
						index % 2 === 0 ? 'even' : 'odd',
						selected[item.id] && 'selected',
						scrollToRow === index && 'scroll-to-row',
					]"
					@dragstart="$emit('drag:row', item, $event)"
					@click="selectItem(item, $event)"
					@dblclick="onDblClickRow($event, item, index)"
					@keydown="handleKey"
				>
					<!-- FIXME: a11y -->
					<!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
					<div
						v-for="column in visibleColumns"
						:key="index + '__' + column.value"
						:style="{
							width: column.width ? column.width + 'px' : defaultWidth,
							maxHeight: rowHeight - 5 + 'px',
						}"
						:class="['table-cell', column.editable && 'editable']"
						@click="emit('click:cell', item, $event, column.value, index)"
						@dblclick="onDblClickCell(item, $event, column, index)"
					>
						<slot
							name="cell"
							draggable
							:item="{ [column.value]: getStringFromLemmaRowByColumn(item, column) }"
							:index="index"
							:column="{ value: column.value }"
							:value="getStringFromLemmaRowByColumn(item, column)"
						/>
					</div>
				</div>
			</template>
		</VVirtualScroll>
	</div>
</template>

<style scoped>
.transition-left {
	transition: left 0.1s;
}

:deep(.v-virtual-scroll__container) {
	will-change: contents, scroll-position;
}

.header-row-drag {
	border-radius: 10px;
	background: var(--v-background-darken2);
}

.header-row-ghost {
	opacity: 0% !important;
}

.header-row,
.table-row {
	display: flex;
	line-height: 1.2;
}

.header-row {
	position: relative;
	z-index: 5;
	padding-right: 8px;
	background: var(--v-background-darken3);
}

.header-cell:first-child,
.table-cell:first-child {
	text-align: right;
}

.header-cell {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 4px;
	border-right: 1px solid transparent;
	opacity: 70%;
	user-select: none;
}

.header-cell .column-name {
	overflow: hidden;
	width: 100%;
	padding: 2px;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.header-cell:focus-within {
	opacity: 100%;
}

.header-cell:hover {
	opacity: 100%;
}

.header-cell.sort-active {
	background: var(--v-background-darken3);
	font-weight: 500;
	opacity: 100%;
}

.header-cell input {
	width: 100%;
	height: 20px;
	margin: 0 -3px 1px;
	margin-bottom: 1px;
	padding: 0 3px;
	background: var(--v-primary-base);
}

.header-cell input:empty {
	background: transparent;
}

.header-sort-arrow {
	float: left;
	margin-top: 2px;
	margin-right: 2px;
	font-size: 70%;
}

.table-row {
	align-items: center;
}

.header-cell,
.table-cell {
	overflow: hidden;
	min-width: 60px;
	text-overflow: ellipsis;
}

.clickable {
	cursor: default;
}
</style>
