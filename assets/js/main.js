/* ============================================
   MicGlier Jewelry — Main JavaScript
   Futuristic & Performant
   ============================================ */

(function () {
  'use strict';

  // ---------- Particle Canvas ----------
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor((w * h) / 18000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 168, 76, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrame = requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        createParticles();
      }, 200);
    });
  }

  // ---------- Header Scroll Effect ----------
  const header = document.getElementById('header');
  let lastScroll = 0;
  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;
    if (header) {
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ---------- Mobile Menu ----------
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
    // Close on link click
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });
  }

  // ---------- Search Overlay ----------
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', function () {
      searchOverlay.classList.add('active');
      searchOverlay.querySelector('input').focus();
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
  const promoBadge = document.getElementById('promoBadge');
  const promoClose = document.getElementById('promoClose');
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

  // ---------- Scroll Animations (IntersectionObserver) ----------
  const animElements = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    animElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ---------- Counter Animation ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            const duration = 2000;
            const startTime = performance.now();

            function update(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.floor(eased * target).toLocaleString();
              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                el.textContent = target.toLocaleString();
              }
            }
            requestAnimationFrame(update);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Contact Form ----------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      btn.style.opacity = '0.6';

      setTimeout(function () {
        btn.textContent = 'Enviado';
        btn.style.background = '#25D366';
        setTimeout(function () {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.background = '';
          contactForm.reset();
        }, 2500);
      }, 1500);
    });
  }

  // ---------- Metal Price Ticker Simulation ----------
  function updateMetalPrices() {
    var gold = document.getElementById('goldPrice');
    var silver = document.getElementById('silverPrice');
    var platinum = document.getElementById('platinumPrice');
    if (gold) {
      var gp = 2340 + (Math.random() - 0.5) * 20;
      gold.textContent = '$' + gp.toFixed(2);
    }
    if (silver) {
      var sp = 31.2 + (Math.random() - 0.5) * 1;
      silver.textContent = '$' + sp.toFixed(2);
    }
    if (platinum) {
      var pp = 1045 + (Math.random() - 0.5) * 15;
      platinum.textContent = '$' + pp.toFixed(2);
    }
  }
  setInterval(updateMetalPrices, 5000);

})();
