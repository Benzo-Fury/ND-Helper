import { commandModule, CommandType } from "@sern/handler";

export default commandModule({
    name: "req-bot",
    type: CommandType.Button,
    execute: async (ctx) => {
        // Just launch model and possibly await response or make that an event
    }
})