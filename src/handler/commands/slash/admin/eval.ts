import { commandModule, CommandType } from "@sern/handler";
import { permRequire } from "../../../../plugins/permRequire";
import { ApplicationCommandOptionType } from "discord.js";

const bannedStatements = [
  "process.env",
  "token",
]

export default commandModule({
  type: CommandType.Slash,
  description: "Evaluates some JS code 📇",
  plugins: [
    permRequire("Administrator")
  ],
  options: [
    {
      name: "script",
      description: "The code to evaluate 📇",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  execute: async (ctx) => {
    try {
      const script = ctx.interaction.options.getString("script")!;

      // Checking if script contains any banned statements
      if (bannedStatements.some((s) => script.toLocaleLowerCase().includes(s))) {
        return ctx.reply({
          content: "Nuh uh 🙅‍♂️.",
          ephemeral: true
        })
      }

      // Running eval
      let result: string
      try {
        result = await eval(script);

        // Wrapping in js code block
        result = wrapInBlock(result, "ts")
      } catch (e) {
        result = String(e);

        // Wrapping in generic code block
        result = wrapInBlock(result)
      }

      // Checking if result is to long to send
      if (result.length > 2000) {
        return ctx.reply({
          content: "The response was to long to send 🤥.",
          ephemeral: true
        })
      }

      await ctx.reply({
        content: result ? (result as string) : "Voided 🌌.",
      })
    } catch (e) {
      if (ctx.channel?.isSendable()) {
        await ctx.channel.send({
          content: `An error occurred while evaluating some code in this channel ❌. Error was: ${e}`
        })
      }
    }
  },
});

function wrapInBlock(text: string, prefix?: string) {
  return `\`\`\`${prefix}\n` + text + "```"
}
