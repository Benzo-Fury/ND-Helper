import { CommandControlPlugin, CommandType, controller } from "@sern/handler";
import type { GuildMember } from "discord.js";

export function roleOnly(role: string | string[]) {
  return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
    if (!ctx.inGuild) {
      throw new Error(
        "roleOnly plugin called outside of guild. Use guildOnly first."
      );
    }

    const member = ctx.member as GuildMember;
    const roles = Array.isArray(role) ? role : [role];
    const hasRequiredRole = roles.some((id) => member.roles.cache.has(id));

    if (!hasRequiredRole) {
      await ctx.reply({
        content:
          "You're missing the required role(s) to operate this command 🧩.",
        flags: "Ephemeral",
      });
      return controller.stop();
    }

    return controller.next();
  });
}
