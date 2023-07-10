<script lang="ts">
import { isValid } from "date-fns";
import { debounce } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { getDaysInMonth } from "@/lib/get-days-in-month";
import TextField from "@/views/lib/TextField.vue";

const standaloneUpdateGlobalStateFunction = (instance: DateField) => {
	if (
		instance.localDate != null && // Only check for validity, if not empty: Allow to emit empty dates
		!isValid(instance.localDate) // Do not emit unvalid dates
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
	@Prop() date!: string | null;

	localDate: string | null = null;

	day: number | null = null;
	month: number | null = null;
	year: number | null = null;

	// if v-datepicker is visible
	datePickerIsOpen = false;

	@Watch("date", { immediate: true, deep: true })
	updateLocalDate() {
		this.localDate = this.date;
	}

	@Watch("localDate", { immediate: false })
	watchLocalDate() {
		debouncedUpdateGlobalDateFunction(this);

		if (this.localDate != null) {
			const _date = new Date(this.localDate);
			this.day = _date.getUTCDate();
			this.month = _date.getUTCMonth() + 1;
			this.year = _date.getUTCFullYear();
		}
	}

	@Watch("day")
	@Watch("month")
	@Watch("year")
	watchDay() {
		try {
			if (this.year != null && this.month != null && this.day != null) {
				this.localDate = new Date(Date.UTC(this.year, this.month - 1, this.day)).toISOString();
			}
		} catch {
			/** noop */
		}
	}

	get hasErrors(): boolean {
		return this.errorMessages.length > 0;
	}

	get errorMessages(): Array<string> {
		if (this.localDate == null) {
			return [];
		}

		const errors = [];

		const _date = new Date(this.localDate);

		const _year = _date.getUTCFullYear();

		// https://en.wikipedia.org/wiki/Year_zero differs from Javascript's implementation
		// https://gitlab.com/acdh-oeaw/oebl/oebl-irs-devops/-/issues/41
		if (_year < 1) {
			errors.push("Es können nur Jahre ab dem Jahr 1 gespeichert werden");
		}

		const _month = _date.getUTCMonth();

		if (_month < 0 || _month > 11) {
			errors.push("Bitte einen Monat zwischen 1 und 12 auswählen.");
		}

		const _day = _date.getUTCDate();
		const _daysInMonth = getDaysInMonth(_year, _month + 1);

		if (_day < 1 || _day > _daysInMonth) {
			errors.push(`Bitte einen Tag zwischen 1 und ${_daysInMonth} auswählen.`);
		}

		// If found errors return them
		if (errors.length > 0) {
			return errors;
		}

		// Else if not valid return default error message
		if (!isValid(this.localDate)) {
			console.error({ message: "Logic in error, check object", object: this });
			return ["Bitte ein existierendes Datum auswählen"];
		}

		// No errors
		return [];
	}

	updateFromDatePicker(isoDate: string) {
		this.localDate = isoDate;
	}

	get defaultISOValue(): string | null {
		return this.localDate;
	}

	get daysInMonth() {
		if (this.year == null) return 31;
		if (this.month == null) return 31;
		return getDaysInMonth(this.year, this.month);
	}
}
</script>

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
			v-model.number="day"
			min="1"
			:max="daysInMonth"
			maxlength="2"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="TT"
		/>
		<input
			ref="month"
			v-model.number="month"
			maxlength="2"
			min="1"
			max="12"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="MM"
		/>
		<input
			ref="year"
			v-model.number="year"
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
		<v-btn icon @click="localDate = null">
			<v-icon>mdi-close-circle-outline</v-icon>
		</v-btn>
	</v-input>
</template>

<style>
.modifier-menu {
	width: 62px;
}
</style>

<style scoped>
.date-field {
	font-size: 0.85rem;
}

.label {
	opacity: 70%;
}

input {
	text-align: center;
}

.v-alert {
	font-size: 14px;
}
</style>
