<template>
	<div>
		<v-row class="ml-5 mr-1" v-for="(column, columnIndex) in columns" :key="column.id">
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
					@input="
						$emit(
							'update-column',
							{ id: column.id, name: column.name, order: column.order },
							$event,
						)
					"
					@end="$emit('end-drag', $event)"
					@start="onDragStart"
					:data-status-id="column.id"
					animation="200"
					class="drop-target rounded-lg"
					ghost-class="ghost"
					group="people"
				>
					<!-- <transition-group type="transition" :name="animate ? 'flip-list' : null"> -->
					<issue-lemma-row
						v-ripple="false"
						:style="selectedLemma !== null && selectedLemma.id === item.id ? selectedStyle : null"
						class="pa-5 cursor-grab rounded-lg"
						@select-lemma="$emit('select-lemma', item)"
						:data-issue-lemma-id="item.id"
						@dragstart="onDragStart($event, item)"
						:tabindex="(columnIndex + 1) * 100 + itemIndex"
						:key="item.id"
						v-for="(item, itemIndex) in column.items"
						:lemma="store.lemma.getLemmaById(item.lemma)"
						:value="item"
					/>
					<!-- </transition-group> -->
				</draggable>
			</v-simple-table>
		</v-row>
	</div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { IssueLemma, LemmaStatus, Label } from "@/types/issue";
import Draggable from "vuedraggable";
import IssueLemmaRow from "./IssueLemmaRow.vue";
import store from "../../store";

interface Column extends LemmaStatus {
	items: IssueLemma[];
}

@Component({
	components: {
		Draggable,
		IssueLemmaRow,
	},
})
export default class IssueLemmaList extends Vue {
	@Prop({ default: [] }) columns!: Column[];
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
  width 100%
  z-index 1
  font-weight 600
  letter-spacing .1em
  text-transform uppercase

.ghost
  opacity: 0;
  background: #c8ebfb;

.cursor-grab
  cursor default

tr:focus
  outline none

.author
  margin-left -10px

.label
  color white !important
  font-weight 600
  margin-right 1px
  padding 0 7px
  letter-spacing -.05em
</style>
