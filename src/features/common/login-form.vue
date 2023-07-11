<script lang="ts" setup>
import { isNonEmptyString } from "@acdh-oeaw/lib";
import { ref } from "vue";

import LoadingSpinner from "@/features/ui/loading-spinner.vue";
import store from "@/store";

const user = ref("");
const password = ref("");

const isLoading = ref(false);
const errorMessage = ref("");
const isPasswordVisible = ref(false);
const passwordInputElement = ref<HTMLInputElement | null>(null);

async function onSubmit() {
	if (!user.value || !password.value) return;

	errorMessage.value = "";

	isLoading.value = true;
	const success = await store.logIn(user.value, password.value);
	isLoading.value = false;

	if (!success) {
		errorMessage.value = "Falsches Passwort oder falscher Nutzername.";
		// @ts-expect-error FIXME: figure out what vuetify does with the ref
		passwordInputElement.value?.$el.querySelector("input")?.select();
	}
}

const validation = [
	function required(value: string): boolean | string {
		if (isNonEmptyString(value)) return true;
		return "Bitte füllen Sie dieses Feld aus.";
	},
];
</script>

<template>
	<VCard color="transparent" class="rounded-lg relative" :elevation="0" :width="300">
		<VOverlay absolute :value="isLoading">
			<LoadingSpinner color="white" :size="40" />
		</VOverlay>

		<VCardText>
			<VForm class="grid gap-2" @submit.prevent="onSubmit">
				<VTextField
					v-model="user"
					aria-label="User name"
					:autocomplete="false"
					autofocus
					class="pt-0"
					dark
					flat
					hide-details
					name="username"
					placeholder="User name"
					:rules="validation"
				/>

				<VTextField
					ref="passwordInputElement"
					v-model="password"
					:append-icon="isPasswordVisible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
					aria-label="Password"
					:autocomplete="false"
					class="pt-0"
					dark
					flat
					hide-details
					name="password"
					placeholder="Password"
					:rules="validation"
					:type="isPasswordVisible ? 'text' : 'password'"
					@click:append="isPasswordVisible = !isPasswordVisible"
				/>

				<VBtn type="submit" block class="rounded-lg mt-2" :elevation="0">Login</VBtn>

				<VAlert
					class="mt-2"
					color="pink darken-4 caption"
					dense
					transition="scale-transition"
					:value="errorMessage !== ''"
				>
					{{ errorMessage }}
				</VAlert>
			</VForm>
		</VCardText>
	</VCard>
</template>

<style>
@keyframes autofill {
	0%,
	100% {
		background: transparent;
		color: hsl(0deg 0% 40%);
	}
}

input:-webkit-autofill {
	animation-name: autofill;
	animation-delay: 1s;
	animation-fill-mode: both;
}
</style>
