import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

import { AppModule } from "@/modules/app/app.module";

import { configCors } from "@/config/cors.config";
import { createValidationException } from "@/config/exception.config";

import { HttpExceptionFilter } from "@/exception-filters/http.exception-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "verbose", "debug"]
  });
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  const environment = configService.get<string>("NODE_ENV") || "development";
  const port = configService.get<number>("SERVER_PORT");
  const corsConfig = configCors(environment).origin;

  // Настройки глобального приложения
  configureApp(app, environment);

  // Запуск приложения
  try {
    await app.listen(port);
    // Логгирование настроек
    serverLogsConfig(logger, environment, corsConfig, port);
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
}

function serverLogsConfig(
  logger: Logger,
  environment: string,
  corsConfig: string[],
  port: number
) {
  logger.verbose(`.env: ${environment}`, "serverLogsConfig");
  logger.verbose(`CORS: ${JSON.stringify(corsConfig)}`, "serverLogsConfig");
  logger.verbose(`port: ${port}`, "serverLogsConfig");
}

function configureApp(app: INestApplication, environment: string) {
  // Подключение Swagger
  const config = new DocumentBuilder()
    .setTitle("API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Подключение глобального префикса
  app.setGlobalPrefix("api");

  // Включение CORS
  const corsConfig = configCors(environment).origin;
  app.enableCors({ origin: corsConfig });

  // Подключение middleware
  app.use(cookieParser());

  // Подключение валидации
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: environment === "production",
      exceptionFactory: createValidationException
    })
  );

  // Фильтры исключений
  const loggerInstance = app.get(Logger);
  app.useGlobalFilters(new HttpExceptionFilter(loggerInstance));

  // WebSocket адаптер
  app.useWebSocketAdapter(new IoAdapter(app));

  // Shutdown hooks для корректного завершения
  app.enableShutdownHooks();
}

bootstrap();
