import { Client, type ClientOptions } from "discord.js";

export const defaultBotOptions: ClientOptions = {
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "MessageContent"
    ]
}

export class Bot extends Client {
    constructor(options: ClientOptions) {
        super(options)
    }
}