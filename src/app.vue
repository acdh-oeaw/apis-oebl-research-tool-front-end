<script lang="ts" setup>
import "@/styles/index.css";

import { computed } from "vue";

import Confirm from "@/features/common/confirm.vue";
import GlobalSearch from "@/features/common/global-search.vue";
import LoginForm from "@/features/common/login-form.vue";
import Prompt from "@/features/common/prompt.vue";
import SideBar from "@/features/common/side-bar.vue";
import ResizableDrawer from "@/features/ui/resizable-drawer.vue";
import store from "@/store";

const isLoggedIn = computed(() => store.isLoggedIn === true);

// TODO: if (route.query.minimal) return false
const isDrawerVisible = computed(() => store.settings.showNavDrawer === true);

const drawerWidth = computed(() => store.settings.drawerLeftWidth);

function onUpdateDrawerWidth(width: number) {
	// TODO: can we mutate?
	store.settings = { ...store.settings, drawerLeftWidth: width };
}
</script>

<template>
	<VApp>
		<template v-if="!isLoggedIn">
			<VOverlay absolute :opacity="1" :value="!isLoggedIn" :z-index="100">
				<LoginForm />
			</VOverlay>
		</template>

		<template v-else>
			<GlobalSearch />

			<Confirm />
			<Prompt />

			<ResizableDrawer
				app
				:card="false"
				class="pa-0"
				color="background darken-2"
				:floating="true"
				left
				:right="false"
				mini-variant-width="73"
				stateless
				:value="isDrawerVisible"
				:width="drawerWidth"
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
