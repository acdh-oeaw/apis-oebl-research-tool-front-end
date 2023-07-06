<template>
	<v-row class="status-columns-outer ml-1 px-5">
		<v-col
			v-for="(column, columnIndex) in columns"
			:key="column.id"
			class="status-column flex-column flex px-1"
		>
			<v-subheader class="column-name flex flex-shrink-1">
				{{ column.name }}
				<v-badge
					:content="column.items.length.toString()"
					inline
					:style="{ opacity: column.items.length === 0 ? '.5' : 1 }"
					color="rgba(0,0,0,.4)"
				/>
			</v-subheader>
			<v-flex class="flex-grow-1 overflow-y-auto">
				<draggable
					:disabled="false"
					:value="column.items"
					:force-fallback="true"
					:scroll-sensitivity="200"
					animation="200"
					class="drop-target rounded-lg"
					ghost-class="ghost"
					group="people"
					@end="$emit('end-drag', $event)"
					@input="
						$emit(
							'update-column',
							{ id: column.id, name: column.name, order: column.order },
							$event,
						)
					"
				>
					<transition-group
						:data-status-id="column.id"
						tag="div"
						class="fill-height"
						type="transition"
						:name="animate ? 'flip-list' : null"
					>
						<v-card
							v-for="(item, itemIndex) in column.items"
							:key="item.id"
							color="background lighten-2"
							:style="selectedLemma !== null && selectedLemma.id === item.id ? selectedStyle : null"
							class="issue-lemma-card rounded-lg pa-3 mb-3"
							:data-issue-lemma-id="item.id"
							:tabindex="(columnIndex + 1) * 100 + itemIndex"
							@mousedown="$emit('select-lemma', item)"
						>
							<issue-lemma-card
								:max-labels="store.settings.issueViewOptions.showLabels"
								:show-editor="store.settings.issueViewOptions.showEditor"
								:show-author="store.settings.issueViewOptions.showAuthor"
								:show-birth-and-death="store.settings.issueViewOptions.showBirthAndDeath"
								:lemma="store.lemma.getLemmaById(item.lemma)"
								:value="item"
							/>
						</v-card>
					</transition-group>
				</draggable>
			</v-flex>
		</v-col>
	</v-row>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Draggable from "vuedraggable";

import { type IssueLemma, type LemmaStatus } from "../../api";
import store from "../../store";
import IssueLemmaCard from "./IssueLemmaCard.vue";

interface Column extends LemmaStatus {
	items: Array<IssueLemma>;
	order: number;
}

@Component({
	components: {
		Draggable,
		IssueLemmaCard,
	},
})
export default class LemmaBoard extends Vue {
	@Prop({ default: [] }) columns!: Array<Column>;
	@Prop({ default: false }) animate!: boolean;
	@Prop({ default: null }) selectedLemma!: IssueLemma | null;

	store = store;
	log = console.log;
	selectedStyle = {
		boxShadow: `inset 0px 0px 0px 3px ${this.$vuetify.theme.currentTheme.primary} !important`,
	};

	// onUpdate(
	//   status: LemmaStatus,
	//   update: {
	//     moved?: { element: IIssueLemma, newIndex: number, oldIndex: number },
	//     added?: { element: IIssueLemma, newIndex: number }
	//   }
	// ) {
	//   if (update.moved) {
	//     const lemma: IIssueLemma = { ...update.moved.element, order: update.moved.newIndex }
	//     this.$emit('update-lemma', lemma, update.moved.newIndex, update.moved.oldIndex)
	//   } else if (update.added) {
	//     const lemma: IIssueLemma = { ...update.added.element, order: update.added.newIndex, status }
	//     this.$emit('update-lemma', lemma, update.added.newIndex)
	//   }
	//   // if (update.added !== undefined && update.added.element !== undefined) {
	//   //   this.$emit('update-lemma', status, update.added.element, update.added.newIndex)
	//   // }
	//   // if (update.moved && update.moved.newIndex !== undefined) {
	//   //   update.moved.element.order = update.moved.newIndex
	//   //   console.log('old', update.moved.element.order)
	//   //   console.log('new', update.moved.newIndex)
	//   // }
	// }
}
</script>

<style lang="stylus" scoped>
.status-columns-outer
  flex none
  flex-wrap nowrap
  overflow-x scroll
  height 100%
  white-space nowrap

.status-column
  display inline-block
  min-width 300px
  height 100%

.column-name
  padding-left 0
  font-weight 700
  letter-spacing 0.1em
  text-transform uppercase

.drop-target
  overflow-x hidden
  overflow-y scroll
  height 80vh

.issue-lemma-card
  box-shadow 0 2px 4px rgb(0 0 0 / 10%) !important
  cursor default
  // cursor -webkit-grab
  // cursor -moz-grab
  // cursor grab

.flip-list-item
  display inline-block
  transition all 1s


.flip-list-enter
.flip-list-leave-to
/* .list-complete-leave-active below version 2.1.8 */
  opacity 0%
  // transform: translateY(30px);


.flip-list-leave-active
  position absolute


.flip-list-move
  transition transform 0.5s, opacity 0.5s


.no-move
  transition transform 0s


.ghost
  background #c8ebfb
  opacity 0%


.list-group
  min-height 20px


.list-group-item
  cursor move


.list-group-item i
  cursor pointer
</style>
