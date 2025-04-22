import { ConsoleLogger, Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logFilePath: string;
  private readonly isProduction: boolean;

  constructor(context?: string) {
    super(context);
    this.isProduction = process.env.NODE_ENV === "production";
    this.logFilePath = path.resolve(__dirname, "../../logs/application.log");

    if (this.isProduction) {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  log(message: string, context?: string) {
    const resolvedContext = context || "Application"; // Контекст по умолчанию
    if (!this.isProduction) {
      super.log(message, resolvedContext); // Лог в консоль для разработки
    } else {
      this.writeToFile("LOG", message, resolvedContext); // Лог в файл для продакшена
    }
  }

  error(message: string, trace?: string, context?: string) {
    const resolvedContext = context || "Application"; // Контекст по умолчанию
    if (!this.isProduction) {
      super.error(message, trace, resolvedContext);
    } else {
      this.writeToFile("ERROR", message, resolvedContext, trace);
    }
  }

  warn(message: string, context?: string) {
    const resolvedContext = context || "Application"; // Контекст по умолчанию
    if (!this.isProduction) {
      super.warn(message, resolvedContext);
    } else {
      this.writeToFile("WARN", message, resolvedContext);
    }
  }

  debug(message: string, context?: string) {
    const resolvedContext = context || "Application"; // Контекст по умолчанию
    if (!this.isProduction) {
      super.debug(message, resolvedContext);
    } else {
      this.writeToFile("DEBUG", message, resolvedContext);
    }
  }

  verbose(message: string, context?: string) {
    const resolvedContext = context || "Application"; // Контекст по умолчанию
    if (!this.isProduction) {
      super.verbose(message, resolvedContext);
    } else {
      this.writeToFile("VERBOSE", message, resolvedContext);
    }
  }

  private writeToFile(
    level: string,
    message: string,
    context?: string,
    trace?: string
  ) {
    if (!this.isProduction) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}]${
      context ? ` [${context}]` : ""
    } ${message}\n`;
    const traceMessage = trace ? `Stack trace: ${trace}\n` : "";

    fs.appendFileSync(this.logFilePath, logMessage + traceMessage);
  }
}
