import { getCurrentInstance } from "vue";

export function useVuetify() {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return getCurrentInstance()!.proxy.$vuetify;
}
