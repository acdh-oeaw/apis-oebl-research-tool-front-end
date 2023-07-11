<script lang="ts" setup>
import Draggable from "vuedraggable";

import IssueListRow from "@/features/issues/issue-list-row.vue";
import { useVuetify } from "@/lib/use-vuetify";
import store from "@/store";
import { type IssueLemma, type LemmaStatus } from "@/types/issue";

interface Column extends LemmaStatus {
	items: Array<IssueLemma>;
}

const props = defineProps<{
	animate: boolean;
	columns: Array<Column>;
	selectedLemma: IssueLemma;
}>();

const emit = defineEmits<{
	(event: "end-drag", e: Event): void;
	(event: "update-column", column: Pick<Column, "id" | "name">, e: Event): void;
	(event: "select-lemma", lemma: IssueLemma): void;
}>();

const vuetify = useVuetify();

const selectedStyle = {
	boxShadow: `inset 0px 0px 0px 3px ${vuetify.theme.currentTheme.primary} !important`,
};

function onDragStart() {
	// FIXME: ?
}
</script>

<template>
	<div>
		<v-row v-for="(column, columnIndex) in columns" :key="column.id" class="ml-5 mr-1">
			<v-subheader class="sticky-header background mt-3">
				<v-badge
					:content="column.items.length.toString()"
					inline
					:style="{ opacity: column.items.length === 0 ? '.5' : 1 }"
					class="mr-2 ml-0"
					color="blue-grey"
				/>
				{{ column.name }}
			</v-subheader>
			<v-simple-table class="rounded-lg overflow-hidden" style="width: 100%">
				<draggable
					:disabled="false"
					:value="column.items"
					tag="tbody"
					:scroll-sensitivity="200"
					:data-status-id="column.id"
					animation="200"
					class="drop-target rounded-lg"
					ghost-class="ghost"
					group="people"
					@input="emit('update-column', { id: column.id, name: column.name }, $event)"
					@end="emit('end-drag', $event)"
					@start="onDragStart"
				>
					<!-- <transition-group type="transition" :name="animate ? 'flip-list' : null"> -->
					<issue-list-row
						v-for="(item, itemIndex) in column.items"
						:key="item.id"
						v-ripple="false"
						:style="selectedLemma !== null && selectedLemma.id === item.id ? selectedStyle : null"
						class="pa-5 cursor-grab rounded-lg"
						:data-issue-lemma-id="item.id"
						:tabindex="(columnIndex + 1) * 100 + itemIndex"
						:lemma="store.lemma.getLemmaById(item.lemma)"
						:value="item"
						@select-lemma="emit('select-lemma', item)"
						@dragstart="onDragStart($event, item)"
					/>
					<!-- </transition-group> -->
				</draggable>
			</v-simple-table>
		</v-row>
	</div>
</template>

<style scoped>
.sticky-header {
	position: sticky;
	top: 64px;
	z-index: 1;
	width: 100%;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.ghost {
	background: hsl(199deg 86% 88%);
	opacity: 0%;
}

.cursor-grab {
	cursor: default;
}

tr:focus {
	outline: none;
}

.author {
	margin-left: -10px;
}

.label {
	margin-right: 1px;
	padding: 0 7px;
	color: hsl(0deg 0% 100%) !important;
	font-weight: 600;
	letter-spacing: -0.05em;
}
</style>
