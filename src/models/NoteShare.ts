import { ObjectId } from "mongodb";

export default class NoteShareModel {
  public _id?: ObjectId;
  public noteId: ObjectId;
  public sharedWith: ObjectId;
}