document.addEventListener('DOMContentLoaded', () => {
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

    window.addEventListener('scroll', closeMenu, { passive: true });
    window.addEventListener('resize', closeMenu);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  // Product pack selector
  const packCards = Array.from(document.querySelectorAll('.pack-card'));
  const productImg = document.querySelector('.image-frame img');
  const priceEl = document.querySelector('.price');

  const packToSrc = {
    '200ml': 'assets/images/products/bottle-200ml.webp',
    '6pack': 'assets/images/products/pack-6.webp',
    '12pack': 'assets/images/products/pack-12.webp',
  };

  const packMultiplier = {
    '200ml': 1,
    '6pack': 6,
    '12pack': 12,
  };

  const basePrice = 40;
  const transitionMs = 220;

  if (!productImg || packCards.length === 0) {
    return; // Exit if essential elements are not on the page
  }

  const updateActivePack = (activeCard) => {
    packCards.forEach((card) => {
      const isActive = card === activeCard;
      card.classList.toggle('active', isActive);
      card.setAttribute('aria-checked', String(isActive));
      card.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    const pack = activeCard?.dataset?.pack;
    const multiplier = packMultiplier[pack] || 1;

    if (priceEl) {
      priceEl.textContent = `\u20B9${basePrice * multiplier}`;
    }
  };

  const selectPack = (card) => {
    const pack = card?.dataset?.pack;
    const newSrc = packToSrc[pack];

    if (!newSrc) {
      return;
    }

    updateActivePack(card);

    if (productImg.getAttribute('src') === newSrc) {
      return;
    }

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
        packCards.forEach((c, i) => c.setAttribute('tabindex', i === nextIndex ? '0' : '-1'));
        packCards[nextIndex].focus();
        selectPack(packCards[nextIndex]);
      }
    });
  });

  const defaultCard = packCards.find((card) => card.classList.contains('active')) || packCards[0];
  selectPack(defaultCard);
});
