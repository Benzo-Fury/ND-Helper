
import { commandModule, CommandType } from "@sern/handler";
import { ApplicationCommandOptionType } from "discord.js";

export default commandModule({
  type: CommandType.Slash,
  description: "Silent ping a user 📌",
  options: [
    {
      name: "user",
      description: "The user to silent ping 🤫",
      type: ApplicationCommandOptionType.User,
      required: true
    }
  ],
  execute: async (ctx) => {
    const user = ctx.options.getUser("user")!;

    await ctx.reply({
      content: user.toString(),
      allowedMentions: { users: [] }
    })
  },
});
