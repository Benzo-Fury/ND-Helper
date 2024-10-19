import { Bot, defaultBotOptions } from "./classes/Bot.ts";
import { makeDependencies, Sern } from "@sern/handler";
import { Publisher } from "@sern/publisher";
import { MongoClient } from "./classes/MongoClient.ts";
import { Logger } from "./classes/Logger.ts";
import config from "./config.ts";

// Creating client instance
const client = new Bot(defaultBotOptions);

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
client.login(process.env.CLIENT_TOKEN);
