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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const rTracer = __importStar(require("cls-rtracer"));
const MongoDbConnectionManager_1 = require("./integrations/MongoDbConnectionManager");
const UserContoller_1 = require("./contorller/UserContoller");
const NoteController_1 = require("./contorller/NoteController");
const Redis_1 = __importDefault(require("./integrations/Redis"));
const startServer = async () => {
    const app = (0, express_1.default)();
    console.log(process.env.NODE_ENV);
    console.log(process.env.PORT);
    const mongoConnection = tsyringe_1.container.resolve(MongoDbConnectionManager_1.MongoDBConnectionManager);
    const redisConnection = tsyringe_1.container.resolve(Redis_1.default);
    await mongoConnection.connect();
    app.use(express_1.default.json({ limit: 100000 }), express_1.default.urlencoded({
        extended: true,
        limit: 10000000,
    }));
    app.use(rTracer.expressMiddleware({
        headerName: "X-fleettracker-request-id",
        requestIdFactory: undefined,
    }));
    app.use("/", tsyringe_1.container.resolve(UserContoller_1.UserContoller).getRoutes());
    app.use("/", tsyringe_1.container.resolve(NoteController_1.NoteController).getRoutes());
    app.listen(process.env.PORT, () => {
        console.log(`server is live.... listening to 9000`);
    });
};
startServer();
