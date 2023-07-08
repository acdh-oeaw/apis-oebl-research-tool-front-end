<template>
	<!-- FIXME: a11y -->
	<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
	<div class="virtual-table-outer" tabindex="-1" @keydown="handleKey">
		<v-menu
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
			<v-card elevation="0" color="background lighten-2" rounded="lg">
				<text-field
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
				<v-divider />
				<v-card-actions>
					<v-btn text rounded x-small @click="editPopUp = null">Abbrechen</v-btn>
					<v-spacer />
					<v-btn elevation="0" rounded x-small @click="onEditItem">Speichern</v-btn>
				</v-card-actions>
			</v-card>
		</v-menu>
		<draggable
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
						<v-icon x-small>mdi-chevron-up</v-icon>
					</span>
					<span v-if="column.sort === 'desc'" class="header-sort-arrow">
						<v-icon x-small>mdi-chevron-down</v-icon>
					</span>
					{{ column.name }}
				</div>
				<text-field
					v-if="showFilter && column.type !== 'boolean'"
					placeholder="Suchen…"
					class="mb-0"
					color="background darken-3 mx-0"
					@input="emitFilterEvent(column, $event)"
					@keydown.esc="emitFilterEvent(column, '')"
				/>
				<select-menu
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
		</draggable>
		<v-virtual-scroll
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
					test-id="lemma-row"
					:draggable="$listeners['drag:row']"
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
						@click="$emit('click:cell', item, $event, column.value, index)"
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
		</v-virtual-scroll>
	</div>
</template>

<script lang="ts">
import _ from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Draggable from "vuedraggable";

import { getValueFromLemmaRowByColumn } from "@/store/lemma";
import { type LemmaColumn, type LemmaRow } from "@/types/lemma";
import { DateContainer } from "@/util/dates";
import SelectMenu from "@/views/lib/SelectMenu.vue";
import TextField from "@/views/lib/TextField.vue";

function getNextSibling(el: HTMLElement, selector: string): HTMLElement | undefined {
	// Get the next sibling element
	let sib = el.nextElementSibling;
	// If the sibling matches our selector, use it
	// If not, jump to the next sibling and continue the loop
	while (sib) {
		if (sib.matches(selector) && sib instanceof HTMLElement) {
			return sib;
		} else {
			sib = sib.nextElementSibling;
		}
	}
}
function getPreviousSibling(el: HTMLElement, selector: string): HTMLElement | undefined {
	// see above
	let sib = el.previousElementSibling;
	while (sib) {
		if (sib.matches(selector) && sib instanceof HTMLElement) {
			return sib;
		} else {
			sib = sib.previousElementSibling;
		}
	}
}

@Component({
	components: {
		Draggable,
		TextField,
		SelectMenu,
	},
})
export default class VirtualTable extends Vue {
	@Prop({ default: [] }) columns!: Array<LemmaColumn>;
	@Prop({ required: true }) height!: number;
	@Prop({ default: [] }) data!: Array<LemmaRow>;
	@Prop({ default: 40 }) rowHeight!: number;
	@Prop({ default: true }) sortableColumns!: boolean;
	@Prop({ default: true }) keyboardSelection!: boolean;
	@Prop({ default: "" }) headerColor!: string;
	@Prop({ default: null }) scrollToRow!: number | null;
	@Prop({ default: () => [] }) selectedRows!: Array<LemmaRow>;
	@Prop({ default: false }) showFilter!: boolean;

	selected: { [key: number]: LemmaRow } = {};
	log = console.log;
	scrollLeft = 0;

	columnQueries: { [key: string]: boolean | string | null } = {};

	editPopUp: {
		x: number;
		y: number;
		value: Array<string> | string | null;
		item: LemmaRow;
		column: LemmaColumn;
		el: HTMLElement;
	} | null = null;

	editNextField(dir: -1 | 1) {
		if (this.editPopUp !== null) {
			const currentColumIndex = this.editableColumns.findIndex(
				(c) => c.value === this.editPopUp?.column.value,
			);
			const nextColumn = this.editableColumns[currentColumIndex + dir];
			const nextSiblingEl =
				dir === 1
					? getNextSibling(this.editPopUp.el, ".table-cell.editable")
					: getPreviousSibling(this.editPopUp.el, ".table-cell.editable");
			if (nextSiblingEl && nextColumn) {
				this.editPopUp = {
					x: nextSiblingEl.getBoundingClientRect().left,
					y: nextSiblingEl.getBoundingClientRect().top,
					value: this.getStringFromLemmaRowByColumn(this.editPopUp.item, nextColumn),
					item: this.editPopUp.item,
					column: nextColumn,
					el: nextSiblingEl,
				};
			}
		}
	}

	getStringFromLemmaRowByColumn(
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

		if (value instanceof DateContainer) {
			return value.toString();
		}

		if (column.value === "gnd") {
			return value as Array<string>;
		}

		return JSON.stringify(value);
	}

	emitFilterEvent(c: LemmaColumn, ev?: boolean | string | null) {
		if (ev !== undefined && ev !== null && ev !== "") {
			this.columnQueries[c.value] = ev;
		} else {
			Vue.delete(this.columnQueries, c.value);
		}
		this.$emit("update:filter", this.columnQueries);
	}

