export const MENULIST = [
  '💥 Забронировать',
  '📱 Контакты',
  '🎰 Что есть в центре',
  '🎁 Получить промокод',
  '📞 Заказать звонок',
];

export const chunk = (array: Array<any>, chunkSize: number) => {
  const R = [];
  for (let i = 0; i < array.length; i += chunkSize)
    R.push(array.slice(i, i + chunkSize));
  return R;
};

export const KEYBOARD_MENU = chunk(
  MENULIST.map((e) => ({ text: String(e) })),
  2,
);

export const SUGGESTS = [
  '🤹‍♂ Заказать праздник ДР',
  '📩 Забронировать посещение',
  '🏒 Бесплатная игра в хоккей',
  '🎰 Бесплатная игра в хватайку',
  '🤷 Cвой вариант',
];

const suggest = [...SUGGESTS, 'Отмена'];

export const SUGGESTS_MENU = chunk(
  suggest.map((e) => ({ text: String(e) })),
  2,
);

export const ADMINMENULIST = [
  '1💌 Создать акцию с купонами',
  '2🛎 Обработать запросы на кассиров',
];

export const SELLERMENULIST = ['1💌 Найти купон и активировать по промокоду'];
