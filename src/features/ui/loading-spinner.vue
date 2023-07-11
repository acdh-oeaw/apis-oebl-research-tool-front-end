<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		color?: string;
		size?: number;
	}>(),
	{ color: "#333", size: 30 },
);

const style = computed(() => {
	return {
		"--loading-spinner-color": props.color,
		"--loading-spinner-size": props.size + "px",
		"--loading-spinner-left": props.size / 2 - 1 + "px",
		"--loading-spinner-top": props.size / 6 + "px",
		"--loading-spinner-height": props.size / 5 + "px",
		"--loading-spinner-width": props.size / 15 + "px",
	};
});
</script>

<template>
	<div class="loading-spinner" :style="style">
		<div v-for="i in 12" :key="i"></div>
	</div>
</template>

<style scoped>
.loading-spinner {
	position: relative;
	display: inline-block;
	width: var(--loading-spinner-size);
	height: var(--loading-spinner-size);
	padding-top: calc(var(--loading-spinner-size) / 2);
	color: hsl(0deg 0% 0%);
}

.loading-spinner div {
	transform-origin: 50% 50%;
	animation: loading-spinner 1.2s linear infinite;
}

.loading-spinner div::after {
	content: " ";
	position: absolute;
	top: var(--loading-spinner-top);
	left: var(--loading-spinner-left);
	display: block;
	width: var(--loading-spinner-width);
	height: var(--loading-spinner-height);
	border-radius: 0;
	background: var(--loading-spinner-color);
}

.loading-spinner div:nth-child(1) {
	transform: rotate(0deg);
	animation-delay: -1.1s;
}

.loading-spinner div:nth-child(2) {
	transform: rotate(30deg);
	animation-delay: -1s;
}

.loading-spinner div:nth-child(3) {
	transform: rotate(60deg);
	animation-delay: -0.9s;
}

.loading-spinner div:nth-child(4) {
	transform: rotate(90deg);
	animation-delay: -0.8s;
}

.loading-spinner div:nth-child(5) {
	transform: rotate(120deg);
	animation-delay: -0.7s;
}

.loading-spinner div:nth-child(6) {
	transform: rotate(150deg);
	animation-delay: -0.6s;
}

.loading-spinner div:nth-child(7) {
	transform: rotate(180deg);
	animation-delay: -0.5s;
}

.loading-spinner div:nth-child(8) {
	transform: rotate(210deg);
	animation-delay: -0.4s;
}

.loading-spinner div:nth-child(9) {
	transform: rotate(240deg);
	animation-delay: -0.3s;
}

.loading-spinner div:nth-child(10) {
	transform: rotate(270deg);
	animation-delay: -0.2s;
}

.loading-spinner div:nth-child(11) {
	transform: rotate(300deg);
	animation-delay: -0.1s;
}

.loading-spinner div:nth-child(12) {
	transform: rotate(330deg);
	animation-delay: 0s;
}

@keyframes loading-spinner {
	0% {
		opacity: 100%;
	}

	100% {
		opacity: 0%;
	}
}
</style>
