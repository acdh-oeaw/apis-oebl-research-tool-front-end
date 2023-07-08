<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import store from "@/store";
import SwitchButton from "@/views/lib/SwitchButton.vue";

@Component({
	components: {
		SwitchButton,
	},
})
export default class ThemeToggle extends Vue {
	get theme() {
		return store.settings.darkTheme;
	}

	updateTheme(dark: boolean) {
		store.settings = { ...store.settings, darkTheme: dark };
		this.$vuetify.theme.dark = store.settings.darkTheme;
	}
}
</script>

<template>
	<switch-button
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
