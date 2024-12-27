import config from "#config";
import { eventModule, EventType } from "@sern/handler";

export default eventModule({
  type: EventType.Discord,
  name: "messageCreate",
  execute: async (message) => {
    // Filter for messages in the neo rants channel.
    if (message.channel.id !== config.neoRants) return;

    // Filter for only owner messages
    if (message.author.id !== config.owner) return;

    // Add bell reaction
    await message.react("🔔");
  },
});
