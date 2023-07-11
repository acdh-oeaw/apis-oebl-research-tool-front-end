<script lang="ts" setup>
import { keyBy } from "@acdh-oeaw/lib";
import { computed } from "vue";

import { type IssueLemma } from "@/api";
import UserAvatar from "@/features/issues/user-avatar.vue";
import { getYear } from "@/lib/get-year";
import store from "@/store";

const props = defineProps<{
	value: IssueLemma;
	maxLabels: number | null;
	showEditor: boolean;
	showAuthor: boolean;
	showBirthAndDeath: boolean;
}>();

const emit = defineEmits<{
	(event: "select-lemma", value: IssueLemma): void;
}>();

const lemma = computed(() => props.value.lemma);

const labelsById = computed(() => keyBy(store.issue.labels, (label) => label.id));

const labels = computed(() => {
	if (props.value.labels != null) {
		return props.value.labels.map((id) => labelsById.value[id]!);
	} else {
		return [];
	}
});

const labelsLimited = computed(() => {
	if (props.maxLabels != null) {
		return labels.value.slice(0, props.maxLabels);
	}

	return labels.value;
});

const editor = computed(() => {
	if (props.value.editor) {
		return store.editors.getById(props.value.editor) || null;
	}

	return null;
});

const author = "TODO:";
// const author = computed(() => {
// 	if (props.value.editor) {
// 		return store.authors.getById(props.value.author) || null;
// 	}

// 	return null;
// });
</script>

<template>
	<!-- FIXME: a11y -->
	<!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
	<div style="user-select: none" @click="emit('select-lemma', value)">
		<template v-if="value.lemma">
			<h2 class="ma-0">{{ lemma.firstName }} {{ lemma.lastName }}</h2>
			<h5 v-if="showBirthAndDeath" class="pa-0 ma-0">
				{{ getYear(lemma.dateOfBirth) }} - {{ getYear(lemma.dateOfDeath) }}
			</h5>
		</template>
		<span v-else class="caption">Lemma nicht gefunden.</span>
		<v-row class="mt-2" no-gutters>
			<v-col class="align-self-end">
				<user-avatar v-if="showEditor" :value="editor" />
				<user-avatar v-if="showAuthor" :value="author" style="margin-left: -5px" />
			</v-col>
			<v-col class="text-right">
				<v-chip
					v-for="label in labelsLimited"
					:key="label.id"
					small
					class="label px-2"
					:color="label.color"
				>
					{{ label.name }}
				</v-chip>
				<v-chip
					v-if="maxLabels && labels.length > maxLabels"
					small
					color="background"
					class="label px-2 text--secondary font-weight-medium"
				>
					+{{ labels.length - maxLabels }}
				</v-chip>
			</v-col>
		</v-row>
	</div>
	<!-- eslint-enable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
</template>

<style scoped>
h2 {
	font-weight: 500;
	font-size: 115%;
	opacity: 80%;
}

h5 {
	overflow: hidden;
	font-weight: 400;
	text-overflow: ellipsis;
	white-space: nowrap;
	opacity: 80%;
}

.label {
	overflow: hidden;
	margin-bottom: 1px;
	margin-left: 1px;
	color: hsl(0deg 0% 100%) !important;
	font-weight: 600;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.id-img {
	font-size: 0.8em;
}

.id-img.author {
	margin-left: -3px;
}
</style>
