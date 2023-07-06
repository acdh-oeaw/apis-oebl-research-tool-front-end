<template>
	<div>
		<text-field
			v-for="(name, i) in value"
			:key="i"
			:required="true"
			:label="label + ' (' + (i + 2) + ')'"
			:value="name"
			@input="updateItem(i, $event)"
		>
			<div class="text-no-wrap align-self-center">
				<v-btn tabindex="-1" tile class="rounded-lg mt-1" icon small @click="removeItem(i)">
					<v-icon>mdi-minus-circle-outline</v-icon>
				</v-btn>
				<v-btn tabindex="-1" tile class="rounded-lg mt-1 mr-1" icon small @click="insertItemAt(i)">
					<v-icon>mdi-plus-circle-outline</v-icon>
				</v-btn>
			</div>
		</text-field>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import TextField from "./TextField.vue";

@Component({
	components: {
		TextField,
	},
})
export default class TextFieldAlternatives extends Vue {
	@Prop({ default: () => [] }) value!: Array<string>;
	@Prop({ default: "" }) label!: string;

	updateItem(i: number, v: string) {
		this.$emit(
			"input",
			this.value.map((v2, i2) => (i === i2 ? v : v2)),
		);
	}

	removeItem(i: number) {
		this.$emit(
			"input",
			this.value.filter((v, i2) => i2 !== i),
		);
	}

	insertItemAt(i: number) {
		this.$emit("input", [...this.value.slice(0, i + 1), "", ...this.value.slice(i + 1)]);
	}
}
</script>

<style lang="scss" scoped></style>
