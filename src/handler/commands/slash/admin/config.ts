import { commandModule, CommandType } from "@sern/handler";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  ChannelType,
  ComponentType,
  Message,
} from "discord.js";
import { ConfigModel } from "../../../../schemas/config.model";
import { awaitMessageComponent } from "../../../../functions/awaitMessageComponent";
import { guildOnly } from "../../../../plugins/guildOnly";
import { permRequire } from "../../../../plugins/permRequire";

export default commandModule({
  type: CommandType.Slash,
  description: "Config default settings ⚙️",
  plugins: [guildOnly(), permRequire("Administrator")],
  options: [
    {
      name: "setting",
      description: "The setting to configure ⚙️",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Pods Category",
          value: "podsCategoryId",
        },
      ],
    },
  ],
  execute: async (ctx) => {
    switch (ctx.options.getString("setting")) {
      case "podsCategoryId": {
        // Fetching existing channel id from db
        const config = await ConfigModel.findOne({ key: "default" });
        const configChannelId = config?.podsCategoryId;

        // Creating channel select component
        const channelSelectCustomId = "podsCategorySelect";
        const channelSelect = new ChannelSelectMenuBuilder({
          customId: channelSelectCustomId,
          channelTypes: [ChannelType.GuildCategory],
          placeholder: "Select a category 📊",
        });

        if (configChannelId) {
          channelSelect.addDefaultChannels([configChannelId]);
        }

        const actionRow = new ActionRowBuilder<ChannelSelectMenuBuilder>({
          components: [channelSelect],
        });

        // Sending select
        const selectMessage = await ctx.reply({
          components: [actionRow],
        });

        async function disableSelect(msg: Message) {
          actionRow.components[0].setDisabled(true);
          await msg.edit({
            components: [actionRow],
          });
        }

        // Waiting for select menu response
        const selectResponse =
          await awaitMessageComponent<ComponentType.ChannelSelect>(
            selectMessage,
            ComponentType.ChannelSelect,
            {
              filter: async (i: ChannelSelectMenuInteraction) => {
                if (i.user.id !== ctx.user.id) {
                  await i.reply({
                    content: "That is not meant for you 😡.",
                  });
                  return false;
                }
                return true;
              },
              time: 120000,
            },
            (msg) => disableSelect(msg)
          );

        // Checking if response was submitted
        if (!selectResponse) return;

        // Deferring an update
        await selectResponse.deferUpdate();

        // Extracting channel id
        const podsCategoryId = selectResponse.values[0];

        // Updating in db
        await ConfigModel.updateOne(
          { key: "default" },
          { podsCategoryId },
          { upsert: true }
        );

        // Responding to the select interaction.
        await selectMessage.edit({
          content: `Pods category set to <#${podsCategoryId}> 📦.`,
          components: [],
        });
        break;
      }
    }
  },
});
