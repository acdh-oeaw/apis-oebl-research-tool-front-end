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

const isDrawerVisible = computed(() => store.settings.showNavDrawer === true);

const drawerWidth = computed(() => store.settings.drawerLeftWidth);

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
