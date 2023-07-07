<template>
	<div :class="['rounded-lg mb-1 text-field-outer', color || 'background darken-2']">
		<div class="d-flex flex-grow-1">
			<slot name="prepend">
				<!-- FIXME: a11y -->
				<!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
				<div
					v-if="$attrs && $attrs.label"
					class="caption pa-2 text-field-label"
					@click="selectAll"
					v-text="$attrs.label"
				/>
				<!-- eslint-enable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
			</slot>
			<div style="position: relative" class="fill-width">
				<slot name="input">
					<div
						class="text-body-2 pa-2 fill-height fill-width fake-textarea"
						v-text="localValue || '&nbsp;'"
					/>
					<!-- FIXME: a11y -->
					<!-- eslint-disable vuejs-accessibility/form-control-has-label -->
					<textarea
						ref="textarea"
						class="fill-height fill-width pa-2 text-body-2"
						style="position: absolute; inset: 0"
						:placeholder="placeholder"
						:value="localValue"
						:disabled="disabled"
						:maxlength="maxlength"
						@keydown="onKeyDown"
						@input="onInput"
					/>
					<!-- eslint-enable vuejs-accessibility/form-control-has-label -->
				</slot>
			</div>
			<div>
				<slot />
			</div>
			<div v-if="clearable === true && localValue !== null && localValue !== ''">
				<v-btn small icon tile class="rounded-lg mt-1 mr-1" @click="clearInput">
					<v-icon size="16" color="primary">mdi-close</v-icon>
				</v-btn>
			</div>
		</div>
		<div v-if="msg !== null" class="text-center caption hint" v-text="msg" />
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class TextField extends Vue {
	@Prop({ default: () => [] }) rules!: Array<(e: string | null) => string | false>;
	@Prop({ default: false }) allowNewLine!: boolean;
	@Prop({ default: "" }) value!: string;
	@Prop({ default: false }) clearable!: boolean;
	@Prop({ default: false }) disabled!: boolean;
	@Prop({ default: false }) required!: boolean;
	@Prop({ default: false }) selected!: boolean;
	@Prop({ default: null }) placeholder!: string | null;
	@Prop({ default: null }) color!: string | null;
	@Prop({ default: null }) maxlength!: number | null;

	msg: string | null = null;

	localValue = this.value || "";

	@Watch("value")
	onChangeValue() {
		this.localValue = this.value;
	}

	@Watch("selected", { immediate: true })
	async onChangeSelected(shouldSelect: boolean) {
		await this.$nextTick();
		setTimeout(async () => {
			if (shouldSelect === true && this.$refs.textarea instanceof HTMLTextAreaElement) {
				await this.$nextTick();
				this.$refs.textarea.focus();
				this.$refs.textarea.select();
			}
		}, 100);
	}

	async clearInput() {
		this.$emit("input", "");
		if (this.$refs.textarea instanceof HTMLTextAreaElement) {
			this.$refs.textarea.value = "";
		}
		await this.$nextTick();
		this.focusInput();
	}

	selectAll() {
		const t = this.$refs.textarea;
		if (t instanceof HTMLTextAreaElement) {
			t.select();
		}
	}

	checkValid(e: string | null): boolean {
		if (e != null && e !== "") {
			const r = this.rules.find((r) => {
				return r(e) !== false;
			});
			if (r) {
				this.msg = r(e) || null;
				return false;
			} else {
				this.msg = null;
				return true;
			}
		} else if (this.required) {
			this.msg = "Dieses Feld darf nicht leer sein.";
			return false;
		} else {
			this.msg = null;
			return true;
		}
	}

	focusInput() {
		const t = this.$refs.textarea;
		if (t instanceof HTMLTextAreaElement) {
			t.focus();
		}
	}

	onInput(e: InputEvent) {
		if (e.target instanceof HTMLTextAreaElement) {
			this.localValue = e.target.value;
			if (this.checkValid(e.target.value)) {
				this.$emit("input", e.target.value);
				this.$nextTick(() => {
					this.focusInput();
				});
			}
		}
	}

	onKeyDown(e: KeyboardEvent) {
		if (e.key.toLowerCase() === "enter" && this.allowNewLine === false) {
			e.preventDefault();
		}
	}
}
</script>

<style lang="stylus">
.theme--dark .text-field-outer textarea
  color white
</style>

<style lang="stylus" scoped>
textarea
  outline 0
  resize none

:placeholder
  overflow hidden
  text-overflow ellipsis
  white-space nowrap

.fake-textarea
  min-height 1.6em
  word-break break-word
  visibility hidden
  will-change contents, height

.text-field-label
  flex 0 0 100px
  hyphens auto
  opacity 70%

.text-field-outer
  display flex
  overflow hidden
  transition 0.2s box-shadow

.text-field-outer:focus-within
  box-shadow 0 0 0 1px var(--v-primary-base), inset 0 0 0 2px var(--v-primary-base)

.hint
  background rgb(255 255 255 / 10%)
</style>
