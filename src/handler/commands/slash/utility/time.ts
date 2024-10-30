import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";
import { UserModel } from "../../../../schemas/user.schema";
import timezones from "../../../../../public/autocomplete/timezones.json";
import { DateTime } from "luxon";

export default commandModule({
  type: CommandType.Slash,
  description: "Manage all stored times ⏱️",
  options: [
    {
      name: "set",
      description: "Sets your timezone ⏱️",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "zone",
          description: "The timezone ⌛",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
          command: {
            execute: async (auto) => {
              const input = auto.options.getFocused();

              return auto.respond(fuzzyMatchTimezone(input)).catch(() => null);
            },
          },
        },
      ],
    },
    {
      name: "get",
      description: "Gets a users timezone ⏱️",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The users timezone to get 🙋",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
    },
    {
      name: "delete",
      description: "Deletes your timezone from the db ⭕",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  execute: async (ctx) => {
    switch (ctx.options.getSubcommand()) {
      case "set": {
        const zone = ctx.options.getString("zone")!;

        // Setting their zone in db
        await UserModel.updateOne(
          {
            id: ctx.user.id,
          },
          {
            timezone: zone,
          },
          {
            upsert: true,
          }
        );

        await ctx.reply({
          content: `Your timezone has been set to \`${zone}\`.`,
        });
        break;
      }
      case "get": {
        const user = ctx.options.getUser("user") || ctx.user;

        // Fetching doc
        const userDoc = await UserModel.findOne({ id: user.id });

        // Ensuring timezone exists
        if (!userDoc || !userDoc.timezone) {
          return ctx.reply({
            content: `${
              user === ctx.user ? "Your" : `${user}'s`
            } timezone has not yet been set!`,
            ephemeral: true,
          });
        }

        // Calculating local time
        const localTime = calculateTime(userDoc.timezone);

        const currentTime = await ctx.reply({
          content: `Current time for ${user} is <t:${localTime}>, in timezone: \`${userDoc.timezone}\`.`,
          allowedMentions: { parse: [] },
        });
        break;
      }
      case "delete": {
        const result = await UserModel.updateOne(
          {
            id: ctx.user.id,
          },
          {
            $unset: {
              timezone: "",
            },
          }
        );

        await ctx.reply({
          content:
            result.matchedCount >= 1
              ? "Successfully removed timezone data from my database ✅."
              : "Nothing was removed as no timezone data was found.",
        });
        break;
      }
    }
  },
});

function fuzzyMatchTimezone(text: string, locale = false) {
  // Change to use the imported object
  const zones = timezones.filter((choice) =>
    choice.toLowerCase().includes(text.toLowerCase())
  );
  return zones.slice(0, 25).map((z) => ({ name: z, value: z }));
}

/**
 * Takes a IANA formatted timezone and converts it to
 * a unix timestamp.
 */
function calculateTime(timezone: string) {
  // Check if correct timezone
  if (!timezones.includes(timezone)) {
    throw new Error("Invalid timezone");
  }

  /**
   * Using Luxon to calculate times as at the time of writing this,
   * there is an issue with Bun on linux that stops us from calculating time accurately
   */

  // Get the current time in the specified timezone
  const now = DateTime.now().setZone(timezone);

  // Convert to UTC and return the Unix timestamp
  const timestamp = Math.floor(now.toUTC().toSeconds());

  return timestamp;
}
