import { z } from "zod";

const schema = z.object({
	ALLOWED_ORIGIN: z.string().transform((value, context) => {
		try {
			return z.array(z.string().url()).parse(JSON.parse(value));
		} catch {
			context.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" });
			return z.NEVER;
		}
	}),
	PORT: z.coerce.number().default(3333),
	SERVICE_SECRET: z.string().min(8),
	ZOTERO_API_KEY: z.string().min(1),
	ZOTERO_USER: z.string().min(1),
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
