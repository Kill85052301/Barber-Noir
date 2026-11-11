(() => {
  const menu = document.querySelector('.menu-movel');
  if (!menu) return;
  const botao = menu.querySelector('.menu-botao');
  const painel = menu.querySelector('nav');
  const telaMenor = window.matchMedia('(max-width: 1024px)');

  function definirAberto(aberto) {
    if (menu.classList.contains('aberto') === aberto) return;
    menu.classList.toggle('aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    painel.inert = !aberto;
  }

  botao.addEventListener('click', () => {
    definirAberto(!menu.classList.contains('aberto'));
  });

  painel.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) {
      botao.focus({ preventScroll: true });
      definirAberto(false);
    }
  });

  document.addEventListener('pointerdown', (evento) => {
    if (!menu.contains(evento.target)) definirAberto(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      definirAberto(false);
      botao.focus({ preventScroll: true });
    }
  });

  menu.addEventListener('focusout', (evento) => {
    if (!menu.contains(evento.relatedTarget)) definirAberto(false);
  });

  telaMenor.addEventListener('change', () => definirAberto(false));
})();


/* Um observador por página, liberado após as entradas terminarem. */
(() => {
  const raiz = document.documentElement;
  if (!raiz.classList.contains('reveal-init')) return;

  let observador;
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pendentes = new Set();
  let aguardandoEntrada = 0;

  function liberarConteudo() {
    raiz.classList.remove('reveal-init', 'reveal-ready');
    clearTimeout(window.noirRevealFallback);
    observador?.disconnect();
    pendentes.forEach((elemento) => {
      elemento.classList.remove('reveal-pending', 'reveal-enter');
      elemento.style.removeProperty('--reveal-delay');
    });
    pendentes.clear();
    document.removeEventListener('animationend', aoTerminar);
    document.removeEventListener('focusin', aoFocar);
    window.removeEventListener('hashchange', aoMudarAncora);
    window.removeEventListener('pageshow', aoRestaurar);
    movimentoReduzido.removeEventListener('change', aoReduzirMovimento);
  }

  function concluirEntrada(elemento) {
    if (!pendentes.has(elemento)) return;
    if (!elemento.classList.contains('reveal-enter')) aguardandoEntrada -= 1;
    observador.unobserve(elemento);
    elemento.classList.remove('reveal-pending', 'reveal-enter');
    elemento.style.removeProperty('--reveal-delay');
    pendentes.delete(elemento);
    if (aguardandoEntrada === 0) observador.disconnect();
    if (pendentes.size === 0) liberarConteudo();
  }

  function aoTerminar(evento) {
    if (evento.animationName === 'noir-reveal') concluirEntrada(evento.target);
  }

  function exibirDestino(elemento) {
    const alvo = elemento?.closest('[data-reveal]');
    if (alvo) concluirEntrada(alvo);
  }

  function aoFocar(evento) { exibirDestino(evento.target); }
  function aoMudarAncora() { exibirDestino(document.getElementById(location.hash.slice(1))); }
  function aoRestaurar(evento) { if (evento.persisted) liberarConteudo(); }
  function aoReduzirMovimento(evento) { if (evento.matches) liberarConteudo(); }

  try {
    if (movimentoReduzido.matches) {
      liberarConteudo();
      return;
    }

    document.querySelectorAll('[data-reveal]').forEach((elemento) => {
      elemento.classList.add('reveal-pending');
      pendentes.add(elemento);
    });
    aguardandoEntrada = pendentes.size;
    if (aguardandoEntrada === 0) {
      liberarConteudo();
      return;
    }

    observador = new IntersectionObserver((entradas) => {
      try {
        let ordem = 0;
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting || !pendentes.has(entrada.target) || entrada.target.classList.contains('reveal-enter')) return;
          const elemento = entrada.target;
          elemento.style.setProperty('--reveal-delay', `${Math.min(ordem++, 2) * 45}ms`);
          elemento.classList.add('reveal-enter');
          observador.unobserve(elemento);
          aguardandoEntrada -= 1;
        });
        if (aguardandoEntrada === 0) observador.disconnect();
      } catch {
        liberarConteudo();
      }
    }, { threshold: 0 });

    document.addEventListener('animationend', aoTerminar);
    document.addEventListener('focusin', aoFocar);
    window.addEventListener('hashchange', aoMudarAncora);
    window.addEventListener('pageshow', aoRestaurar);
    movimentoReduzido.addEventListener('change', aoReduzirMovimento);

    // A troca de estado é síncrona para impedir a exibição antes da entrada.
    raiz.classList.add('reveal-ready');
    raiz.classList.remove('reveal-init');
    clearTimeout(window.noirRevealFallback);
    pendentes.forEach((elemento) => observador.observe(elemento));
  } catch {
    liberarConteudo();
  }
})();
