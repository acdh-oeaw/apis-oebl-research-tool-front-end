<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ResizableDrawer extends Vue {
	@Prop({ default: false }) value!: boolean;
	@Prop({ default: false }) right!: boolean;
	@Prop({ default: false }) card!: boolean;
	@Prop({ default: false }) mini!: boolean;
	@Prop({ default: false }) clipped!: boolean;
	@Prop({ default: 250 }) minWidth!: number;
	@Prop({ default: 300 }) width!: number;
	@Prop({ default: true }) floating!: boolean;
	@Prop() color!: string;

	localWidth = this.width || 300;
	transitionValues: { [selector: string]: string } = {};
	maxWidth = 750;
	isDragging = false;

	@Watch("width")
	onChangeWidthProp(w: number) {
		this.localWidth = w;
	}

	cssVars() {
		return { "--bg-color": this.color };
	}

	expandOrShrink() {
		if (this.width === this.minWidth) {
			this.localWidth = this.maxWidth;
		} else if (this.width === this.maxWidth) {
			this.localWidth = this.minWidth;
		} else {
			this.localWidth = this.maxWidth;
		}
		this.$emit("update:width", this.localWidth);
	}

	disableUserSelect() {
		document.body.style.pointerEvents = "none";
		document.body.style.userSelect = "none";
		document.body.style.webkitUserSelect = "none";
	}

	enableUserSelect() {
		document.body.style.pointerEvents = "initial";
		document.body.style.userSelect = "initial";
		document.body.style.webkitUserSelect = "initial";
	}

	disableTransitions(...selectors: Array<string>) {
		selectors.forEach((s) => {
			document.querySelectorAll(s).forEach((e) => {
				if (e instanceof HTMLElement) {
					// cache ’em
					this.transitionValues[s] = e.style.transition;
					// unset em
					e.style.transition = "none";
				}
			});
		});
	}

	enableAllTransitions() {
		Object.entries(this.transitionValues).forEach((e) => {
			document.querySelectorAll(e[0]).forEach((el) => {
				if (el instanceof HTMLElement) {
					// give them their old value
					el.style.transition = e[1];
				}
			});
		});
	}

	startDrag() {
		this.disableUserSelect();
		this.disableTransitions(".nav-drawer", ".v-main", ".v-toolbar");
		this.isDragging = true;
		document.addEventListener("mousemove", this.drag);
		document.addEventListener("mouseup", this.endDrag);
	}

	endDrag() {
		this.isDragging = false;
		this.enableUserSelect();
		this.enableAllTransitions();
		document.removeEventListener("mousemove", this.drag);
		document.removeEventListener("mouseup", this.endDrag);
		console.log(this.width, this.localWidth, this.minWidth);
		// if it’s too big or too small, bounce back.
		if (this.localWidth > this.maxWidth) {
			this.localWidth = this.maxWidth;
		} else if (this.localWidth < this.minWidth) {
			this.localWidth = this.minWidth;
		}
		this.$emit("update:width", this.localWidth);
	}

	drag(e: MouseEvent) {
		const intendedWidth = this.right ? document.body.clientWidth - e.pageX : e.pageX;
		if (intendedWidth < this.minWidth) {
			this.localWidth = intendedWidth - (intendedWidth - this.minWidth) / 2;
		} else if (intendedWidth > this.maxWidth) {
			this.localWidth = intendedWidth - (intendedWidth - this.maxWidth) / 2;
		} else {
			this.localWidth = intendedWidth;
		}
	}

	handleInput(v: boolean) {
		if (v === false) {
			this.$emit("close");
		}
	}
}
</script>

<template>
	<v-navigation-drawer
		v-bind="{ ...$props, ...$attrs }"
		ref="drawer"
		:color="color"
		:right="right"
		stateless
		:clipped="clipped"
		:width="localWidth"
		:class="{
			'display-card': card,
			'nav-drawer': true,
			right: right,
		}"
		:floating="floating"
		:value="value"
		app
		@input="handleInput"
	>
		<!-- FIXME: a11y -->
		<!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
		<div
			v-if="!mini"
			:class="['resize-handle-outer', isDragging && 'dragging', right && 'right']"
			@dblclick="expandOrShrink"
			@mousedown="startDrag"
		>
			<div
				class="resize-handle"
				:style="{ backgroundColor: $vuetify.theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)' }"
			/>
		</div>
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
