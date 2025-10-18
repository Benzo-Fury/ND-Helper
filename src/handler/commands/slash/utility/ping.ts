import { commandModule, CommandType } from "@sern/handler";

export default commandModule({
  type: CommandType.Slash,
  description: "Check latency 🏓",
  execute: async (ctx) => {
    await ctx.reply(
      `Ping? Wow, groundbreaking. Ping: ${ctx.client.ws.ping}. Still here, by the way.`
    );
  },
});
