import joi from "joi";
import * as types from "../utils/types";

export const signup = (payload: types.SignUpInput) => {
  const schema = joi.object({
    username: joi.string().alphanum().min(3).max(30).required(),
    password: joi.string().min(7).max(15).required(),
    name: joi.string().min(1).max(30).required(),
  });

  return schema.validate(payload).error;
};

export const login = (payload: types.LoginInput) => {
  const schema = joi.object({
    username: joi.string().alphanum().min(3).max(30).required(),
    password: joi.string().min(7).max(15).required(),
  });

  return schema.validate(payload).error;
};
