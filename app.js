/**
 * VR2C Haircosmetics - Interactive Client Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize state
  const state = {
    wishlist: new Set(['prod-1']),
    quizStep: 1,
    quizAnswers: {},
    activeCategory: 'all'
  };

  try {
    const savedWishlist = JSON.parse(localStorage.getItem('vr2cWishlist') || 'null');
    if (Array.isArray(savedWishlist)) state.wishlist = new Set(savedWishlist);
  } catch {
    state.wishlist = new Set(['prod-1']);
  }

  // --------------------------------------------------
  // 1. Header Scroll Effect & Mobile Navigation
  // --------------------------------------------------
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    const headerContainer = mobileMenuBtn.closest('.header-container');
    const header = mobileMenuBtn.closest('.main-header');
    let mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (!mobileNavDrawer && headerContainer && header) {
      mobileNavDrawer = document.createElement('nav');
      mobileNavDrawer.className = 'mobile-nav-drawer';
      mobileNavDrawer.id = 'mobileNavDrawer';
      mobileNavDrawer.setAttribute('aria-label', 'Mobile navigation');
      headerContainer.insertAdjacentElement('afterend', mobileNavDrawer);
    }

    if (mobileNavDrawer) {
      mobileMenuBtn.type = 'button';
      mobileMenuBtn.setAttribute('aria-controls', mobileNavDrawer.id);
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileMenuBtn.setAttribute('aria-label', 'Open navigation');
      mobileNavDrawer.replaceChildren();

      document.querySelectorAll('.nav-left, .nav-right').forEach(desktopNav => {
        desktopNav.querySelectorAll(':scope > .nav-dropdown').forEach(dropdown => {
          const primaryLink = dropdown.querySelector(':scope > .nav-link');
          if (!primaryLink) return;

          const group = document.createElement('div');
          group.className = 'mobile-nav-group';
          const headingLink = document.createElement('a');
          headingLink.href = primaryLink.href;
          headingLink.textContent = primaryLink.textContent.trim();
          group.appendChild(headingLink);

          dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            const subLink = document.createElement('a');
            subLink.href = item.href;
            subLink.textContent = item.textContent.trim();
            group.appendChild(subLink);
          });

          mobileNavDrawer.appendChild(group);
        });

        desktopNav.querySelectorAll(':scope > .nav-link').forEach(link => {
          const mobileLink = document.createElement('a');
          mobileLink.href = link.href;
          mobileLink.textContent = link.textContent.trim();
          mobileNavDrawer.appendChild(mobileLink);
        });
      });

      const closeMobileNav = () => {
        mobileNavDrawer.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Open navigation');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      };

      mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileNavDrawer.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
      });

      mobileNavDrawer.addEventListener('click', event => {
        if (event.target.closest('a')) closeMobileNav();
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMobileNav();
      });
    }
  }

  // Cart interactions removed per storefront requirements.

  // --------------------------------------------------
  // 3. Toast Notifications
  // --------------------------------------------------
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = document.createElement('i');
    icon.className = 'fas fa-circle-info';
    icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(icon, text);
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --------------------------------------------------
  // 4. Products Filter & Showcase Tabs
  // --------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const category = e.target.dataset.category;
      productCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  document.querySelectorAll('.product-wishlist-btn').forEach(button => {
    const card = button.closest('.product-card');
    const title = card?.querySelector('.product-title')?.textContent.trim() || 'Product';
    const productId = card?.dataset.id || `product-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (card) card.dataset.id = productId;

    const updateWishlistButton = () => {
      const isSaved = state.wishlist.has(productId);
      button.classList.toggle('active', isSaved);
      button.setAttribute('aria-pressed', String(isSaved));
      button.setAttribute('aria-label', `${isSaved ? 'Remove' : 'Add'} ${title} ${isSaved ? 'from' : 'to'} wishlist`);
      button.title = `${isSaved ? 'Remove from' : 'Add to'} wishlist`;
      const icon = button.querySelector('i');
      if (icon) icon.className = isSaved ? 'fas fa-heart' : 'far fa-heart';
    };

    button.type = 'button';
    updateWishlistButton();
    button.addEventListener('click', () => {
      if (state.wishlist.has(productId)) {
        state.wishlist.delete(productId);
        showToast(`${title} removed from your wishlist.`);
      } else {
        state.wishlist.add(productId);
        showToast(`${title} added to your wishlist.`);
      }
      try {
        localStorage.setItem('vr2cWishlist', JSON.stringify([...state.wishlist]));
      } catch {
        showToast('Wishlist changes will last only for this visit.');
      }
      updateWishlistButton();
    });
  });

  // Product cards intentionally omit purchase buttons per storefront requirements.

  // --------------------------------------------------
  // 5. Interactive Hair Diagnosis Quiz Logic
  // --------------------------------------------------
  const quizSteps = document.querySelectorAll('.quiz-step');
  const progressFill = document.querySelector('.progress-fill');
  const stepCountText = document.querySelector('.step-count');

  function updateQuizStep(step) {
    quizSteps.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`quizStep${step}`);
    if (target) {
      target.classList.add('active');
      state.quizStep = step;

      const progress = (step / 3) * 100;
      if (progressFill) progressFill.style.width = `${progress}%`;
      if (stepCountText) stepCountText.textContent = `STEP ${step} OF 3`;
    }
  }

  // Quiz option selections
  document.querySelectorAll('.quiz-option-card').forEach(option => {
    option.addEventListener('click', (e) => {
      const parent = e.currentTarget.closest('.quiz-options-grid');
      parent.querySelectorAll('.quiz-option-card').forEach(o => o.classList.remove('selected'));
      e.currentTarget.classList.add('selected');

      const stepNum = parseInt(e.currentTarget.dataset.step);
      state.quizAnswers[`step${stepNum}`] = e.currentTarget.dataset.value;
    });
  });

  document.querySelectorAll('.quiz-next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.quizStep < 3) {
        updateQuizStep(state.quizStep + 1);
      } else {
        // Show result modal
        showQuizResultModal();
      }
    });
  });

  document.querySelectorAll('.quiz-prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.quizStep > 1) {
        updateQuizStep(state.quizStep - 1);
      }
    });
  });

  function showQuizResultModal() {
    const hairType = state.quizAnswers.step1 || 'Straight';
    const concern = state.quizAnswers.step2 || 'Dryness';
    
    openCustomModal(`
      <div style="text-align: center; padding: 1rem 0;">
        <span class="section-subtitle">YOUR PERSONALIZED VR2C DIAGNOSIS</span>
        <h2 style="font-size: 2.2rem; margin-bottom: 1rem;">Targeted Routine Prescribed</h2>
        <p style="color: #666; margin-bottom: 2rem;">Based on your <strong>${hairType}</strong> hair profile with primary concern for <strong>${concern}</strong>, our VR2C hair scientists recommend:</p>
        
        <div style="display: flex; gap: 1.5rem; justify-content: center; margin-bottom: 2rem;">
          <div style="border: 1px solid #EEE; padding: 1rem; border-radius: 8px; width: 200px;">
            <img src="assets/1000134054.png" alt="VR2C volumizing shampoo" style="height: 140px; width: 100%; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" />
            <h4 style="font-size: 0.9rem;">VR2C Care Vital Nutrition</h4>
            <p style="font-size: 0.8rem; color: #C5A059; font-weight: 600;">Step 1: Cleanse & Nourish</p>
          </div>
          <div style="border: 1px solid #EEE; padding: 1rem; border-radius: 8px; width: 200px;">
            <img src="assets/1000134052.png" alt="VR2C Moroccan argan oil treatment" style="height: 140px; width: 100%; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" />
            <h4 style="font-size: 0.9rem;">VR2C Care Long & Strong</h4>
            <p style="font-size: 0.8rem; color: #C5A059; font-weight: 600;">Step 2: Fortify & Protect</p>
          </div>
        </div>
      </div>
    `);
  }

  // --------------------------------------------------
  // 6. Interactive Before & After Drag Slider
  // --------------------------------------------------
  const sliderWrapper = document.getElementById('comparisonWrapper');
  const overlayImg = document.getElementById('comparisonOverlay');
  const sliderHandle = document.getElementById('sliderHandle');
  const beforeImg = document.getElementById('comparisonBeforeImg');

  if (sliderWrapper && overlayImg && sliderHandle) {
    let isDragging = false;

    // Dynamically sync before image size with wrapper container for crisp alignment
    function syncOverlayImageSize() {
      const rect = sliderWrapper.getBoundingClientRect();
      if (beforeImg && rect.width > 0) {
        beforeImg.style.width = `${rect.width}px`;
        beforeImg.style.height = `${rect.height}px`;
      }
    }

    syncOverlayImageSize();
    window.addEventListener('resize', syncOverlayImageSize);

    function moveSlider(clientX) {
      const rect = sliderWrapper.getBoundingClientRect();
      let x = clientX - rect.left;
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;

      const percentage = (x / rect.width) * 100;
      overlayImg.style.width = `${percentage}%`;
      sliderHandle.style.left = `${percentage}%`;
      sliderWrapper.setAttribute('aria-valuenow', Math.round(percentage));
    }

    sliderWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      syncOverlayImageSize();
      moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', (e) => {
      if (isDragging) moveSlider(e.clientX);
    });

    // Touch support for mobile
    sliderWrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      syncOverlayImageSize();
      moveSlider(e.touches[0].clientX);
    });
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', (e) => {
      if (isDragging) moveSlider(e.touches[0].clientX);
    });

    // Keyboard navigation (Arrow keys)
    sliderWrapper.addEventListener('keydown', (e) => {
      const currentVal = parseFloat(sliderWrapper.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newVal = Math.max(0, currentVal - 4);
        const rect = sliderWrapper.getBoundingClientRect();
        moveSlider(rect.left + (newVal / 100) * rect.width);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newVal = Math.min(100, currentVal + 4);
        const rect = sliderWrapper.getBoundingClientRect();
        moveSlider(rect.left + (newVal / 100) * rect.width);
      }
    });

    // Intro hint animation on scroll into view
    let hasAnimated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          syncOverlayImageSize();
          
          let startPercent = 50;
          let targetPercent = 68;
          let step = 0;

          function hintAnimation() {
            step++;
            if (step <= 25) {
              const current = startPercent + (targetPercent - startPercent) * (step / 25);
              const rect = sliderWrapper.getBoundingClientRect();
              moveSlider(rect.left + (current / 100) * rect.width);
              requestAnimationFrame(hintAnimation);
            } else if (step <= 50) {
              const current = targetPercent - (targetPercent - 50) * ((step - 25) / 25);
              const rect = sliderWrapper.getBoundingClientRect();
              moveSlider(rect.left + (current / 100) * rect.width);
              requestAnimationFrame(hintAnimation);
            }
          }
          setTimeout(hintAnimation, 400);
        }
      });
    }, { threshold: 0.4 });
    observer.observe(sliderWrapper);
  }

  // --------------------------------------------------
  // 7. Salon Finder Live Search Filter
  // --------------------------------------------------
  const salonInput = document.getElementById('salonSearchInput');
  const salonItems = document.querySelectorAll('.salon-item');
  const salonSearchForm = document.getElementById('salonSearchForm');
  const salonSearchStatus = document.getElementById('salonSearchStatus');

  function filterSalons() {
    const term = salonInput?.value.toLowerCase().trim() || '';
    let visibleCount = 0;
    salonItems.forEach(item => {
      const isMatch = item.textContent.toLowerCase().includes(term);
      item.hidden = !isMatch;
      if (isMatch) visibleCount += 1;
    });
    if (salonSearchStatus) {
      salonSearchStatus.textContent = visibleCount
        ? `${visibleCount} salon${visibleCount === 1 ? '' : 's'} found.`
        : 'No salons match that search. Try another city or postal code.';
    }
  }

  salonInput?.addEventListener('input', filterSalons);
  salonSearchForm?.addEventListener('submit', event => {
    event.preventDefault();
    filterSalons();
  });

  // --------------------------------------------------
  // 8. Custom Modal Utility
  // --------------------------------------------------
  function openCustomModal(contentHtml) {
    let modalOverlay = document.getElementById('customModalOverlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'customModalOverlay';
      modalOverlay.className = 'modal-overlay';
      modalOverlay.innerHTML = `
        <div class="modal-content" role="dialog" aria-modal="true">
          <button type="button" class="modal-close-btn" aria-label="Close dialog">&times;</button>
          <div id="modalBody"></div>
        </div>
      `;
      document.body.appendChild(modalOverlay);
    }

    document.getElementById('modalBody').innerHTML = contentHtml;
    const dialogTitle = document.querySelector('#modalBody h2');
    const dialog = modalOverlay.querySelector('.modal-content');
    if (dialogTitle && dialog) {
      dialogTitle.id = 'modalTitle';
      dialog.setAttribute('aria-labelledby', 'modalTitle');
    }
    modalOverlay.classList.add('active');
    modalOverlay.querySelector('.modal-close-btn')?.focus();
  }

  window.closeModal = function() {
    const modalOverlay = document.getElementById('customModalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  };

  document.addEventListener('click', event => {
    const modalOverlay = document.getElementById('customModalOverlay');
    if (event.target === modalOverlay) window.closeModal();
    if (event.target.closest('.modal-close-btn')) window.closeModal();
    if (event.target.closest('.social-icon[href="#"]')) {
      event.preventDefault();
      showToast('This social profile link has not been connected yet.');
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') window.closeModal();
  });

  // Quick View triggers
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.currentTarget.closest('.product-card');
      if (!card) return;

      const title = card.querySelector('.product-title').textContent;
      const img = card.querySelector('.product-img').src;
      const category = card.querySelector('.product-category').textContent;

      openCustomModal(`
        <div class="quick-view-layout">
          <div style="border-radius: 8px; overflow: hidden; background: #F9F9F9;">
            <img src="${img}" alt="${title}" />
          </div>
          <div>
            <span style="color: var(--color-gold); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">${category}</span>
            <h2 style="font-size: 1.8rem; margin: 0.4rem 0 0.8rem 0;">${title}</h2>
            <p style="color: #666; font-size: 0.9375rem; margin-bottom: 1.5rem; line-height: 1.6;">
              Formulated with VR2C Essential Minerals, Organic Silanols, and Centella Asiatica to restore inner vitality and structural shine to high-demand hair textures.
            </p>
          </div>
        </div>
      `);
    });
  });

  document.querySelectorAll('form.luxury-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const subject = form.closest('.feedback-card')?.querySelector('h3')?.textContent.trim() || 'VR2C enquiry';
      const body = [...form.querySelectorAll('input:not([readonly]), textarea')]
        .map(field => {
          const label = field.closest('.form-field')?.querySelector('label')?.textContent.trim() || 'Message';
          return `${label}: ${field.value.trim()}`;
        })
        .join('\n\n');
      window.location.href = `mailto:hello@vr2c.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast('Your email app should open with a draft. Press Send there to deliver it.');
    });
  });

  // Newsletter Form Handler
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    if (input && input.value) {
      showToast('Newsletter signup is not connected yet. Please contact hello@vr2c.com to subscribe.');
    }
  });
});
