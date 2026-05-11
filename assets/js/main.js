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

  // ---------- Metal Ticker — GoldAPI.io (1 actualización diaria a las 6am Barcelona) ----------
  var GOLDAPI_KEY = 'goldapi-d6220d379a785008cde3a0c19970d4e1-io';
  var METALS_CACHE_KEY = 'micglier_metal_prices';
  var CRYPTO_CACHE_KEY = 'micglier_crypto_prices';

  function getBarcelonaDate() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  }

  function isCacheValid(cacheKey) {
    try {
      var cached = JSON.parse(localStorage.getItem(cacheKey));
      if (!cached || !cached.timestamp) return false;
      var cachedDate = new Date(cached.timestamp);
      var now = getBarcelonaDate();
      var todaySixAm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
      if (now < todaySixAm) {
        var yesterdaySixAm = new Date(todaySixAm);
        yesterdaySixAm.setDate(yesterdaySixAm.getDate() - 1);
        return cachedDate >= yesterdaySixAm;
      }
      return cachedDate >= todaySixAm;
    } catch (e) { return false; }
  }

  function getCached(cacheKey) {
    try { return JSON.parse(localStorage.getItem(cacheKey)); }
    catch (e) { return null; }
  }

  function saveCache(cacheKey, data) {
    data.timestamp = new Date().toISOString();
    localStorage.setItem(cacheKey, JSON.stringify(data));
  }

  function updatePriceEl(priceId, changeId, price, pct, decimals) {
    var priceEl = document.getElementById(priceId);
    var changeEl = document.getElementById(changeId);
    if (priceEl) {
      priceEl.textContent = '$' + price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    if (changeEl && typeof pct === 'number') {
      changeEl.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
      changeEl.className = 'ticker-change ticker-change--' + (pct >= 0 ? 'up' : 'down');
    }
  }

  function updateMetalsUI(data) {
    if (data.gold) updatePriceEl('goldPrice', 'goldChange', data.gold.price, data.gold.change_pct, 2);
    if (data.silver) updatePriceEl('silverPrice', 'silverChange', data.silver.price, data.silver.change_pct, 2);
    if (data.platinum) updatePriceEl('platinumPrice', 'platinumChange', data.platinum.price, data.platinum.change_pct, 2);
    updateTimestamp(data.timestamp);
  }

  function updateCryptoUI(data) {
    if (data.btc) updatePriceEl('btcPrice', 'btcChange', data.btc.price, data.btc.change_pct, 0);
    if (data.eth) updatePriceEl('ethPrice', 'ethChange', data.eth.price, data.eth.change_pct, 0);
    if (data.sol) updatePriceEl('solPrice', 'solChange', data.sol.price, data.sol.change_pct, 2);
    if (data.xrp) updatePriceEl('xrpPrice', 'xrpChange', data.xrp.price, data.xrp.change_pct, 3);
    updateTimestamp(data.timestamp);
  }

  function updateTimestamp(ts) {
    var timeEl = document.getElementById('tickerTime');
    if (timeEl && ts) {
      var d = new Date(ts);
      timeEl.textContent = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })
        + ' ' + d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Madrid' });
    }
  }

  // --- GoldAPI (Metals) ---
  function fetchMetalPrice(symbol) {
    return fetch('https://www.goldapi.io/api/' + symbol + '/USD', {
      headers: { 'x-access-token': GOLDAPI_KEY, 'Content-Type': 'application/json' }
    }).then(function (res) { return res.json(); });
  }

  function fetchMetals() {
    Promise.all([
      fetchMetalPrice('XAU'),
      fetchMetalPrice('XAG'),
      fetchMetalPrice('XPT')
    ]).then(function (results) {
      var data = {};
      if (results[0] && results[0].price) data.gold = { price: results[0].price, change_pct: results[0].ch || 0 };
      if (results[1] && results[1].price) data.silver = { price: results[1].price, change_pct: results[1].ch || 0 };
      if (results[2] && results[2].price) data.platinum = { price: results[2].price, change_pct: results[2].ch || 0 };
      saveCache(METALS_CACHE_KEY, data);
      updateMetalsUI(data);
    }).catch(function (err) {
      console.warn('GoldAPI fetch error:', err);
      var cached = getCached(METALS_CACHE_KEY);
      if (cached) updateMetalsUI(cached);
    });
  }

  // --- CoinGecko (Crypto) ---
  function fetchCrypto() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd&include_24hr_change=true')
      .then(function (res) { return res.json(); })
      .then(function (result) {
        var data = {};
        if (result.bitcoin) data.btc = { price: result.bitcoin.usd, change_pct: result.bitcoin.usd_24h_change || 0 };
        if (result.ethereum) data.eth = { price: result.ethereum.usd, change_pct: result.ethereum.usd_24h_change || 0 };
        if (result.solana) data.sol = { price: result.solana.usd, change_pct: result.solana.usd_24h_change || 0 };
        if (result.ripple) data.xrp = { price: result.ripple.usd, change_pct: result.ripple.usd_24h_change || 0 };
        saveCache(CRYPTO_CACHE_KEY, data);
        updateCryptoUI(data);
      }).catch(function (err) {
        console.warn('CoinGecko fetch error:', err);
        var cached = getCached(CRYPTO_CACHE_KEY);
        if (cached) updateCryptoUI(cached);
      });
  }

  // Main ticker logic — metals (daily at 6am), crypto (daily at 6am)
  if (isCacheValid(METALS_CACHE_KEY)) {
    updateMetalsUI(getCached(METALS_CACHE_KEY));
  } else {
    fetchMetals();
  }

  if (isCacheValid(CRYPTO_CACHE_KEY)) {
    updateCryptoUI(getCached(CRYPTO_CACHE_KEY));
  } else {
    fetchCrypto();
  }

  // ---------- Mobile Ticker Marquee ----------
  if (window.innerWidth <= 768) {
    var tickerInner = document.getElementById('tickerTrack');
    if (tickerInner) {
      var clone = tickerInner.innerHTML;
      tickerInner.innerHTML = clone + clone;
    }
  }

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
