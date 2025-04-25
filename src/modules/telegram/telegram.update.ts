import { On, Start, Update } from "@grammyjs/nestjs";
import { Injectable } from "@nestjs/common";
import { Context } from "grammy";

import { TelegramService } from "@/modules/telegram/telegram.service";

@Update()
@Injectable()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  async onStart(ctx: Context): Promise<void> {
    await ctx.reply(
      `Привет, ${ctx.from.first_name}! Отправь мне голосовое сообщение, и я расставлю тайм-коды`
    );
  }

  @On("message:voice")
  async onVoiceMessage(ctx: Context): Promise<void> {
    return this.telegramService.processVoiceMessage(ctx);
  }
}
