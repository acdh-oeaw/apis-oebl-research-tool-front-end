<script lang="ts" setup>
import { computed } from "vue";

import { useVuetify } from "@/lib/use-vuetify";
import store from "@/store";
import SwitchButton from "@/views/lib/SwitchButton.vue";

const vuetify = useVuetify();

const theme = computed(() => {
	return store.settings.darkTheme;
});

function updateTheme(dark: boolean) {
	store.settings = { ...store.settings, darkTheme: dark };
	vuetify.theme.dark = store.settings.darkTheme;
}
</script>

<template>
	<SwitchButton
		:items="[
			{
				icon: 'mdi-brightness-5',
				value: true,
			},
			{
				icon: 'mdi-brightness-7',
				value: false,
			},
		]"
		:value="theme"
		@input="updateTheme"
	/>
</template>
