import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { TelegramService } from '../telegram.service';
import { Inject } from '@nestjs/common';
import { TelegramTokensEnum } from '../enum/tokens/telegram.tokens.enum';
import { CouponsTokenEnum } from '../../coupons/enum/tokens/coupons.token.enum';
import { CouponsService } from '../../coupons/coupons.service';
import { KEYBOARD_MENU } from '../../common/constants';

dotenv.config();

@Wizard('order-call')
export class OrderCallWizard {
  constructor(
    @Inject(TelegramTokensEnum.TELEGRAM_SERVICE_TOKEN)
    private readonly telegramService: TelegramService,
    @Inject(CouponsTokenEnum.COUPONS_SERVICE_TOKEN)
    private readonly couponsService: CouponsService,
  ) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/2204e23fe25ad9cef5830.jpg',
      {
        caption: 'Введите ваше имя',
        reply_markup: {
          keyboard: [[{ text: 'Отмена' }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
    await ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message || message.toLowerCase() === 'отмена') {
      await ctx.scene.leave();
      await this.telegramService.menu(ctx);
      return;
    }
    const cntx = ctx as any;
    cntx.session.name = message;
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/d99731258db9cf9d9761c.jpg',
      {
        caption: 'Введите ваш номер телефона',
        reply_markup: {
          keyboard: [[{ text: 'Отмена' }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
    await ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message || message.toLowerCase() === 'отмена') {
      await ctx.scene.leave();
      await this.telegramService.menu(ctx);
      return;
    }
    const cntx = ctx as any;
    const conditionOnPhone =
      /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(
        message,
      );
    if (!conditionOnPhone) {
      await ctx.reply('Телефон не корректен. Введите повторно', {
        reply_markup: {
          keyboard: [[{ text: 'Отмена' }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      await ctx.wizard.selectStep(2);
      return;
    }
    cntx.session.phone = message;
    await this.telegramService.confirmOrNot(ctx);
    await ctx.wizard.next();
  }

  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
    const cntx = ctx as any;
    const message = (ctx as any).update?.message?.text;
    if (!message || message.toLowerCase() === 'отмена') {
      await ctx.scene.leave();
      await this.telegramService.menu(ctx);
      return;
    }
    switch (message.toLowerCase()) {
      case 'да': {
        await ctx.reply(
          'Ваша заявка отправлена. С вами свяжутся в ближайшее время!',
          {
            reply_markup: {
              keyboard: KEYBOARD_MENU,
              resize_keyboard: true,
            },
          },
        );
        await ctx.scene.leave();
        await this.telegramService.sendOrder(ctx, {
          name: cntx.session.name,
          phone: cntx.session.phone,
          num: ctx.update.update_id,
          event: cntx.session.event,
        });
        break;
      }
      case 'переделать': {
        await ctx.replyWithPhoto(
          'https://telegra.ph/file/2204e23fe25ad9cef5830.jpg',
          {
            caption: 'Введите ваше имя',
            reply_markup: {
              keyboard: [[{ text: 'Отмена' }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          },
        );
        await ctx.wizard.selectStep(1);
        break;
      }
      case 'отмена': {
        await this.telegramService.menu(ctx);
        await ctx.scene.leave();
        break;
      }
      default: {
        await ctx.reply('Пожалуйста - выберите из списка возможных вариантов');
        await ctx.wizard.selectStep(3);
        break;
      }
    }
  }
}
