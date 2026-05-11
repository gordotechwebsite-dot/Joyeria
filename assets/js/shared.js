/**
 * MicGlier Shared Layout — Injects header, footer, promo badge, WhatsApp, search overlay
 * Include this script on every page. It reads data-page attribute from <body> to mark active nav.
 */
(function () {
  'use strict';

  var page = document.body.getAttribute('data-page') || 'inicio';
  var root = document.body.getAttribute('data-root') || '.';

  function activeClass(p) { return p === page ? ' active' : ''; }

  // Promo badge
  var promoBadge = '<div class="promo-badge" id="promoBadge">' +
    '<span class="promo-badge__label">OBTÉN</span>' +
    '<span class="promo-badge__value">10<small>%</small></span>' +
    '<span class="promo-badge__label">OFF</span>' +
    '<button class="promo-badge__close" id="promoClose" aria-label="Cerrar promoción">&times;</button></div>';

  // Top bar
  var topbar = '<div class="topbar"><div class="topbar__container">' +
    '<div class="topbar__left">' +
    '<a href="tel:+34600000000" class="topbar__link">ATENCIÓN AL CLIENTE +34 600 000 000</a>' +
    '<span class="topbar__divider">|</span>' +
    '<a href="mailto:info@micglierjewelry.com" class="topbar__link">INFO@MICGLIERJEWELRY.COM</a></div>' +
    '<div class="topbar__right">' +
    '<span class="topbar__cta">Llama o escríbenos para atención VIP personalizada</span>' +
    '<button class="topbar__close-btn" id="topbarClose" aria-label="Cerrar barra">&times;</button>' +
    '</div></div></div>';

  // Header
  var header = '<header class="header" id="header"><div class="header__top"><div class="header__top-inner">' +
    '<div class="header__left-group">' +
    '<div class="header__search"><button class="header__search-btn" id="searchToggle" aria-label="Buscar">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' +
    '</button><input type="text" placeholder="Buscar joyas..." class="header__search-input" /></div>' +
    '<nav class="header__nav header__nav--left">' +
    '<a href="' + root + '/colecciones.html" class="nav-link">HOMBRE</a>' +
    '<a href="' + root + '/colecciones.html" class="nav-link">MUJER</a></nav></div>' +
    '<a href="' + root + '/index.html" class="header__logo"><img src="' + root + '/assets/images/logo.png" alt="MicGlier Jewelry" /></a>' +
    '<div class="header__right-group"><nav class="header__nav header__nav--right">' +
    '<a href="' + root + '/servicios.html" class="nav-link">DISEÑO PERSONALIZADO</a>' +
    '<a href="' + root + '/servicios.html" class="nav-link">SERVICIOS</a></nav>' +
    '<div class="header__actions"><a href="' + root + '/contacto.html" class="header__icon-btn" aria-label="Contacto">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
    '<span class="header__icon-label">Contacto</span></a></div></div></div></div>' +
    '<nav class="header__subnav"><div class="header__subnav-inner">' +
    '<a href="' + root + '/colecciones.html" class="subnav-link">Nuevas Llegadas</a>' +
    '<a href="' + root + '/colecciones.html" class="subnav-link">Más Vendidos</a>' +
    '<a href="' + root + '/colecciones.html" class="subnav-link">Anillos</a>' +
    '<a href="' + root + '/colecciones.html" class="subnav-link">Collares</a>' +
    '<a href="' + root + '/colecciones.html" class="subnav-link">Cadenas de Oro</a>' +
    '<a href="' + root + '/colecciones.html" class="subnav-link">Pulseras</a>' +
    '<a href="' + root + '/colecciones.html" class="subnav-link">Pendientes</a>' +
    '<a href="' + root + '/servicios.html" class="subnav-link">Diseño a Medida</a>' +
    '</div></nav>' +
    '<div class="header__ticker"><div class="header__ticker-inner" id="tickerTrack">' +
    '<span class="ticker-item"><span class="ticker-label">Oro<small>(XAU)</small></span> <span class="ticker-value" id="goldPrice">$2,340.50</span> <span class="ticker-change ticker-change--up" id="goldChange">+0.22%</span></span>' +
    '<span class="ticker-item"><span class="ticker-label">Plata<small>(XAG)</small></span> <span class="ticker-value" id="silverPrice">$31.20</span> <span class="ticker-change ticker-change--up" id="silverChange">+1.45%</span></span>' +
    '<span class="ticker-item"><span class="ticker-label">Platino<small>(XPT)</small></span> <span class="ticker-value" id="platinumPrice">$1,045.00</span> <span class="ticker-change ticker-change--up" id="platinumChange">+0.87%</span></span>' +
    '<span class="ticker-divider">|</span>' +
    '<span class="ticker-item"><span class="ticker-label">BTC</span> <span class="ticker-value" id="btcPrice">--</span> <span class="ticker-change" id="btcChange">--</span></span>' +
    '<span class="ticker-item"><span class="ticker-label">ETH</span> <span class="ticker-value" id="ethPrice">--</span> <span class="ticker-change" id="ethChange">--</span></span>' +
    '<span class="ticker-item"><span class="ticker-label">SOL</span> <span class="ticker-value" id="solPrice">--</span> <span class="ticker-change" id="solChange">--</span></span>' +
    '<span class="ticker-item"><span class="ticker-label">XRP</span> <span class="ticker-value" id="xrpPrice">--</span> <span class="ticker-change" id="xrpChange">--</span></span>' +
    '</div></div>' +
    '<button class="header__menu-btn" id="menuToggle" aria-label="Menú"><span></span><span></span><span></span></button>' +
    '<div class="mobile-nav" id="mobileNav">' +
    '<a href="' + root + '/index.html" class="mobile-nav__link' + activeClass('inicio') + '">Inicio</a>' +
    '<a href="' + root + '/colecciones.html" class="mobile-nav__link' + activeClass('colecciones') + '">Colecciones</a>' +
    '<a href="' + root + '/servicios.html" class="mobile-nav__link' + activeClass('servicios') + '">Servicios</a>' +
    '<a href="' + root + '/galeria.html" class="mobile-nav__link' + activeClass('galeria') + '">Galería</a>' +
    '<a href="' + root + '/sobre-nosotros.html" class="mobile-nav__link' + activeClass('sobre-nosotros') + '">Sobre Nosotros</a>' +
    '<a href="' + root + '/contacto.html" class="mobile-nav__link' + activeClass('contacto') + '">Contacto</a>' +
    '</div></header>';

  // Footer
  var footer = '<footer class="footer"><div class="footer__container">' +
    '<p class="footer__slogan" style="text-align:center;padding:32px 0;margin:0;letter-spacing:4px;font-size:0.95rem;color:var(--gold,#c9a84c);">BRIGHT &bull; GLAM &bull; LUXURY</p>' +
    '</div></footer>';

  // WhatsApp
  var whatsapp = '<a href="https://wa.me/34600000000" target="_blank" rel="noopener" class="whatsapp-btn" aria-label="WhatsApp">' +
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>';

  // Search overlay
  var searchOverlay = '<div class="search-overlay" id="searchOverlay"><div class="search-overlay__inner">' +
    '<input type="text" placeholder="Buscar joyas, colecciones..." class="search-overlay__input" autofocus />' +
    '<button class="search-overlay__close" id="searchClose" aria-label="Cerrar búsqueda">&times;</button></div></div>';

  // Inject into page
  var mainContent = document.getElementById('pageContent');
  if (mainContent) {
    mainContent.insertAdjacentHTML('beforebegin', promoBadge + topbar + header);
    mainContent.insertAdjacentHTML('afterend', footer + whatsapp + searchOverlay);
  }
})();
