/** @format */

import { singleton } from "tsyringe";
import IORedis from "ioredis";

@singleton()
export default class RedisService {
  private client;
  constructor() {
    this.client = new IORedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      enableAutoPipelining: true,
    });

    this.client
      .on("error", (error: Error): void => {
        console.error(
          `[RedisService][readerClient][on][error] : ${error.message}`,
          error
        );
      })
      .on("connect", () => {
        console.log("[RedisService][readerClient][on][connect]");
      })
      .on("end", () => {
        console.log("[RedisService][readerClient][on][end]");
      });
  }

  async isRateLimited(key: string, expiry: number, threshold: number) {
    const multi = this.client.multi();
    multi.get(key);
    multi.incr(key);

    const result = await multi.exec();

    if (!result) {
      throw new Error("somethign went wrong");
    }

    const currentValue = Number(result[0][1]) || 0;

    const incrementedValue = Number(result[1][1]);

    if (currentValue >= threshold) {
      return true;
    }

    if (currentValue === 0) {
      await this.client.expire(key, expiry);
    }

    return false;
  }
}
