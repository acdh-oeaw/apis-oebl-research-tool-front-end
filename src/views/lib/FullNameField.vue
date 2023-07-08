<template>
	<div class="full-name-input-wrapper">
		<!-- @vue-expect-error -->
		<text-field
			v-model="fullName.firstName"
			:required="false"
			:label="lemmaRowTranslations.firstName.de"
			:disabled="disabled"
			@input="emitInput($event, 'firstName')"
		></text-field>
		<!-- @vue-expect-error -->
		<text-field
			v-model="fullName.lastName"
			:required="false"
			:label="lemmaRowTranslations.lastName.de"
			:disabled="disabled"
			@input="emitInput($event, 'lastName')"
		></text-field>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { type FullName as FullNameType } from "@/types/lemma";
import { lemmaRowTranslations } from "@/util/labels";
import TextField from "@/views/lib/TextField.vue";

@Component({
	components: {
		TextField,
	},
})
export default class FullNameField extends Vue {
	@Prop({
		default: () => {
			return { firstName: null, lastName: null };
		},
	})
	fullName!: FullNameType;
	@Prop({ default: true }) disabled!: boolean;

	lemmaRowTranslations = lemmaRowTranslations;

	emitInput(eventData: string, property: "firstName" | "lastName") {
		if (!["firstName", "lastName"].includes(property)) {
			throw new Error(`Can not emit input for property ${property}`);
		}
		const updateFirstName = property === "firstName";
		this.$emit("input", {
			firstName: updateFirstName ? eventData : this.fullName.firstName,
			lastName: !updateFirstName ? eventData : this.fullName.lastName,
		});
	}
}
</script>
