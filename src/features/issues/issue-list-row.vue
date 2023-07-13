<script lang="ts" setup>
import { keyBy } from "@acdh-oeaw/lib";
import { computed } from "vue";

// FIXME: why are we importing a different "IssueLemma" type here,
// in issue-list-row we are importing from
import { type IssueLemma } from "@/api";
// import { type IssueLemma } from "@/types/issue";
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

// TODO: lift this up to ancestor? these are exactly the same as in issues-board-card

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
	<tr class="background lighten-2 rounded-lg" @click="emit('select-lemma', value)">
		<td class="pr-0 text-no-wrap" style="width: 80px">
			<UserAvatar :value="editor" />
			<UserAvatar :value="author" style="margin-left: -5px" />
		</td>
		<td style="width: 20%; font-weight: 500" class="pr-1">
			<template v-if="value.lemma">{{ lemma.lastName }} {{ lemma.firstName }}</template>
			<span v-else>Lemma nicht gefunden.</span>
		</td>
		<td>{{ getYear(lemma.dateOfBirth) }} - {{ getYear(lemma.dateOfDeath) }}</td>
		<td>
			<div class="float-right fill-height d-flex">
				<VChip
					v-for="label in labelsLimited"
					:key="label.id"
					small
					class="label align-self-center"
					:color="label.color"
				>
					{{ label.name }}
				</VChip>
			</div>
		</td>
	</tr>
</template>

<style scoped>
.label {
	margin-left: 1px;
	color: hsl(0deg 0% 100%) !important;
}
</style>
