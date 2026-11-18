(() => {
  'use strict';

  /* Mobile nav */
  const panel = document.querySelector('[data-mobile-nav]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');

  const setOpen = (open) => {
    if (!panel) return;
    panel.dataset.open = open ? 'true' : 'false';
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && closeBtn) closeBtn.focus();
    if (!open && openBtn) openBtn.focus();
  };

  openBtn && openBtn.addEventListener('click', () => setOpen(true));
  closeBtn && closeBtn.addEventListener('click', () => setOpen(false));
  panel && panel.addEventListener('click', (e) => {
    if (e.target === panel || e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel && panel.dataset.open === 'true') setOpen(false);
  });

  /* Reveal on scroll */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window && els.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  /* Reading progress on case pages */
  const progress = document.querySelector('[data-progress]');
  if (progress) {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    update();
    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* Lazy video: load + play when in view, pause when out */
  const lazyVideos = document.querySelectorAll('video[data-lazy-src]');
  if (lazyVideos.length) {
    const load = (v) => {
      if (v.dataset.loaded) return;
      v.src = v.dataset.lazySrc;
      v.dataset.loaded = '1';
      v.load();
    };

    if (!reduce && 'IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (entry.isIntersecting) {
            load(v);
            if (v.hasAttribute('data-manual')) return;
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
          } else {
            v.pause();
          }
        });
      }, { threshold: 0.2, rootMargin: '120px' });
      lazyVideos.forEach((v) => vio.observe(v));
    }

    lazyVideos.forEach((v) => {
      if (v.hasAttribute('controls')) return;
      v.addEventListener('click', () => {
        load(v);
        if (v.paused) {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          v.pause();
        }
      });
    });
  }

  /* YouTube facades: load the player only when clicked */
  document.querySelectorAll('.yt-facade').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.yt;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = btn.getAttribute('aria-label') || 'Campaign film';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      btn.replaceWith(iframe);
    });
  });

  /* Carousels */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;
    const items = [...track.querySelectorAll('.carousel-item')];
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const indexEl = carousel.querySelector('[data-carousel-index]');
    const bar = carousel.querySelector('[data-carousel-bar]');
    if (!items.length) return;

    const step = () => (items[0] ? items[0].getBoundingClientRect().width + 14 : track.clientWidth * 0.8);

    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      const progress = max > 0 ? track.scrollLeft / max : 0;
      if (bar) bar.style.transform = `scaleX(${Math.max(0.04, progress)})`;
      const active = Math.min(items.length, Math.round(track.scrollLeft / step()) + 1);
      if (indexEl) indexEl.textContent = String(active).padStart(2, '0');
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
    };

    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* Current year */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
