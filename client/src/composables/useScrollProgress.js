import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Прогресс прокрутки внутри высокой секции: 0 — секция только начала,
 * 1 — дошли до конца. На этом построена scroll-история (sticky-сцена).
 * @param {import('vue').Ref<HTMLElement|null>} target
 */
export function useScrollProgress(target) {
  const progress = ref(0);
  let frame = 0;

  function measure() {
    frame = 0;
    const el = target.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    progress.value = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
  }

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };

  /** Прокрутить страницу так, чтобы прогресс секции стал value (0..1) */
  function scrollToProgress(value, smooth = true) {
    const el = target.value;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: smooth ? 'smooth' : 'instant' });
  }

  onMounted(() => {
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  });

  return { progress, scrollToProgress };
}
