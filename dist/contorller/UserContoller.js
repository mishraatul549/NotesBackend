"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserContoller = void 0;
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const node_crypto_1 = __importDefault(require("node:crypto"));
const userValidator = __importStar(require("../validators/user"));
const UserDAO_1 = require("../dao/UserDAO");
const JWT_1 = require("../utils/JWT");
const RateLimit_1 = require("../utils/RateLimit");
let UserContoller = class UserContoller {
    userDao;
    jwt;
    rateLimit;
    router;
    constructor(userDao, jwt, rateLimit) {
        this.userDao = userDao;
        this.jwt = jwt;
        this.rateLimit = rateLimit;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    async Singup(payload) {
        try {
            const { username, password, name } = payload;
            const validationError = userValidator.signup(payload);
            console.log(JSON.stringify(validationError));
            if (validationError) {
                return {
                    status: 400,
                    message: validationError.message,
                    data: null,
                };
            }
            const user = await this.userDao.findOne(username);
            if (user) {
                return {
                    status: 400,
                    message: "This username already exist",
                    data: null,
                };
            }
            const hashedPassword = node_crypto_1.default
                .createHash("sha256")
                .update(password)
                .digest("hex");
            payload.password = hashedPassword;
            const data = await this.userDao.insertOne(payload);
            return {
                status: 200,
                message: "ok",
                data: {
                    userId: data,
                },
            };
        }
        catch (error) {
            console.log(`[UserContoller][signup][error] ${error.message}`);
            return {
                message: "error",
                status: 500,
                data: null,
            };
        }
    }
    async Login(payload) {
        try {
            const { username, password } = payload;
            const validationError = userValidator.login(payload);
            console.log(JSON.stringify(validationError));
            if (validationError) {
                return {
                    status: 400,
                    message: validationError.message,
                    data: null,
                };
            }
            const user = await this.userDao.findOne(username);
            if (!user) {
                return {
                    status: 400,
                    message: "user not found",
                    data: null,
                };
            }
            const hashedPassword = node_crypto_1.default
                .createHash("sha256")
                .update(password)
                .digest("hex");
            if (user.password !== hashedPassword) {
                return {
                    status: 400,
                    message: "password doesn't match",
                    data: null,
                };
            }
            return {
                status: 200,
                message: "ok",
                data: {
                    authToken: this.jwt.getToken({ userId: user._id }, 60 * 60),
                    user,
                },
            };
        }
        catch (error) {
            console.log(`[UserContoller][signup][error] ${error.message}`);
            return {
                message: "error",
                status: 500,
                data: null,
            };
        }
    }
    initializeRoutes() {
        this.router.post("/api/auth/signup", this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const payload = req.body;
            console.log(req.body);
            const response = await this.Singup(payload);
            res.status(response.status).send(response);
        });
        this.router.post("/api/auth/login", this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const payload = req.body;
            console.log(req.body);
            const response = await this.Login(payload);
            res.status(response.status).send(response);
        });
    }
    getRoutes() {
        return this.router;
    }
};
exports.UserContoller = UserContoller;
exports.UserContoller = UserContoller = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [UserDAO_1.UserDAO, JWT_1.JWT, RateLimit_1.RateLimit])
], UserContoller);
