import { MongoDBConnectionManager } from "../integrations/MongoDbConnectionManager";
import { singleton } from "tsyringe";
import RateLimitRuleModel from "../models/RateLimitRule";

@singleton()
export class RateLimitRuleDAO {
  constructor(private mongoDBConnectionManager: MongoDBConnectionManager) {}

  async findOneByUrlAndMethod(url: string, method: string) {
    return await this.mongoDBConnectionManager
      .getDb()
      .collection<RateLimitRuleModel>("RateLimitRules")
      .findOne({ url, method });
  }
}
