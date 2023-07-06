<template>
	<v-menu
		v-model="shouldShowSpecialCharPicker"
		:close-on-content-click="false"
		:nudge-width="200"
		:max-width="200"
		offset-x
	>
		<template #activator="{ on, attrs }">
			<v-btn v-bind="attrs" class="rounded-lg" small text v-on="on">
				<v-icon small left>mdi-omega</v-icon>
				Sonderzeichen
			</v-btn>
		</template>
		<v-card>
			<span v-for="(group, i) in specialCharGroups" :key="i">
				<div class="special-char-group caption pl-2">
					<span class="muted">{{ group.group }}</span>
				</div>
				<v-btn
					v-for="(char, i) in group.chars"
					:key="'em' + i"
					text
					small
					class="special-char"
					@click="$emit('returnSpecialChar', toSpecialChar(char[0]))"
				>
					{{ toSpecialChar(char[0]) }}
				</v-btn>
			</span>
		</v-card>
	</v-menu>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { specialChar } from "@/service/specialchars";

@Component
export default class Annotation extends Vue {
	shouldShowSpecialCharPicker = false;

	specialCharGroups = specialChar.groups;

	toSpecialChar(s: number | string): string {
		if (typeof s === "number") {
			return String.fromCodePoint(s);
		} else {
			return "";
		}
	}
}
</script>

<style lang="stylus" scoped>
.special-char
  display inline-block
  width 39px
  font-size 1.1em
  text-align center
  cursor pointer
</style>
