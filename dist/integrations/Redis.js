"use strict";
/** @format */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    client;
    constructor() {
        this.client = new ioredis_1.default({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            enableAutoPipelining: true,
        });
        this.client
            .on("error", (error) => {
            console.error(`[RedisService][readerClient][on][error] : ${error.message}`, error);
        })
            .on("connect", () => {
            console.log("[RedisService][readerClient][on][connect]");
        })
            .on("end", () => {
            console.log("[RedisService][readerClient][on][end]");
        });
    }
    async isRateLimited(key, expiry, threshold) {
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
};
RedisService = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [])
], RedisService);
exports.default = RedisService;
