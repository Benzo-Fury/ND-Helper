import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType, ChannelType, GuildMember, type ColorResolvable, type GuildTextBasedChannel, type PermissionResolvable } from "discord.js";
import { ConfigModel } from "../../../../schemas/config.model";
import { guildOnly } from "../../../../plugins/guildOnly";
import { permRequire } from "../../../../plugins/permRequire";
import { JEmbed } from "#jembed";
import gConfig from "#config"
import { PodModel } from "../../../../schemas/pod.model";

export default commandModule({
  type: CommandType.Slash,
  description: "Pod manager",
  plugins: [guildOnly(), permRequire("ManageChannels")],
  options: [
    {
      name: "spin",
      description: "Spin up a new pod 📦",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "bot",
          description: "The bot we will be testing 🧪",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "system",
          description:
            "The system/event/command inside the bot that we will be testing 🧪",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "type",
          description: "The type of pod to spin up 💨",
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: "Text",
              value: "text",
            },
            {
              name: "Voice",
              value: "voice",
            },
            {
              name: "Forum",
              value: "forum",
            },
            {
              name: "Stage",
              value: "stage",
            }
          ],
          required: true
        }
      ],
    },
    {
      name: "archive",
      description: "Archive the current pod 📦",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "add-user",
      description: "Add a user to the current pod 👤",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user to add 👤",
          type: ApplicationCommandOptionType.User,
          required: true
        }
      ]
    }
  ],
  execute: async (ctx, sdt) => {
    switch (ctx.options.getSubcommand()) {
      case "spin": {
        const bot = ctx.options.getUser("bot")!;
        const system = ctx.options.getString("system")!;

        await ctx.reply("Spinning up a new pod... 📦");

        // Resolving the category id
        const config = await ConfigModel.findOne({ key: "default" });

        // Checking if config doc exists
        if (!config) {
          return ctx.reply({
            content: "No config document found. Set one with `/config`.",
            ephemeral: true,
          });
        }

        // Checking testing bot is a bot
        if (!bot?.bot) {
          return ctx.reply({
            content: "Thats not a bot 🤖.",
            ephemeral: true,
          });
        }

        // Fetching category & creating channel
        const modifiedPerms: PermissionResolvable[] = ["SendMessages", "AddReactions", "CreatePublicThreads", "CreatePrivateThreads"]
        const pod = await ctx.guild!.channels.create({
          name: `📦pod-${system}`,
          type: ChannelType.GuildText,
          parent: config.podsCategoryId,
          permissionOverwrites: [
            {
              id: ctx.guild!.id, // everyone
              deny: modifiedPerms,
            },
            {
              id: ctx.user.id,
              allow: modifiedPerms,
            },
            {
              id: bot.id,
              allow: modifiedPerms,
            },
          ],
        });

        // Creating pod in db.
        await PodModel.create({
          channelId: pod.id,
          authorId: ctx.user.id,
          botId: bot.id,
        })

        // Editing original message and posting new one in pod.
        await ctx.interaction.editReply({
          content: null,
          embeds: [
            new JEmbed({
              author: ctx.member as GuildMember
            })
              .setColor(gConfig.podEmbedColor)
              .setTitle("New Pod 📦")
              .setDescription(`${ctx.user} has spun up a new pod to test \`${system}\` inside ${bot} 🧪.\nThe pod can be found here\n ## <#${pod.id}>.`)
              .setThumbnail(gConfig.packageEmojiNameUrl)
          ]
        })

        break;
      }

      case "archive": {
        const podDoc = await PodModel.findOne({channelId: ctx.channel!.id});

        if (!podDoc) {
          return ctx.reply({
            content: "This channel does not seem to be a pod 📦.",
            ephemeral: true
          })
        }

        podDoc.solved = true;
        podDoc.save();

        await (ctx.channel! as GuildTextBasedChannel).edit({
          permissionOverwrites: [
          ]
        })

        // Lock perms
        // Move channel to archive category
        break;
      }

      case "add-user": {
        break;
      }
    }
  },
});
