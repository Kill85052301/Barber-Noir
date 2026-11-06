/* Entradas individuais, observadas uma vez e sem eventos de scroll. */
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  if (!root.classList.contains('motion-init')) return;
  const release = () => {
    root.classList.remove('motion-init', 'motion-ready');
    clearTimeout(window.noirMotionFallback);
  };
  if (motion.matches || !('IntersectionObserver' in window)) {
    release();
    return;
  }

  try {
  const targets = Array.from(document.querySelectorAll('main > section > *'));
  const pending = new Set(targets);
  const active = new Set();
  const observer = new IntersectionObserver((entries) => {
    try {
    const stagger = new Map();
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const section = target.parentElement;
      const order = stagger.get(section) || 0;
      stagger.set(section, order + 1);
      target.style.setProperty('--entrance-delay', `${Math.min(order, 3) * 80}ms`);
      target.classList.add('reveal-enter');
      active.add(target);
      observer.unobserve(target);
      pending.delete(target);
      target.addEventListener('animationend', (event) => {
        if (event.target !== target) return;
        target.classList.remove('reveal-pending', 'reveal-enter');
        target.style.removeProperty('--entrance-delay');
        active.delete(target);
      }, { once: true });
    });
    if (pending.size === 0) observer.disconnect();
    } catch {
      observer.disconnect();
      release();
    }
  }, { threshold: 0.08 });

  targets.forEach((target) => {
    target.classList.add('reveal-pending');
    const image = target.matches('img') ? target : target.querySelector('img');
    const observe = () => {
      if (!motion.matches && pending.has(target)) observer.observe(target);
    };
    // Aguarda a foto: a entrada não termina enquanto a imagem ainda carrega.
    if (image && !image.complete) {
      const timeout = setTimeout(observe, 4000);
      const ready = () => { clearTimeout(timeout); observe(); };
      image.addEventListener('load', ready, { once: true });
      image.addEventListener('error', ready, { once: true });
    } else {
      observe();
    }
  });
  root.classList.add('motion-ready');
  root.classList.remove('motion-init');
  clearTimeout(window.noirMotionFallback);

  motion.addEventListener('change', (event) => {
    if (!event.matches) return;
    observer.disconnect();
    release();
    pending.clear();
    active.forEach((target) => {
      target.classList.remove('reveal-enter');
      target.style.removeProperty('--entrance-delay');
    });
    active.clear();
  });
  } catch {
    release();
  }
})();
