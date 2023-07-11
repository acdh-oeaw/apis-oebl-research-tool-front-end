<script lang="ts" setup>
import { ref } from "vue";

import LoadingSpinner from "@/features/ui/loading-spinner.vue";
import store from "@/store";

const user = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
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

		if (passwordInputElement.value != null) {
			passwordInputElement.value.select();
		}
	}
}
</script>

<template>
	<VCard color="transparent" class="rounded-lg relative" :elevation="0" :width="300">
		<VOverlay v-if="isLoading" absolute>
			<LoadingSpinner color="white" :size="40" />
		</VOverlay>

		<VCardText>
			<VForm @submit.prevent="onSubmit">
				<VTextField
					v-model="user"
					:autocomplete="false"
					autofocus
					class="input-no-stroke"
					dark
					flat
					hide-details
					name="username"
					placeholder="User name"
					required
				/>

				<VDivider />

				<VTextField
					ref="passwordInputElement"
					v-model="password"
					:append-icon="isPasswordVisible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
					:autocomplete="false"
					class="input-no-stroke mt-1 pt-0"
					dark
					flat
					hide-details
					name="password"
					placeholder="Password"
					required
					style="box-shadow: inset 0 0 20px 20px hsl(0deg 0% 15%)"
					:type="isPasswordVisible ? 'text' : 'password'"
					@click:append="isPasswordVisible = !isPasswordVisible"
				/>

				<VBtn type="submit" block class="rounded-lg mt-3" :elevation="0">Login</VBtn>

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
