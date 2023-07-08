<template>
	<div class="d-flex fill-height flex-column overflow-y-hidden">
		<div class="background darken-2" :style="{ zIndex: 1 }">
			<v-text-field
				v-model="searchQuery"
				placeholder="Abgaben suchen…"
				solo
				autofocus
				class="text-body-2 rounded-lg search-field"
				dense
				prepend-inner-icon="mdi-magnify"
				background-color="background darken-3"
				hide-details
				clearable
				flat
				@keydown.esc="searchQuery = ''"
			/>
			<v-divider class="mt-3" />
		</div>
		<div style="flex: 1" class="overflow-y-auto">
			<v-list
				subheader
				class="mt-4 pr-0"
				color="transparent"
				nav
				dense
				@dragleave.prevent="highlighted = null"
			>
				<v-subheader class="sticky background darken-2" :style="{ zIndex: 1 }">Abgaben</v-subheader>
				<v-list-item
					v-for="i in store.issue.issues"
					:key="i.id"
					dense
					class="rounded-lg mb-0"
					:to="'/issue/' + i.id"
				>
					<v-list-item-avatar size="15" tile>
						<v-icon small class="rotate-180">mdi-chart-box-outline</v-icon>
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>
							{{ i.name }}
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import store from "@/store";

@Component
export default class LemmaNavigation extends Vue {
	searchQuery = "";
	highlighted: number | null = null;
	store = store;
	log = console.log;

	createList() {
		console.log("yo");
	}
}
</script>

<style scoped>
.search-field :deep(.v-icon.v-icon) {
	font-size: 130%;
}

.v-list-item__action {
	margin: 10px 0;
}

.drag-over {
	box-shadow: inset 0 0 0 3px var(--v-primary-base);
}
</style>
