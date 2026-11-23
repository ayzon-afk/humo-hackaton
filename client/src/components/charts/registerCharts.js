import {
  Chart,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(BarElement, CategoryScale, Filler, LinearScale, LineElement, PointElement, Tooltip);

/** Берём цвета прямо из CSS-токенов, чтобы графики совпадали с темой */
export function themeColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  return {
    accent: v('--accent'),
    accentSoft: v('--accent-soft'),
    text: v('--text'),
    muted: v('--text-tertiary'),
    grid: v('--hairline'),
    surface: v('--surface'),
    font: v('--font'),
  };
}

export function baseOptions(c) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.text,
        titleColor: c.surface,
        bodyColor: c.surface,
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        titleFont: { family: c.font, weight: '500' },
        bodyFont: { family: c.font },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: c.muted, font: { family: c.font, size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } },
      y: { grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, font: { family: c.font, size: 11 }, precision: 0, maxTicksLimit: 5 } },
    },
  };
}
