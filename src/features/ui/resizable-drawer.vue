<script lang="ts" setup>
import { clamp } from "@acdh-oeaw/lib";
import { ref } from "vue";

import { useVuetify } from "@/lib/use-vuetify";

const props = withDefaults(
	defineProps<{
		color?: string;
		initialWidth?: number;
		maxWidth?: number;
		minWidth?: number;
		right?: boolean;
		variant?: "card" | "default";
		visible?: boolean;
	}>(),
	{
		initialWidth: 300,
		maxWidth: 750,
		minWidth: 250,
		right: false,
		variant: "default",
		visible: false,
	},
);

const emit = defineEmits<{
	(event: "close"): void;
	(event: "update:width", width: number): void;
}>();

const vuetify = useVuetify();

const width = ref(props.initialWidth);

const isDragging = ref(false);
const transitionValues: Record<string, string> = {};

function disableUserSelect() {
	document.body.style.pointerEvents = "none";
	document.body.style.userSelect = "none";
}

function enableUserSelect() {
	document.body.style.pointerEvents = "initial";
	document.body.style.userSelect = "initial";
}

function disableTransitions(...selectors: Array<string>) {
	selectors.forEach((selector) => {
		document.querySelectorAll(selector).forEach((element) => {
			if (element instanceof HTMLElement) {
				transitionValues[selector] = element.style.transition;
				element.style.transition = "none";
			}
		});
	});
}

function enableAllTransitions() {
	Object.entries(transitionValues).forEach(([selector, value]) => {
		document.querySelectorAll(selector).forEach((element) => {
			if (element instanceof HTMLElement) {
				element.style.transition = value;
			}
		});
	});
}

function onStartDrag() {
	isDragging.value = true;

	disableUserSelect();
	disableTransitions(".nav-drawer", ".v-main", ".v-toolbar");

	document.addEventListener("mousemove", onDrag);
	document.addEventListener("mouseup", onEndDrag);
}

function onDrag(event: MouseEvent) {
	const intendedWidth = props.right ? document.body.clientWidth - event.pageX : event.pageX;

	if (intendedWidth < props.minWidth) {
		width.value = intendedWidth - (intendedWidth - props.minWidth) / 2;
	} else if (intendedWidth > props.maxWidth) {
		width.value = intendedWidth - (intendedWidth - props.maxWidth) / 2;
	} else {
		width.value = intendedWidth;
	}
}

function onEndDrag() {
	isDragging.value = false;

	enableUserSelect();
	enableAllTransitions();

	document.removeEventListener("mousemove", onDrag);
	document.removeEventListener("mouseup", onEndDrag);

	width.value = clamp(props.minWidth, width.value, props.maxWidth);

	emit("update:width", width.value);
}

function onDoubleClick() {
	if (width.value === props.maxWidth) {
		width.value = props.minWidth;
	} else {
		width.value = props.maxWidth;
	}

	emit("update:width", width.value);
}

function onVisibilityChange(value: boolean) {
	if (value === false) {
		emit("close");
	}
}
</script>

<template>
	<VNavigationDrawer
		app
		:class="{ 'display-card': props.variant === 'card', 'nav-drawer': true, right: props.right }"
		:color="props.color"
		:floating="true"
		:right="props.right"
		stateless
		:value="props.visible"
		:width="width"
		@input="onVisibilityChange"
	>
		<!-- FIXME: a11y -->
		<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
		<div
			:class="{ 'resize-handle-outer': true, dragging: isDragging, right: props.right }"
			@dblclick="onDoubleClick"
			@mousedown="onStartDrag"
		>
			<div
				class="resize-handle"
				:style="{ backgroundColor: vuetify.theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)' }"
			/>
		</div>
		<slot />
	</VNavigationDrawer>
</template>

<style>
.nav-drawer .v-navigation-drawer__content {
	position: relative;
	background: var(--bg-color);
}
</style>

<style scoped>
.nav-drawer:not(.v-navigation-drawer--custom-mini-variant) {
	overflow: visible;
	min-width: 100px;
	will-change: width;
}

.nav-drawer:not(.v-navigation-drawer--custom-mini-variant) :deep(.v-navigation-drawer__content) {
	background-color: var(--v-color);
}

.nav-drawer {
	paddding-left: 100px;
}

.nav-drawer.display-card :deep(.v-navigation-drawer__content) {
	border-radius: 13px;
	box-shadow: 10px 10px 100px hsl(240deg 100% 2%);
}

.nav-drawer.display-card :deep(.v-navigation-drawer__content) {
	margin: 10px 0 10px 10px;
}

.nav-drawer.right.display-card :deep(.v-navigation-drawer__content) {
	margin: 10px 10px 10px 0;
}

.resize-handle-outer {
	position: absolute;
	right: -6px;
	z-index: 6;
	width: 12px;
	height: 100%;
	cursor: ew-resize;
}

.resize-handle-outer.right {
	right: auto;
	left: -6px;
}

.resize-handle-outer:hover .resize-handle,
.resize-handle-outer.dragging .resize-handle {
	opacity: 100%;
}

.resize-handle {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 6px;
	width: 1px;
	opacity: 0%;
	transition: 0.2s;
}

.theme--light {
	color: hsl(0deg 0% 0%);
}
</style>
