<template>
	<div style="user-select: none" @click="$emit('select-lemma', value)">
		<template v-if="value.lemma">
			<h2 class="ma-0">{{ lemma.firstName }} {{ lemma.lastName }}</h2>
			<h5 v-if="showBirthAndDeath" class="pa-0 ma-0">
				{{ dateToYear(lemma.dateOfBirth) }} - {{ dateToYear(lemma.dateOfDeath) }}
			</h5>
		</template>
		<span v-else class="caption">Lemma nicht gefunden.</span>
		<v-row class="mt-2" no-gutters>
			<v-col class="align-self-end">
				<user-avatar v-if="showEditor" :value="editor" />
				<user-avatar v-if="showAuthor" :value="author" style="margin-left: -5px" />
			</v-col>
			<v-col class="text-right">
				<v-chip
					v-for="label in labelsLimited"
					:key="label.id"
					small
					class="label px-2"
					:color="label.color"
				>
					{{ label.name }}
				</v-chip>
				<v-chip
					v-if="maxLabels && labels.length > maxLabels"
					small
					color="background"
					class="label px-2 text--secondary font-weight-medium"
				>
					+{{ labels.length - maxLabels }}
				</v-chip>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts">
import format from "date-fns/esm/format";
import _ from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { type IssueLemma,type LemmaLabel } from "@/api";
import store from "@/store";
import UserAvatar from "@/views/lib/UserAvatar.vue";

@Component({
	components: {
		UserAvatar,
	},
})
export default class IssueLemmaCard extends Vue {
	@Prop({ required: true }) value!: IssueLemma;
	@Prop({ default: null }) maxLabels!: number | null;
	@Prop({ default: true }) showEditor!: boolean;
	@Prop({ default: true }) showAuthor!: boolean;
	@Prop({ default: true }) showBirthAndDeath!: boolean;

	get labelsById() {
		return _.keyBy(store.issue.labels, "id");
	}

	get lemma() {
		return this.value.lemma;
	}

	dateToYear(d: string | null | undefined): string | null {
		if (d !== null && d !== undefined) {
			try {
				return format(new Date(d), "yyyy");
			} catch (e) {
				return null;
			}
		} else {
			return null;
		}
	}

	get labels(): Array<LemmaLabel> {
		if (this.value.labels !== undefined) {
			return this.value.labels.map((id) => this.labelsById[id]);
		} else {
			return [];
		}
	}

	get labelsLimited(): Array<LemmaLabel> {
		if (this.maxLabels !== null) {
			return _.take(this.labels, this.maxLabels);
		} else {
			return this.labels;
		}
	}

	get editor() {
		if (this.value.editor) {
			return store.editors.getById(this.value.editor) || null;
		} else {
			return null;
		}
	}

	get author() {
		console.warn("get author is currently not implemented. This is a TODO!");
		return null;
	}
}
</script>

<style lang="stylus" scoped>
h2
  font-weight 500
  font-size 115%
  opacity 80%

h5
  overflow hidden
  font-weight 400
  text-overflow ellipsis
  white-space nowrap
  opacity 80%

.label
  overflow hidden
  margin-bottom 1px
  margin-left 1px
  color white !important
  font-weight 600
  text-overflow ellipsis
  white-space nowrap

.id-img
  font-size 0.8em

  &.author
    margin-left -3px
</style>
