import { commandModule, CommandType } from "@sern/handler";
import {
  ApplicationCommandOptionType,
  type MessageReplyOptions,
} from "discord.js";
import { roleOnly } from "../../../../plugins/roleOnly";
import config from "#config";
import Minecraft from "../../../../utils/classes/Minecraft";

export interface WhitelistRecord {
  uuid: string;
  name: string;
}

/**
 * Supports writing to a minecraft whitelist in JSON format.
 * Must have a "WHITELIST_FILE" env var set for this to work.
 */
export default commandModule({
  type: CommandType.Slash,
  description: "Check latency 🏓",
  plugins: [roleOnly([config.roles.mcAdmin, config.roles.mcAdmin2])],
  options: [
    {
      name: "add",
      description: "Sneak a users into the Minecraft whitelist 😏",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "username",
          description: "The Mojang username of the user 🤫",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Banish a user from the whitelist 🔨",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "username",
          description: "The Mojang username of the user 🤫",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  execute: async (ctx, sdt) => {
    // Get whitelist file as obj

    const username = ctx.options.getString("username")!;

    let cmds = {
      add: `whitelist add ${username}`,
      remove: `whitelist remove ${username}`,
    };

    const subcommand = ctx.options.getSubcommand();
    try {
      let res;

      if (subcommand === "remove") {
        res = await Minecraft.execute(cmds.remove);
      } else {
        res = await Minecraft.execute(cmds.add);
      }

      return ctx.reply({ content: String(res) });
    } catch (e) {
      return ctx.reply({
        content: `Failed to ${subcommand} ${username} from whitelist`,
        flags: "Ephemeral",
      });
    }
  },
});
