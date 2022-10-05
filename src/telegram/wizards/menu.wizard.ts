import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { MENULIST, SUGGESTS } from 'src/common/constants';
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

  async confirmOrNot(ctx: Scenes.WizardContext) {
    const cntx = ctx as any;
    const event = cntx.session.event || 'Заказать звонок';
    const mess = `Ваше имя: ${(ctx as any).session.name}\nВаш номер телефона: ${
      cntx.session.phone
    }\nВы хотите: ${event}`;
    await ctx.reply(`${mess}\n\nВы подтверждаете?`, {
      reply_markup: {
        one_time_keyboard: true,
        resize_keyboard: true,
        keyboard: [
          [{ text: 'Да' }, { text: 'Переделать' }, { text: 'Отмена' }],
        ],
      },
    });
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const keyboard = MENULIST.map((e) => [{ text: String(e) }]);
    await ctx.replyWithPhoto(
      'https://telegra.ph/file/df62280c6631e7f6f6977.jpg',
      {
        caption: `Выберите, что вам требуется:\n\n${MENULIST.join('\n')}`,
        reply_markup: {
          keyboard,
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
    const first = String(message)[0];

    switch (first) {
      case '1': {
        await ctx.reply('Введите ваше имя');
        await ctx.wizard.next();
        break;
      }
      case '5': {
        await ctx.reply('Введите ваше имя');
        (ctx as any).session.option = '6';
        await ctx.wizard.next();
        break;
      }
    }
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
    cntx.session.name = message;
    await ctx.reply('Введите ваш номер телефона');
    if (cntx.session.option === '6') {
      await ctx.wizard.next();
    }
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
    const conditionOnPhone =
      /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(
        message,
      );
    if (!conditionOnPhone) {
      await ctx.reply('Телефон не корректен. Введите повторно');
      await ctx.wizard.selectStep(3);
      return;
    }
    cntx.session.phone = message;
    await ctx.reply(`Выберите, что вам потребуется:\n${SUGGESTS.join('\n')}`, {
      reply_markup: {
        keyboard: SUGGESTS.map((e) => [{ text: e }]),
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    });
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
    if ((ctx as any).session.option === '6') {
      const conditionOnPhone =
        /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(
          message,
        );
      if (!conditionOnPhone) {
        await ctx.reply('Телефон не корректен. Введите повторно');
        await ctx.wizard.selectStep(4);
        return;
      }
      (ctx as any).session.phone = message;
      await ctx.wizard.next();
      await this.confirmOrNot(ctx);
      return;
    }
    const firstNum = Number(String(message).trim()[0]);
    if (isNaN(firstNum) || firstNum > SUGGESTS.length + 1 || firstNum < 0) {
      await ctx.reply('Пожалуйста - выберите из списка возможных вариантов');
      await ctx.wizard.selectStep(4);
      return;
    }
    if (firstNum === 5) {
      await ctx.reply('Введите ваш запрос)');
      await ctx.wizard.next();
      await ctx.wizard.next();
      return;
    }
    (ctx as any).session.event = SUGGESTS[firstNum - 1];
    await this.confirmOrNot(ctx);
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
        await ctx.reply(`Введите ваше имя`);
        await ctx.wizard.selectStep(2);
        break;
      }
      case 'отмена': {
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

  @WizardStep(7)
  async step7(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message || message.toLowerCase() === 'отмена') {
      await ctx.scene.leave();
      await this.telegramService.menu(ctx);
      return;
    }
    const cntx = ctx as any;
    cntx.session.event = '  ' + message;
    await this.confirmOrNot(ctx);
    await ctx.wizard.selectStep(5);
  }
}
