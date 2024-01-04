import { Db, MongoClient, ReadPreference } from "mongodb";
import { singleton } from "tsyringe";

@singleton()
export class MongoDBConnectionManager {
  private client;
  private db: Db;
  constructor() {
    const connectionString = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE_NAME}`;

    this.client = new MongoClient(connectionString, {
      family: 4,
      connectTimeoutMS: 5000,
      appName: "notesApp",
      retryReads: true,
      retryWrites: true,
      readPreference: ReadPreference.SECONDARY_PREFERRED,
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 10000,
      monitorCommands: process.env.NODE_ENV !== "production",
    });
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();

      this.client.on("commandStarted", (event) => {
        console.log(
          `[MongoQuery] commandStarted: ${JSON.stringify(event, null, 2)}`
        );
      });

      console.log(
        "[MongoDBConnectionManager](connect) Connected to MongoDB server"
      );
    } catch (err) {
      console.error(
        "[MongoDBConnectionManager](connect) Error connecting to MongoDB",
        err as Error
      );

      throw new Error("mongo connection not successfull");
    }
  }

  public getDb() {
    return this.db;
  }
}
