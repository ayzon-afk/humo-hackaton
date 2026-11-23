import { Bot, Headset, LayoutDashboard, ListChecks, Map, Settings, Sparkles, Users } from 'lucide-vue-next';

/** Меню сайдбара. section — подпись группы */
export const navSections = [
  {
    section: 'Работа',
    links: [
      { to: '/app', label: 'Обзор', icon: LayoutDashboard, exact: true },
      { to: '/app/items', label: 'Записи', icon: ListChecks },
      { to: '/app/map', label: 'Карта', icon: Map },
      { to: '/app/operator', label: 'AI-управляющий', icon: Headset },
      { to: '/app/agent', label: 'AI-агент', icon: Bot },
      { to: '/app/ai', label: 'Ассистент', icon: Sparkles },
    ],
  },
  {
    section: 'Управление',
    links: [
      { to: '/app/team', label: 'Команда', icon: Users },
      { to: '/app/settings', label: 'Настройки', icon: Settings },
    ],
  },
];
