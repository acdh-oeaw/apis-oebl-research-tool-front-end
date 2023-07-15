import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import "tippy.js/themes/light.css";
import "tippy.js/dist/backdrop.css";

import { type Editor } from "@tiptap/core";
import { Mark, VueRenderer } from "@tiptap/vue-2";
import tippy, { hideAll, type Instance as TippyInstance, sticky } from "tippy.js";
import Vue, { type VueConstructor } from "vue";

import { vuetify } from "@/lib/vuetify";

let t: TippyInstance | null = null;
const vueComponents: { [name: string]: VueRenderer } = {};

function updateComponent(name: string, id: string, attrs: any, tagName: string, editor: Editor) {
	const el = document.querySelector(`${tagName}[data-id="${id}"]`);
	if (el instanceof HTMLElement && vueComponents[name] != null) {
		vueComponents[name]?.updateProps({ ...attrs, editor });
	}
}

function showPopUp(
	name: string,
	id: string,
	shouldFocus: boolean,
	vueComp: VueConstructor<Vue>,
	attributes: any,
	editor: Editor,
	parent: any,
	tagName: string,
) {
	const el = document.querySelector(`${tagName}[data-id="${id}"]`);
	if (el instanceof HTMLElement && t != null) {
		t.setProps({
			getReferenceClientRect() {
				return el.getBoundingClientRect();
			},
		});
		t.show();
		if (vueComponents[name] != null) {
			vueComponents[name]?.updateProps({
				...attributes,
				editor,
			});
		} else {
			vueComponents[name] = new VueRenderer(vueComp, {
				vuetify,
				propsData: {
					...attributes,
					editor,
				},
				parent,
			});
		}
		t.setContent(vueComponents[name]!.element);
		if (shouldFocus) {
			requestAnimationFrame(() => {
				t!.popper.querySelector("textarea")?.focus();
			});
		}
		t.popper.addEventListener("keyup", (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				t!.hide();
				editor.chain().focus().run();
			}
		});
	}
}

const ex = Mark.create({
	addOptions() {
		return {
			component: Vue,
			tagName: "",
		};
	},

	onCreate() {
		const e = document.querySelector("#app") as Element;
		t = tippy(e, {
			content: "",
			showOnCreate: false,
			allowHTML: true,
			interactive: true,
			ignoreAttributes: true,
			trigger: "manual",
			animation: "scale",
			sticky: true,
			plugins: [sticky],
			placement: "bottom",
			theme: "light",
			maxWidth: 350,
			appendTo: e,
			inertia: true,
			moveTransition: "transform 0.2s ease-out",
			popperOptions: {
				modifiers: [
					{
						name: "flip",
						options: {
							fallbackPlacements: ["bottom", "right"],
						},
					},
					{
						name: "preventOverflow",
						options: {
							altAxis: true,
							tether: false,
						},
					},
				],
			},
		});
	},
	onTransaction({ transaction }) {
		// parse the transaction
		const isAddingTypeMark = transaction.steps.some(
			(s) => s.toJSON().stepType === "addMark" && s.toJSON().mark.type === this.name,
		);
		const isRemovingTypeMark = transaction.steps.some(
			(s) => s.toJSON().stepType === "removeMark" && s.toJSON().mark.type === this.name,
		);

		// when adding a mark of this type, open the pop up
		const attrs = this.editor.getAttributes(this.name);
		if (isAddingTypeMark && !isRemovingTypeMark) {
			if (typeof attrs.id === "string") {
				showPopUp(
					this.name,
					attrs.id,
					true,
					this.options.component,
					attrs,
					this.editor,
					this.parent,
					this.options.tagName,
				);
			}
			// when adding and removing a mark in the same transaction,
			// we call it an update.
		} else if (isAddingTypeMark && isRemovingTypeMark) {
			updateComponent(this.name, attrs.id, attrs, this.options.tagName, this.editor);
			const el = document.querySelector(`${this.options.tagName}[data-id="${attrs.id}"]`);
			if (t != null && el != null) {
				t.setProps({
					getReferenceClientRect() {
						return el.getBoundingClientRect();
					},
				});
			}
			// when the transaction only removes a mark of this type,
			// close the popup
		} else if (!isAddingTypeMark && isRemovingTypeMark) {
			if (t != null) {
				t.hide();
			}
		}
	},
	addKeyboardShortcuts() {
		return {
			Escape: () => {
				console.log("esc!", t);
				if (t != null && t.state.isVisible) {
					t.hide();
					return true;
				} else {
					return false;
				}
			},
		};
	},
	onSelectionUpdate() {
		if (this.editor.isActive(this.name)) {
			const attrs = this.editor.getAttributes(this.name);
			if (typeof attrs.id === "string") {
				showPopUp(
					this.name,
					attrs.id,
					false,
					this.options.component,
					attrs,
					this.editor,
					this.parent,
					this.options.tagName,
				);
			}
		} else {
			if (t != null) {
				hideAll({
					exclude: t,
				});
			}
		}
	},
});

export default ex;
