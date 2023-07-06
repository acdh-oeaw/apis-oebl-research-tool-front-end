<template>
	<tr class="background lighten-2 rounded-lg" @click="$emit('select-lemma', value)">
		<td class="pr-0 text-no-wrap" style="width: 80px">
			<user-avatar :value="editor" />
			<user-avatar :value="author" style="margin-left: -5px" />
		</td>
		<td style=" width: 20%;font-weight: 500" class="pr-1">
			<template v-if="value.lemma">{{ lemma.lastName }} {{ lemma.firstName }}</template>
			<span v-else>Lemma nicht gefunden.</span>
		</td>
		<td>{{ dateToYear(lemma.dateOfBirth) }} - {{ dateToYear(lemma.dateOfDeath) }}</td>
		<td>
			<div class="float-right fill-height d-flex">
				<v-chip
					v-for="label in labelsLimited"
					:key="label.id"
					small
					class="label align-self-center"
					:color="label.color"
				>
					{{ label.name }}
				</v-chip>
			</div>
		</td>
	</tr>
</template>

<script lang="ts">
import format from "date-fns/esm/format";
import _ from "lodash";
import { Component, Prop,Vue } from "vue-property-decorator";

import { type Author,type Editor, type LemmaLabel } from "@/api";
import store from "@/store";
import UserAvatar from "@/views/lib/UserAvatar.vue";

import { type IssueLemma } from "../../types/issue";

@Component({
	components: {
		UserAvatar,
	},
})
export default class IssueLemmaRow extends Vue {
	@Prop({ required: true }) value!: IssueLemma;
	@Prop({ default: null }) maxLabels!: number | null;
	@Prop({ default: true }) showEditor!: boolean;
	@Prop({ default: true }) showAuthor!: boolean;
	@Prop({ default: true }) showDescription!: boolean;

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

	get lemma() {
		return this.value.lemma;
	}

	get labelsById() {
		return _.keyBy(store.issue.labels, "id");
	}

	get labelsLimited(): Array<LemmaLabel> {
		return this.maxLabels !== null
			? _.take(this.value.labels, this.maxLabels).map((id) => this.labelsById[id])
			: this.value.labels.map((id) => this.labelsById[id]);
	}

	get editor(): Editor | null {
		if (this.value.editor) {
			return store.editors.getById(this.value.editor) || null;
		} else {
			return null;
		}
	}

	get author(): Author | null {
		if (this.value.editor) {
			return store.authors.getById(this.value.editor) || null;
		} else {
			return null;
		}
	}
}
</script>

<style lang="stylus" scoped>
.label
  margin-left 1px
  color white !important
</style>
