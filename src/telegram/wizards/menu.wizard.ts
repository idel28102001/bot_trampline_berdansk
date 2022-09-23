import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { MENULIST } from 'src/common/constants';
import { Scenes } from 'telegraf';
import * as dotenv from 'dotenv';
import { TelegramService } from '../services/telegram.service';

dotenv.config();

@Wizard('menu')
export class MenuWizard {
  constructor(private readonly telegramService: TelegramService) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const keyboard = Object.values(MENULIST).map((e) => [{ text: String(e) }]);
    await ctx.reply(
      `Выберите, что вам требуется:\n\n${Object.keys(MENULIST).join('\n')}`,
      {
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
    if (!message) {
      await ctx.scene.leave();
      return;
    }

    switch (message) {
      case '1': {
        await ctx.reply('Введите ваше имя');
        await ctx.wizard.next();
        break;
      }
      case '2': {
        await ctx.reply(
          `Наши контакты:\n${process.env.CONTACTS.split('\\n').join('\n')}`,
        );
        await ctx.scene.leave();
        break;
      }
      case '3': {
        await ctx.reply(`Мы находимся по адресу:\n${process.env.ADRESS}`);
        await ctx.scene.leave();
        break;
      }
      default: {
        await ctx.reply('Пожалуйста - выберите из списка возможных вариантов');
        await ctx.wizard.selectStep(2);
        break;
      }
    }
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    const cntx = ctx as any;
    cntx.session.name = message;
    await ctx.reply('Введите ваш номер телефона');
    await ctx.wizard.next();
  }

  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
      return;
    }
    const mess = `Ваше имя: ${
      (ctx as any).session.name
    }\nВаш номер телефона: ${message}`;
    (ctx as any).session.phone = message;
    await ctx.reply(`${mess}\n\nВы подтверждаете?`, {
      reply_markup: {
        one_time_keyboard: true,
        resize_keyboard: true,
        keyboard: [
          [{ text: 'Да' }, { text: 'Переделать' }, { text: 'Отмена' }],
        ],
      },
    });
    await ctx.wizard.next();
  }

  @WizardStep(5)
  async step5(@Context() ctx: Scenes.WizardContext) {
    const cntx = ctx as any;
    const message = (ctx as any).update?.message?.text;
    if (!message) {
      await ctx.scene.leave();
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
        await ctx.wizard.selectStep(4);
        break;
      }
    }
  }
}
