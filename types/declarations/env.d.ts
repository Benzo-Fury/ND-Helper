import type { ColorResolvable } from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            DB_URI: string;
        }
    }
}