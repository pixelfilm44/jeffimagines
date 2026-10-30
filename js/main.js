// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll-reveal for sections and cards
const revealTargets = document.querySelectorAll(
  '.game-card, .film-card, .principle, .section-head, .about-inner, .contact-inner'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealTargets.forEach((el) => io.observe(el));

// Short films: swap the thumbnail for the YouTube player on click
document.querySelectorAll('.film-thumb').forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.className = 'film-frame';
    frame.src = `https://www.youtube-nocookie.com/embed/${thumb.dataset.video}?autoplay=1&rel=0`;
    frame.title = thumb.getAttribute('aria-label').replace(/^Play /, '');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    thumb.replaceWith(frame);
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
