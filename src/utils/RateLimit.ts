import { Response, Request, NextFunction } from "express";
import { singleton } from "tsyringe";
import { RateLimitRuleDAO } from "../dao/RateLimitRuleDAO";
import RedisService from "../integrations/Redis";
import RateLimitRuleModel from "../models/RateLimitRule";

@singleton()
export class RateLimit {
  constructor(
    private rateLimitRuleDAO: RateLimitRuleDAO,
    private redisService: RedisService
  ) {}
  private async getRule(url: string, method: string) {
    return (await this.rateLimitRuleDAO.findOneByUrlAndMethod(
      url,
      method
    )) as RateLimitRuleModel;
  }

  private getKey(
    rule: RateLimitRuleModel,
    req: Request,
    res: Response
  ): string {
    const url = req.route.path;
    const method = req.method;
    const ip = req.ip;
    const userId = res.locals.user?._id;

    const { identification } = rule;
    let key = `${url}&${method}`;

    if (identification === 'ip') {
      key += `&${ip}`;
    } else {
      key += `&${userId}`;
    }

    return key;
  }

  rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction)=> {
    try {
      const url = req.route.path;
      const method = req.method;

      const rule = await this.getRule(url, method);

      console.log(url, method);

      if (!rule) {
        next();
        return;
      }

      const key = this.getKey(rule, req,res);
      console.log(key);

      const isRateLimited = await this.redisService.isRateLimited(key, rule.timeWindow, rule.allowedRate);

      if (isRateLimited) {
        res
          .status(429)
          .send({
            message:
              "Too many requests... you are rate limited. Please try after sometime",
          });
        return;
      }

      next();
    } catch (error) {
      console.log(`[rateLimit][rateLimit][error] ${error.message}`);

      res.status(500).send({message: 'Somethin went wrong.... Please try agin'});

    }
  }
}

