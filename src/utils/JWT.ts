import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import { singleton } from "tsyringe";

@singleton()
export class JWT {
  private key: string;

  constructor() {
    this.key = process.env.JWT_PRIVATE_KEY || "";
  }

  getToken(data: { userId: ObjectId }, expiresIn: number) {
    return jwt.sign(data, this.key, { expiresIn: expiresIn });
  }

  verifyToken<T>(authToken: string) {
    console.log('hello');
    const authResult = jwt.verify(authToken, this.key);

    return authResult as T;
  }
}
