<script lang="ts">
import "@/styles/index.css";

import { Component, Vue } from "vue-property-decorator";

import { requestState } from "@/api/core/request";
/**
 * `store` *must* be imported before `requestState` to avoid error caused by circular dependency.
 *
 * @see https://github.com/acdh-oeaw/apis-oebl-research-tool-front-end/issues/159
 */
import store from "@/store";
import GlobalSearch from "@/views/GlobalSearch.vue";
import Confirm from "@/views/lib/Confirm.vue";
import LoadingSpinner from "@/views/lib/LoadingSpinner.vue";
import Prompt from "@/views/lib/Prompt.vue";
import ResizableDrawer from "@/views/lib/ResizableDrawer.vue";
import LoginForm from "@/views/LoginForm.vue";
import Sidebar from "@/views/Sidebar.vue";

@Component({
	components: {
		ResizableDrawer,
		GlobalSearch,
		LoadingSpinner,
		LoginForm,
		Confirm,
		Prompt,
		Sidebar,
	},
})
export default class App extends Vue {
	store = store;
	requestState = requestState;

	onKeyDown(e: KeyboardEvent) {
		if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			e.stopPropagation();
			store.showSearchDialog = !store.showSearchDialog;
		}
	}

	mounted() {
		window.addEventListener("keydown", this.onKeyDown);
	}

	get showDrawer(): boolean {
		return this.$route.query["minimal"] ? false : this.store.settings.showNavDrawer;
	}
}
</script>

<template>
	<v-app :style="{ background: 'var(--v-background-base)' }">
		<v-overlay
			v-if="store.isLoggedIn === false"
			:value="store.isLoggedIn === false"
			opacity="1"
			z-index="99"
			absolute
		>
			<login-form />
		</v-overlay>

		<global-search v-model="store.showSearchDialog" />

		<confirm />
		<prompt />

		<resizable-drawer
			:card="false"
			:right="false"
			:floating="true"
			color="background darken-2"
			stateless
			app
			:value="showDrawer"
			left
			mini-variant-width="73"
			class="pa-0"
			:width="store.settings.drawerLeftWidth"
			@update:width="store.settings = { ...store.settings, drawerLeftWidth: $event }"
		>
			<sidebar v-if="showDrawer" class="px-3 pt-5" />
		</resizable-drawer>

		<keep-alive>
			<router-view />
		</keep-alive>
	</v-app>
</template>
