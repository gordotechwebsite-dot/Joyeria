/* ============================================
   MicGlier Jewelry — Main JavaScript
   Optimized & Fast
   ============================================ */

(function () {
  'use strict';

  // ---------- Top Bar Close ----------
  var topbarClose = document.getElementById('topbarClose');
  var topbar = document.querySelector('.topbar');
  if (topbarClose && topbar) {
    topbarClose.addEventListener('click', function () {
      topbar.classList.add('hidden');
    });
  }

  // ---------- Header Scroll Effect ----------
  var header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    if (header) {
      if (window.pageYOffset > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // ---------- Mobile Menu ----------
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });
  }

  // ---------- Search Overlay ----------
  var searchToggle = document.getElementById('searchToggle');
  var searchOverlay = document.getElementById('searchOverlay');
  var searchClose = document.getElementById('searchClose');
  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', function () {
      searchOverlay.classList.add('active');
      var input = searchOverlay.querySelector('input');
      if (input) input.focus();
    });
    if (searchClose) {
      searchClose.addEventListener('click', function () {
        searchOverlay.classList.remove('active');
      });
    }
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        searchOverlay.classList.remove('active');
      }
    });
  }

  // ---------- Promo Badge ----------
  var promoBadge = document.getElementById('promoBadge');
  var promoClose = document.getElementById('promoClose');
  if (promoClose && promoBadge) {
    promoClose.addEventListener('click', function (e) {
      e.stopPropagation();
      promoBadge.classList.add('hidden');
      sessionStorage.setItem('promoHidden', 'true');
    });
    if (sessionStorage.getItem('promoHidden') === 'true') {
      promoBadge.classList.add('hidden');
    }
  }

  // ---------- Carousel Navigation ----------
  document.querySelectorAll('.carousel-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var track = btn.closest('.custom-banner__carousel, .products-section__carousel');
      if (!track) return;
      var scrollContainer = track.querySelector('.carousel-track');
      if (!scrollContainer) return;
      var dir = btn.dataset.dir;
      var scrollAmount = 260;
      if (dir === 'next') {
        scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    });
  });

  // ---------- Scroll Animations (IntersectionObserver) ----------
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------- Counter Animation ----------
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var current = 0;
      var step = Math.max(1, Math.floor(target / 60));
      var timer = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current.toLocaleString();
      }, 25);
    });
  }

  if ('IntersectionObserver' in window) {
    var statsSection = document.querySelector('.stats');
    if (statsSection) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      counterObserver.observe(statsSection);
    }
  }

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var offset = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Contact Form ----------
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = 'Mensaje Enviado';
        btn.style.background = '#4caf50';
        setTimeout(function () {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 2000);
      }, 1500);
    });
  }

  // ---------- Metal Ticker Update ----------
  function updateTicker() {
    var now = new Date();
    var timeEl = document.getElementById('tickerTime');
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
  }
  updateTicker();
  setInterval(updateTicker, 60000);

  // ---------- Lazy Load Images ----------
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
  } else {
    // Fallback for older browsers
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      var imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.dataset.src || img.src;
            imgObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach(function (img) { imgObserver.observe(img); });
    }
  }

})();
