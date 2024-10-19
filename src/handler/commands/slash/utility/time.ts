import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";
import { UserModel } from "../../../../schemas/user.schema";
import timezones from "../../../../../public/autocomplete/timezones.json";

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

        // Extracting data
        const data = extractTimezoneData(userDoc.timezone);

        await ctx.reply({
          content: `Current time for ${user} is ${data.current_timestamp}, in timezone: \`${data.timezone}\`.`,
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

function extractTimezoneData(timezone: string): {
  current_timestamp: string;
  timezone: string;
} {
  // Check if correct timezone
  if (!timezones.includes(timezone)) {
    throw new Error("Invalid timezone");
  }

  // Regular expression to match Etc/GMT timezones with an offset
  const etcPattern = /^Etc\/GMT([+-]\d+)$/i;

  // Attempt to match the timezone against the regular expression
  const match = timezone.match(etcPattern);

  // Initialize the adjustedTimezone with the original timezone from the document
  let adjustedTimezone = timezone;

  // If the timezone matches the Etc/GMT pattern, adjust the offset sign
  if (match) {
    const offset = parseInt(match[1], 10);
    adjustedTimezone = `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
  }

  // Create a string representation of the current date and time in the adjusted timezone
  const currentDate = new Date().toLocaleString("en-US", {
    timeZone: adjustedTimezone,
  });

  // Convert the current date and time to a Unix timestamp using the adjusted timezone
  const timestamp = Math.floor(new Date(currentDate).getTime() / 1000);

  // Get the full date and timezone string using the Intl.DateTimeFormat constructor
  const fullDateTimeZone = new Intl.DateTimeFormat("en-US", {
    timeZone: adjustedTimezone,
    timeZoneName: "long",
  }).format(new Date());

  // Use a regular expression to extract just the timezone name from the full string
  const timezoneNameMatch = fullDateTimeZone.match(/, (.*)$/);
  const timezoneName = timezoneNameMatch
    ? timezoneNameMatch[1]
    : "Unknown Timezone";

  // Return an object with the timestamp in Discord's Unix timestamp format and the human-readable timezone name
  return {
    current_timestamp: `<t:${timestamp}>`,
    timezone: timezoneName,
  };
}
