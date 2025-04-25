import * as Joi from "joi";

export const getValidationSchemaConfig = () =>
  Joi.object({
    NODE_ENV: Joi.string()
      .valid("development", "production")
      .default("development"),
    SERVER_PORT: Joi.number().required(),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION: Joi.string().required(),
    JWT_REFRESH_EXPIRATION: Joi.string().required()
  });
