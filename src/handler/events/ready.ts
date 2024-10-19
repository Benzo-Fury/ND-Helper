import { eventModule, EventType, Service } from "@sern/handler";

export default eventModule({
  type: EventType.Discord,
  name: "ready",
  execute: async () => {
    // Resolving mongo client
    const mongoClient = Service("mongoClient");

    // Connecting to the database
    await mongoClient.connect();
  },
});
