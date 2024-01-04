"use strict";
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
exports.RateLimit = void 0;
const tsyringe_1 = require("tsyringe");
const RateLimitRuleDAO_1 = require("../dao/RateLimitRuleDAO");
const Redis_1 = __importDefault(require("../integrations/Redis"));
let RateLimit = class RateLimit {
    rateLimitRuleDAO;
    redisService;
    constructor(rateLimitRuleDAO, redisService) {
        this.rateLimitRuleDAO = rateLimitRuleDAO;
        this.redisService = redisService;
    }
    async getRule(url, method) {
        return (await this.rateLimitRuleDAO.findOneByUrlAndMethod(url, method));
    }
    getKey(rule, req, res) {
        const url = req.route.path;
        const method = req.method;
        const ip = req.ip;
        const userId = res.locals.user?._id;
        const { identification } = rule;
        let key = `${url}&${method}`;
        if (identification === 'ip') {
            key += `&${ip}`;
        }
        else {
            key += `&${userId}`;
        }
        return key;
    }
    rateLimitMiddleware = async (req, res, next) => {
        try {
            const url = req.route.path;
            const method = req.method;
            const rule = await this.getRule(url, method);
            console.log(url, method);
            if (!rule) {
                next();
                return;
            }
            const key = this.getKey(rule, req, res);
            console.log(key);
            const isRateLimited = await this.redisService.isRateLimited(key, rule.timeWindow, rule.allowedRate);
            if (isRateLimited) {
                res
                    .status(429)
                    .send({
                    message: "Too many requests... you are rate limited. Please try after sometime",
                });
                return;
            }
            next();
        }
        catch (error) {
            console.log(`[rateLimit][rateLimit][error] ${error.message}`);
            res.status(500).send({ message: 'Somethin went wrong.... Please try agin' });
        }
    };
};
exports.RateLimit = RateLimit;
exports.RateLimit = RateLimit = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [RateLimitRuleDAO_1.RateLimitRuleDAO,
        Redis_1.default])
], RateLimit);
