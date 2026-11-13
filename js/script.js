(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  const backToTop = document.querySelector('.back-to-top');
  const form = document.querySelector('#enquiry-form');
  const status = document.querySelector('#form-status');
  const dialog = document.querySelector('.project-dialog');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const savedTheme = localStorage.getItem('emril-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  updateThemeButton();

  themeToggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    localStorage.setItem('emril-theme', theme);
    updateThemeButton();
  });

  function updateThemeButton() {
    const isDark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    themeToggle.title = `Switch to ${isDark ? 'light' : 'dark'} theme`;
    document.querySelectorAll('.brand-mark img').forEach((logo) => {
      logo.dataset.lightSrc ??= logo.getAttribute('src');
      logo.src = isDark ? new URL('logo-dark.png', logo.src).href : logo.dataset.lightSrc;
    });
    themeToggle.innerHTML = isDark
      ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
      : '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"/></svg>';
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('is-open', !isOpen);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      navigation.classList.remove('is-open');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      navigation.classList.remove('is-open');
      menuToggle.focus();
    }
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  function updateScrollControls() {
    backToTop.classList.toggle('is-visible', window.scrollY > 560);
  }
  window.addEventListener('scroll', updateScrollControls, { passive: true });
  updateScrollControls();

  const heroCarousel = document.querySelector('.hero-media')?.parentElement;
  const heroImages = heroCarousel?.querySelectorAll('.hero-image');
  const heroDots = heroCarousel?.querySelectorAll('[data-hero-slide]');
  const heroControls = heroCarousel?.querySelector('.hero-carousel-ui');
  if (heroCarousel && heroImages?.length && heroDots?.length && heroControls) {
    const sceneTitle = heroCarousel.querySelector('#hero-scene-title');
    const heroDescription = heroCarousel.querySelector('#hero-description');
    const photoCredit = heroCarousel.querySelector('#hero-photo-credit');
    const currentCount = heroCarousel.querySelector('#hero-slide-current');
    const pauseButton = heroCarousel.querySelector('[data-hero-toggle]');
    const slides = [
      {
        title: 'Grain silos & storage',
        description: 'Industrial silo fabrication, installation and erection for flour mills and grain-handling facilities.',
        credit: 'Image supplied for the Embril website'
      },
      {
        title: 'Flour milling machinery',
        description: 'Machinery fabrication, installation and maintenance for flour-milling operations.',
        credit: 'Image supplied for the Embril website'
      },
      {
        title: 'Scaffolding & structural work',
        description: 'Scaffolding erection and dismantling for construction and industrial projects.',
        credit: 'Image supplied for the Embril website'
      }
    ];
    let activeSlide = 0;
    let autoplayPaused = reducedMotion;
    let autoplayTimer;
    let touchStartX = null;

    function showSlide(index) {
      activeSlide = (index + slides.length) % slides.length;
      heroImages.forEach((image, imageIndex) => {
        const isActive = imageIndex === activeSlide;
        image.classList.toggle('is-active', isActive);
        image.setAttribute('aria-hidden', String(!isActive));
      });
      heroDots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeSlide;
        dot.classList.toggle('is-active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      sceneTitle.textContent = slides[activeSlide].title;
      heroDescription.textContent = slides[activeSlide].description;
      photoCredit.textContent = slides[activeSlide].credit;
      currentCount.textContent = String(activeSlide + 1).padStart(2, '0');
      startAutoplay();
    }

    function startAutoplay() {
      clearInterval(autoplayTimer);
      if (autoplayPaused || document.hidden) return;
      autoplayTimer = setInterval(() => showSlide(activeSlide + 1), 6000);
    }

    function updatePauseButton() {
      pauseButton.setAttribute('aria-pressed', String(autoplayPaused));
      pauseButton.setAttribute('aria-label', autoplayPaused ? 'Start automatic image changes' : 'Pause automatic image changes');
      pauseButton.querySelector('span').textContent = autoplayPaused ? '▶' : 'Ⅱ';
      heroControls.classList.toggle('is-paused', autoplayPaused);
    }

    heroCarousel.querySelector('[data-hero-prev]').addEventListener('click', () => showSlide(activeSlide - 1));
    heroCarousel.querySelector('[data-hero-next]').addEventListener('click', () => showSlide(activeSlide + 1));
    pauseButton.addEventListener('click', () => {
      autoplayPaused = !autoplayPaused;
      updatePauseButton();
      startAutoplay();
    });
    heroDots.forEach((dot) => dot.addEventListener('click', () => showSlide(Number(dot.dataset.heroSlide))));
    heroCarousel.addEventListener('keydown', (event) => {
      if (!event.target.closest('.hero-carousel-ui')) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(activeSlide - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(activeSlide + 1);
      }
    });
    heroCarousel.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') touchStartX = event.clientX;
    });
    heroCarousel.addEventListener('pointerup', (event) => {
      if (touchStartX === null) return;
      const distance = event.clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) > 55) showSlide(activeSlide + (distance < 0 ? 1 : -1));
    });
    document.addEventListener('visibilitychange', startAutoplay);
    updatePauseButton();
    startAutoplay();
  }

  document.querySelectorAll('.filter-button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('.filter-button.is-active')?.classList.remove('is-active');
      document.querySelector('.filter-button[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
      const filter = button.dataset.filter;
      document.querySelectorAll('.project-card').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });

  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (!dialog) return;
      const image = card.querySelector('img');
      dialog.querySelector('img').src = image.src;
      dialog.querySelector('img').alt = image.alt;
      dialog.querySelector('h2').textContent = card.dataset.title;
      dialog.querySelector('div > p:not(.eyebrow)').textContent = card.dataset.description;
      dialog.showModal();
    });
  });
  if (dialog) {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    status.classList.remove('is-error', 'is-success');
    if (!form.reportValidity()) {
      status.textContent = 'Please complete the required fields with valid details.';
      status.classList.add('is-error');
      return;
    }

    const endpoint = form.dataset.endpoint?.trim();
    if (endpoint) {
      const submitButton = form.querySelector('[type="submit"]');
      submitButton.disabled = true;
      submitButton.firstChild.textContent = 'Sending… ';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then((response) => {
          if (!response.ok) throw new Error(`Enquiry service returned ${response.status}`);
          form.reset();
          status.textContent = 'Thank you. Your enquiry has been sent.';
          status.classList.add('is-success');
        })
        .catch(() => {
          status.textContent = 'We could not send your enquiry. Please try again later or contact Embril directly.';
          status.classList.add('is-error');
        })
        .finally(() => {
          submitButton.disabled = false;
          submitButton.firstChild.textContent = 'Continue by email ';
        });
      return;
    }

    const email = form.dataset.email?.trim();
    if (!email) {
      status.textContent = 'Enquiry delivery is not configured. Please contact Embril directly.';
      status.classList.add('is-error');
      return;
    }

    const values = new FormData(form);
    const subject = `[Embril website enquiry] ${values.get('service')} — ${values.get('name')}`;
    const body = [
      `Full name: ${values.get('name')}`,
      `Company: ${values.get('company') || 'Not provided'}`,
      `Email: ${values.get('email')}`,
      `Phone: ${values.get('phone') || 'Not provided'}`,
      `Service required: ${values.get('service')}`,
      `Project location: ${values.get('location') || 'Not provided'}`,
      '',
      'Project description:',
      values.get('description')
    ].join('\n');
    status.textContent = `Your email app should open a draft addressed to ${email}. Review and send it to complete delivery.`;
    status.classList.add('is-success');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  document.querySelector('#current-year').textContent = String(new Date().getFullYear());
})();
