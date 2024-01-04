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
exports.NoteDAO = void 0;
const MongoDbConnectionManager_1 = require("../integrations/MongoDbConnectionManager");
const tsyringe_1 = require("tsyringe");
const mongodb_1 = require("mongodb");
let NoteDAO = class NoteDAO {
    mongoDBConnectionManager;
    constructor(mongoDBConnectionManager) {
        this.mongoDBConnectionManager = mongoDBConnectionManager;
    }
    async insertOne(payload) {
        const insertedData = await this.mongoDBConnectionManager
            .getDb()
            .collection("Notes")
            .insertOne(payload);
        return insertedData.insertedId;
    }
    async findOneById(id) {
        const Note = await this.mongoDBConnectionManager
            .getDb()
            .collection("Notes")
            .findOne({ _id: new mongodb_1.ObjectId(id) });
        return Note;
    }
    async findByUserId(userId) {
        const data = await this.mongoDBConnectionManager
            .getDb()
            .collection("Notes")
            .find({ createdBy: new mongodb_1.ObjectId(userId) })
            .toArray();
        return data;
    }
    async deleteById(id) {
        await this.mongoDBConnectionManager
            .getDb()
            .collection("Notes")
            .deleteOne({ _id: new mongodb_1.ObjectId(id) });
    }
    async updateById(noteId, valueToUpdate) {
        await this.mongoDBConnectionManager
            .getDb()
            .collection("Notes")
            .updateOne({ _id: new mongodb_1.ObjectId(noteId) }, { $set: { ...valueToUpdate, updatedAt: new Date() } });
    }
    async searchNote(searchText, userId) {
        const data = await this.mongoDBConnectionManager
            .getDb()
            .collection("Notes")
            .find({
            $text: { $search: searchText },
            createdBy: new mongodb_1.ObjectId(userId),
        })
            .toArray();
        return data;
    }
};
exports.NoteDAO = NoteDAO;
exports.NoteDAO = NoteDAO = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [MongoDbConnectionManager_1.MongoDBConnectionManager])
], NoteDAO);
