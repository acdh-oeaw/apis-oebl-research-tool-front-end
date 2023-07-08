<script lang="ts">
import _ from "lodash";
import { Component, Prop, Vue } from "vue-property-decorator";

import { type LemmaRow } from "@/types/lemma";
import Badge from "@/views/lib/Badge.vue";

@Component({
	components: {
		Badge,
	},
})
export default class DragImage extends Vue {
	@Prop({ default: [] }) rows!: Array<LemmaRow>;
	@Prop({ default: 5 }) maxItems!: number;

	get limitedRows() {
		return _(this.rows).compact().takeRight(this.maxItems).value();
	}
}
</script>

<template>
	<v-card class="rounded-lg soft-shadow" style="position: absolute; left: -1000px">
		<badge
			color="primary darken-2 white--text"
			style="position: absolute; top: -6px; right: -6px"
			:content="rows.length"
		/>
		<v-list class="text-body-2" dense>
			<v-list-item v-for="(s, i) in limitedRows" :key="i">
				<v-list-item-content>{{ s.lastName }}, {{ s.firstName }}</v-list-item-content>
			</v-list-item>
			<v-list-item
				v-if="limitedRows.length < rows.length"
				class="font-weight-bold"
				style="opacity: 70%"
			>
				<v-list-item-content>+ {{ rows.length - maxItems }} weitere…</v-list-item-content>
			</v-list-item>
		</v-list>
	</v-card>
</template>
