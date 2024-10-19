import { commandModule, CommandType } from "@sern/handler";
import { guildOnly } from "../../../../plugins/guildOnly";
import { permRequire } from "../../../../plugins/permRequire";
import {
  ApplicationCommandOptionType,
  ChannelType,
  Message,
  type GuildTextBasedChannel,
} from "discord.js";
import { isValidDiscordMessageLink } from "../../../../functions/isValidDiscordMessageLink";
import { fetchMessageFromUrl } from "../../../../functions/fetchMessageFromUrl";
import { JEmbed } from "#jembed";
import { attachmentIsImage } from "../../../../functions/attachmentIsImage";

export default commandModule({
  type: CommandType.Slash,
  description: "Creates a new embed 🧰",
  plugins: [guildOnly(), permRequire("ManageMessages")],
  options: [
    {
      name: "linkedmessage",
      description: "The message to copy and post 📋",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "channel",
      description: "The channel to post the embed in 📬",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [
        ChannelType.GuildText
      ]
    },
  ],
  execute: async (ctx) => {
    const messageUrl = ctx.options.getString("linkedmessage")!;
    let channel = ctx.options.getChannel("channel") as GuildTextBasedChannel;

    if (!channel && ctx.channel && !ctx.channel.isDMBased()) {
      channel = ctx.channel;
    }

    // Deferring
    await ctx.interaction.deferReply({
      ephemeral: true,
    });

    // Validating message is discord link
    if (!isValidDiscordMessageLink(messageUrl)) {
      return ctx.interaction.editReply({
        content: "That is not a valid Discord message link 🔗.",
      });
    }

    // Fetching message
    let message: Message;
    try {
      message = await fetchMessageFromUrl(ctx.client, messageUrl);
    } catch (e) {
      return ctx.interaction.editReply(
        "There was an error while fetching the message ❌."
      );
    }

    // Creating embed
    const embed = new JEmbed({
      embedData: {
        description: message.content,
      },
    });

    // Checking if any attachments exist
    if(message.attachments.size !== 0) {
      // Filtering attachments to only images
      const filteredAttachments = message.attachments.filter((a) => attachmentIsImage(a));

      // Checking if any exist
      if(filteredAttachments.size !== 0) {
        // Setting first attachment as embed image
        embed.setImage(filteredAttachments.first()!.url)
      }
    }

    // Reposting message in embed
    await channel.send({
      embeds: [embed],
    });

    // Responding
    await ctx.interaction.editReply(`Embed sent to channel ${channel} ✅.`)
  },
});
