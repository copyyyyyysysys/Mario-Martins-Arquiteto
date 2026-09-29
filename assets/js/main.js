/* ===================================================================
   Mario Martins · Arquiteto — Main JS
   GSAP + ScrollTrigger + Lenis (v1)
   Um único motor de scroll · Um único loop de renderização
   Máximo 3 laços contínuos · Respeita prefers-reduced-motion
   =================================================================== */

(function () {
  'use strict';

  // ---- Feature detection ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Mark JS active (enables reveal hide states in CSS) ----
  document.documentElement.classList.add('js-ready');

  // ---- GSAP & ScrollTrigger registration ----
  gsap.registerPlugin(ScrollTrigger);

  // ---- Lenis smooth scroll ----
  const lenis = new Lenis({
    duration: 1.2,
    easing: function (t) {
      return Math.min(1, 1.001 - Math.pow(2, -10 * t));
    },
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: !prefersReducedMotion,
    syncTouch: false,
  });

  // Single render loop via GSAP ticker
  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Connect Lenis → ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // ---- Anchor links with Lenis ----
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -60, duration: 1.4 });
        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });

  // ---- Mobile menu ----
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');
  var backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  function openMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu');
    navMenu.classList.add('open');
    backdrop.classList.add('active');
    document.body.classList.add('menu-open');
    lenis.stop();
  }

  function closeMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    navMenu.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
    lenis.start();
  }

  navToggle.addEventListener('click', function () {
    var isOpen = this.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  backdrop.addEventListener('click', closeMobileMenu);

  // Escape closes menu
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (navToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
        navToggle.focus();
      }
    }
  });

  // ---- Header scroll state ----
  var header = document.getElementById('site-header');

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top -80',
    onToggle: function (self) {
      header.classList.toggle('scrolled', self.isActive);
    },
  });

  // ---- Scroll Reveal ----
  if (!prefersReducedMotion) {
    var revealEls = document.querySelectorAll('[data-reveal]');

    revealEls.forEach(function (el) {
      var direction = el.getAttribute('data-reveal');
      var delay = parseFloat(el.getAttribute('data-reveal-delay') || 0);

      var fromVars = { opacity: 0, duration: 0.9, ease: 'power3.out', delay: delay };

      if (direction === 'up') {
        fromVars.y = 40;
      } else if (direction === 'left') {
        fromVars.x = -40;
      } else if (direction === 'right') {
        fromVars.x = 40;
      }

      fromVars.onComplete = function () {
        el.classList.add('revealed');
        el.style.willChange = 'auto';
      };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        invalidateOnRefresh: true,
        onEnter: function () {
          gsap.from(el, fromVars);
        },
      });
    });
  } else {
    // reduced motion: make everything visible immediately
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ---- Hero parallax layers ----
  if (!prefersReducedMotion) {
    var heroContent = document.querySelector('.hero__content');
    var heroHalo1 = document.querySelector('.hero__halo--1');
    var heroHalo2 = document.querySelector('.hero__halo--2');
    var heroScrollHint = document.querySelector('.hero__scroll-hint');

    if (heroContent) {
      gsap.to(heroContent, {
        y: -60,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    if (heroHalo1) {
      gsap.to(heroHalo1, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    if (heroHalo2) {
      gsap.to(heroHalo2, {
        y: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    if (heroScrollHint) {
      gsap.to(heroScrollHint, {
        opacity: 0,
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '30% top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }
  }

  // ---- Sobre section parallax ----
  if (!prefersReducedMotion) {
    var sobreImg = document.querySelector('.sobre__img');
    if (sobreImg) {
      gsap.fromTo(sobreImg, { y: 30 }, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.sobre',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }
  }

  // ---- Atuação items hover glow line ----
  var atuacaoFios = document.querySelectorAll('.atuacao__fio');
  atuacaoFios.forEach(function (fio) {
    var item = fio.parentElement;
    item.addEventListener('mouseenter', function () {
      gsap.to(fio, {
        background: 'linear-gradient(90deg, transparent 0%, rgba(196,170,124,0.45) 20%, rgba(196,170,124,0.45) 80%, transparent 100%)',
        duration: 0.4,
        overwrite: true,
      });
    });
    item.addEventListener('mouseleave', function () {
      gsap.to(fio, {
        background: 'linear-gradient(90deg, transparent 0%, rgba(196,170,124,0.20) 20%, rgba(196,170,124,0.20) 80%, transparent 100%)',
        duration: 0.6,
        overwrite: true,
      });
    });
  });

  // ---- Pause continuous animations when tab is hidden ----
  // (CSS animations + halos are the 3 continuous loops max)
  var continuousAnimEls = document.querySelectorAll('.hero__halo, .btn__sweep, .hero__scroll-line');
  document.addEventListener('visibilitychange', function () {
    var paused = document.hidden;
    continuousAnimEls.forEach(function (el) {
      el.style.animationPlayState = paused ? 'paused' : 'running';
    });
  });

  // ---- ScrollTrigger.refresh() — mandatory ----
  // After load
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });

  // After fonts ready
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
    });
  }

  // On resize (debounced)
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      ScrollTrigger.refresh();
    }, 250);
  });

})();
