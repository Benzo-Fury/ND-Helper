import mongoose, { Document, Schema } from 'mongoose';

export interface Config extends Document {
    key: "default";
    podsArchiveCategoryId: string;
    podsCategoryId: string;
    definedEmbeds: [];
}

export const configSchema = new Schema({
    key: {type: String, required: true, unique: true},
    podsArchiveCategoryId: {type: String, required: true},
    podsCategoryId: {type: String, required: true},
})

export const ConfigModel = mongoose.model<Config>('Config', configSchema)
