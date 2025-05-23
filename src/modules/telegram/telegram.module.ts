import { NestjsGrammyModule } from "@grammyjs/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AiService } from "@/modules/services/ai.service";
import { SpeechService } from "@/modules/services/speech.service";
import { TelegramService } from "@/modules/telegram/telegram.service";
import { TelegramUpdate } from "@/modules/telegram/telegram.update";

@Module({
  imports: [
    ConfigModule,
    NestjsGrammyModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>("TELEGRAM_BOT_TOKEN")
      })
    })
  ],
  providers: [TelegramUpdate, TelegramService, SpeechService, AiService]
})
export class TelegramModule {}
