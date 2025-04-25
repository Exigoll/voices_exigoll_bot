import { InjectBot } from "@grammyjs/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Api, Bot, Context } from "grammy";

import { AiService } from "@/modules/services/ai.service";
import { SpeechService } from "@/modules/services/speech.service";

@Injectable()
export class TelegramService {
  private readonly botToken: string;

  constructor(
    @InjectBot() private readonly bot: Bot<Context>,
    private readonly configService: ConfigService,
    private readonly speechService: SpeechService,
    private readonly aiService: AiService
  ) {
    this.botToken = configService.get<string>("TELEGRAM_BOT_TOKEN");
  }

  async processVoiceMessage(ctx: Context) {
    const voice = ctx.msg.voice;
    const duration = voice.duration;

    let progressMessageId: number | undefined;
    let interval: NodeJS.Timeout | undefined;
    let percent = 10;

    try {
      const file = await ctx.api.getFile(voice.file_id); // <<< ЗАМЕНЕНО
      await ctx.reply(`Длина голосового сообщения: ${duration} сек.`);

      const progressMsg = await ctx.reply(this.renderProgress(percent));
      progressMessageId = progressMsg.message_id;

      interval = setInterval(
        async () => {
          if (percent < 90) {
            percent += 5;
            await this.updateProgress(
              ctx.api,
              ctx.chat.id,
              progressMessageId,
              percent
            );
          }
        },
        duration > 300 ? 3000 : 2000
      );

      const transcription = await this.speechService.transcribeVoice(
        file.file_path
      );

      const { cost, timestamps } = await this.aiService.generateTimestamps(
        transcription,
        duration
      );

      clearInterval(interval);

      await this.updateProgress(ctx.api, ctx.chat.id, progressMessageId, 100);

      await ctx.reply(`Тайм-коды: \n\n${timestamps}`);
      await ctx.reply(cost);
    } catch (err) {
      clearInterval(interval);
      console.error("Ошибка при обработке голосового:", err.message);
      await ctx.reply("Произошла ошибка при обработке голосового.");
    }
  }

  private async updateProgress(
    api: Api,
    chatId: number,
    messageId: number,
    percent: number
  ) {
    await api.editMessageText(chatId, messageId, this.renderProgress(percent));
  }

  private renderProgress(percent: number): string {
    const totalBlocks = 10;
    const blockChar = "▰";
    const emptyBlockChar = "▱";
    const filledBlocks = Math.max(1, Math.round((percent / 100) * totalBlocks));
    const emptyBlocks = totalBlocks - filledBlocks;

    return `Прогресс: [${blockChar.repeat(filledBlocks)}${emptyBlockChar.repeat(emptyBlocks)}] ${percent}%`;
  }
}
