<script lang="ts" setup>
import promptStore, { bus } from "@/store/prompt";

function onConfirm() {
	bus.$emit("confirm");
}

function onAbort() {
	bus.$emit("abort");
}

function onChangeVisibility(value: boolean) {
	if (value === false) {
		onAbort();
	}
}
</script>

<template>
	<VDialog
		v-if="promptStore.show"
		:max-width="500"
		overlay-color="#000"
		:value="promptStore.show"
		@input="onChangeVisibility"
	>
		<VCard color="background" class="rounded-lg">
			<VCardTitle class="pt-4 text-center pb-3 text-body-2 d-block">
				{{ promptStore.message }}
			</VCardTitle>

			<VDivider />

			<VCardText class="px-2 pt-5 pb-0">
				<VTextarea
					v-model="promptStore.value"
					auto-grow
					autofocus
					background-color="background darken-2"
					class="rounded-lg"
					clearable
					flat
					:placeholder="promptStore.placeholder"
					rows="1"
					:rules="promptStore.rules"
					solo
				/>
			</VCardText>

			<VDivider />

			<VCardActions class="pb-0">
				<VBtn
					block
					class="rounded-lg"
					color="primary"
					:disabled="!promptStore.isValid(promptStore.value)"
					:elevation="0"
					@click="onConfirm"
				>
					{{ promptStore.confirmText }}
				</VBtn>
			</VCardActions>
			<VCardActions>
				<VBtn block class="rounded-lg" color="background darken-2" :elevation="0" @click="onAbort">
					{{ promptStore.abortText }}
				</VBtn>
			</VCardActions>
		</VCard>
	</VDialog>
</template>
