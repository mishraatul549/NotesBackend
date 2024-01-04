import { id } from "cls-rtracer";
import { NextFunction, Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { singleton } from "tsyringe";
import { NoteDAO } from "../dao/NoteDAO";
import { NoteShareDAO } from "../dao/NoteShareDAO";
import { UserDAO } from "../dao/UserDAO";
import UserModel from "../models/User";
import { JWT } from "../utils/JWT";
import { RateLimit } from "../utils/RateLimit";
import * as types from "../utils/types";
import * as noteValidator from "../validators/Notes";

@singleton()
export class NoteController {
  private routes: Router;

  constructor(
    private jwt: JWT,
    private userDao: UserDAO,
    private noteDao: NoteDAO,
    private rateLimit: RateLimit,
    private noteShareDAO: NoteShareDAO
  ) {
    this.routes = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.routes.get(
      "/api/notes",
      this.verifyAuth,
      this.rateLimit.rateLimitMiddleware,
      async (req, res) => {
        const noteId = req.params.id;
        const data = await this.getNotes(noteId, res.locals.user._id);

        return res.status(data.status).send(data);
      }
    );

    this.routes.get(
      "/api/notes/:id",
      this.verifyAuth,
      this.rateLimit.rateLimitMiddleware,
      async (req, res) => {
        const noteId = req.params.id;
        const data = await this.getNotes(noteId, res.locals.user._id);

        return res.status(data.status).send(data);
      }
    );

    this.routes.post(
      "/api/notes/",
      this.verifyAuth,
      this.rateLimit.rateLimitMiddleware,
      async (req, res) => {
        const payload: types.CreateNote = req.body;
        const data = await this.createNote(payload, res.locals.user);

        return res.status(data.status).send(data);
      }
    );
    this.routes.delete(
      "/api/notes/:id",
      this.verifyAuth,
      this.rateLimit.rateLimitMiddleware,
      async (req, res) => {
        const data = await this.deleteNote(req.params.id);

        return res.status(data.status).send(data);
      }
    );
    this.routes.put(
      "/api/notes/:id",
      this.verifyAuth,
      this.rateLimit.rateLimitMiddleware,
      async (req, res) => {
        const payload: types.UpdateNote = {
          ...req.body,
          noteId: req.params.id,
        };

        const data = await this.updateNote(payload, res.locals.user);

        return res.status(data.status).send(data);
      }
    );

    this.routes.post(
      "/api/notes/:id/share",
      this.verifyAuth,
      this.rateLimit.rateLimitMiddleware,
      async (req, res) => {
        const payload: types.shareNote = {
          noteId: req.params.id,
          sharedWith: req.query.sharedWith as string,
        };

        const data = await this.shareNote(payload, res.locals.user);

        return res.status(data.status).send(data);
      }
    );

    this.routes.get(
      "/api/search",
      this.verifyAuth,
      this.rateLimit.rateLimitMiddleware,
      async (req, res) => {
        const data = await this.searchNote(
          req.query.q as string,
          res.locals.user._id
        );

        return res.status(data.status).send(data);
      }
    );
  }

  private verifyAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authToken = req.headers.authorization as string;

      console.log(`authToken ${authToken}`);

      if (!authToken) {
        res.status(401).send({ message: "authorization header is missing" });
        return;
      }

      const authResult = this.jwt.verifyToken<{ userId: string }>(authToken);

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
    } catch (error) {
      console.log(`[NoteController][verifyAuth][error] ${error.message}`);

      res.status(401).send({ message: "unauthorized" });
    }
  };

  private async getNotes(
    noteId: string | undefined,
    userId: string
  ): Promise<types.TApiResponse> {
    console.log(`[getNotes] start ${noteId} ${userId}`);

    let data;
    if (noteId) {
      data = await this.noteDao.findOneById(noteId);
    } else {
      data = await this.noteDao.findByUserId(userId);
    }

    return {
      status: 200,
      message: "ok",
      data,
    };
  }

  private async createNote(paylaod: types.CreateNote, user: UserModel) {
    try {
      console.log(
        `[NoteController][createNote] ${JSON.stringify(paylaod)} userId`
      );

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
        createdBy: new ObjectId(user._id),
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
    } catch (error) {
      return {
        status: 500,
        message: error.message,
        data: null,
      };
    }
  }

  private async deleteNote(noteId: string): Promise<types.TApiResponse> {
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
    } catch (error) {
      return {
        status: 500,
        message: error.message,
        data: null,
      };
    }
  }

  private async updateNote(
    payload: types.UpdateNote,
    user: UserModel
  ): Promise<types.TApiResponse> {
    try {
      console.log(
        `[NoteController][updateNote]  ${JSON.stringify(
          payload
        )} ${JSON.stringify(user)}`
      );

      const validationError = noteValidator.updateNote(payload);

      if (validationError) {
        return {
          status: 400,
          message: validationError.message,
          data: null,
        };
      }

      const valueToUpdate: {
        title?: string;
        content?: string;
      } = {};

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
    } catch (error) {
      console.log(`[updateNote] ${error.message}`);
      return {
        status: 500,
        message: error.message,
        data: null,
      };
    }
  }

  private async shareNote(
    payload: types.shareNote,
    user: UserModel
  ): Promise<types.TApiResponse> {
    try {
      console.log(
        `[NoteController][shareNote]  ${JSON.stringify(
          payload
        )} ${JSON.stringify(user)}`
      );

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

      const shareData = await this.noteShareDAO.findOne(
        noteId,
        shareUserData._id
      );

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
    } catch (error) {
      console.log(`[shareNote][error] ${error.message}`);
      return {
        status: 500,
        message: error.message,
        data: null,
      };
    }
  }

  private async searchNote(
    searchText: string,
    userId: string
  ): Promise<types.TApiResponse> {
    try {
      console.log(
        `[NoteController][searchNote]  ${searchText} ${userId}`
      );

      if (!searchText) {
        return {
          status: 400,
          message: "searchText is required",
          data: null,
        };
      }

      const data = await this.noteDao.searchNote(searchText, userId);

      console.log("data",JSON.stringify(data));

      return {
        status: 200,
        message: "ok",
        data,
      };
    } catch (error) {
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
}
