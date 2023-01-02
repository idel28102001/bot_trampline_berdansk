import { Context, SessionFlavor } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { RolesEnum } from '../users-center/enums/roles.enum';
import { DIALOGS } from './texts';

export interface SessionData {
  role: { type: RolesEnum };
  event: string;
}

export const generateWhatsappLink = (phone: string, event: string) => {
  return `https://api.whatsapp.com/send?phone=${phone.slice(
    1,
  )}&text=${DIALOGS.MEETINGS.FOR_LINK.A1(event)}`;
};

export const formatPhone = (phone: string) => {
  if (phone.startsWith('+')) {
    return phone;
  }
  if (phone.startsWith('7') || phone.startsWith('38')) {
    return `+${phone}`;
  }
  return `+7${phone}`;
};

export const choose = async (ctx: MyContext) => {
  await ctx.reply('Выберите пункт из предложенных вариантов').catch(e=>undefined);
};
export type MyConversation = Conversation<MyContext>;
export type MyContext = Context &
  ConversationFlavor &
  SessionFlavor<SessionData | any>;
