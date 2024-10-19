import { Schema, type SchemaTypeOptions } from "mongoose";

export const userId: SchemaTypeOptions<String> = {
  type: Schema.Types.String,
  required: true,
  unique: true,
  immutable: true,
  index: true,
};
