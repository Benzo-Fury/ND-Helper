import { Client, Partials, type ClientOptions } from "discord.js";

export const defaultBotOptions: ClientOptions = {
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "MessageContent",
    "GuildMessageReactions",
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
};

export class Bot extends Client {
  constructor(options: ClientOptions) {
    super(options);
  }
}
