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
  const heroVideo = document.querySelector('.hero-bg-video');

  /* Hero background video (Mux HLS) */
  if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var heroSrc = 'https://stream.mux.com/enkPTZU5TZJ2UcuIGbD7Q49I3QYA007Wmp019voyBI5wA.m3u8';

    function playHeroVideo() {
      heroVideo.play().catch(function () {});
    }

    if (heroVideo.canPlayType('application/vnd.apple.mpegurl')) {
      heroVideo.src = heroSrc;
      playHeroVideo();
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(heroSrc);
      hls.attachMedia(heroVideo);
      hls.on(Hls.Events.MANIFEST_PARSED, playHeroVideo);
    }
  }

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

    var menuBackdrop = mobileMenu.querySelector('.mobile-menu-backdrop');
    if (menuBackdrop) {
      menuBackdrop.addEventListener('click', function () {
        setMobileMenuOpen(false);
      });
    }
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

  /* Top bar open / closed status (Houston hours) */
  var topBarStatus = document.getElementById('top-bar-status');

  function getChicagoTime() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date()).forEach(function (part) {
      if (part.type !== 'literal') {
        parts[part.type] = part.value;
      }
    });

    var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    return {
      day: dayMap[parts.weekday],
      hour: parseInt(parts.hour, 10),
      minute: parseInt(parts.minute, 10),
      date: parseInt(parts.day, 10),
      month: parseInt(parts.month, 10),
      year: parseInt(parts.year, 10)
    };
  }

  function getLastSundayDate(year, month) {
    var date = new Date(year, month, 0);
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() - 1);
    }
    return date.getDate();
  }

  function isSundayBrunchOpen(t) {
    if (t.day !== 0) {
      return false;
    }

    var mins = t.hour * 60 + t.minute;
    return t.date === getLastSundayDate(t.year, t.month) && mins >= 12 * 60 && mins < 16 * 60;
  }

  function isEuphoriaOpen() {
    var t = getChicagoTime();
    var mins = t.hour * 60 + t.minute;

    if (isSundayBrunchOpen(t)) {
      return true;
    }

    if (t.day === 1 || t.day === 2) {
      return false;
    }

    if (t.day === 3) {
      return mins >= 20 * 60;
    }

    if (t.day === 4) {
      return mins < 2 * 60 || mins >= 20 * 60;
    }

    if (t.day === 5) {
      return mins < 2 * 60 || mins >= 19 * 60;
    }

    if (t.day === 6) {
      return mins < 3 * 60 || mins >= 19 * 60;
    }

    if (t.day === 0) {
      return mins < 3 * 60;
    }

    return false;
  }

  function updateTopBarStatus() {
    if (!topBarStatus) {
      return;
    }

    var open = isEuphoriaOpen();
    topBarStatus.textContent = open ? 'Open' : 'Closed';
    topBarStatus.classList.toggle('is-open', open);
    topBarStatus.classList.toggle('is-closed', !open);
  }

  if (topBarStatus) {
    updateTopBarStatus();
    setInterval(updateTopBarStatus, 60000);
  }

})();
