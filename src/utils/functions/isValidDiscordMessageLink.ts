export function isValidDiscordMessageLink(link: string): boolean {
    // Regular expression for validating Discord message links, allowing optional subdomains like ptb or canary
    const discordMessageLinkRegex = /^https:\/\/(www\.)?(canary\.|ptb\.)?(discord\.com|discordapp\.com)\/channels\/(\d+|@me)\/\d+\/\d+$/;

    // Test the link against the regex pattern
    return discordMessageLinkRegex.test(link);
}