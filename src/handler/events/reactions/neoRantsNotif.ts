import config from "#config";
import { eventModule, EventType, Service } from "@sern/handler";

export default eventModule({
  type: EventType.Discord,
  name: "messageReactionAdd",
  execute: async (reaction, user) => {
    // Filter for guilds only
    if (!reaction.message.guild) return;

    // Filter for rant channel
    if (reaction.message.channel.id !== config.neoRants) return;

    // Filter for the correct emoji
    if (reaction.emoji.name !== config.rantEmoji) return;

    // Fetching the member via the users id
    let member;

    try {
      member = await reaction.message.guild.members.fetch(user.id);
    } catch (e) {
      // Member doesn't exist or an error occurred
      return;
    }

    // Add or remove role from member.
    if(member.roles.cache.has(config.rantListener)) {
        await member.roles.remove(config.rantListener)
    } else {
        await member.roles.add(config.rantListener)
    }
  },
});
