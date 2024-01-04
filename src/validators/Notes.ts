import joi from "joi";
import * as types from "../utils/types";

export const createNote = (payload: types.CreateNote) => {
  const schema = joi.object({
    title: joi.string().min(1).max(30).required(),
    content: joi.string().min(1).max(100).required(),
  });

  return schema.validate(payload).error;
};


export const updateNote = (payload: types.UpdateNote) => {
  const schema = joi.object({
    noteId: joi.string().min(1).max(30).required(),
    title: joi.string().min(1).max(30).optional(),
    content: joi.string().min(1).max(100).optional(),
  });

  return schema.validate(payload).error;
};

export const shareNote = (payload: types.shareNote) => {
  const schema = joi.object({
    noteId: joi.string().min(1).max(30).required(),
    sharedWith: joi.string().min(1).max(30).required(),
  });

  return schema.validate(payload).error;
};
