import type { Client, TextChannel } from "discord.js";

export async function fetchMessageFromUrl(client: Client, url: string) {
    // Example URL: https://discord.com/channels/123456789012345678/234567890123456789/345678901234567890
    const urlParts = url.split('/');
    
    // Extract channelId and messageId from the URL
    const channelId = urlParts[5];
    const messageId = urlParts[6];
    
    try {
        // Get the channel object
        const channel = await client.channels.fetch(channelId) as TextChannel;
        
        if (!channel) {
            throw new Error("Channel does not exist.")
        }
        
        // Fetch the message by its ID
        const message = await channel.messages.fetch(messageId);
        
        return message
    } catch (e) {
        throw e
    }
}