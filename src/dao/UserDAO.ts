import { MongoDBConnectionManager } from "../integrations/MongoDbConnectionManager";
import { singleton } from "tsyringe";
import UserModel from "../models/User";
import { ObjectId } from "mongodb";

@singleton()
export class UserDAO {
  constructor(private mongoDBConnectionManager: MongoDBConnectionManager) {}

  async insertOne(payload: UserModel): Promise<ObjectId> {
    const insertedData = await this.mongoDBConnectionManager
      .getDb()
      .collection<UserModel>("Users")
      .insertOne(payload);

    return insertedData.insertedId;
  }

  async findOne(username: string) {
    const user = await this.mongoDBConnectionManager
      .getDb()
      .collection<UserModel>("Users")
      .findOne({ username });

    return user;
  }

  async findOneById(id: string) {
    const user = await this.mongoDBConnectionManager
      .getDb()
      .collection<UserModel>("Users")
      .findOne({ _id: new ObjectId(id) });

    return user;
  }
}
