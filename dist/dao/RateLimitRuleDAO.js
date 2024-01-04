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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitRuleDAO = void 0;
const MongoDbConnectionManager_1 = require("../integrations/MongoDbConnectionManager");
const tsyringe_1 = require("tsyringe");
let RateLimitRuleDAO = class RateLimitRuleDAO {
    mongoDBConnectionManager;
    constructor(mongoDBConnectionManager) {
        this.mongoDBConnectionManager = mongoDBConnectionManager;
    }
    async findOneByUrlAndMethod(url, method) {
        return await this.mongoDBConnectionManager
            .getDb()
            .collection("RateLimitRules")
            .findOne({ url, method });
    }
};
exports.RateLimitRuleDAO = RateLimitRuleDAO;
exports.RateLimitRuleDAO = RateLimitRuleDAO = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [MongoDbConnectionManager_1.MongoDBConnectionManager])
], RateLimitRuleDAO);
