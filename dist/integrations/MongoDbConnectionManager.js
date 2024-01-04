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
exports.MongoDBConnectionManager = void 0;
const mongodb_1 = require("mongodb");
const tsyringe_1 = require("tsyringe");
let MongoDBConnectionManager = class MongoDBConnectionManager {
    client;
    db;
    constructor() {
        const connectionString = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE_NAME}`;
        this.client = new mongodb_1.MongoClient(connectionString, {
            family: 4,
            connectTimeoutMS: 5000,
            appName: "notesApp",
            retryReads: true,
            retryWrites: true,
            readPreference: mongodb_1.ReadPreference.SECONDARY_PREFERRED,
            maxPoolSize: 20,
            minPoolSize: 5,
            maxIdleTimeMS: 10000,
            monitorCommands: process.env.NODE_ENV !== "production",
        });
    }
    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db();
            this.client.on("commandStarted", (event) => {
                console.log(`[MongoQuery] commandStarted: ${JSON.stringify(event, null, 2)}`);
            });
            console.log("[MongoDBConnectionManager](connect) Connected to MongoDB server");
        }
        catch (err) {
            console.error("[MongoDBConnectionManager](connect) Error connecting to MongoDB", err);
            throw new Error("mongo connection not successfull");
        }
    }
    getDb() {
        return this.db;
    }
};
exports.MongoDBConnectionManager = MongoDBConnectionManager;
exports.MongoDBConnectionManager = MongoDBConnectionManager = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [])
], MongoDBConnectionManager);
