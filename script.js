document.addEventListener('DOMContentLoaded', () => {
  // --- Component & Asset Loading ---
  const loadComponent = async (selector, filePath) => {
    const element = document.querySelector(selector);
    if (!element) return;

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Could not fetch ${filePath}`);
      const content = await response.text();
      element.innerHTML = content;
      return element;
    } catch (error) {
      console.error('Error loading component:', error);
      element.innerHTML = `<p style="color: red; text-align: center;">Error loading footer.</p>`;
      return element;
    }
  };

  // --- Animations ---
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  const enableMotionAfterFirstPaint = () => {
    if (prefersReducedMotion()) return;

    const enableMotion = () => {
      document.documentElement.classList.add('motion-ready');
    };

    if ('requestAnimationFrame' in window) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(enableMotion);
      });
      return;
    }

    window.setTimeout(enableMotion, 0);
  };

  const isInViewport = (element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < window.innerHeight;
  };

  const revealObserver = ('IntersectionObserver' in window && !prefersReducedMotion())
    ? new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    )
    : null;

  const observeReveal = (element) => {
    if (!element || element.dataset.motionObserved === 'true') return;
    element.dataset.motionObserved = 'true';

    if (!revealObserver || isInViewport(element)) {
      element.classList.add('visible');
      return;
    }

    revealObserver.observe(element);
  };

  const setStagger = (items) => {
    Array.from(items).forEach((item, index) => {
      item.style.setProperty('--stagger-index', index);
    });
  };

  const prepareAnimations = (root = document) => {
    root.querySelectorAll('.product-details-section .product-grid, .mobile-footer-wrapper').forEach((element) => {
      element.setAttribute('data-animate', '');
    });

    [
      '.product-highlight .section-label, .product-highlight .product-image, .product-highlight .product-eyebrow, .product-highlight .product-heading-link, .product-highlight .product-tagline, .product-highlight .price-wrapper, .product-highlight .button',
      '.product-details-section .product-header > *, .product-details-section .pack-selector, .product-details-section .purchase-controls, .product-details-section .price, .product-details-section .product-info-tabs > *',
      '.product-icons .feature-item',
      '.accordion-item',
      '.gallery-card',
      '.mobile-footer-section, .mobile-footer-row, .mobile-footer-divider, .mobile-footer-brand-section, .mobile-footer-bottom',
      '.mobile-footer-social .social-link-mobile'
    ].forEach((selector) => setStagger(root.querySelectorAll(selector)));

    root.querySelectorAll('[data-animate]').forEach(observeReveal);
  };

  const wrapHeroWords = () => {
    const heroHeading = document.querySelector('.hero h1');
    if (!heroHeading || heroHeading.dataset.motionText === 'true') return;

    const words = heroHeading.textContent.trim().split(/\s+/);
    heroHeading.textContent = '';

    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'hero-word';
      wordSpan.textContent = word;
      wordSpan.style.setProperty('--stagger-index', index);
      heroHeading.appendChild(wordSpan);

      if (index < words.length - 1) {
        heroHeading.appendChild(document.createTextNode(' '));
      }
    });

    heroHeading.dataset.motionText = 'true';
  };

  const initHeroMotion = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    wrapHeroWords();

    if (prefersReducedMotion()) return;

    window.setTimeout(() => {
      hero.classList.add('hero-floating');
    }, 900);

    let pointerFrame = 0;
    const canUsePointerParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (canUsePointerParallax) {
      hero.addEventListener('pointermove', (event) => {
        if (pointerFrame) return;

        pointerFrame = window.requestAnimationFrame(() => {
          const bounds = hero.getBoundingClientRect();
          const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
          const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
          hero.style.setProperty('--hero-pointer-x', `${offsetX.toFixed(2)}px`);
          hero.style.setProperty('--hero-pointer-y', `${offsetY.toFixed(2)}px`);
          pointerFrame = 0;
        });
      }, { passive: true });

      hero.addEventListener('pointerleave', () => {
        hero.style.setProperty('--hero-pointer-x', '0px');
        hero.style.setProperty('--hero-pointer-y', '0px');
      });
    }

    let scrollFrame = 0;
    const updateHeroParallax = () => {
      const bounds = hero.getBoundingClientRect();
      if (bounds.bottom >= 0 && bounds.top <= window.innerHeight) {
        const progress = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height);
        const clamped = Math.max(0, Math.min(1, progress));
        hero.style.setProperty('--hero-parallax-y', `${((clamped - 0.5) * 22).toFixed(2)}px`);
      }
      scrollFrame = 0;
    };

    const requestHeroParallax = () => {
      if (!scrollFrame) {
        scrollFrame = window.requestAnimationFrame(updateHeroParallax);
      }
    };

    requestHeroParallax();
    window.addEventListener('scroll', requestHeroParallax, { passive: true });
    window.addEventListener('resize', requestHeroParallax);
  };

  const addRipple = (event) => {
    if (prefersReducedMotion()) return;

    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const size = Math.max(bounds.width, bounds.height);
    const ripple = document.createElement('span');

    ripple.className = 'tap-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - bounds.left - size / 2}px`;
    ripple.style.top = `${event.clientY - bounds.top - size / 2}px`;

    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  };

  const initRipples = (root = document) => {
    root.querySelectorAll('.button, .subscribe-form button').forEach((button) => {
      if (button.dataset.rippleReady === 'true') return;
      button.dataset.rippleReady = 'true';
      button.addEventListener('pointerdown', addRipple);
    });
  };

  prepareAnimations();
  initHeroMotion();
  initRipples();
  enableMotionAfterFirstPaint();

  // --- Utilities ---
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // --- Mobile Navigation ---
  const menuBtn = document.querySelector('.menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  const closeMenu = () => {
    document.body.classList.remove('nav-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.setAttribute('aria-label', 'Open menu');
  };

  if (menuBtn && primaryNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('scroll', debounce(closeMenu, 100), { passive: true });
    window.addEventListener('resize', debounce(closeMenu, 150));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  // --- Active Navigation Link ---
  const navLinks = document.querySelectorAll('.nav-links a');
  if (navLinks.length > 0) {
    const currentPath = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href').split('/').pop().split('#')[0];
      // Check for product.html or if it's an index link on the index page
      if (currentPath === 'product.html' && linkPath === 'product.html') {
        link.classList.add('active');
      } else if ((currentPath === 'index.html' || currentPath === '') && link.getAttribute('href').includes('index.html')) {
        // A more robust check could be implemented for hash links
      }
    });
  }

  // Product pack selector
  // Run product page specific logic only if on product.html
  if (document.querySelector('.product-details-section')) {
    const packCards = Array.from(document.querySelectorAll('.pack-card'));
    const productImg = document.querySelector('.image-frame img');
    const priceEl = document.querySelector('.price');
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.querySelector('.quantity-btn[data-action="decrease"]');
    const buyNowBtn = document.getElementById('buy-now-btn');
    const packHeading = document.getElementById('pack-heading');
    const priceSubtitle = document.querySelector('.price-subtitle');
    const priceNote = document.querySelector('.price-note');
    const trustBadges = document.querySelector('.trust-badges');
    const productBadge = document.querySelector('.product-page-badge');
    const moqBadge = document.querySelector('.moq-badge-premium');

    const packData = {
      '1pack': {
        price: 40,
        src: 'assets/images/products/bottle-200ml.webp',
        subtitle: 'Per Bottle',
        note: '',
        moqText: '',
        ctaText: 'Shop Now',
        label: 'Single Bottle',
        purchasable: true, // Button is enabled but links to product page
        ctaLink: 'product.html'
      },
      '6pack': {
        price: 240,
        src: 'assets/images/products/pack-6.webp',
        subtitle: '\u20B940 per bottle',
        badgeText: 'Best Seller',
        ctaText: 'Buy Now',
        label: '6 Bottle Pack',
        purchasable: true,
        ctaLink: 'https://wa.me/919310997076?text=Hello%20I%20would%20like%20to%20buy%20a%206-pack%20of%20LastPick%20Coconut%20Water'
      },
      '12pack': {
        price: 480,
        src: 'assets/images/products/pack-12.webp',
        subtitle: '\u20B940 per bottle',
        badgeText: 'Best Value',
        ctaText: 'Buy Now',
        label: '12 Bottle Pack',
        purchasable: true,
        ctaLink: 'https://wa.me/919310997076?text=Hello%20I%20would%20like%20to%20buy%20a%2012-pack%20of%20LastPick%20Coconut%20Water'
      }
    };

    const MIN_QUANTITY = 1;
    const transitionMs = 300;

    const updatePrice = (pack) => {
      const data = packData[pack];
      if (!data) return;
      if (priceEl) {
        priceEl.textContent = `\u20B9${data.price}`;
      }
    };

    const checkQuantity = (quantity) => {
      decreaseBtn.disabled = quantity <= MIN_QUANTITY;
    };

    const updateActivePack = (activeCard) => {
      const pack = activeCard?.dataset?.pack;
      const data = packData[pack];
      if (!data) return;

      // Hide quantity selector for single bottle view
      const quantitySelector = document.querySelector('.quantity-selector');
      if(quantitySelector) quantitySelector.style.display = (pack === '1pack') ? 'none' : 'grid';
      if(trustBadges) trustBadges.style.display = (pack === '1pack') ? 'none' : 'flex';

      // Update cards
      packCards.forEach((card) => {
        const isActive = card === activeCard;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-checked', String(isActive));
        card.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Update UI elements based on the selected pack data
      updatePrice(pack);

      // Animate text changes
      const textElements = [priceEl, priceSubtitle, priceNote, moqBadge, productBadge];
      textElements.forEach(el => el && (el.style.opacity = '0'));

      setTimeout(() => {
        if (priceSubtitle) priceSubtitle.innerHTML = data.subtitle || '';
        if (priceNote) priceNote.innerHTML = data.note || '';
        if (data.helperText && priceNote) priceNote.innerHTML += `<br>${data.helperText}`;
        if (moqBadge) {
          moqBadge.textContent = data.moqText || '';
          moqBadge.classList.toggle('visible', !!data.moqText);
        }

        if (productBadge) {
          productBadge.textContent = data.badgeText || '';
          productBadge.style.opacity = data.badgeText ? '1' : '0';
          productBadge.style.transform = data.badgeText ? 'scale(1)' : 'scale(0.9)';
        }

        textElements.forEach(el => el && (el.style.opacity = '1'));
      }, transitionMs / 2);

      // Update CTA button state and text
      if (buyNowBtn) {
        buyNowBtn.textContent = data.ctaText;
        buyNowBtn.setAttribute('href', data.ctaLink);
      }

      // Announce the change for screen readers
      if (packHeading) {
        packHeading.textContent = 'Choose Your Pack';
      }
    };

    const selectPack = (card) => {
      const newSrc = packData[card?.dataset?.pack]?.src;

      if (!newSrc) return;

      updateActivePack(card);

      if (productImg.getAttribute('src') === newSrc) return;

      productImg.style.opacity = '0'; // Fade out

      window.setTimeout(() => {
        productImg.setAttribute('src', newSrc);
        productImg.style.opacity = '1';
      }, transitionMs);
    };

    packCards.forEach((card, index) => {
      card.setAttribute('tabindex', card.classList.contains('active') ? '0' : '-1');
      card.addEventListener('click', () => selectPack(card));
      card.addEventListener('keydown', (event) => {
        const nextKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';
        const previousKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp';

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectPack(card);
        }

        if (nextKey || previousKey) {
          event.preventDefault();
          const direction = nextKey ? 1 : -1;
          const nextIndex = (index + direction + packCards.length) % packCards.length;
          packCards[nextIndex].focus();
          selectPack(packCards[nextIndex]);
        }
      });
    });

    // Set initial state
    const initialPack = document.querySelector('.pack-card.active');
    if (initialPack) selectPack(initialPack);
    
  }

  // FAQ Accordion
  const accordionGroup = document.querySelector('.accordion-group');
  if (accordionGroup) {
    const items = Array.from(accordionGroup.querySelectorAll('.accordion-item'));

    accordionGroup.addEventListener('click', (event) => {
      const trigger = event.target.closest('.accordion-trigger');
      if (!trigger) return;

      const parentItem = trigger.closest('.accordion-item');
      const panel = parentItem.querySelector('.accordion-panel');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all items
      if (!parentItem.classList.contains('open')) {
        event.preventDefault(); // Prevent default if we are opening, to manage focus
      }

      items.forEach(item => {
        const otherTrigger = item.querySelector('.accordion-trigger');
        const otherPanel = item.querySelector('.accordion-panel');
        if (item !== parentItem && item.classList.contains('open')) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherPanel.style.maxHeight = null;
          otherPanel.style.opacity = '0';
          otherPanel.style.paddingTop = null;
          otherPanel.style.paddingBottom = null;
          item.classList.remove('open');
        }
      });

      // Toggle the clicked accordion
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      panel.style.maxHeight = isExpanded ? null : `${panel.scrollHeight}px`;
      panel.style.opacity = isExpanded ? '0' : '1';      
      panel.style.paddingBottom = isExpanded ? null : '24px';
      parentItem.classList.toggle('open', !isExpanded);
    });
  }

  // --- Footer ---
  const setCurrentYear = (root = document) => {
    const yearSpan = root.querySelector('#current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  };

  setCurrentYear();

  // Load footer content last
  loadComponent('.site-footer', 'footer.html').then((footer) => {
    if (!footer) return;
    setCurrentYear(footer);
    prepareAnimations(footer);
    initRipples(footer);
  });
});
