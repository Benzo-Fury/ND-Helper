import mongoose, {
  Schema,
  type Document,
  type SchemaTimestampsConfig,
} from "mongoose";
import { userId } from "./templates/userId";

export interface User extends Document, SchemaTimestampsConfig {
  id: string;
  timezone?: string;
}

export const userSchema = new Schema(
  {
    id: userId,
    timezone: { type: String },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<User>("User", userSchema);
