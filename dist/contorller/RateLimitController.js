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
exports.rateLimit = void 0;
const tsyringe_1 = require("tsyringe");
const RateLimitRuleDAO_1 = require("../dao/RateLimitRuleDAO");
const Redis_1 = __importDefault(require("../integrations/Redis"));
let rateLimit = class rateLimit {
    rateLimitRuleDAO;
    redisService;
    constructor(rateLimitRuleDAO, redisService) {
        this.rateLimitRuleDAO = rateLimitRuleDAO;
        this.redisService = redisService;
    }
    async getRule(url, method) {
        return await this.rateLimitRuleDAO.findOneByUrlAndMethod(url, method);
    }
    async rateLimit(req, res, next) {
        try {
            const url = req.url;
            const method = req.method;
            const rule = await this.getRule(url, method);
            if (!rule) {
                next();
                return;
            }
        }
        catch (error) {
            console.log(`[rateLimit][rateLimit][error]`);
        }
    }
};
exports.rateLimit = rateLimit;
exports.rateLimit = rateLimit = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [RateLimitRuleDAO_1.RateLimitRuleDAO,
        Redis_1.default])
], rateLimit);
