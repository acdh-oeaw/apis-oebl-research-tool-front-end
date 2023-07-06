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
					@input="
						$emit(
							'update-column',
							{ id: column.id, name: column.name, order: column.order },
							$event,
						)
					"
					@end="$emit('end-drag', $event)"
					@start="onDragStart"
				>
					<!-- <transition-group type="transition" :name="animate ? 'flip-list' : null"> -->
					<issue-lemma-row
						v-for="(item, itemIndex) in column.items"
						:key="item.id"
						v-ripple="false"
						:style="selectedLemma !== null && selectedLemma.id === item.id ? selectedStyle : null"
						class="pa-5 cursor-grab rounded-lg"
						:data-issue-lemma-id="item.id"
						:tabindex="(columnIndex + 1) * 100 + itemIndex"
						:lemma="store.lemma.getLemmaById(item.lemma)"
						:value="item"
						@select-lemma="$emit('select-lemma', item)"
						@dragstart="onDragStart($event, item)"
					/>
					<!-- </transition-group> -->
				</draggable>
			</v-simple-table>
		</v-row>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Draggable from "vuedraggable";

import { type IssueLemma, type LemmaStatus } from "@/types/issue";

import store from "../../store";
import IssueLemmaRow from "./IssueLemmaRow.vue";

interface Column extends LemmaStatus {
	items: Array<IssueLemma>;
}

@Component({
	components: {
		Draggable,
		IssueLemmaRow,
	},
})
export default class IssueLemmaList extends Vue {
	@Prop({ default: [] }) columns!: Array<Column>;
	@Prop({ default: false }) animate!: boolean;
	@Prop({ default: null }) selectedLemma!: IssueLemma | null;

	store = store;
	maxLabels = 3;

	onDragStart(...args: any) {
		console.log(args);
	}

	selectedStyle = {
		boxShadow: `inset 0px 0px 0px 3px ${this.$vuetify.theme.currentTheme.primary} !important`,
	};
}
</script>

<style lang="stylus" scoped>
.sticky-header
  position sticky
  // TODO: dynamic based on app-bar height
  top 64px
  z-index 1
  width 100%
  font-weight 600
  letter-spacing 0.1em
  text-transform uppercase

.ghost
  background #c8ebfb
  opacity 0%

.cursor-grab
  cursor default

tr:focus
  outline none

.author
  margin-left -10px

.label
  margin-right 1px
  padding 0 7px
  color white !important
  font-weight 600
  letter-spacing -0.05em
</style>