	get editableColumns() {
		return this.visibleColumns.filter((c) => c.editable === true);
	}

	@Watch("scrollToRow")
	onChangeScrollToRow() {
		if (this.scrollToRow !== null && this.$refs.scroller instanceof Vue) {
			(this.$refs.scroller as Vue).$el.scrollTo({
				top: this.scrollToRow * this.rowHeight,
			});
		}
	}

	@Watch("selectedRows")
	onChangeSelectedRows() {
		this.selected = _.keyBy(this.selectedRows, "id");
	}

	onEditItem() {
		if (this.editPopUp !== null) {
			this.$emit("update:item", this.editPopUp.item, {
				[this.editPopUp.column.value]: this.editPopUp.value,
			});
			this.editPopUp = null;
		}
	}

	onDblClickCell(item: LemmaRow, e: MouseEvent, column: LemmaColumn, _index: number) {
		if (column.editable === true && e.currentTarget instanceof HTMLElement) {
			this.editPopUp = {
				x: e.currentTarget.getBoundingClientRect().left,
				y: e.currentTarget.getBoundingClientRect().top,
				value: this.getStringFromLemmaRowByColumn(item, column),
				el: e.currentTarget,
				column,
				item,
			};
		}
	}

	onDblClickRow(e: MouseEvent, item: LemmaRow, _index: number) {
		this.$emit("dblclick:row", item, e);
	}

	onScroll(e: MouseEvent) {
		const l = (e.target as HTMLElement).scrollLeft;
		if (l !== this.scrollLeft) {
			this.scrollLeft = l;
		}
	}

	handleKey(e: KeyboardEvent) {
		const mod = e.ctrlKey || e.metaKey;
		if (e.key === "Escape") {
			e.preventDefault();
			this.selectNone();
		} else if (e.key === "a" && mod) {
			e.preventDefault();
			this.selectAll();
		} else if (e.key === "ArrowDown" && mod) {
			e.preventDefault();
			this.selectLast();
		} else if (e.key === "ArrowUp" && mod) {
			e.preventDefault();
			this.selectFirst();
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			this.selectNext();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			this.selectPrevious();
		}
	}

	scrollToIndex(i: number) {
		const elOffset = i * this.rowHeight;
		const el = (this.$refs.scroller as Vue).$el;
		const sTop = el.scrollTop;
		const sBottom = sTop + el.clientHeight;
		if (elOffset < sTop || elOffset > sBottom) {
			el.scrollTo({ top: elOffset });
		}
	}

	selectPrevious() {
		const selectedIndexes = _.map(this.selected, (v) => this.data.findIndex((r) => r.id === v.id));
		const newIndex = Math.min(...selectedIndexes) - 1;
		const prevItem = this.data[newIndex];
		if (prevItem !== undefined) {
			this.selected = { [prevItem.id]: prevItem };
			this.$emit("update:selection", [prevItem]);
			this.scrollToIndex(newIndex);
		}
	}

	selectNext() {
		const selectedIndexes = _.map(this.selected, (v) => this.data.findIndex((r) => r.id === v.id));
		const newIndex = Math.max(...selectedIndexes) + 1;
		const nextItem = this.data[newIndex];
		if (nextItem !== undefined) {
			this.selected = { [nextItem.id]: nextItem };
			this.$emit("update:selection", [nextItem]);
			this.scrollToIndex(newIndex);
		}
	}

	selectFirst() {
		const firstItem = this.data[0];
		if (firstItem !== undefined) {
			this.selected = { [firstItem.id]: firstItem };
			this.$emit("update:selection", [firstItem]);
			this.scrollToIndex(0);
		}
	}

	selectLast() {
		const lastItem = this.data[this.data.length - 1];
		if (lastItem !== undefined) {
			this.selected = { [lastItem.id]: lastItem };
			this.$emit("update:selection", [lastItem]);
			this.scrollToIndex(this.data.length - 1);
		}
	}

	selectNone() {
		this.selected = {};
		this.$emit("update:selection", []);
	}

	selectAll() {
		this.selected = _.keyBy(this.data, "id");
		this.$emit("update:selection", this.data);
	}

	selectItem(item: LemmaRow, event: MouseEvent) {
		if (event.currentTarget instanceof HTMLElement) {
			if (event.ctrlKey || event.metaKey) {
				// add or remove from selection set
				const selected = event.currentTarget.classList.toggle("selected");
				if (selected) {
					this.selected[item.id] = item;
				} else {
					this.$delete(this.selected, item.id);
				}
			} else {
				// deselect everything, then select this.
				if (this.$el instanceof HTMLElement) {
					this.$el.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
				}
				event.currentTarget.classList.add("selected");
				this.selected = { [item.id]: item };
			}
		}
		this.$emit("update:selection", _.toArray(this.selected));
	}

	get visibleColumns() {
		return this.columns.filter((c) => c.show === true);
	}

	get defaultWidth() {
		return 100 / this.visibleColumns.length + "%";
	}

	updateColumnOrder(cs: Array<LemmaColumn>) {
		this.$emit("update:columns", [...cs, ...this.columns.filter((c) => c.show === false)]);
	}
}
</script>

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
