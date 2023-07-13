<script lang="ts" setup>
// eslint-disable-next-line simple-import-sort/imports
import "@/styles/index.css";

import { computed } from "vue";

/**
 * FIXME: Currently, this breaks when `store` is not imported first because of cyclical dependencies.
 *
 * @see https://github.com/acdh-oeaw/apis-oebl-research-tool-front-end/issues/159
 */
import store from "@/store";

import Confirm from "@/features/common/confirm.vue";
import GlobalSearch from "@/features/common/global-search.vue";
import LoginForm from "@/features/common/login-form.vue";
import Prompt from "@/features/common/prompt.vue";
import SideBar from "@/features/common/side-bar.vue";
import ResizableDrawer from "@/features/ui/resizable-drawer.vue";
import { useRoute } from "vue-router/composables";

const route = useRoute()
const isLoggedIn = computed(() => store.isLoggedIn === true);

const isDrawerVisible = computed(() => {
	/** This is set for the print preview, see `lemma-printer`. */
	if (route.query.minimal) return false

	return store.settings.showNavDrawer === true
});

const initialDrawerWidth = store.settings.drawerLeftWidth;

function onUpdateDrawerWidth(width: number) {
	store.settings = { ...store.settings, drawerLeftWidth: width };
}
</script>

<template>
	<VApp>
		<template v-if="!isLoggedIn">
			<VOverlay :opacity="1" :value="!isLoggedIn">
				<LoginForm />
			</VOverlay>
		</template>

		<template v-else>
			<GlobalSearch />

			<Confirm />
			<Prompt />

			<ResizableDrawer
				class="pa-0"
				color="background darken-2"
				:initial-width="initialDrawerWidth"
				:visible="isDrawerVisible"
				@update:width="onUpdateDrawerWidth"
			>
				<SideBar v-if="isDrawerVisible" class="px-3 pt-5" />
			</ResizableDrawer>

			<KeepAlive>
				<RouterView />
			</KeepAlive>
		</template>
	</VApp>
</template>
