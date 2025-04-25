import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

import { AppModule } from "@/modules/app/app.module";

import { getCorsConfig } from "@/config/cors.config";
import { getValidationExceptionConfig } from "@/config/exception.config";

import { HttpExceptionFilter } from "@/exception-filters/http.exception-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "verbose", "debug"]
  });

  const config = app.get(ConfigService);
  const logger = app.get(Logger);
  const env = config.get<string>("NODE_ENV") ?? "development";
  const port = config.get<number>("SERVER_PORT") ?? 3000;
  const cors = getCorsConfig(env).origin;

  configureApp(app, env, cors);

  try {
    await app.listen(port);
    logServerConfig(logger, env, cors, port);
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
}

function logServerConfig(
  logger: Logger,
  env: string,
  cors: string[],
  port: number
) {
  logger.verbose(`.env: ${env}`, "serverLogs");
  logger.verbose(`CORS: ${JSON.stringify(cors)}`, "serverLogs");
  logger.verbose(`port: ${port}`, "serverLogs");
}

function configureApp(app: INestApplication, env: string, cors: string[]) {
  const swagger = new DocumentBuilder()
    .setTitle("API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup("api", app, document);

  app.setGlobalPrefix("api");
  app.enableCors({ origin: cors });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: env === "production",
      exceptionFactory: getValidationExceptionConfig
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter(app.get(Logger)));
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableShutdownHooks();
}

bootstrap();
