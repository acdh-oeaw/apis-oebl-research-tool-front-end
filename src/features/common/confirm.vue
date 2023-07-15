<script lang="ts" setup>
import confirmStore, { bus } from "@/store/confirm";

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
		:max-width="400"
		overlay-color="#000"
		:value="confirmStore.show"
		@input="onChangeVisibility"
	>
		<VCard color="background" class="rounded-lg pa-3">
			<VCardText class="text-center pb-4 pt-2">
				<div v-if="confirmStore.icon != null" class="my-2">
					<VIcon large>{{ confirmStore.icon }}</VIcon>
				</div>
				{{ confirmStore.message }}
			</VCardText>

			<VCardActions class="pa-0">
				<VBtn block class="rounded-lg" color="primary" :elevation="0" @click="onConfirm">
					{{ confirmStore.confirmText }}
				</VBtn>
			</VCardActions>
			<VCardActions v-if="confirmStore.showCancel" class="pa-0 pt-2">
				<VBtn block class="rounded-lg" color="background darken-2" :elevation="0" @click="onAbort">
					{{ confirmStore.abortText }}
				</VBtn>
			</VCardActions>
		</VCard>
	</VDialog>
</template>
