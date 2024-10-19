import {
  commandModule,
  CommandType,
} from "@sern/handler";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  type EmbedData,
  type GuildTextBasedChannel,
} from "discord.js";
import { permRequire } from "../../../../plugins/permRequire";
import { EmbedPresetModel } from "../../../../schemas/embedPreset.model";
import { stringToBoolean } from "../../../../functions/strToBoolean";
import config from "#config";
import { hexToInt } from "../../../../functions/hexToInt";
import { isHexColor } from "../../../../functions/isHexColor";

export interface ButtonObj {
  customId: string;
  label: string;
  style: "Primary" | "Secondary" | "Success" | "Danger";
  disabled?: string;
}

export const styleMap: { [key in ButtonObj["style"]]: ButtonStyle } = {
  Primary: ButtonStyle.Primary,
  Danger: ButtonStyle.Danger,
  Secondary: ButtonStyle.Secondary,
  Success: ButtonStyle.Success,
};

export default commandModule({
  name: "presets", // Overwriting from the file name
  description: "Send a embed preset 🧰",
  type: CommandType.Slash,
  plugins: [permRequire("Administrator")],
  options: [
    {
      name: "create",
      description: "Creates a new embed preset 🧰",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "The name of the preset 📕",
          type: ApplicationCommandOptionType.String,
          required: true,
          max_length: 20,
        },
        {
          name: "embed",
          description: "The embed in JSON 📋",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "buttons",
          description: "An array of buttons in JSON 📋",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "post",
      description: "Posts a preset 📯",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "preset",
          description: "The preset to post 📝",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
          command: {
            execute: fetchPostChoices,
          },
        },
        {
          name: "channel",
          description: "The channel to send the preset to 🚧.",
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildText],
        },
      ],
    },
    {
      name: "delete",
      description: "Deletes a preset 🗑️",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "preset",
          description: "The preset to post 📝",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
          command: {
            execute: fetchPostChoices,
          },
        },
      ],
    },
  ],
  execute: async (ctx) => {
    switch (ctx.options.getSubcommand()) {
      case "create": {
        // Getting all options
        const name = ctx.options.getString("name")!.toLocaleLowerCase();
        const embedJson = ctx.options.getString("embed")!;
        const buttonsJson = ctx.options.getString("buttons");

        // Ensure name doesn't already exist
        if (await EmbedPresetModel.findOne({ name })) {
          return ctx.reply({
            content: "That preset already exists ❌.",
            ephemeral: true,
          });
        }

        // Parsing JSON
        let embedObj: EmbedData;
        let buttonObjs: Array<ButtonObj> | undefined;

        try {
          embedObj = JSON.parse(embedJson);

          if (buttonsJson) {
            buttonObjs = JSON.parse(buttonsJson);

            // Ensuring its array
            if (!Array.isArray(buttonObjs)) {
              return ctx.reply({
                content: `Buttons must be an array 🪡.`,
                ephemeral: true,
              });
            }
          }
        } catch (e) {
          return ctx.reply({
            content: `\`${e}\``,
            ephemeral: true,
          });
        }

        // Convert embed color from hex to rgb int
        if (embedObj.color && typeof embedObj.color !== "number") {
          // Check if hex
          if (!isHexColor(embedObj.color)) {
            return ctx.reply({
              content: "Embed color must be a color hex or rgb int.",
              ephemeral: true,
            });
          }

          // Convert
          embedObj.color = hexToInt(embedObj.color);
        }

        // Creating document in db
        await EmbedPresetModel.create({
          name,
          embed: embedObj,
          buttons: buttonObjs,
        });

        await ctx.reply({
          content: `Successfully created preset. Use </preset post:${config.presets}> to see it.`,
        });
        break;
      }
      case "post": {
        const channel = (ctx.options.getChannel("channel") ||
          ctx.channel)! as GuildTextBasedChannel;

        // Fetching post from db
        const preset = await EmbedPresetModel.findOne({
          name: ctx.options.getString("preset")!,
        });

        // Ensuring preset exists (might have been removed since autocomplete was sent)
        if (!preset) {
          return ctx.reply({
            content: "That preset no longer exists 😥.",
            ephemeral: true,
          });
        }

        // Creating buttons
        let buttonActionRow: ActionRowBuilder<ButtonBuilder> | undefined;

        if (preset.buttons) {
          buttonActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...preset.buttons.map((b) =>
              new ButtonBuilder()
                .setCustomId(b.customId)
                .setLabel(b.label)
                .setStyle(styleMap[b.style])
                .setDisabled(b.disabled ? stringToBoolean(b.disabled) : false)
            )
          );
        }

        try {
          await channel.send({
            embeds: [preset.embed],
            components: buttonActionRow ? [buttonActionRow] : undefined,
          });
        } catch (e) {
          return ctx.reply({
            content: "An error happened while sending the preset.",
            ephemeral: true,
          });
        }

        await ctx.reply(`Preset sent in ${channel}.`);
        break;
      }
      case "delete": {
        const preset = ctx.options.getString("preset")!;

        try {
          await EmbedPresetModel.deleteOne({ name: preset });
        } catch (e) {
          // Catching in case preset didn't exist
          return ctx.reply({
            content: "That preset no longer exists 😥.",
            ephemeral: true,
          });
        }

        await ctx.reply(`Successfuly deleted \`${preset}\`.`);
        break;
      }
    }
  },
});

async function fetchPostChoices(ctx: AutocompleteInteraction) {
  // Fetch all presets
  const presets = await EmbedPresetModel.find();

  await ctx.respond(
    presets.map((p) => ({
      name: p.name,
      value: p.name,
    }))
  );
}
