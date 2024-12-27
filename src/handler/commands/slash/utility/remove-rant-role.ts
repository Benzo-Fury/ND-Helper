import config from "#config";
import { commandModule, CommandType } from "@sern/handler";
import type { GuildMember } from "discord.js";

export default commandModule({
  type: CommandType.Slash,
  description: "Removes the rant listener role 🗣️",
  execute: async (ctx) => {
    const member = ctx.member as GuildMember;
    if (member.roles.cache.has(config.rantListener)) {
      await member.roles.remove(config.rantListener);
    }

    await ctx.reply({
      content: "Done 👍",
      ephemeral: true,
    });
  },
});
