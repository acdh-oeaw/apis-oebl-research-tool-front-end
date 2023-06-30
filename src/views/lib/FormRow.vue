<template>
	<v-row style="height: 35px" class="align-center" no-gutters>
		<v-col cols="5">
			{{ label }}
		</v-col>
		<v-col cols="7">
			<slot />
		</v-col>
	</v-row>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class FormRow extends Vue {
	@Prop({ required: true }) label!: string | null;
}
</script>
<style lang="scss" scoped></style>
