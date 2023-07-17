<script lang="ts" setup>
import { v4 as uuid } from "uuid";
import { ref, watch } from "vue";

const props = withDefaults(
	defineProps<{
		allowNewLine?: boolean;
		ariaLabel?: string;
		clearable?: boolean;
		color?: string;
		disabled?: boolean;
		id?: string;
		label?: string;
		maxlength?: number;
		placeholder?: string;
		required?: boolean;
		rules?: Array<(e: string | null) => string | false>;
		selected?: boolean;
		value?: string | null;
	}>(),
	{
		id: uuid(),
	},
);

const emit = defineEmits<{
	(event: "input", value: string): void;
}>();

const textarea = ref<HTMLTextAreaElement | null>(null);
const msg = ref<string | null>(null);
const localValue = ref(props.value ?? "");

watch(
	() => props.value,
	(value) => {
		localValue.value = value ?? "";
	},
);

watch(
	() => props.selected,
	(shouldSelect) => {
		setTimeout(async () => {
			if (shouldSelect === true && textarea.value instanceof HTMLTextAreaElement) {
				textarea.value.focus();
				textarea.value.select();
			}
		}, 100);
	},
	{ immediate: true },
);

function clearInput() {
	emit("input", "");

	if (textarea.value instanceof HTMLTextAreaElement) {
		textarea.value.value = "";
	}

	focusInput();
}

function selectAll() {
	const t = textarea.value;
	if (t instanceof HTMLTextAreaElement) {
		t.select();
	}
}

function checkValid(e: string | null): boolean {
	if (e != null && e !== "") {
		const r = props.rules?.find((r) => {
			return r(e) !== false;
		});
		if (r) {
			msg.value = r(e) || null;
			return false;
		} else {
			msg.value = null;
			return true;
		}
	} else if (props.required) {
		msg.value = "Dieses Feld darf nicht leer sein.";
		return false;
	} else {
		msg.value = null;
		return true;
	}
}

function focusInput() {
	if (textarea.value instanceof HTMLTextAreaElement) {
		textarea.value.focus();
	}
}

function onInput(e: Event) {
	if (e.target instanceof HTMLTextAreaElement) {
		localValue.value = e.target.value;

		if (checkValid(e.target.value)) {
			emit("input", e.target.value);
		}
	}
}

function onKeyDown(e: KeyboardEvent) {
	if (e.key === "Enter" && props.allowNewLine === false) {
		e.preventDefault();
	}
}
</script>

<template>
	<div :class="['rounded-lg mb-1 text-field-outer', color || 'background darken-2']">
		<div class="d-flex flex-grow-1">
			<slot name="prepend">
				<!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
				<label
					v-if="props.label"
					:for="props.id"
					class="caption pa-2 text-field-label"
					@click="selectAll"
				>
					{{ props.label }}
				</label>
			</slot>

			<div style="position: relative" class="fill-width">
				<slot name="input">
					<div
						class="text-body-2 pa-2 fill-height fill-width fake-textarea"
						v-text="localValue || '&nbsp;'"
					/>

					<textarea
						:id="props.id"
						ref="textarea"
						:aria-label="props.ariaLabel"
						class="fill-height fill-width pa-2 text-body-2"
						:disabled="disabled"
						:maxlength="maxlength"
						:placeholder="placeholder"
						style="position: absolute; inset: 0"
						:value="localValue"
						@keydown="onKeyDown"
						@input="onInput"
					/>
				</slot>
			</div>

			<div>
				<slot />
			</div>

			<div v-if="props.clearable === true && localValue != null && localValue !== ''">
				<VBtn small icon tile class="rounded-lg mt-1 mr-1" @click="clearInput">
					<VIcon size="16" color="primary">mdi-close</VIcon>
				</VBtn>
			</div>
		</div>

		<div v-if="msg != null" class="text-center caption hint" v-text="msg" />
	</div>
</template>

<style>
.theme--dark .text-field-outer textarea {
	color: hsl(0deg 0% 100%);
}
</style>

<style scoped>
textarea {
	outline: 0;
	resize: none;
}

::placeholder {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.fake-textarea {
	min-height: 1.6em;
	word-break: break-word;
	visibility: hidden;
	will-change: contents, height;
}

.text-field-label {
	flex: 0 0 100px;
	hyphens: auto;
	opacity: 70%;
}

.text-field-outer {
	display: flex;
	overflow: hidden;
	transition: 0.2s box-shadow;
}

.text-field-outer:focus-within {
	box-shadow: 0 0 0 1px var(--v-primary-base), inset 0 0 0 2px var(--v-primary-base);
}

.hint {
	background: hsl(0deg 0% 100% / 10%);
}
</style>
