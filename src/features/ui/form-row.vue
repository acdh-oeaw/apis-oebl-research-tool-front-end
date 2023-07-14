<script lang="ts" setup>
const props = defineProps<{
	label: string;
}>();
</script>

<template>
	<VRow class="align-center" no-gutters style="height: 35px">
		<VCol cols="5">
			{{ props.label }}
		</VCol>
		<VCol cols="7">
			<slot />
		</VCol>
	</VRow>
</template>
