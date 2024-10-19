import type { APIEmbed } from "discord.js";
import mongoose, { Schema, type SchemaTimestampsConfig } from "mongoose";
import type { ButtonObj } from "../handler/commands/slash/admin/embed-presets";

export interface EmbedPreset extends Document, SchemaTimestampsConfig {
    name: string;
    embed: APIEmbed;
    buttons: ButtonObj[],
}

export const embedPresetSchema = new Schema({
    name: { type: String, required: true, unique: true },
    embed: { type: Object, required: true },
    buttons: { type: Object },
}, { timestamps: true })

export const EmbedPresetModel = mongoose.model<EmbedPreset>("EmbedPresets", embedPresetSchema);