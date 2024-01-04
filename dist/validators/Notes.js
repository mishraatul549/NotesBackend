"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareNote = exports.updateNote = exports.createNote = void 0;
const joi_1 = __importDefault(require("joi"));
const createNote = (payload) => {
    const schema = joi_1.default.object({
        title: joi_1.default.string().min(1).max(30).required(),
        content: joi_1.default.string().min(1).max(100).required(),
    });
    return schema.validate(payload).error;
};
exports.createNote = createNote;
const updateNote = (payload) => {
    const schema = joi_1.default.object({
        noteId: joi_1.default.string().min(1).max(30).required(),
        title: joi_1.default.string().min(1).max(30).optional(),
        content: joi_1.default.string().min(1).max(100).optional(),
    });
    return schema.validate(payload).error;
};
exports.updateNote = updateNote;
const shareNote = (payload) => {
    const schema = joi_1.default.object({
        noteId: joi_1.default.string().min(1).max(30).required(),
        sharedWith: joi_1.default.string().min(1).max(30).required(),
    });
    return schema.validate(payload).error;
};
exports.shareNote = shareNote;
