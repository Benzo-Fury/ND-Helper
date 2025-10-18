import { commandModule, CommandType } from "@sern/handler";
import {
  ApplicationCommandOptionType,
  type MessageReplyOptions,
} from "discord.js";
import { roleOnly } from "../../../../plugins/roleOnly";
import config from "#config";

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
  plugins: [roleOnly(config.roles.mcAdmin)],
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
    let whiteList: WhitelistRecord[];
    try {
      whiteList = await Bun.file(Bun.env.WHITELIST_FILE).json();
    } catch (e) {
      sdt.deps["@sern/logger"]!.warning({ message: e });
      return ctx.reply({
        content: "There was an issue accessing the whitelist file.",
        flags: "Ephemeral",
      });
    }

    const username = ctx.options.getString("username")!;
    let response: MessageReplyOptions;

    const subcommand = ctx.options.getSubcommand();
    switch (subcommand) {
      case "remove": {
        // Loop whitelist & remove user
        const index = whiteList.findIndex((i) => i.name === username);

        if (index === -1) {
          // No index found
          return ctx.reply({
            content: "That user isn't whitelisted.",
            flags: "Ephemeral",
          });
        }

        response = {
          content: `Removed \`${username}\` from the whitelist.`,
        };
        break;
      }

      case "add": {
        // Fetch uuid & append uuid
        let uuid: string;
        try {
          const res = await fetchUUID(username);

          if (!res) {
            return ctx.reply({
              content: "That username doesn't exist.",
              flags: "Ephemeral",
            });
          }

          uuid = res.uuid;
        } catch (e) {
          return ctx.reply({
            content: "There was an error fetching that users UUID.",
            flags: "Ephemeral",
          });
        }

        whiteList.push({
          name: username,
          uuid,
        });

        response = {
          content: `Successfully pushed \`${username}\` to the whitelist.`,
        };
        break;
      }
    }

    // Save whitelist
    try {
      await Bun.write(Bun.env.WHITELIST_FILE, JSON.stringify(whiteList));
    } catch (e) {
      sdt.deps["@sern/logger"]!.warning({ message: e });
      return ctx.reply({
        content: "There was an error writing to the file.",
        flags: "Ephemeral",
      });
    }

    await ctx.reply(response!);
  },
});

/**
 * Fetch a user's UUID and current name from Mojang by username.
 * Endpoint returns 200 with { id, name } (id is undashed UUID),
 * or 204 No Content when the username does not exist.
 */
async function fetchUUID(username: string): Promise<WhitelistRecord | null> {
  const endpoint = `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(
    username
  )}`;
  const response = await fetch(endpoint);

  // Mojang returns 204 No Content when the user isn't found
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch UUID for ${username}: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as { id: string; name: string };
  if (!data?.id || !data?.name) {
    return null;
  }

  // Convert undashed Mojang UUID (32 hex chars) to dashed form 8-4-4-4-12
  const uuid =
    data.id.length === 32
      ? data.id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5")
      : data.id;

  return { uuid, name: data.name };
}
