import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { KEYBOARD_MENU, SUGGESTS, SUGGESTS_MENU } from 'src/common/constants';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { TelegramService } from '../telegram.service';
import { Inject } from '@nestjs/common';
import { TelegramTokensEnum } from '../enum/tokens/telegram.tokens.enum';
import { CouponsTokenEnum } from '../../coupons/enum/tokens/coupons.token.enum';
import { CouponsService } from '../../coupons/coupons.service';

dotenv.config();

@Wizard('book-event')
export class BookEventWizard {
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
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/5fbb1884bc291ea82defe.jpg',
      {
        caption: `Выберите, что вам потребуется:\n\n${SUGGESTS.join('\n')}`,

        reply_markup: {
          keyboard: SUGGESTS_MENU,
          one_time_keyboard: true,
          resize_keyboard: true,
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
    if (!SUGGESTS.includes(message)) {
      await ctx.replyWithPhoto(
        'https://telegra.ph/file/9750a63183e882aaf36a8.jpg',
        {
          caption: 'Пожалуйста - выберите из списка возможных вариантов',
          reply_markup: {
            keyboard: SUGGESTS_MENU,
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        },
      );
      await ctx.wizard.selectStep(1);
      return;
    }
    if (SUGGESTS.indexOf(message) === SUGGESTS.length - 1) {
      await ctx.reply('Введите ваш запрос:');
      await ctx.wizard.next();
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
    (ctx as any).session.event = message;
    await ctx.wizard.next();
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
    (ctx as any).session.event = message;
    await ctx.wizard.next();
  }

  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
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

  @WizardStep(5)
  async step5(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message || message.toLowerCase() === 'отмена') {
      await ctx.scene.leave();
      await this.telegramService.menu(ctx);
      return;
    }
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
      await ctx.wizard.selectStep(4);
      return;
    }
    (ctx as any).session.phone = message;
    await this.telegramService.confirmOrNot(ctx);
    await ctx.wizard.next();
  }

  @WizardStep(6)
  async step6(@Context() ctx: Scenes.WizardContext) {
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
          'https://telegra.ph/file/5fbb1884bc291ea82defe.jpg',
          {
            caption: `Выберите, что вам потребуется:\n\n${SUGGESTS.join('\n')}`,

            reply_markup: {
              keyboard: SUGGESTS_MENU,
              one_time_keyboard: true,
              resize_keyboard: true,
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
        await ctx.wizard.selectStep(5);
        break;
      }
    }
  }
}
