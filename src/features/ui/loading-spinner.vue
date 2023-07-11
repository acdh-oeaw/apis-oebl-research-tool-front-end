<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LoadingSpinner extends Vue {
	@Prop({ default: "#333" }) color!: string;
	@Prop({ default: 30 }) size!: number;

	get cssProps() {
		return {
			"--loading-spinner-color": this.color,
			"--loading-spinner-left": this.size / 2 - 1 + "px",
			"--loading-spinner-top": this.size / 6 + "px",
			"--loading-spinner-height": this.size / 5 + "px",
			"--loading-spinner-width": this.size / 15 + "px",
		};
	}
}
</script>

<template>
	<div
		:style="{ paddingTop: size / 2 + 'px', width: size + 'px', height: size + 'px', ...cssProps }"
		class="lds-spinner"
	>
		<div v-for="i in 12" :key="i"></div>
	</div>
</template>

<style scoped>
.lds-spinner {
	position: relative;
	display: inline-block;
	color: black;
}

.lds-spinner div {
	transform-origin: 50% 50%;
	animation: lds-spinner 1.2s linear infinite;
}

.lds-spinner div::after {
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

.lds-spinner div:nth-child(1) {
	transform: rotate(0deg);
	animation-delay: -1.1s;
}

.lds-spinner div:nth-child(2) {
	transform: rotate(30deg);
	animation-delay: -1s;
}

.lds-spinner div:nth-child(3) {
	transform: rotate(60deg);
	animation-delay: -0.9s;
}

.lds-spinner div:nth-child(4) {
	transform: rotate(90deg);
	animation-delay: -0.8s;
}

.lds-spinner div:nth-child(5) {
	transform: rotate(120deg);
	animation-delay: -0.7s;
}

.lds-spinner div:nth-child(6) {
	transform: rotate(150deg);
	animation-delay: -0.6s;
}

.lds-spinner div:nth-child(7) {
	transform: rotate(180deg);
	animation-delay: -0.5s;
}

.lds-spinner div:nth-child(8) {
	transform: rotate(210deg);
	animation-delay: -0.4s;
}

.lds-spinner div:nth-child(9) {
	transform: rotate(240deg);
	animation-delay: -0.3s;
}

.lds-spinner div:nth-child(10) {
	transform: rotate(270deg);
	animation-delay: -0.2s;
}

.lds-spinner div:nth-child(11) {
	transform: rotate(300deg);
	animation-delay: -0.1s;
}

.lds-spinner div:nth-child(12) {
	transform: rotate(330deg);
	animation-delay: 0s;
}

@keyframes lds-spinner {
	0% {
		opacity: 100%;
	}

	100% {
		opacity: 0%;
	}
}
</style>
