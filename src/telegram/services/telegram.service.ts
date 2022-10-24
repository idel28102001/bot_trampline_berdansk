import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Bot, Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { TelegramUpdate } from '../updates/telegram.update';
import { makeMeAdmin } from '../conversations/make-me-admin.conversation';
import { promo } from '../conversations/all-meets.conversation';
import { cancelMeet } from '../conversations/cancel-meet.conversation';
import { TextsTokenEnum } from '../../texts/enums/texts.token.enum';
import { TextsService } from '../../texts/services/texts.service';
import { sendContacts } from '../conversations/edit-meet.conversation';
import { consDiagnostic } from '../conversations/cons-diagnostic.conversation';

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

@Injectable()
export class TelegramService {
  calendar;
  constructor(
    @InjectBot() private readonly bot: Bot,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
    @Inject(TextsTokenEnum.TEXTS_SERVICES_TOKEN)
    private readonly textsService: TextsService,
  ) {}

  async sendContacts(conversation: MyConversation, ctx: MyContext) {
    return await sendContacts(conversation, ctx);
  }

  async promo(conversation: MyConversation, ctx: MyContext) {
    return await promo(conversation, ctx, this as unknown as TelegramUpdate);
  }
  async cancelMeet(conversation: MyConversation, ctx: MyContext) {
    return await cancelMeet(
      conversation,
      ctx,
      this as unknown as TelegramUpdate,
    );
  }

  async makeMeAdmin(conversation: MyConversation, ctx: MyContext) {
    return makeMeAdmin(conversation, ctx, this as unknown as TelegramUpdate);
  }

  async orderACall(conversation: MyConversation, ctx: MyContext) {
    // return diagnosticTest(
    //   conversation,
    //   ctx,
    //   this as unknown as TelegramUpdate,
    //   type,
    // );
    return consDiagnostic(conversation, ctx, this as unknown as TelegramUpdate);
  }
}
