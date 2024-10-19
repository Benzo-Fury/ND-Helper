import { CommandControlPlugin, CommandType, controller } from "@sern/handler";
import type { GuildMember, PermissionResolvable } from "discord.js";

export function permRequire(
  perm: PermissionResolvable | PermissionResolvable[]
) {
  return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
    if (!ctx.inGuild) {
      throw new Error(
        "permRequire plugin called outside of guild. Use guildOnly first."
      );
    }

    if (!(ctx.member as GuildMember).permissions.has(perm)) {
      await ctx.reply({
        content:
          "Your missing the required permissions to operate this command 🛠️.",
        ephemeral: true,
      });
      return controller.stop();
    }

    return controller.next();
  });
}
