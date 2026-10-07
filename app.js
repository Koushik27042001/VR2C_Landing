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
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  
  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('active');
    });
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
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--color-gold);"></i> <span>${message}</span>`;
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
            <img src="assets/body_img2.jpeg" style="height: 140px; width: 100%; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" />
            <h4 style="font-size: 0.9rem;">VR2C Care Vital Nutrition</h4>
            <p style="font-size: 0.8rem; color: #C5A059; font-weight: 600;">Step 1: Cleanse & Nourish</p>
          </div>
          <div style="border: 1px solid #EEE; padding: 1rem; border-radius: 8px; width: 200px;">
            <img src="assets/body_img.jpeg" style="height: 140px; width: 100%; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" />
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

  salonInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    salonItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(term)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
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
        <div class="modal-content">
          <button class="modal-close-btn" onclick="closeModal()">&times;</button>
          <div id="modalBody"></div>
        </div>
      `;
      document.body.appendChild(modalOverlay);
    }

    document.getElementById('modalBody').innerHTML = contentHtml;
    modalOverlay.classList.add('active');
  }

  window.closeModal = function() {
    const modalOverlay = document.getElementById('customModalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  };

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
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center;">
          <div style="border-radius: 8px; overflow: hidden; background: #F9F9F9;">
            <img src="${img}" style="width: 100%; height: 380px; object-fit: cover;" />
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

  // Newsletter Form Handler
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    if (input && input.value) {
      showToast('Thank you for joining the VR2C Haircosmetics VIP Circle!');
      input.value = '';
    }
  });

  // Initial cart render
  renderCart();
});
