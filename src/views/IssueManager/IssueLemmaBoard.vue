<template>
	<v-row class="status-columns-outer ml-1 px-5">
		<v-col
			class="status-column flex-column flex px-1"
			v-for="(column, columnIndex) in columns"
			:key="column.id"
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
					@end="$emit('end-drag', $event)"
					@input="
						$emit(
							'update-column',
							{ id: column.id, name: column.name, order: column.order },
							$event,
						)
					"
					animation="200"
					class="drop-target rounded-lg"
					ghost-class="ghost"
					group="people"
				>
					<transition-group
						:data-status-id="column.id"
						tag="div"
						class="fill-height"
						type="transition"
						:name="animate ? 'flip-list' : null"
					>
						<v-card
							color="background lighten-2"
							:style="selectedLemma !== null && selectedLemma.id === item.id ? selectedStyle : null"
							class="issue-lemma-card rounded-lg pa-3 mb-3"
							:data-issue-lemma-id="item.id"
							@mousedown="$emit('select-lemma', item)"
							v-for="(item, itemIndex) in column.items"
							:tabindex="(columnIndex + 1) * 100 + itemIndex"
							:key="item.id"
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
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { IssueLemma, LemmaStatus } from "../../api";
import Draggable from "vuedraggable";
import IssueLemmaCard from "./IssueLemmaCard.vue";
import store from "../../store";

interface Column extends LemmaStatus {
	items: IssueLemma[];
	order: number;
}

@Component({
	components: {
		Draggable,
		IssueLemmaCard,
	},
})
export default class LemmaBoard extends Vue {
	@Prop({ default: [] }) columns!: Column[];
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
  white-space nowrap
  overflow-x scroll
  height 100%

.status-column
  min-width 300px
  display inline-block
  height 100%

.column-name
  text-transform uppercase
  letter-spacing .1em
  font-weight 700
  padding-left 0

.drop-target
  height 80vh
  overflow-y scroll
  overflow-x hidden

.issue-lemma-card
  box-shadow 0 2px 4px rgba(0,0,0,0.1) !important
  cursor default
  // cursor -webkit-grab
  // cursor -moz-grab
  // cursor grab

.flip-list-item {
  transition: all 1s;
  display: inline-block;
}
.flip-list-enter, .flip-list-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  opacity: 0;
  // transform: translateY(30px);
}
.flip-list-leave-active {
  position: absolute;
}

.flip-list-move {
  transition: transform 0.5s, opacity .5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}
</style>
