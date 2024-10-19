import type { CoreDependencies } from "@sern/handler";
import type { MongoClient } from "./classes/MongoClient";
import type { Publisher } from "@sern/publisher";

declare global {
  interface Dependencies extends CoreDependencies {
    publisher: Publisher;
    mongoClient: MongoClient;
  }
}

export {}