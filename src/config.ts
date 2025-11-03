import type { ColorResolvable } from "discord.js";

const config = {
  // sern
  commands: "./src/handler/commands",
  events: "./src/handler/events",

  // Embed Colors
  defaultEmbedColor: "Grey" as ColorResolvable,
  podEmbedColor: "#bd674d" as ColorResolvable,

  // Emojis
  packageEmojiNameUrl:
    "https://creazilla-store.fra1.digitaloceanspaces.com/emojis/49889/package-emoji-clipart-md.png",
  rantEmoji: "🔔",

  // Users
  owner: "671610612475756576",
  me: "1289371064433901639",

  // Command Ids (MODIFY ALL DISCORD IDS SO THEY UPDATE UPON CLIENT READY)
  presets: "1294083619912028272",

  roles: {
    mcAdmin: "1429038788859924563",
    mcAdmin2: "1429243407582105630",
  }
};

export default config
