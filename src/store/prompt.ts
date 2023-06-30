import Vue from "vue";

interface PromptOptions {
	abortText?: string;
	confirmText?: string;
	placeholder?: string;
	rules?: ((s: string) => string | boolean)[];
}

export const bus = new Vue();

class ConfirmStore {
	private defaultMessage = "Name eingeben…";
	private defaultAbortText = "abbrechen";
	private defaultConfirmText = "OK";

	show = false;
	message = this.defaultMessage;
	abortText = this.defaultAbortText;
	confirmText = this.defaultConfirmText;
	placeholder = "";
	rules: PromptOptions["rules"] = [];
	value: string | null = null;

	isValid(input: string | null): boolean {
		return input !== null && (this.rules || []).every((r) => r(input) === true);
	}

	async prompt(message: string, options?: PromptOptions): Promise<string | null> {
		this.show = true;
		this.value = null;
		this.message = message || this.defaultMessage;
		this.abortText = options?.abortText || this.defaultAbortText;
		this.confirmText = options?.confirmText || this.defaultConfirmText;
		this.rules = options?.rules || [];
		this.placeholder = options?.placeholder || "";
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		return new Promise((resolve) => {
			window.addEventListener("keyup", function onEscOrEnter(e) {
				if (e.key === "Enter" && that.isValid(that.value)) {
					e.stopImmediatePropagation();
					e.stopPropagation();
					e.preventDefault();
					that.show = false;
					window.removeEventListener("keyup", onEscOrEnter);
					resolve(that.value);
				}
				if (e.key === "Escape") {
					e.stopImmediatePropagation();
					e.stopPropagation();
					e.preventDefault();
					that.show = false;
					window.removeEventListener("keyup", onEscOrEnter);
					resolve(null);
				}
			});
			bus.$on("confirm", () => {
				this.show = false;
				resolve(this.value);
			});
			bus.$on("abort", () => {
				this.show = false;
				resolve(null);
			});
		});
	}
}

export default Vue.observable(new ConfirmStore());
