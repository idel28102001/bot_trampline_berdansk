import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { TelegramUpdate } from '../updates/telegram.update';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export const diagnosticTest = async (
    conversation: MyConversation,
    ctx: MyContext,
    thisv2: TelegramUpdate,
) => {
    await ctx.reply('Мы в тесте').catch((e) => undefined);
};
