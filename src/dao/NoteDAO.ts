import { MongoDBConnectionManager } from "../integrations/MongoDbConnectionManager";
import { singleton } from "tsyringe";
import { ObjectId } from "mongodb";
import NoteModel from "../models/Note";

@singleton()
export class NoteDAO {
  constructor(private mongoDBConnectionManager: MongoDBConnectionManager) {}

  async insertOne(payload: NoteModel): Promise<ObjectId> {
    const insertedData = await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteModel>("Notes")
      .insertOne(payload);

    return insertedData.insertedId;
  }

  async findOneById(id: string) {
    const Note = await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteModel>("Notes")
      .findOne({ _id: new ObjectId(id) });

    return Note;
  }

  async findByUserId(userId: string) {
    const data = await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteModel>("Notes")
      .find({ createdBy: new ObjectId(userId) })
      .toArray();

    return data;
  }

  async deleteById(id: string) {
    await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteModel>("Notes")
      .deleteOne({ _id: new ObjectId(id) });
  }

  async updateById(
    noteId: string,
    valueToUpdate: { title?: string; content?: string }
  ) {
    await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteModel>("Notes")
      .updateOne(
        { _id: new ObjectId(noteId) },
        { $set: { ...valueToUpdate, updatedAt: new Date() } }
      );
  }

  async searchNote(searchText: string, userId: string) {
    const data = await this.mongoDBConnectionManager
      .getDb()
      .collection<NoteModel>("Notes")
      .find({
        $text: { $search: searchText },
        createdBy: new ObjectId(userId),
      })
      .toArray();

    return data;
  }
}
