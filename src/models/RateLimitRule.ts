import { ObjectId } from "mongodb";

export default class RateLimitRuleModel {
  public _id?: ObjectId;
  public url: string;
  public method: string;
  public identification: string;
  public timeWindow: number;
  public allowedRate: number;
}

