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
exports.JWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tsyringe_1 = require("tsyringe");
let JWT = class JWT {
    key;
    constructor() {
        this.key = process.env.JWT_PRIVATE_KEY || "";
    }
    getToken(data, expiresIn) {
        return jsonwebtoken_1.default.sign(data, this.key, { expiresIn: expiresIn });
    }
    verifyToken(authToken) {
        console.log('hello');
        const authResult = jsonwebtoken_1.default.verify(authToken, this.key);
        return authResult;
    }
};
exports.JWT = JWT;
exports.JWT = JWT = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [])
], JWT);
