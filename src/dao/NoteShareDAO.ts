import { MongoDBConnectionManager } from "../integrations/MongoDbConnectionManager";
import { singleton } from "tsyringe";
import NoteShareModel from "../models/NoteShare";
import { ObjectId } from "mongodb";

@singleton()
export class NoteShareDAO {
  constructor(private mongoDBConnectionManager: MongoDBConnectionManager) {}

  async findOne(noteId: string, shareUserId: ObjectId) {
    return await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteShareModel>("NoteShares")
      .findOne({
        noteId: new ObjectId(noteId),
        sharedWith: new ObjectId(shareUserId),
      });
  }

  async insertOne(noteId: string, shareUserId: ObjectId) {
    await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteShareModel>("NoteShares")
      .insertOne({
        noteId: new ObjectId(noteId),
        sharedWith: new ObjectId(shareUserId),
      });
  }
}
