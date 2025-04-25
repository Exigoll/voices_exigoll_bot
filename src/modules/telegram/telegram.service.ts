import { InjectBot } from "@grammyjs/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Bot, Context } from "grammy";

import { SpeechService } from "@/modules/services/speech.service";

@Injectable()
export class TelegramService {
  private readonly botToken: string;

  constructor(
    @InjectBot() private readonly bot: Bot<Context>,
    private readonly configService: ConfigService,
    private readonly speechService: SpeechService
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
      const file = await ctx.getFile();
      await ctx.reply(`Длина голосового сообщения: ${duration} сек.`);

      const progressMsg = await ctx.reply(this.renderProgress(percent));
      const progressMessageId = progressMsg.message_id;

      interval = setInterval(
        async () => {
          if (percent < 90) {
            percent += 5;
            await ctx.api.editMessageText(
              ctx.chat.id,
              progressMessageId,
              this.renderProgress(percent)
            );
          }
        },
        duration > 300 ? duration * 8 : 2000
      );

      const transcription = await this.speechService.transcribeVoice(
        file.file_path
      );

      console.log("Transcription:", transcription);

      //clearInterval(interval);
    } catch (err) {
      clearInterval(interval);
      console.error("Ошибка при обработке голосового:", err.message);
      await ctx.reply("Произошла ошибка при обработке голосового.");
    }

    console.log("Voice message duration:", duration);
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
