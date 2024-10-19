import { CommandControlPlugin, CommandType, controller } from "@sern/handler";

export function guildOnly() {
    return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
        if(!ctx.inGuild) {
            await ctx.reply({
                content: "This command can only be used inside a server 💻.",
                ephemeral: true
            })
            return controller.stop()
        }
        return controller.next()
    })
}