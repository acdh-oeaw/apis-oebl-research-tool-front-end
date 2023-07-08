import { z } from "zod";

const schema = z.object({
	VUE_APP_API_HOST: z.string().url(),
	VUE_APP_EVENTBUS_HOST: z.string().url(),
	VUE_APP_WEBAPP_HOST: z.string().url(),
});

const result = schema.safeParse(process.env);

if (result.success === false) {
	const message = [
		"Invalid environment variables.",
		JSON.stringify(result.error.flatten().fieldErrors, null, 2),
	].join("\n");
	const error = new Error(message);
	delete error.stack;
	throw error;
}

export const env = result.data;
