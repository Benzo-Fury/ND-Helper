import mongoose, {
  Document,
  Schema,
  type SchemaTimestampsConfig,
} from "mongoose";

export interface Pod extends Document, SchemaTimestampsConfig {
  channelId: string;
  authorId: string;
  botId: string;
  /**
   * All users that have been involved in the pod.
   * This includes the bots id too.
   */
  userIds: string[];
  solved: boolean;
}

export const PodSchema = new Schema(
  {
    channelId: { type: String, required: true, unique: true },
    authorId: { type: String, required: true },
    botId: { type: String, required: true },
    userIds: { type: [String], required: true, default: [] },
    solved: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

export const PodModel = mongoose.model<Pod>("Pods", PodSchema);
