"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const joi_1 = __importDefault(require("joi"));
const signup = (payload) => {
    const schema = joi_1.default.object({
        username: joi_1.default.string().alphanum().min(3).max(30).required(),
        password: joi_1.default.string().min(7).max(15).required(),
        name: joi_1.default.string().min(1).max(30).required(),
    });
    return schema.validate(payload).error;
};
exports.signup = signup;
const login = (payload) => {
    const schema = joi_1.default.object({
        username: joi_1.default.string().alphanum().min(3).max(30).required(),
        password: joi_1.default.string().min(7).max(15).required(),
    });
    return schema.validate(payload).error;
};
exports.login = login;
