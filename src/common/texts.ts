import { format, subHours, subMinutes } from 'date-fns';
import { config } from './config';
import { ru } from 'date-fns/locale';

export const MenuButtons = {
  Q0: '🧸Участвовать в розыгрыше🧸',
  Q1: '🤹‍♂Заказать праздник ДР🤹‍♂',
  // Q2: '🏒Бесплатная игра в хоккей🏒',
  // Q3: '🎰Бесплатная игра в хватайку🎰',
  Q4: '👘Бесплатное Карате👘 - занятие',
  Q5: '🧘‍♂Бесплатное Гимнастика🧘‍♂ - занятие',
  Q6: '🎁Акция 2 + 1🎁',
  Q7: '📱Контакты📱',
  Q8: '🎲Выбрать случайного победителя🎲',
};

export const CANCEL = 'Отмена';
export const DIALOGS = {
  LOCATION: {
    A1: `Мы находимся по адресу:\n${config.get('ADDRESS')}\n${config
      .get('CONTACTS')
      .split('\\n')
      .join('\n')}`,
  },
  OTHER: { ADMIN: 'Теперь вы админ' },
  CONFIRMATION: {
    KEYBOARD: { CONFIRM: 'Подтвердить', REEDIT: 'Перезаписать' },
    QUESTIONS: { Q1: 'Вы подтверждаете?' },
  },
  ERRORS: {
    MESSAGE: 'Произошла ошибка, попробуйте ещё раз',
    TRY: 'К сожалению это время уже занято, попробуйте ещё раз',
  },
  MEETINGS: {
    EVENT: {
      A2: '😢Жаль, но надеюсь мы вас заинтересуем другими нашими мероприятиями😇',
      A1: '🎁Акция 2+1🎁 - при покупке 2-ух билетов 3-ий в подарок!\nПодскажите, вам интересно воспользоваться данным предлжением?',
      Q1: 'Да, очень интересно',
      Q2: 'Нет, не интересно',
    },
    DATE: {
      A1: 'Выберите месяц, в котором будете праздновать день рождения',
      A2: 'Выберите число, в котором будете праздновать день рождения',
      A3: 'Сколько лет именинику(-це)?',
      A4: 'Сколько детей будет на празднике?',
      A5: ['до 5-ти', '5-10', '10-20', '20-30', '30-50', 'больше 50-ти'],
      A6: (date: Date, age: string, count: string) =>
        `Дата: ${format(date, 'd MMMM (cccc)', {
          locale: ru,
        })}\nВозраст ребёнка: ${age}\nКоличество детей на празднике: ${count}`,
      A7: 'Возраст должен быть не более 17-ти лет',
      A8: 'Выберите день, на который планируете придти',
      A9: (date: string) => `Дата: ${date}`,
    },
    FOR_LINK: {
      A1: (event: string) =>
        `Вас+заинтресовало+предложение+${event.replace(' ', '+')}\,+верно?`,
    },
    FUTURE: {
      A1: 'у вас состоится',
      A2: 'Завтра',
      A3: 'Сегодня',
      A4: 'в',
      A5: {
        date(date: Date) {
          return subHours(date, 2);
        },
        text: 'Через 2 часа',
      },
      A6: {
        date(date: Date) {
          return subMinutes(date, 15);
        },
        text: 'Через 15 минут',
      },
    },
    DAYS: {
      A1: 'Пока у вас нет встреч',
      Q1: 'Выберите день встреч',
      Q2: 'Выберите время',
    },
    CANCELATION: {
      AUS: { Q: 'Вы точно хотите отменить?' },
      CONFIRM: { Q: 'Да, отменить встречу', A: 'Вы успешно отменили встречу' },
      CANCEL: { Q: 'Нет, оставить встречу', A: 'Встреча всё ещё в силе' },
    },
    EDIT: {
      AUS: { Q: 'Что вы хотите изменить?' },
      EVENT: {
        COMMENT: '✏Комментарий✏',
        PHONE_NUMBER: '📞Номер телефона📞',
        DATE: '📅Дату/время встречи📅',
      },
    },
    CREATE: {
      DATE: {
        DAY: 'Выберите день',
        TIME: `Выберите время`,
        A1: 'Встреча успешно перенесена',
        S1: 'Вы выбрали:',
      },
      PHONE_NUMBER: {
        SHARE: 'Поделиться телефоном',
        ACTION: () => {
          const text = (this as any).DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.SHARE;
          return `Поделитесь телефоном через кнопку "${text}" \nИли введите ваш номер телефона в международном формате +7XXXXXXXXXX или +38XXXXXXXXXX`;
        },

        S1: 'Вы ввели:',
        A1: 'Номер телефона успешно обновлён',
      },
      COMMENT: {
        KEYBOARD: {
          EMPTY: 'Оставить поле пустым',
          TYPESMTH: 'Добавить комментарий',
        },
        ACTION: 'Введите ваш комментарий',
        S1: 'Вы ввели:',
        A1: 'Комментарий успешно обновлён',
        Q1: 'Хотите добавить комментарий к заявке?',
      },
      ALL: {
        A1: 'Ваша заявка была отправлена. Скоро вам перезвонят',
        TO_GOOGLE: {
          P1: 'Telegram',
          P2: 'Имя',
          P3: 'Написать',
          P4: 'Время',
          P5: 'Запрос',
          P6: 'Комментарий',
          P7: 'Не оставляли',
          P8: 'Телефон',
          P9: 'с',
          P10: 'Whatsapp',
        },
        WHOLE_TEXT: {
          P1: 'Вы выбрали:',
          P2: 'Мероприятие:',
          P3: 'Телефон:',
          P4: 'Комментарий:',
        },
      },
    },
  },
};