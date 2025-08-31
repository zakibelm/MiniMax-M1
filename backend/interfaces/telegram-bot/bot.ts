// interfaces/telegram-bot/bot.ts

// The Telegraf library would need to be installed (`npm install telegraf`)
import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';

// Import the central orchestrator to process requests
import { MediaAgentOrchestrator } from '../../core/orchestrator/main';

export class MediaAgentBot {
  private bot: Telegraf;
  private orchestrator: MediaAgentOrchestrator;

  constructor() {
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
        console.error('Fatal: TELEGRAM_TOKEN is not set in the environment variables.');
        process.exit(1); // Exit if the token is not provided
    }
    this.bot = new Telegraf(token);
    this.orchestrator = new MediaAgentOrchestrator();
    this.setupHandlers();
  }

  private setupHandlers() {
    // A welcome message when a user starts a chat with the bot
    this.bot.start((ctx) => ctx.reply('Welcome to the Ultimate Media Agent! Send me a command or a photo.'));

    // Handler for standard text messages
    this.bot.on(message('text'), async (ctx) => {
      const response = await this.orchestrator.routeRequest({
        type: 'text',
        content: ctx.message.text,
        chatId: ctx.chat.id
      });
      // The original spec included HTML parsing, so we'll keep that.
      await ctx.reply(response.message, { parse_mode: 'HTML' });
    });

    // Handler for photo uploads
    this.bot.on(message('photo'), async (ctx) => {
      // Get the highest resolution photo's file_id
      const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

      // The orchestrator will receive the fileId and decide how to process it.
      const response = await this.orchestrator.routeRequest({
        type: 'photo',
        fileId: fileId,
        chatId: ctx.chat.id
      });
      await ctx.reply(response.message);
    });
  }

  public launch() {
    this.bot.launch();
    console.log('Telegram bot is now running...');

    // Enable graceful stop on process termination signals
    process.once('SIGINT', () => {
        this.bot.stop('SIGINT');
        console.log('Bot stopped on SIGINT.');
    });
    process.once('SIGTERM', () => {
        this.bot.stop('SIGTERM');
        console.log('Bot stopped on SIGTERM.');
    });
  }
}

// This block allows the bot to be started directly from the command line
// e.g., `ts-node interfaces/telegram-bot/bot.ts`
if (require.main === module) {
    const mediaBot = new MediaAgentBot();
    mediaBot.launch();
}
