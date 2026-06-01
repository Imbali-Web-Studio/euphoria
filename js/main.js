(function () {
  'use strict';

  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuPanels = document.querySelectorAll('.menu-panel');
  const reservationForm = document.getElementById('reservation-form');
  const toast = document.getElementById('toast');
  const fadeUpElements = document.querySelectorAll('.fade-up');

  /* Sticky nav */
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* Hamburger + body scroll lock */
  function setMobileMenuOpen(open) {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      setMobileMenuOpen(!mobileMenu.classList.contains('open'));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMobileMenuOpen(false);
      });
    });
  }

  /* Smooth scroll */
  function smoothScrollTo(target) {
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target);
    });
  });

  document.querySelectorAll('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.getElementById(btn.getAttribute('data-scroll'));
      smoothScrollTo(target);
    });
  });

  /* Menu tabs */
  function setActiveTab(tabName) {
    menuTabs.forEach(function (tab) {
      const isActive = tab.getAttribute('data-tab') === tabName;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    menuPanels.forEach(function (panel) {
      panel.classList.toggle('active', panel.getAttribute('data-panel') === tabName);
    });
  }

  menuTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setActiveTab(tab.getAttribute('data-tab'));
    });
  });

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js-loaded');

  /* IntersectionObserver scroll animations */
  if ('IntersectionObserver' in window && fadeUpElements.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeUpElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeUpElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* Reservation form toast */
  let toastTimeout;

  if (reservationForm && toast) {
    reservationForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!reservationForm.checkValidity()) {
        reservationForm.reportValidity();
        return;
      }

      toast.classList.add('show');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
      }, 3500);

      reservationForm.reset();
    });
  }
})();
