<template>
	<v-input
		:error-messages="errorMessages"
		class="background darken-2 rounded-lg mb-1 pl-2 date-field"
		dense
		:hide-details="!hasErrors"
	>
		<div class="caption label">{{ label }}</div>
		<v-spacer></v-spacer>
		<input
			ref="date"
			v-model.number="localDate.calendarDate"
			min="1"
			:max="localDate.getMaxDate()"
			maxlength="2"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="TT"
		/>
		<input
			ref="month"
			v-model.number="localDate.calendarMonth"
			maxlength="2"
			min="1"
			max="12"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="MM"
		/>
		<input
			ref="year"
			v-model.number="localDate.calendarYear"
			minlength="4"
			maxlength="4"
			class="pa-1 text--primary"
			style="width: 50px"
			placeholder="JJJJ"
		/>
		<v-spacer></v-spacer>
		<v-menu v-model="datePickerIsOpen" class="date-picker">
			<template #activator="{ on, attrs }">
				<v-btn v-bind="attrs" icon v-on="on"><v-icon>mdi-calendar</v-icon></v-btn>
			</template>
			<v-date-picker
				no-title
				scrollable
				:value="defaultISOValue"
				:first-day-of-week="1"
				@change="updateFromDatePicker"
			></v-date-picker>
		</v-menu>
		<v-btn icon @click="localDate.reset()">
			<v-icon>mdi-close-circle-outline</v-icon>
		</v-btn>
	</v-input>
</template>

<script lang="ts">
import { debounce } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { DateContainer } from "@/util/dates";
import TextField from "@/views/lib/TextField.vue";

const standaloneUpdateGlobalStateFunction = (instance: DateField) => {
	if (
		!instance.localDate.isEmpty() && // Only check for validity, if not empty: Allow to emit empty dates
		!instance.localDate.isValid() // Do not emit unvalid dates
	) {
		return;
	}
	instance.$emit("submit", instance.localDate);
};

const debouncedUpdateGlobalDateFunction = debounce(standaloneUpdateGlobalStateFunction, 750);

@Component({
	components: {
		TextField,
	},
})
export default class DateField extends Vue {
	@Prop({ default: null }) label!: string | null;
	@Prop() date!: DateContainer;

	localDate: DateContainer = new DateContainer();

	// if v-datepicker is visible
	datePickerIsOpen = false;

	@Watch("date", { immediate: true, deep: true })
	updateLocalDate() {
		if (!this.localDate.equals(this.date)) {
			this.localDate = this.date;
		}
	}

	@Watch("localDate", { immediate: false, deep: true })
	watchLocalDate() {
		debouncedUpdateGlobalDateFunction(this);
	}

	get hasErrors(): boolean {
		return this.errorMessages.length > 0;
	}

	get errorMessages(): Array<string> {
		if (
			this.localDate.calendarYear === undefined ||
			this.localDate.calendarMonth === undefined ||
			this.localDate.calendarDate === undefined
		) {
			return [];
		}

		const errors = [];

		// https://en.wikipedia.org/wiki/Year_zero differs from Javascript's implementation
		// https://gitlab.com/acdh-oeaw/oebl/oebl-irs-devops/-/issues/41
		if (this.localDate.calendarYear < 1) {
			errors.push("Es können nur Jahre ab dem Jahr 1 gespeichert werden");
		}

		if (this.localDate.calendarMonth < 1 || this.localDate.calendarMonth > 12) {
			errors.push("Bitte einen Monat zwischen 1 und 12 auswählen.");
		}

		if (
			this.localDate.calendarDate < 1 ||
			this.localDate.calendarDate > this.localDate.getMaxDate()
		) {
			errors.push(`Bitte einen Tag zwischen 1 und ${this.localDate.getMaxDate()} auswählen.`);
		}

		// If found errors return them
		if (errors.length > 0) {
			return errors;
		}

		// Else if not valid return default error message
		if (!this.localDate.isValid()) {
			console.error({ message: "Logic in error, check object", object: this });
			return ["Bitte ein existierendes Datum auswählen"];
		}

		// No errors
		return [];
	}

	updateFromDatePicker(isoDate: string) {
		this.localDate = DateContainer.fromISO_OnlyDate(isoDate);
	}

	get defaultISOValue(): string | null {
		if (this.localDate.isEmpty()) {
			return null;
		}

		if (this.localDate.isValid()) {
			return this.localDate.generateISO_OnlyDate();
		}

		// Fallback to keep as muc information as possible
		const year = this.localDate.calendarYear ?? 1970;
		const month = this.localDate.calendarMonth ?? 1;
		const date = this.localDate.calendarDate ?? 1;

		return new DateContainer(year, month, date).generateISO_OnlyDate();
	}
}
</script>

<style lang="stylus" scoped>
.date-field
  font-size 0.85rem


.label
  opacity 70%


input
  text-align center


.v-alert
  font-size 14px
</style>

<style lang="stylus">
.modifier-menu
  width 62px
</style>
