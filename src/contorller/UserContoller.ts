import { Router, Request, Response } from "express";
import { singleton } from "tsyringe";
import crypto from "node:crypto";

import * as types from "../utils/types";
import { ObjectId } from "mongodb";
import * as userValidator from "../validators/user";
import { UserDAO } from "../dao/UserDAO";
import { JWT } from "../utils/JWT";
import UserModel from "../models/User";
import { RateLimit } from "../utils/RateLimit";

@singleton()
export class UserContoller {
  private router: Router;

  constructor(private userDao: UserDAO, private jwt: JWT,private rateLimit: RateLimit) {
    this.router = Router();
    this.initializeRoutes();
  }

  private async Singup(
    payload: types.SignUpInput
  ): Promise<types.TApiResponse<{ userId: ObjectId } | null>> {
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

      const hashedPassword = crypto
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
    } catch (error) {
      console.log(`[UserContoller][signup][error] ${(error as Error).message}`);

      return {
        message: "error",
        status: 500,
        data: null,
      };
    }
  }

  private async Login(
    payload: types.LoginInput
  ): Promise<
    types.TApiResponse<{ authToken: string; user: UserModel } | null>
  > {
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

      const hashedPassword = crypto
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
    } catch (error) {
      console.log(`[UserContoller][signup][error] ${(error as Error).message}`);

      return {
        message: "error",
        status: 500,
        data: null,
      };
    }
  }

  private initializeRoutes() {
    this.router.post("/api/auth/signup",this.rateLimit.rateLimitMiddleware, async (req: Request, res: Response) => {
      const payload: types.SignUpInput = req.body;
      console.log(req.body);

      const response = await this.Singup(payload);

      res.status(response.status).send(response);
    });

    this.router.post("/api/auth/login",this.rateLimit.rateLimitMiddleware, async (req: Request, res: Response) => {
      const payload: types.LoginInput = req.body;
      console.log(req.body);

      const response = await this.Login(payload);

      res.status(response.status).send(response);
    });
  }

  getRoutes() {
    return this.router;
  }
}
