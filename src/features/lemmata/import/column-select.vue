<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { lemmaRowTranslations } from "@/lib/labels";
import { type Data2D } from "@/lib/lemmaimport/datacontainers";
import { type ExtractColumnOptions } from "@/lib/lemmaimport/options";
import { type LemmaRow } from "@/types/lemma";

const props = defineProps<{
	lemmaKey: keyof LemmaRow;
	sourceData: Data2D;
	preloadedOptions: ExtractColumnOptions;
}>();

const emit = defineEmits<{
	(event: "options", value: ExtractColumnOptions): void;
	(event: "data", value: any): void;
	(event: "cancel"): void;
}>();

const options = ref<ExtractColumnOptions>({ sourceKey: null });
const label = ref(lemmaRowTranslations[props.lemmaKey]!.de);

const extractedData = computed(() => {
	if (options.value.sourceKey == null) {
		return [];
	}

	const column = props.sourceData.selectByHeaderName(options.value.sourceKey);

	return column.map((value) => {
		return {
			[props.lemmaKey]: value,
		};
	});
});

watch(
	() => props.preloadedOptions,
	() => {
		options.value = props.preloadedOptions;
	},
	{ immediate: true, deep: true },
);

watch(
	options,
	() => {
		if (options.value.sourceKey == null) {
			cancel();
		} else {
			submit();
		}
	},
	{ immediate: true, deep: true },
);

function submit() {
	emit("options", options.value);
	emit("data", extractedData.value);
}

function cancel() {
	emit("options", options.value);
	emit("cancel");
}

// https://vuetifyjs.com/en/api/v-select/#props-items
const vuetifySelectItems = computed(() => {
	return props.sourceData.headers.map((header) => {
		return {
			text: header,
			value: header,
		};
	});
});
</script>

<template>
	<div>
		<VContainer>
			<VRow>
				<VCol>{{ label }}</VCol>
				<VCol>
					<VSelect
						label="Quellspalte"
						:value="options.sourceKey"
						:items="vuetifySelectItems"
						clearable
						@change="options.sourceKey = $event"
					/>
				</VCol>
			</VRow>
		</VContainer>
	</div>
</template>
