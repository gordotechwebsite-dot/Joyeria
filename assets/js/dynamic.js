/**
 * MicGlier Dynamic Content Loader
 * Fetches site data from backend API and updates the page.
 * Falls back gracefully to hardcoded HTML if API is unavailable.
 */
(function () {
  'use strict';

  var API_BASE = window.MICGLIER_API || '';
  var API_HEADERS = {};

  if (!API_BASE) return; // No API configured, use static content

  // Parse basic auth from URL if present
  try {
    var u = new URL(API_BASE);
    if (u.username) {
      API_HEADERS['Authorization'] = 'Basic ' + btoa(u.username + ':' + u.password);
      API_BASE = u.origin;
    }
  } catch (e) { /* relative URL, no auth needed */ }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  function productCardHTML(p) {
    var priceHTML = '';
    if (p.sale_price) {
      priceHTML = '<span class="price-sale">\u20ac' + p.price.toLocaleString() + '</span> \u20ac' + p.sale_price.toLocaleString();
    } else {
      priceHTML = '\u20ac' + p.price.toLocaleString();
    }
    return '<div class="product-card">' +
      (p.material ? '<div class="product-card__badge' + (p.sale_price ? ' sale' : '') + '">' + (p.sale_price ? 'Sale' : esc(p.material)) + '</div>' : '') +
      '<div class="product-card__image"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" /></div>' +
      '<div class="product-card__info"><h3>' + esc(p.name) + '</h3>' +
      '<span class="product-card__price">' + priceHTML + '</span></div></div>';
  }

  fetch(API_BASE + '/api/public/site', { headers: API_HEADERS })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var settings = data.settings || {};
      var products = data.products || [];
      var services = data.services || [];
      var testimonials = data.testimonials || [];
      var gallery = data.gallery || [];
      var promotions = data.promotions || [];
      var categories = data.categories || [];

      // --- Promo Badge ---
      var promo = promotions[0];
      var badge = document.getElementById('promoBadge');
      if (badge && promo) {
        if (!promo.badge_visible) {
          badge.style.display = 'none';
        } else {
          var parts = (promo.text || '').split(' ');
          var labels = badge.querySelectorAll('.promo-badge__label');
          var val = badge.querySelector('.promo-badge__value');
          if (labels.length >= 2 && val) {
            labels[0].textContent = parts[0] || '';
            val.innerHTML = promo.discount_percent + '<small>%</small>';
            labels[1].textContent = parts.slice(1).join(' ') || 'OFF';
          }
        }
      }

      // --- Top Bar ---
      if (promo) {
        var topbarCTA = document.querySelector('.topbar__cta');
        if (topbarCTA && promo.topbar_text) topbarCTA.textContent = promo.topbar_text;
        var topbar = document.querySelector('.topbar');
        if (topbar && !promo.topbar_visible) topbar.style.display = 'none';
      }

      // --- Contact Info (topbar) ---
      var topPhone = document.querySelector('.topbar__left a[href^="tel:"]');
      if (topPhone && settings.phone) {
        topPhone.href = 'tel:' + settings.phone.replace(/\s/g, '');
        topPhone.textContent = 'ATENCI\u00D3N AL CLIENTE ' + settings.phone;
      }
      var topEmail = document.querySelector('.topbar__left a[href^="mailto:"]');
      if (topEmail && settings.email) {
        topEmail.href = 'mailto:' + settings.email;
        topEmail.textContent = settings.email.toUpperCase();
      }

      // --- Hero ---
      if (settings.hero_title) {
        var heroTitle = document.querySelector('.hero__title');
        if (heroTitle) {
          var lines = settings.hero_title.split('\\n');
          heroTitle.innerHTML = esc(lines[0]) + (lines[1] ? '<br>' + esc(lines[1]).replace('Barcelona', '<span class="text-gold">Barcelona</span>') : '');
        }
      }
      if (settings.hero_subtitle) {
        var heroDesc = document.querySelector('.hero__desc');
        if (heroDesc) heroDesc.textContent = settings.hero_subtitle;
      }
      if (settings.hero_image) {
        var heroImg = document.querySelector('.hero__image');
        if (heroImg) heroImg.src = settings.hero_image;
      }

      // --- Subnav (categories) ---
      var subnav = document.querySelector('.header__subnav-inner');
      if (subnav && categories.length) {
        var subHTML = '<a href="#colecciones" class="subnav-link">Nuevas Llegadas</a>' +
          '<a href="#colecciones" class="subnav-link">M\u00e1s Vendidos</a>';
        categories.forEach(function (c) {
          subHTML += '<a href="#colecciones" class="subnav-link">' + esc(c.name) + '</a>';
        });
        subHTML += '<a href="#personalizado" class="subnav-link">Dise\u00f1o a Medida</a>';
        subnav.innerHTML = subHTML;
      }

      // --- Featured Products (custom carousel) ---
      var featuredProducts = products.filter(function (p) { return p.featured; });
      var customTrack = document.getElementById('customTrack');
      if (customTrack && featuredProducts.length) {
        customTrack.innerHTML = featuredProducts.map(productCardHTML).join('');
      }

      // --- Bestsellers ---
      var bestProducts = products.filter(function (p) { return p.bestseller; });
      var bestTrack = document.getElementById('bestsellersTrack');
      if (bestTrack && bestProducts.length) {
        bestTrack.innerHTML = bestProducts.map(productCardHTML).join('');
      }

      // --- Category Grids (Anillos, Cadenas) ---
      var grids = document.querySelectorAll('.products-grid');
      var catSections = document.querySelectorAll('.products-section--alt, .products-section:not(.products-section--alt)');
      // Build products by category
      if (categories.length >= 2) {
        // Find anillos and cadenas/collares
        var anillosCat = categories.find(function (c) { return c.slug === 'anillos'; });
        var cadenasCat = categories.find(function (c) { return c.slug === 'cadenas-de-oro' || c.slug === 'collares'; });
        if (grids[0] && anillosCat) {
          var anillosProducts = products.filter(function (p) { return p.category_id === anillosCat.id; }).slice(0, 4);
          if (anillosProducts.length) grids[0].innerHTML = anillosProducts.map(productCardHTML).join('');
        }
        if (grids[1] && cadenasCat) {
          var cadenasProducts = products.filter(function (p) { return p.category_id === cadenasCat.id; }).slice(0, 4);
          if (cadenasProducts.length) grids[1].innerHTML = cadenasProducts.map(productCardHTML).join('');
        }
      }

      // --- Services ---
      var servicesGrid = document.querySelector('.services__grid');
      if (servicesGrid && services.length) {
        var icons = {
          gem: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
          tools: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
          pencil: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>'
        };
        servicesGrid.innerHTML = services.map(function (s) {
          return '<div class="service-card" data-animate="fade-up">' +
            '<div class="service-card__icon">' + (icons[s.icon] || icons.gem) + '</div>' +
            '<h3 class="service-card__title">' + esc(s.title) + '</h3>' +
            '<p class="service-card__desc">' + esc(s.description) + '</p>' +
            '<a href="#contacto" class="service-card__link">Consultar &rarr;</a></div>';
        }).join('');
      }

      // --- Gallery ---
      var galleryGrid = document.querySelector('.gallery__grid');
      if (galleryGrid && gallery.length) {
        galleryGrid.innerHTML = gallery.map(function (g, i) {
          var cls = (i === 1 || i === 4) ? 'gallery__item gallery__item--wide' : 'gallery__item';
          return '<div class="' + cls + '"><img src="' + esc(g.image) + '" alt="' + esc(g.alt || 'Galer\u00eda MicGlier') + '" loading="lazy" /></div>';
        }).join('');
      }

      // --- Testimonials ---
      var testGrid = document.querySelector('.testimonials__grid');
      if (testGrid && testimonials.length) {
        testGrid.innerHTML = testimonials.map(function (t) {
          return '<div class="testimonial-card" data-animate="fade-up">' +
            '<div class="testimonial-card__stars">' + '\u2733'.repeat(0) + '\u2605'.repeat(t.rating) + '</div>' +
            '<p class="testimonial-card__text">\u201c' + esc(t.text) + '\u201d</p>' +
            '<div class="testimonial-card__author"><strong>' + esc(t.name) + '</strong><span>Barcelona</span></div></div>';
        }).join('');
      }

      // --- About ---
      if (settings.about_text) {
        var aboutDesc = document.querySelectorAll('.about__desc');
        if (aboutDesc.length) {
          var paras = settings.about_text.split('\n');
          aboutDesc[0].textContent = paras[0] || '';
          if (aboutDesc[1] && paras[1]) aboutDesc[1].textContent = paras[1];
        }
      }
      if (settings.about_image) {
        var aboutImg = document.querySelector('.about__image img');
        if (aboutImg) aboutImg.src = settings.about_image;
      }

      // --- Contact ---
      var contactPhone = document.querySelector('.contact__details a[href^="tel:"]');
      if (contactPhone && settings.phone) {
        contactPhone.href = 'tel:' + settings.phone.replace(/\s/g, '');
        contactPhone.textContent = settings.phone;
      }
      var contactEmail = document.querySelector('.contact__details a[href^="mailto:"]');
      if (contactEmail && settings.email) {
        contactEmail.href = 'mailto:' + settings.email;
        contactEmail.textContent = settings.email;
      }
      var contactAddr = document.querySelector('.contact__detail:first-child span');
      if (contactAddr && settings.address) contactAddr.textContent = settings.address;

      // --- WhatsApp ---
      if (settings.whatsapp) {
        var waBtn = document.querySelector('.whatsapp-btn');
        if (waBtn) waBtn.href = 'https://wa.me/' + settings.whatsapp;
        var heroPhone = document.querySelector('.hero__buttons a[href^="tel:"]');
        if (heroPhone && settings.phone) heroPhone.href = 'tel:' + settings.phone.replace(/\s/g, '');
      }
    })
    .catch(function (err) {
      console.warn('MicGlier API unavailable, using static content:', err.message);
    });
})();
