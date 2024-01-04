import "reflect-metadata";

import Express from "express";
import { container } from "tsyringe";
import * as rTracer from "cls-rtracer";

import { MongoDBConnectionManager } from "./integrations/MongoDbConnectionManager";
import { UserContoller } from "./contorller/UserContoller";
import { NoteController } from "./contorller/NoteController";
import RedisService from "./integrations/Redis";

const startServer = async () => {
  const app = Express();

  console.log(process.env.NODE_ENV);

  console.log(process.env.PORT);

  const mongoConnection = container.resolve(MongoDBConnectionManager);
  const redisConnection = container.resolve(RedisService);

  await mongoConnection.connect();

  app.use(
    Express.json({ limit: 100000 }),
    Express.urlencoded({
      extended: true,
      limit: 10000000,
    })
  );

  app.use(
    rTracer.expressMiddleware({
      headerName: "X-fleettracker-request-id",
      requestIdFactory: undefined,
    })
  );
  

  app.use("/", container.resolve(UserContoller).getRoutes());
  app.use("/", container.resolve(NoteController).getRoutes());

  app.listen(process.env.PORT, () => {
    console.log(`server is live.... listening to 9000`);
  });
};

startServer();
