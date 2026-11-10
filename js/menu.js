(() => {
  const menu = document.querySelector('.menu-movel');
  const botao = menu.querySelector('.menu-botao');
  const painel = menu.querySelector('nav');
  const telaMenor = window.matchMedia('(max-width: 1024px)');

  function definirAberto(aberto) {
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
