/**
 * Демо-склад для AI-управляющего: минимаркет в Ташкенте, цены в сумах.
 * Под тему меняются названия, единицы и поставщики — логика остаётся.
 * «Яйца» уже ниже минимума: на демо сразу есть решение, которое ждёт владельца.
 */
export const DEMO_STOCK = [
  { name: 'Молоко 1 л', unit: 'шт', quantity: 14, minQuantity: 10, unitPrice: 12_000, supplier: 'Сут Савдо' },
  { name: 'Лепёшка', unit: 'шт', quantity: 40, minQuantity: 20, unitPrice: 4_000, supplier: 'Нонвойхона Чорсу' },
  { name: 'Яйца 10 шт', unit: 'уп', quantity: 3, minQuantity: 8, unitPrice: 18_000, supplier: 'Птицефабрика Юнусабад' },
  { name: 'Сахар 1 кг', unit: 'шт', quantity: 25, minQuantity: 10, unitPrice: 13_000, supplier: 'Оптовая база Куйлюк' },
  { name: 'Масло подсолнечное 1 л', unit: 'шт', quantity: 12, minQuantity: 8, unitPrice: 22_000, supplier: 'Ёг Савдо' },
  {
    name: 'Рис девзира 1 кг',
    unit: 'шт',
    quantity: 30,
    minQuantity: 10,
    unitPrice: 28_000,
    supplier: 'Оптовая база Куйлюк',
  },
  { name: 'Чай зелёный', unit: 'пач', quantity: 9, minQuantity: 6, unitPrice: 9_000, supplier: 'Чой Импорт' },
  { name: 'Вода 1,5 л', unit: 'шт', quantity: 60, minQuantity: 24, unitPrice: 3_500, supplier: 'Аква Ташкент' },
];
