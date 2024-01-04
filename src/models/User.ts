import { ObjectId } from "mongodb";

export default class UserModel {
  public _id?: ObjectId;
  public username: string;
  public password: string;
  public name: string;
}