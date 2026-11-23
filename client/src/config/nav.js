import { LayoutDashboard, ListChecks, Map, Sparkles } from 'lucide-vue-next';

export const navLinks = [
  { to: '/app', label: 'Обзор', icon: LayoutDashboard },
  { to: '/app/items', label: 'Записи', icon: ListChecks },
  { to: '/app/map', label: 'Карта', icon: Map },
  { to: '/app/ai', label: 'Ассистент', icon: Sparkles },
];
