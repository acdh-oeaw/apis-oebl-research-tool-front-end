import { env } from "./config/env";
import { server } from "./server";

server.listen(env.PORT, () => {
	// eslint-disable-next-line no-console
	console.info("🚀 ", `Server listening on port ${env.PORT}.`);
});
