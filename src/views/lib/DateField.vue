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
			min="1"
			:max="localDate.getMaxDate()"
			maxlength="2"
			v-model.number="localDate.calendarDate"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="TT"
			ref="date"
		/>
		<input
			maxlength="2"
			min="1"
			max="12"
			v-model.number="localDate.calendarMonth"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="MM"
			ref="month"
		/>
		<input
			minlength="4"
			maxlength="4"
			v-model.number="localDate.calendarYear"
			class="pa-1 text--primary"
			style="width: 50px"
			placeholder="JJJJ"
			ref="year"
		/>
		<v-spacer></v-spacer>
		<v-menu v-model="datePickerIsOpen" class="date-picker">
			<template v-slot:activator="{ on, attrs }">
				<v-btn v-on="on" v-bind="attrs" icon><v-icon>mdi-calendar</v-icon></v-btn>
			</template>
			<v-date-picker
				no-title
				scrollable
				:value="defaultISOValue"
				@change="updateFromDatePicker"
				:first-day-of-week="1"
			></v-date-picker>
		</v-menu>
		<v-btn @click="localDate.reset()" icon>
			<v-icon>mdi-close-circle-outline</v-icon>
		</v-btn>
	</v-input>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import TextField from "./TextField.vue";
import { DateContainer } from "@/util/dates";
import { debounce } from "lodash";

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
	datePickerIsOpen: boolean = false;

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

	get errorMessages(): string[] {
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
.date-field {
  font-size: 0.85rem;
}

.label {
  opacity: 0.7;
}

input {
  text-align: center;
}

.v-alert {
  font-size: 14px;
}
</style>
<style lang="stylus">
.modifier-menu {
  width: 62px;
}
</style>
