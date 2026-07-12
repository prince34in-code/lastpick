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
    } catch (error) {
      console.error('Error loading component:', error);
      element.innerHTML = `<p style="color: red; text-align: center;">Error loading footer.</p>`;
    }
  };

  // --- Animations ---
  const animatedElements = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    animatedElements.forEach((el) => observer.observe(el));
  } else {
    animatedElements.forEach((el) => el.classList.add('visible'));
  }

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
    const moqBadge = document.querySelector('.moq-badge-premium');

    const packData = {
      '1pack': {
        price: 40,
        src: 'assets/images/products/bottle-200ml.webp',
        subtitle: 'Per Bottle',
        note: 'Price Reference',
        moqText: 'Minimum Order: 6 Bottles (MOQ)',
        ctaText: 'Shop Now',
        label: 'Single Bottle',
        purchasable: true, // Button is enabled but links to product page
        ctaLink: 'product.html'
      },
      '6pack': {
        price: 240,
        src: 'assets/images/products/pack-6.webp',
        subtitle: '₹40 per bottle',
        note: 'Most Popular',
        ctaText: 'Buy Now',
        label: '6 Bottle Pack',
        purchasable: true,
        ctaLink: 'https://wa.me/919310997076?text=Hello%20I%20would%20like%20to%20buy%20a%206-pack%20of%20LastPick%20Coconut%20Water'
      },
      '12pack': {
        price: 480,
        src: 'assets/images/products/pack-12.webp',
        subtitle: '₹40 per bottle',
        note: 'Best Value',
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
      const textElements = [priceEl, priceSubtitle, priceNote, moqBadge];
      textElements.forEach(el => el && (el.style.opacity = '0'));

      setTimeout(() => {
        if (priceSubtitle) priceSubtitle.innerHTML = data.subtitle || '';
        if (priceNote) priceNote.innerHTML = data.note || '';
        if (data.helperText && priceNote) priceNote.innerHTML += `<br>${data.helperText}`;
        if (moqBadge) {
          moqBadge.textContent = data.moqText || '';
          moqBadge.classList.toggle('visible', !!data.moqText);
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
        packHeading.textContent = `Selected: ${data.label}`;
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
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Load footer content last
  loadComponent('.site-footer', 'footer.html');
});
