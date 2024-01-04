import { ObjectId } from "mongodb";

export default class NoteModel {
  public _id?: ObjectId;
  public title : string;
  public content: string;
  public createdBy: ObjectId;
  public createdAt: Date;
  public updatedAt: Date;
}