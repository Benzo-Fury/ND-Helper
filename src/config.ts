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


  // Command Ids (MODIFY ALL DISCORD IDS SO THEY UPDATE UPON CLIENT READY)
  presets: "1294083619912028272",
};

export default config
