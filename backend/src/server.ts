import { app } from "./app";
import { env } from "./config/env";
import { testDatabaseConnection } from "./config/db";

async function bootstrap() {
  await testDatabaseConnection();

  app.listen(env.PORT, () => {
    console.log(`Backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap backend", error);
  process.exit(1);
});
