import { env } from "@server/config/env";
import { server } from "@server/server";

server.listen(env.PORT, () => {
	// eslint-disable-next-line no-console
	console.info("🚀 ", `Server listening on port ${env.PORT}.`);
});
