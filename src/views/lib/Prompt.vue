<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import promptStore, { bus } from "@/store/prompt";

@Component
export default class Prompt extends Vue {
	promptStore = promptStore;
	bus = bus;

	modelClose(b: boolean) {
		if (b === false) {
			bus.$emit("abort");
		}
	}
}
</script>

<template>
	<v-dialog
		v-if="promptStore.show"
		overlay-color="#000"
		max-width="500px"
		:value="promptStore.show"
		@input="modelClose"
	>
		<v-card color="background" class="rounded-lg">
			<v-card-title class="pt-4 text-center pb-3 text-body-2 d-block">
				{{ promptStore.message }}
			</v-card-title>
			<v-divider />
			<v-card-text class="px-2 pt-5 pb-0">
				<v-textarea
					v-model="promptStore.value"
					solo
					flat
					test-id="prompt-field"
					clearable
					background-color="background darken-2"
					class="rounded-lg"
					auto-grow
					autofocus
					rows="1"
					:placeholder="promptStore.placeholder"
					:rules="promptStore.rules"
				/>
			</v-card-text>
			<v-divider />
			<v-card-actions class="pb-0">
				<v-btn
					test-id="prompt-submit-btn"
					:disabled="!promptStore.isValid(promptStore.value)"
					block
					class="rounded-lg"
					color="primary"
					elevation="0"
					@click="bus.$emit('confirm')"
				>
					{{ promptStore.confirmText }}
				</v-btn>
			</v-card-actions>
			<v-card-actions>
				<v-btn
					block
					test-id="prompt-abort-btn"
					class="rounded-lg"
					color="background darken-2"
					elevation="0"
					@click="bus.$emit('abort')"
				>
					{{ promptStore.abortText }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
