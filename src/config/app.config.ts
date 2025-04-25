import { ConfigModuleOptions } from "@nestjs/config";

import { getValidationSchemaConfig } from "./validation-schema.config";

export const getAppConfig = (): ConfigModuleOptions => ({
  isGlobal: true,
  envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
  cache: true,
  validationSchema: getValidationSchemaConfig(),
  validationOptions: {
    abortEarly: false
  }
});
