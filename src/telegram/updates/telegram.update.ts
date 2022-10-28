import { Context } from 'grammy';
import { Ctx, Help, Start, Update } from '@grammyjs/nestjs';
import { ConversationFlavor } from '@grammyjs/conversations';
import { InjectBot } from 'nestjs-telegraf';
import { telegramMenuUtility } from '../utility/telegramMenuUtility';
import { Inject } from '@nestjs/common';
import { TelegramTokenEnum } from '../enums/tokens/telegram.token.enum';
import { TelegramService } from '../services/telegram.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { composer } from '../composers/telegram.composer';
import { TextsTokenEnum } from '../../texts/enums/texts.token.enum';
import { TextsService } from '../../texts/services/texts.service';
import { EventsTokenEnum } from '../../events/enum/tokens/events.token.enum';
import { EventsService } from '../../events/services/events.service';

type MyContext = Context & ConversationFlavor;

@Update()
export class TelegramUpdate {
  constructor(
    @InjectBot() private readonly bot,
    @Inject(TelegramTokenEnum.TELEGRAM_SERVICES_TOKEN)
    readonly telegramService: TelegramService,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    readonly usersCenterService: UsersCenterService,
    @Inject(TextsTokenEnum.TEXTS_SERVICES_TOKEN)
    readonly textsService: TextsService,
    @Inject(EventsTokenEnum.EVENTS_SERVICE_TOKEN)
    readonly eventsService: EventsService,
  ) {
    bot.use(composer(this));
  }

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    await this.usersCenterService.saveToDBUser(ctx.from);
    await telegramMenuUtility(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply('Это бот записей на онлайн приём к Эльмире Гатауллиной');
  }
}
