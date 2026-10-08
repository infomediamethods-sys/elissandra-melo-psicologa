/* movimento.js — movimento DESTE site, reproduzido de claritypsych.com.au (Kit de Design, seção "Movimento").
   Reproduzido aqui: frase do herói sorteada a cada carregamento (sem rotação automática) e ligada ao mural;
   entrada escalonada das 3 linhas da faixa de frase; mural "Eu sinto…" (troca com fade de 0,2s);
   acordeão (resposta abre por grid-template-rows 0,4s, "+" gira 45°). Hovers, cabeçalho que encolhe, menu e
   pulso do ponto estão no style.css. Sem efeito ligado à rolagem (a referência não tem).
   O que é função (sorteio, mural, acordeão) roda sempre; o que é animação respeita prefers-reduced-motion.
   main.js e base.css não se editam. */
(function () {
  'use strict';
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement;
  if (!reduzir) raiz.classList.add('js-mov');

  var WA = 'https://wa.me/5548988547577?text=';
  var celular = window.matchMedia('(max-width: 899px)');

  function rolarPara(alvo) {
    if (!alvo) return;
    var desloc = -((document.querySelector('[data-header]') || {}).offsetHeight || 64) - 16;
    if (window.__lenis) window.__lenis.scrollTo(alvo, { offset: desloc, duration: 1.1 });
    else window.scrollTo({ top: alvo.getBoundingClientRect().top + window.scrollY + desloc, behavior: reduzir ? 'auto' : 'smooth' });
  }

  /* 1. Faixa de frase: 3 linhas entram uma a uma (900ms ease-out, +120ms), uma vez */
  var faixa = document.querySelector('[data-linhas]');
  if (faixa) {
    if (reduzir || !('IntersectionObserver' in window)) {
      faixa.classList.add('visivel');
    } else {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
        });
      }, { threshold: 0.35 });
      obs.observe(faixa);
    }
  }

  /* 2. Mural "Eu sinto…": a caixa central responde à frase escolhida */
  var frases = Array.prototype.slice.call(document.querySelectorAll('.frase[data-frase]'));
  var conteudo = document.querySelector('[data-mural-conteudo]');
  var caixa = document.getElementById('mural-caixa');
  var campoFrase = document.querySelector('[data-mural-frase]');
  var campoResp = document.querySelector('[data-mural-resposta]');
  var campoChips = document.querySelector('[data-mural-chips]');
  var botaoWa = document.querySelector('[data-mural-wa]');

  function preencher(botao) {
    var tpl = document.querySelector('template[data-resposta="' + botao.dataset.tema + '"]');
    if (!tpl) return;
    var partes = tpl.content.querySelectorAll('p');
    campoFrase.textContent = botao.textContent;
    campoFrase.hidden = false;
    campoResp.textContent = partes[0].textContent;
    campoChips.innerHTML = partes[1] ? partes[1].innerHTML : '';
    campoChips.hidden = !partes[1];
    botaoWa.href = WA + encodeURIComponent('Olá, Elissandra! Vi seu site e me identifiquei com: "' + botao.textContent + '". Gostaria de conversar.');
  }

  function escolher(botao, rolar) {
    frases.forEach(function (b) { b.setAttribute('aria-pressed', b === botao ? 'true' : 'false'); });
    if (reduzir) { preencher(botao); }
    else {
      conteudo.classList.add('trocando');
      setTimeout(function () { preencher(botao); conteudo.classList.remove('trocando'); }, 200);
    }
    if (rolar && celular.matches) rolarPara(caixa);
  }

  if (conteudo && frases.length) {
    frases.forEach(function (b) { b.addEventListener('click', function () { escolher(b, true); }); });
  }

  /* 3. Frase do herói: sorteada a cada carregamento entre as curtas do mural; clicar leva ao mural */
  var heroiFrase = document.querySelector('[data-frase-heroi]');
  if (heroiFrase && frases.length) {
    var opcoes = ['1', '3', '4', '7', '16'];
    var id = opcoes[Math.floor(Math.random() * opcoes.length)];
    var origem = document.querySelector('.frase[data-frase="' + id + '"]');
    if (origem) { heroiFrase.textContent = origem.textContent; heroiFrase.dataset.fraseHeroi = id; }
    heroiFrase.addEventListener('click', function () {
      var alvo = document.querySelector('.frase[data-frase="' + heroiFrase.dataset.fraseHeroi + '"]');
      rolarPara(document.getElementById('sinto'));
      if (alvo) escolher(alvo, false);
    });
  }

  /* 4. Acordeão: <details> funciona sem JS; com JS a resposta abre/fecha animada */
  document.querySelectorAll('.acordeao details').forEach(function (d) {
    if (d.open) d.classList.add('aberto');
    var resumo = d.querySelector('summary');
    resumo.addEventListener('click', function (e) {
      e.preventDefault();
      if (!d.open) {
        d.open = true;
        if (reduzir) d.classList.add('aberto');
        else requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('aberto'); }); });
      } else {
        d.classList.remove('aberto');
        if (reduzir) d.open = false;
        else setTimeout(function () { if (!d.classList.contains('aberto')) d.open = false; }, 400);
      }
    });
  });
})();
