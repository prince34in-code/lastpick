document.addEventListener('DOMContentLoaded', async () => {
  // Function to load reusable HTML components
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

  // Wait for the footer to be loaded before running other scripts
  await loadComponent('.site-footer', '_footer.html');

  // Intersection Observer for animations
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

  // Debounce function
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

  // Mobile navigation
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

  // Active navigation link
  const navLinks = document.querySelectorAll('.nav-links a');
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

  // Product pack selector
  // Run product page specific logic only if on product.html
  if (document.querySelector('.product-details-section')) {
    const packCards = Array.from(document.querySelectorAll('.pack-card'));
    const productImg = document.querySelector('.image-frame img');
    const priceEl = document.querySelector('.price');
    const quantityInput = document.getElementById('quantity');
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    const decreaseBtn = document.querySelector('.quantity-btn[data-action="decrease"]');
    const buyNowBtn = document.getElementById('buy-now-btn');
    const packHeading = document.getElementById('pack-heading');

    const packToSrc = {
      '6pack': 'assets/images/products/pack-6.webp',
      '12pack': 'assets/images/products/pack-12.webp',
    };

    const packPrices = {
      '6pack': 240,
      '12pack': 480,
    };

    const MIN_QUANTITY = 1;
    const transitionMs = 300;

    const updatePrice = (pack, quantity) => {
      const packPrice = packPrices[pack];
      if (!packPrice) return;
      const newPrice = packPrice * quantity;
      if (priceEl) {
        priceEl.textContent = `\u20B9${newPrice}`;
      }
    };

    const checkQuantity = (quantity) => {
      decreaseBtn.disabled = quantity <= MIN_QUANTITY;
    };

    const updateActivePack = (activeCard) => {
      const pack = activeCard?.dataset?.pack;

      // Update cards
      packCards.forEach((card) => {
        const isActive = card === activeCard;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-checked', String(isActive));
        card.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      quantityInput.value = MIN_QUANTITY; // Reset quantity to 1 on pack change
      const currentQuantity = parseInt(quantityInput.value, 10);
      updatePrice(pack, currentQuantity);

      // Show the buy now button
      if (buyNowBtn) {
        buyNowBtn.style.opacity = '1';
        buyNowBtn.style.pointerEvents = 'auto';
        buyNowBtn.style.transform = 'translateY(0)';
      }

      // Announce the change for screen readers
      if (packHeading) {
        packHeading.textContent = `Selected: ${activeCard.textContent.trim()}`;
      }
    };

    const selectPack = (card) => {
      const pack = card?.dataset?.pack;
      const newSrc = packToSrc[pack];

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

    // Quantity selector logic
    quantityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        const action = btn.dataset.action;

        if (action === 'increase') {
          currentValue++;
        } else if (action === 'decrease' && currentValue > MIN_QUANTITY) {
          currentValue--;
        }

        quantityInput.value = currentValue;
        checkQuantity(currentValue);

        const activePack = document.querySelector('.pack-card.active').dataset.pack;
        if (activePack) {
          updatePrice(activePack, currentValue);
        }
      });
    });

    quantityInput.addEventListener('change', () => {
        let currentValue = parseInt(quantityInput.value, 10);
        if (isNaN(currentValue) || currentValue < MIN_QUANTITY) {
            currentValue = MIN_QUANTITY;
            quantityInput.value = MIN_QUANTITY;
        }
        checkQuantity(currentValue);
        const activePack = document.querySelector('.pack-card.active').dataset.pack;
        if (activePack) {
          updatePrice(activePack, currentValue);
        }
    });

    // Set initial state
    const initialPack = document.querySelector('.pack-card.active');
    if (initialPack) {
      selectPack(initialPack);
    }
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

  // Set current year in footer
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
