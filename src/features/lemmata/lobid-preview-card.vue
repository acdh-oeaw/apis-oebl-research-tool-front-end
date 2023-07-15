<script lang="ts" setup>
import _ from "lodash";
import { computed, ref, watch } from "vue";

import * as lobidService from "@/service/lobid";

type Fragment = {
	html: string | null;
	selected: boolean;
	gnd: string;
	data: {
		name: string;
		id: string;
		type: string;
		picture: string | null;
		description: string | null;
	};
};

const props = withDefaults(
	defineProps<{
		gnd: Array<string>;
		limit: number;
		value?: Array<string>;
		showFullLink?: boolean;
	}>(),
	{
		limit: Infinity,
		showFullLink: false,
		value: () => [],
	},
);

const emit = defineEmits<{
	(event: "input", gnds: Array<string>): void;
}>();

const allFragments = ref<Array<Fragment>>([]);

function selectOrDeselectFragment(gnd: string) {
	const gnds = new Set(props.value);

	if (gnds.has(gnd)) {
		gnds.delete(gnd);
	} else {
		gnds.add(gnd);
	}

	emit("input", Array.from(gnds));
}

const fragments = computed(() => {
	return allFragments.value.slice(0, props.limit);
});

async function loadPreviews(gnd: Array<string>) {
	const results = await Promise.all(gnd.map((id) => lobidService.get(id)));

	return gnd.map((id, index) => {
		return {
			gnd: id,
			html: "",
			data: results[index]!,
			selected: false,
		};
	});
}

watch(
	() => props.gnd,
	async (gnd) => {
		allFragments.value = await loadPreviews(gnd.slice(0, props.limit));
	},
	{ immediate: true },
);
</script>

<template>
	<div>
		<VRow
			v-for="(fragment, i) in fragments"
			:key="i"
			style="overflow: hidden"
			:class="['fragment', $listeners['input'] != null && 'clickable', 'rounded-lg', 'mt-1']"
			no-gutters
			@click="selectOrDeselectFragment(fragment.gnd)"
		>
			<slot />
			<div
				v-if="$listeners['input'] != null"
				style="flex: 0 0 40px"
				class="align-self-center text-center"
			>
				<VIcon v-if="value.includes(fragment.gnd)" color="primary">mdi-check-decagram</VIcon>
				<VIcon v-else>mdi-checkbox-blank-circle-outline</VIcon>
			</div>
			<div
				v-if="fragment.html != null"
				style="flex: 0 0 100px; overflow: hidden; height: 100px"
				class="pt-1 pb-1 text-center"
				cols="3"
			>
				<img v-if="fragment.data.picture" alt="" :src="fragment.data.picture" />
				<VIcon v-else class="mt-5 ml-5 pt-4 pl-2">mdi-image-broken-variant</VIcon>
			</div>
			<div style="flex: 1; line-height: 1.2" class="pt-1 pl-2 caption">
				<div class="description">
					<b>{{ fragment.data.name }}</b>
					<br />
					{{ fragment.data.description || fragment.data.type }}
				</div>
				<a
					class="mt-2 d-inline-block text-decoration-none"
					target="_blank"
					:href="'https://lobid.org/gnd/' + fragment.gnd"
				>
					&rarr; {{ showFullLink ? `https://lobid.org/gnd/${fragment.gnd}` : fragment.gnd }}
				</a>
			</div>
		</VRow>
	</div>
</template>

<style scoped>
.fragment {
	position: relative;
	border-radius: 6px;
}

.fragment.clickable:hover {
	background: var(--v-background-lighten1);
}

.fragment img {
	max-width: 80px;
	max-height: 100%;
	border-radius: 7px;
	background: var(--v-background-lighten2);
}

.fragment a {
	font-weight: 700;
}

.fragment .description {
	/* stylelint-disable-next-line value-no-vendor-prefix */
	display: -webkit-box;
	overflow: hidden;
	-webkit-line-clamp: 5;
	-webkit-box-orient: vertical;
}
</style>
