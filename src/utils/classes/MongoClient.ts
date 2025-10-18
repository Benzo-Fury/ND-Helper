import mongoose from "mongoose";
import type { Disposable } from "@sern/handler";

/**
 * Used to manage the connection of the mongo db.
 */
export class MongoClient implements Disposable {
  constructor(public uri: string) {
    // Disable versionKey globally for all schemas (because fuck version keys)
    mongoose.plugin((schema) => {
      schema.set("versionKey", false);
    });
  }

  // Just used for sern
  async dispose() {
    await this.disconnect();
  }

  async connect() {
    await mongoose.connect(this.uri);
  }
  async disconnect() {
    await mongoose.disconnect();
  }
}
