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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const tsyringe_1 = require("tsyringe");
const NoteDAO_1 = require("../dao/NoteDAO");
const NoteShareDAO_1 = require("../dao/NoteShareDAO");
const UserDAO_1 = require("../dao/UserDAO");
const JWT_1 = require("../utils/JWT");
const RateLimit_1 = require("../utils/RateLimit");
const noteValidator = __importStar(require("../validators/Notes"));
let NoteController = class NoteController {
    jwt;
    userDao;
    noteDao;
    rateLimit;
    noteShareDAO;
    routes;
    constructor(jwt, userDao, noteDao, rateLimit, noteShareDAO) {
        this.jwt = jwt;
        this.userDao = userDao;
        this.noteDao = noteDao;
        this.rateLimit = rateLimit;
        this.noteShareDAO = noteShareDAO;
        this.routes = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.routes.get("/api/notes", this.verifyAuth, this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const noteId = req.params.id;
            const data = await this.getNotes(noteId, res.locals.user._id);
            return res.status(data.status).send(data);
        });
        this.routes.get("/api/notes/:id", this.verifyAuth, this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const noteId = req.params.id;
            const data = await this.getNotes(noteId, res.locals.user._id);
            return res.status(data.status).send(data);
        });
        this.routes.post("/api/notes/", this.verifyAuth, this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const payload = req.body;
            const data = await this.createNote(payload, res.locals.user);
            return res.status(data.status).send(data);
        });
        this.routes.delete("/api/notes/:id", this.verifyAuth, this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const data = await this.deleteNote(req.params.id);
            return res.status(data.status).send(data);
        });
        this.routes.put("/api/notes/:id", this.verifyAuth, this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const payload = {
                ...req.body,
                noteId: req.params.id,
            };
            const data = await this.updateNote(payload, res.locals.user);
            return res.status(data.status).send(data);
        });
        this.routes.post("/api/notes/:id/share", this.verifyAuth, this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const payload = {
                noteId: req.params.id,
                sharedWith: req.query.sharedWith,
            };
            const data = await this.shareNote(payload, res.locals.user);
            return res.status(data.status).send(data);
        });
        this.routes.get("/api/search", this.verifyAuth, this.rateLimit.rateLimitMiddleware, async (req, res) => {
            const data = await this.searchNote(req.query.q, res.locals.user._id);
            return res.status(data.status).send(data);
        });
    }
    verifyAuth = async (req, res, next) => {
        try {
            const authToken = req.headers.authorization;
            console.log(`authToken ${authToken}`);
            if (!authToken) {
                res.status(401).send({ message: "authorization header is missing" });
                return;
            }
            const authResult = this.jwt.verifyToken(authToken);
            if (authResult && authResult.userId) {
                const user = await this.userDao.findOneById(authResult.userId);
                console.log(authResult.userId, JSON.stringify(user));
                if (!user) {
                    res.status(401).send({ message: "user not found" });
                    return;
                }
                res.locals.user = user;
                next();
                return;
            }
            res.status(401).send({ message: "unauthorized" });
        }
        catch (error) {
            console.log(`[NoteController][verifyAuth][error] ${error.message}`);
            res.status(401).send({ message: "unauthorized" });
        }
    };
    async getNotes(noteId, userId) {
        console.log(`[getNotes] start ${noteId} ${userId}`);
        let data;
        if (noteId) {
            data = await this.noteDao.findOneById(noteId);
        }
        else {
            data = await this.noteDao.findByUserId(userId);
        }
        return {
            status: 200,
            message: "ok",
            data,
        };
    }
    async createNote(paylaod, user) {
        try {
            console.log(`[NoteController][createNote] ${JSON.stringify(paylaod)} userId`);
            const { title, content } = paylaod;
            const validationError = noteValidator.createNote(paylaod);
            console.log(JSON.stringify(validationError));
            if (validationError) {
                return {
                    status: 400,
                    message: validationError.message,
                    data: null,
                };
            }
            const data = await this.noteDao.insertOne({
                title,
                content,
                createdBy: new mongodb_1.ObjectId(user._id),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return {
                status: 200,
                message: "ok",
                data: {
                    insertedNoteId: data,
                },
            };
        }
        catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }
    async deleteNote(noteId) {
        try {
            console.log(`[NoteController][deleteNode]  ${noteId}`);
            if (!noteId) {
                return {
                    status: 400,
                    message: "noteId is required",
                    data: null,
                };
            }
            await this.noteDao.deleteById(noteId);
            return {
                status: 200,
                message: "Note deleted Successfully",
                data: null,
            };
        }
        catch (error) {
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }
    async updateNote(payload, user) {
        try {
            console.log(`[NoteController][updateNote]  ${JSON.stringify(payload)} ${JSON.stringify(user)}`);
            const validationError = noteValidator.updateNote(payload);
            if (validationError) {
                return {
                    status: 400,
                    message: validationError.message,
                    data: null,
                };
            }
            const valueToUpdate = {};
            if (payload.title) {
                valueToUpdate.title = payload.title;
            }
            if (payload.content) {
                valueToUpdate.content = payload.content;
            }
            if (Object.keys(valueToUpdate).length === 0) {
                return {
                    status: 400,
                    message: "title or content should be there to update",
                    data: null,
                };
            }
            const noteData = await this.noteDao.findOneById(payload.noteId);
            console.log("noteData", noteData, user._id);
            if (!noteData || String(noteData.createdBy) !== String(user._id)) {
                return {
                    status: 400,
                    message: noteData
                        ? "You are trying to update note using different Id"
                        : "note does not exist",
                    data: null,
                };
            }
            await this.noteDao.updateById(payload.noteId, valueToUpdate);
            return {
                status: 200,
                message: "Note updated Successfully",
                data: null,
            };
        }
        catch (error) {
            console.log(`[updateNote] ${error.message}`);
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }
    async shareNote(payload, user) {
        try {
            console.log(`[NoteController][shareNote]  ${JSON.stringify(payload)} ${JSON.stringify(user)}`);
            const validationError = noteValidator.shareNote(payload);
            if (validationError) {
                return {
                    status: 400,
                    message: validationError.message,
                    data: null,
                };
            }
            const { noteId, sharedWith } = payload;
            const shareUserData = await this.userDao.findOne(sharedWith);
            if (!shareUserData) {
                return {
                    status: 400,
                    message: "User you want to share note does not exist",
                    data: null,
                };
            }
            const shareData = await this.noteShareDAO.findOne(noteId, shareUserData._id);
            if (shareData) {
                return {
                    status: 400,
                    message: "Note Already shared with this user",
                    data: null,
                };
            }
            await this.noteShareDAO.insertOne(noteId, shareUserData._id);
            return {
                status: 200,
                message: "Note Shared Successfully",
                data: null,
            };
        }
        catch (error) {
            console.log(`[shareNote][error] ${error.message}`);
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }
    async searchNote(searchText, userId) {
        try {
            console.log(`[NoteController][searchNote]  ${searchText} ${userId}`);
            if (!searchText) {
                return {
                    status: 400,
                    message: "searchText is required",
                    data: null,
                };
            }
            const data = await this.noteDao.searchNote(searchText, userId);
            console.log("data", JSON.stringify(data));
            return {
                status: 200,
                message: "ok",
                data,
            };
        }
        catch (error) {
            console.log(`[shareNote][error] ${error.message}`);
            return {
                status: 500,
                message: error.message,
                data: null,
            };
        }
    }
    getRoutes() {
        return this.routes;
    }
};
exports.NoteController = NoteController;
exports.NoteController = NoteController = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [JWT_1.JWT,
        UserDAO_1.UserDAO,
        NoteDAO_1.NoteDAO,
        RateLimit_1.RateLimit,
        NoteShareDAO_1.NoteShareDAO])
], NoteController);
