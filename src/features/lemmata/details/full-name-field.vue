<script lang="ts" setup>
import TextField from "@/features/ui/text-field.vue";
import { type FullName as FullNameType } from "@/types/lemma";
import { lemmaRowTranslations } from "@/util/labels";

const props = defineProps<{
	disabled?: boolean;
	fullName: FullNameType;
}>();

const emit = defineEmits<{
	(event: "input", value: FullNameType): void;
}>();

function onUpdateFirstName(firstName: string) {
	emit("input", { firstName, lastName: props.fullName.lastName });
}

function onUpdateLastName(lastName: string) {
	emit("input", { firstName: props.fullName.lastName, lastName });
}
</script>

<!-- FIXME: why are both fields optional? -->
<template>
	<div>
		<TextField
			:disabled="disabled"
			:label="lemmaRowTranslations.firstName.de"
			:required="false"
			:value="props.fullName.firstName"
			@input="onUpdateFirstName"
		/>
		<TextField
			:disabled="disabled"
			:label="lemmaRowTranslations.lastName.de"
			:required="false"
			:value="props.fullName.lastName"
			@input="onUpdateLastName"
		/>
	</div>
</template>
