import { Bot, defaultBotOptions } from "./utils/classes/Bot.ts";
import { makeDependencies, Sern } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import { MongoClient } from "./utils/classes/MongoClient.ts";
import config from "./config.ts";

// Creating client instance
const client = new Bot(defaultBotOptions);

/**
 * Index is wrapped in a function to avoid Top Level Await.
 *
 * TLA is usually supported with ESNext and Bun however Bun contains a bug
 * where it errors when using TLA & Pm2. The bug can be found on their github
 * here:
 * https://github.com/oven-sh/bun/issues/19942
 */
async function main() {
  // Registering dependencies
  await makeDependencies(({ add, swap }) => {
    add("@sern/client", client);
    add("mongoClient", new MongoClient(Bun.env.DB_URI));
    add(
      "publisher",
      (deps) =>
        new Publisher(
          deps["@sern/modules"],
          deps["@sern/emitter"],
          deps["@sern/logger"]!
        )
    );
  });

  // Initializing sern with pre defined configuration
  Sern.init({
    commands: config.commands,
    events: config.events,
  });

  // Logging in with discord
  await client.login(process.env.DISCORD_TOKEN);
}

main();
