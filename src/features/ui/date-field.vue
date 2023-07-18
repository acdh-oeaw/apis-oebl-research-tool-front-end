<script lang="ts" setup>
import { debounce } from "@acdh-oeaw/lib";
import { isValid } from "date-fns";
import { computed, ref, watch } from "vue";

import { getDaysInMonth } from "@/lib/get-days-in-month";

const props = defineProps<{
	label: string;
	date: string | null;
}>();

const emit = defineEmits<{
	(event: "submit", value: string | null): void;
}>();

const localDate = ref<string | null>(props.date);
const day = ref<number | null>(null);
const month = ref<number | null>(null);
const year = ref<number | null>(null);

const datePickerIsOpen = ref(false);

function onChange() {
	/** Only valid or null dates are allowed. */
	if (localDate.value != null && !isValid(new Date(localDate.value))) return;

	emit("submit", localDate.value);
}

const debouncedOnChange = debounce(onChange, 150);

watch(
	() => props.date,
	(date) => {
		localDate.value = date;
	},
);

watch(
	localDate,
	() => {
		if (localDate.value != null) {
			const _date = new Date(localDate.value);
			day.value = _date.getUTCDate();
			month.value = _date.getUTCMonth() + 1;
			year.value = _date.getUTCFullYear();
		}
	},
	{ immediate: true },
);

watch(localDate, (date, previousDate) => {
	if (date !== previousDate) {
		debouncedOnChange();
	}
});

watch([day, month, year], () => {
	try {
		if (year.value != null && month.value != null && day.value != null) {
			localDate.value = new Date(Date.UTC(year.value, month.value - 1, day.value)).toISOString();
		}
	} catch {
		/** noop */
	}
});

function updateFromDatePicker(isoDate: string) {
	localDate.value = isoDate;
}

const defaultISOValue = computed(() => {
	return localDate.value;
});

const daysInMonth = computed(() => {
	if (year.value == null) return 31;
	if (month.value == null) return 31;
	return getDaysInMonth(year.value, month.value);
});

const errorMessages = computed(() => {
	if (localDate.value == null) return [];

	const errors = [];

	const _date = new Date(localDate.value);

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
	if (!isValid(_date)) {
		return ["Bitte ein existierendes Datum auswählen"];
	}

	// No errors
	return [];
});

const hasErrors = computed(() => {
	return errorMessages.value.length > 0;
});
</script>

<template>
	<VInput
		:error-messages="errorMessages"
		class="background darken-2 rounded-lg mb-1 pl-2 date-field"
		dense
		:hide-details="!hasErrors"
	>
		<div class="caption label">{{ label }}</div>

		<VSpacer />

		<input
			v-model.number="day"
			min="1"
			:max="daysInMonth"
			maxlength="2"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="TT"
		/>

		<input
			v-model.number="month"
			maxlength="2"
			min="1"
			max="12"
			class="pa-1 text--primary"
			style="width: 40px"
			placeholder="MM"
		/>

		<input
			v-model.number="year"
			minlength="4"
			maxlength="4"
			class="pa-1 text--primary"
			style="width: 50px"
			placeholder="JJJJ"
		/>

		<VSpacer />

		<VMenu v-model="datePickerIsOpen" class="date-picker">
			<template #activator="{ on, attrs }">
				<VBtn v-bind="attrs" icon v-on="on"><VIcon>mdi-calendar</VIcon></VBtn>
			</template>
			<VDatePicker
				no-title
				scrollable
				:value="defaultISOValue"
				:first-day-of-week="1"
				@change="updateFromDatePicker"
			/>
		</VMenu>

		<VBtn icon @click="localDate = null">
			<VIcon>mdi-close-circle-outline</VIcon>
		</VBtn>
	</VInput>
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
