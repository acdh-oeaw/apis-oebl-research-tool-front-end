<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const props = withDefaults(
	defineProps<{
		color?: string;
		minWidth?: number;
		right?: boolean;
		value?: boolean;
		width?: number;
	}>(),
	{
		minWidth: 250,
		right: false,
		value: false,
		width: 300,
	},
);

const emit = defineEmits<{
	(event: "update:width", width: number): void;
	(event: "close"): void;
}>();

// TODO:

const localWidth = ref(props.width);
const maxWidth = 750;
const transitionValues = ref<{ [selector: string]: string }>({});
const isDragging = ref(false);

const cssVars = computed(() => ({ "--bg-color": props.color }));

watch(
	() => props.width,
	(width) => {
		localWidth.value = width;
	},
);

function expandOrShrink() {
	if (props.width === props.minWidth) {
		localWidth.value = maxWidth;
	} else if (props.width === maxWidth) {
		localWidth.value = props.minWidth;
	} else {
		localWidth.value = maxWidth;
	}

	emit("update:width", localWidth.value);
}

function disableUserSelect() {
	document.body.style.pointerEvents = "none";
	document.body.style.userSelect = "none";
	document.body.style.webkitUserSelect = "none";
}

function enableUserSelect() {
	document.body.style.pointerEvents = "initial";
	document.body.style.userSelect = "initial";
}

function disableTransitions(...selectors: Array<string>) {
	selectors.forEach((s) => {
		document.querySelectorAll(s).forEach((e) => {
			if (e instanceof HTMLElement) {
				// cache 'em
				transitionValues.value[s] = e.style.transition;
				// unset em
				e.style.transition = "none";
			}
		});
	});
}

function enableAllTransitions() {
	Object.entries(transitionValues.value).forEach((e) => {
		document.querySelectorAll(e[0]).forEach((el) => {
			if (el instanceof HTMLElement) {
				// give them their old value
				el.style.transition = e[1];
			}
		});
	});
}

function startDrag() {
	disableUserSelect();
	disableTransitions(".nav-drawer", ".v-main", ".v-toolbar");
	isDragging.value = true;
	document.addEventListener("mousemove", drag);
	document.addEventListener("mouseup", endDrag);
}

function endDrag() {
	isDragging.value = false;

	enableUserSelect();
	enableAllTransitions();

	document.removeEventListener("mousemove", drag);
	document.removeEventListener("mouseup", endDrag);

	// if it's too big or too small, bounce back.
	if (localWidth.value > maxWidth) {
		localWidth.value = maxWidth;
	} else if (localWidth.value < props.minWidth) {
		localWidth.value = props.minWidth;
	}

	emit("update:width", localWidth.value);
}

function drag(e: MouseEvent) {
	const intendedWidth = props.right ? document.body.clientWidth - e.pageX : e.pageX;

	if (intendedWidth < props.minWidth) {
		localWidth.value = intendedWidth - (intendedWidth - props.minWidth) / 2;
	} else if (intendedWidth > maxWidth) {
		localWidth.value = intendedWidth - (intendedWidth - maxWidth) / 2;
	} else {
		localWidth.value = intendedWidth;
	}
}

function onChange(value: boolean) {
	if (value === false) {
		emit("close");
	}
}
</script>

<template>
	<v-navigation-drawer
		v-bind="{ ...$props, ...$attrs }"
		ref="drawer"
		app
		:class="{ 'nav-drawer': true, right }"
		:clipped="false"
		:color="color"
		:floating="true"
		:right="right"
		stateless
		:value="value"
		:width="localWidth"
		@input="onChange"
	>
		<slot />
	</v-navigation-drawer>
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
