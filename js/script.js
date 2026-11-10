/* Entradas individuais, preparadas antes da primeira exibição. */
(() => {
  const raiz = document.documentElement;
  if (!raiz.classList.contains('reveal-init')) return;

  let observador;
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pendentes = new Set();

  function liberarConteudo() {
    raiz.classList.remove('reveal-init', 'reveal-ready');
    clearTimeout(window.noirRevealFallback);
    observador?.disconnect();
    pendentes.clear();
  }

  try {
    if (movimentoReduzido.matches) {
      liberarConteudo();
      return;
    }

    const elementos = document.querySelectorAll('[data-reveal]');
    elementos.forEach((elemento) => {
      elemento.classList.add('reveal-pending');
      pendentes.add(elemento);
    });

    observador = new IntersectionObserver((entradas) => {
      try {
        let ordem = 0;
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const elemento = entrada.target;
          elemento.style.setProperty('--reveal-delay', `${Math.min(ordem++, 2) * 45}ms`);
          elemento.classList.add('reveal-enter');
          observador.unobserve(elemento);
          pendentes.delete(elemento);
        });
        if (pendentes.size === 0) observador.disconnect();
      } catch {
        liberarConteudo();
      }
    }, { threshold: 0 });

    document.addEventListener('animationend', (evento) => {
      if (evento.animationName !== 'noir-reveal') return;
      evento.target.classList.remove('reveal-pending', 'reveal-enter');
      evento.target.style.removeProperty('--reveal-delay');
    });

    // Navegação por teclado e âncoras nunca espera uma entrada visual.
    function exibirDestino(elemento) {
      const alvo = elemento?.closest('[data-reveal]');
      if (!alvo) return;
      alvo.classList.remove('reveal-pending', 'reveal-enter');
      observador.unobserve(alvo);
      pendentes.delete(alvo);
    }
    document.addEventListener('focusin', (evento) => exibirDestino(evento.target));
    window.addEventListener('hashchange', () => {
      exibirDestino(document.getElementById(location.hash.slice(1)));
    });
    movimentoReduzido.addEventListener('change', (evento) => {
      if (evento.matches) liberarConteudo();
    });
    window.addEventListener('pageshow', (evento) => {
      if (evento.persisted) liberarConteudo();
    });

    raiz.classList.add('reveal-ready');
    raiz.classList.remove('reveal-init');
    clearTimeout(window.noirRevealFallback);
    elementos.forEach((elemento) => observador.observe(elemento));
  } catch {
    liberarConteudo();
  }
})();
