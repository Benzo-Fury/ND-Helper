import {
  EmbedBuilder,
  GuildMember,
  type APIEmbedField,
  type EmbedData,
} from "discord.js";
import config from "#config";

export class JEmbed extends EmbedBuilder {
  constructor(options?: { embedData?: EmbedData; author?: GuildMember }) {
    // Constructing super with default properties
    super({
      author: options?.author
        ? {
            name: options.author.displayName,
            iconURL: options.author.displayAvatarURL(),
          }
        : undefined,
    });

    // Setting color outside constructor so we dont need to convert to RGB decimal format (im lazy)
    super.setColor(config.defaultEmbedColor);

    // Applying provided embed data
    if (options?.embedData) {
      this.setData(options.embedData);
    }
  }

  setData(data: EmbedData) {
    if (data.title) this.setTitle(data.title);
    if (data.description) this.setDescription(data.description);
    if (data.url) this.setURL(data.url);
    if (data.color) this.setColor(data.color);
    if (data.footer) this.setFooter(data.footer);
    if (data.thumbnail) this.setThumbnail(data.thumbnail.url);
    if (data.image) this.setImage(data.image.url);
    if (data.author)
      this.setAuthor({
        name: data.author.name,
        iconURL: data.author.iconURL,
        url: data.author.url,
      });

    if (typeof data.timestamp === "string") {
      this.setTimestamp(new Date(data.timestamp));
    } else if (data.timestamp) {
      this.setTimestamp(data.timestamp);
    }
    if (data.fields) this.addFields(...(data.fields as APIEmbedField[]));

    return this;
  }
}
