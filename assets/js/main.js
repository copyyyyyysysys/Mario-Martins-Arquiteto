/* ===================================================================
   Mario Martins · Arquiteto — Main JS (Otimizado · Zero Dependências)
   IntersectionObserver nativo · Rolagem nativa fluida · Zero RAF parado
   Total: < 6 KB
   =================================================================== */

(function () {
  'use strict';

  // ---- Detecção de movimento reduzido ----
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Header & Scroll Sentinel ----
  var header = document.getElementById('site-header');

  // ---- Parallax & Scroll Elements ----
  var heroSection = document.querySelector('.hero');
  var heroContent = document.querySelector('.hero__content');
  var heroHalo1 = document.querySelector('.hero__halo--1');
  var heroHalo2 = document.querySelector('.hero__halo--2');
  var heroScrollHint = document.querySelector('.hero__scroll-hint');
  var sobreSection = document.querySelector('.sobre');
  var sobreImg = document.querySelector('.sobre__img');

  var isTicking = false;
  var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

  function updateScrollState() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Estado do cabeçalho (scrolled > 60px)
    if (header) {
      if (scrollY > 60) {
        if (!header.classList.contains('scrolled')) {
          header.classList.add('scrolled');
        }
      } else {
        if (header.classList.contains('scrolled')) {
          header.classList.remove('scrolled');
        }
      }
    }

    // Parallax suave (apenas se prefersReducedMotion for falso)
    if (!prefersReducedMotion) {
      var vh = window.innerHeight;

      // Parallax da Hero
      if (heroSection && scrollY <= vh) {
        var heroRatio = scrollY / vh;
        if (heroContent) {
          heroContent.style.transform = 'translateY(' + (-scrollY * 0.16).toFixed(1) + 'px)';
          heroContent.style.opacity = Math.max(0.2, 1 - heroRatio * 0.9).toFixed(2);
        }
        if (heroHalo1) {
          heroHalo1.style.transform = 'translateY(' + (-scrollY * 0.22).toFixed(1) + 'px)';
        }
        if (heroHalo2) {
          heroHalo2.style.transform = 'translateY(' + (scrollY * 0.12).toFixed(1) + 'px)';
        }
        if (heroScrollHint) {
          heroScrollHint.style.opacity = Math.max(0, 1 - scrollY / 140).toFixed(2);
        }
      }

      // Parallax do Sobre (apenas quando visível)
      if (sobreSection && sobreImg) {
        var sRect = sobreSection.getBoundingClientRect();
        if (sRect.top < vh && sRect.bottom > 0) {
          var progress = (vh - sRect.top) / (vh + sRect.height);
          var translateY = ((0.5 - progress) * 44).toFixed(1);
          sobreImg.style.transform = 'translateY(' + translateY + 'px)';
        }
      }
    }

    isTicking = false;
  }

  function onScroll() {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateScrollState);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Chamada inicial para ajustar cabeçalho se recarregado com scroll
  updateScrollState();


  // ---- Pausar animações da hero quando fora da tela ----
  if ('IntersectionObserver' in window && heroSection) {
    var heroAtmosphere = heroSection.querySelector('.hero__atmosphere');
    var scrollLine = heroSection.querySelector('.hero__scroll-line');

    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var state = entry.isIntersecting ? 'running' : 'paused';
        if (heroAtmosphere) {
          var halos = heroAtmosphere.querySelectorAll('.hero__halo');
          halos.forEach(function (h) {
            h.style.animationPlayState = state;
          });
        }
        if (scrollLine) {
          scrollLine.style.animationPlayState = state;
        }
      });
    }, { threshold: 0 });

    heroObserver.observe(heroSection);
  }

  // ---- Menu Móvel com Acessibilidade ----
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');
  var backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  function openMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu');
    navMenu.classList.add('open');
    backdrop.classList.add('active');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    navMenu.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = this.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  backdrop.addEventListener('click', closeMobileMenu);

  // Fechar menu móvel ao clicar em âncora
  document.querySelectorAll('.nav__link, a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
      }
    });
  });

  // ---- Modal de Projeto (Lightbox com Zero Upscale) ----
  var projetoModal = document.getElementById('projeto-modal');
  var projetoModalImg = document.getElementById('projeto-modal-img');
  var projetoModalClose = document.getElementById('projeto-modal-close');
  var projetoModalBackdrop = document.getElementById('projeto-modal-backdrop');
  var lastFocusedTrigger = null;

  function openProjetoModal(trigger) {
    if (!projetoModal || !projetoModalImg) return;
    lastFocusedTrigger = trigger;
    var src = trigger.getAttribute('data-src');
    var alt = trigger.getAttribute('data-alt');
    projetoModalImg.setAttribute('src', src);
    projetoModalImg.setAttribute('alt', alt || 'Projeto em destaque');
    projetoModal.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    if (projetoModalClose) {
      projetoModalClose.focus();
    }
  }

  function closeProjetoModal() {
    if (!projetoModal || projetoModal.hasAttribute('hidden')) return;
    projetoModal.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
    if (projetoModalImg) {
      projetoModalImg.setAttribute('src', '');
      projetoModalImg.setAttribute('alt', '');
    }
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }

  document.querySelectorAll('.projeto-card__trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openProjetoModal(this);
    });
  });

  if (projetoModalClose) {
    projetoModalClose.addEventListener('click', closeProjetoModal);
  }

  if (projetoModalBackdrop) {
    projetoModalBackdrop.addEventListener('click', closeProjetoModal);
  }

  // Tecla Escape para fechar modal ou menu
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (projetoModal && !projetoModal.hasAttribute('hidden')) {
        closeProjetoModal();
      } else if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
        navToggle.focus();
      }
    }
  });

  // ---- Pausar animações contínuas ao ocultar a aba ----
  var continuousAnimEls = document.querySelectorAll('.hero__halo, .btn__sweep, .hero__scroll-line');
  document.addEventListener('visibilitychange', function () {
    var paused = document.hidden;
    continuousAnimEls.forEach(function (el) {
      el.style.animationPlayState = paused ? 'paused' : 'running';
    });
  });

})();
