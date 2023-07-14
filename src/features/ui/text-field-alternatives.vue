<script lang="ts" setup>
import TextField from "@/features/ui/text-field.vue";

const props = defineProps<{
	value: Array<string>;
	label: string;
}>();

const emit = defineEmits<{
	(event: "input", value: Array<string>): void;
}>();

function updateItem(i: number, v: string) {
	emit(
		"input",
		props.value.map((v2, i2) => (i === i2 ? v : v2)),
	);
}

function removeItem(i: number) {
	emit(
		"input",
		props.value.filter((v, i2) => i2 !== i),
	);
}

function insertItemAt(i: number) {
	emit("input", [...props.value.slice(0, i + 1), "", ...props.value.slice(i + 1)]);
}
</script>

<template>
	<div>
		<TextField
			v-for="(name, i) in value"
			:key="i"
			:required="true"
			:label="label + ' (' + (i + 2) + ')'"
			:value="name"
			@input="updateItem(i, $event)"
		>
			<div class="text-no-wrap align-self-center">
				<VBtn tabindex="-1" tile class="rounded-lg mt-1" icon small @click="removeItem(i)">
					<VIcon>mdi-minus-circle-outline</VIcon>
				</VBtn>
				<VBtn tabindex="-1" tile class="rounded-lg mt-1 mr-1" icon small @click="insertItemAt(i)">
					<VIcon>mdi-plus-circle-outline</VIcon>
				</VBtn>
			</div>
		</TextField>
	</div>
</template>
