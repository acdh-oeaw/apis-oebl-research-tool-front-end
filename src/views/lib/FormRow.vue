<script lang="ts" setup>
const _props = defineProps<{
	label: string;
}>();
</script>

<template>
	<VRow style="height: 35px" class="align-center" no-gutters>
		<VCol cols="5">
			{{ label }}
		</VCol>
		<VCol cols="7">
			<slot />
		</VCol>
	</VRow>
</template>
