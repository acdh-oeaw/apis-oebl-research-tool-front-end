<script lang="ts" setup>
import { ref } from "vue";

import { characters } from "@/lib/characters";

const emit = defineEmits<{
	(event: "input", character: string): void;
}>();

const isVisible = ref(false);
</script>

<template>
	<VMenu
		v-model="isVisible"
		:close-on-content-click="false"
		:max-width="200"
		:nudge-width="200"
		offset-x
	>
		<template #activator="{ on, attrs }">
			<VBtn v-bind="attrs" class="rounded-lg" small text v-on="on">
				<v-icon small left>mdi-omega</v-icon>
				Sonderzeichen
			</VBtn>
		</template>
		<VCard>
			<span v-for="(group, key) of characters.groups" :key="key">
				<div class="special-char-group caption pl-2">
					<span class="muted">{{ group.label }}</span>
				</div>
				<VBtn
					v-for="character of group.characters"
					:key="character.code"
					class="character-button"
					small
					text
					@click="emit('input', String.fromCodePoint(character.code))"
				>
					{{ String.fromCodePoint(character.code) }}
				</VBtn>
			</span>
		</VCard>
	</VMenu>
</template>

<style scoped>
.character-button {
	display: inline-block;
	width: 39px;
	font-size: 1.1em;
	text-align: center;
	cursor: pointer;
}
</style>
