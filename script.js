const animatedElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

animatedElements.forEach((el) => observer.observe(el));

// Pack selector: switch large product image without reloading
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle: show/hide compact nav when menu button is used
  const menuBtn = document.querySelector('.menu-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (menuBtn && primaryNav) {
    menuBtn.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  const packCards = Array.from(document.querySelectorAll('.pack-card'));
  const productImg = document.querySelector('.image-frame img');
  const packToSrc = {
    '200ml': 'assets/images/products/bottle-200ml.png',
    '6pack': 'assets/images/products/pack-6.png',
    '12pack': 'assets/images/products/pack-12.png'
  };

  const priceEl = document.querySelector('.price');
  const basePrice = 40; // ₹40 per 200ml bottle
  const packMultiplier = {
    '200ml': 1,
    '6pack': 6,
    '12pack': 12
  };

  if (!productImg || packCards.length === 0) return;

  const transitionMs = 240; // matches CSS ~200-300ms

  function setActive(card) {
    packCards.forEach((c) => {
      const active = c === card;
      c.classList.toggle('active', active);
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // update price display based on active card
    if (priceEl && card && card.dataset && card.dataset.pack) {
      const mult = packMultiplier[card.dataset.pack] || 1;
      priceEl.textContent = `₹${basePrice * mult}`;
    }
  }

  packCards.forEach((card) => {
    card.addEventListener('click', () => {
      const pack = card.dataset.pack;
      const newSrc = packToSrc[pack];
      if (!newSrc) return;

      // if already active and src already set, do nothing
      if (card.classList.contains('active') && productImg.getAttribute('src') === newSrc) return;

      setActive(card);

      // fade out, swap src, fade in
      productImg.style.opacity = '0';
      setTimeout(() => {
        productImg.setAttribute('src', newSrc);
        productImg.style.opacity = '1';
      }, transitionMs);
    });
    // allow keyboard activation
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Initialize price/image according to default active card (200ml)
  const defaultCard = packCards.find(c => c.classList.contains('active')) || packCards[0];
  if (defaultCard) {
    // ensure price shows correct value
    const mult = packMultiplier[defaultCard.dataset.pack] || 1;
    if (priceEl) priceEl.textContent = `₹${basePrice * mult}`;
    // ensure product image matches active
    const initialSrc = packToSrc[defaultCard.dataset.pack];
    if (initialSrc && productImg.getAttribute('src') !== initialSrc) {
      productImg.setAttribute('src', initialSrc);
    }
  }
});
