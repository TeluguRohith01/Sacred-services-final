// premium.js
// Externalized logic for about-llc.html to comply with CSP and enhance interactions

(function(){
  // Select plan -> store and redirect to login with query param
  function selectPlan(planType) {
    try { localStorage.setItem('selectedPlan', planType); } catch(_) {}
    window.location.href = 'login.html?plan=' + encodeURIComponent(planType);
  }
  window.selectPlan = selectPlan;

  // Feature modal logic
  function openFeatureModal(featureType) {
    const modal = document.getElementById('featureModal');
    const modalContent = document.getElementById('modalContent');
    if (!modal || !modalContent) return;

    const blocks = getFeatureBlocks();
    if (!blocks[featureType]) return;
    modalContent.innerHTML = blocks[featureType];
    modal.style.display = 'block';
  }
  function closeFeatureModal() {
    const modal = document.getElementById('featureModal');
    if (modal) modal.style.display = 'none';
  }
  window.openFeatureModal = openFeatureModal;
  window.closeFeatureModal = closeFeatureModal;

  function getFeatureBlocks() {
    return {
      chanting: `
        <h3 style="color: #FFD700; margin-bottom: 1rem;">🎵 Personalized Chanting</h3>
        <p style="margin-bottom: 1rem;">Experience the power of personalized mantras and chanting sessions designed specifically for you.</p>
        <h4 style="color: #FFD700; margin: 1.5rem 0 0.5rem 0;">What's Included:</h4>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
          <li>Daily chanting of your name during sacred rituals</li>
          <li>Customized mantras based on your birth details</li>
          <li>High-quality audio recordings of each session</li>
          <li>Sanskrit pronunciation guide</li>
          <li>Personalized blessing certificates</li>
        </ul>
        <h4 style="color: #FFD700; margin: 1.5rem 0 0.5rem 0;">Benefits:</h4>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
          <li>Positive energy and spiritual vibrations</li>
          <li>Enhanced meditation and mindfulness</li>
          <li>Stress relief and mental peace</li>
          <li>Spiritual growth and connection</li>
        </ul>
        <div style="text-align: center; margin-top: 2rem;">
          <button data-select-plan="premium" style="background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; border: none; padding: 12px 24px; border-radius: 20px; font-weight: bold; cursor: pointer;">Start Chanting Service</button>
        </div>
      `,
      slots: `
        <h3 style="color: #FFD700; margin-bottom: 1rem;">⏰ Scheduled Prayer Slots</h3>
        <p style="margin-bottom: 1rem;">Book your preferred time slots for personalized prayer sessions at the most auspicious times.</p>
        <h4 style="color: #FFD700; margin: 1.5rem 0 0.5rem 0;">Available Time Slots:</h4>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
          <li><strong>Brahma Muhurta:</strong> 4:00 AM - 6:00 AM</li>
          <li><strong>Morning:</strong> 6:00 AM - 8:00 AM</li>
          <li><strong>Afternoon:</strong> 12:00 PM - 2:00 PM</li>
          <li><strong>Evening:</strong> 6:00 PM - 8:00 PM</li>
          <li><strong>Night:</strong> 8:00 PM - 10:00 PM</li>
        </ul>
        <div style="text-align: center; margin-top: 2rem;">
          <a href="login.html" style="background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; border: none; padding: 12px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; text-decoration: none;">Book Prayer Slot</a>
        </div>
      `,
      live: `
        <h3 style="color: #FFD700; margin-bottom: 1rem;">📱 Live Prayer Sessions</h3>
        <p style="margin-bottom: 1rem;">Join live streaming prayer sessions and witness your personalized rituals in real-time.</p>
        <h4 style="color: #FFD700; margin: 1.5rem 0 0.5rem 0;">Live Features:</h4>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
          <li>HD video streaming</li>
          <li>Multiple camera angles</li>
          <li>Real-time chat</li>
          <li>Interactive blessings</li>
        </ul>
        <div style="text-align: center; margin-top: 2rem;">
          <button data-alert="Live session will start soon!" style="background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; border: none; padding: 12px 24px; border-radius: 20px; font-weight: bold; cursor: pointer;">Join Live Session</button>
        </div>
      `,
      recordings: `
        <h3 style="color: #FFD700; margin-bottom: 1rem;">🎧 Prayer Recordings</h3>
        <p style="margin-bottom: 1rem;">Access our extensive library of prayer recordings, mantras, and personalized chanting sessions.</p>
        <h4 style="color: #FFD700; margin: 1.5rem 0 0.5rem 0;">Audio Quality:</h4>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
          <li>High-definition audio (320kbps)</li>
          <li>Professional recording</li>
          <li>Multiple formats (MP3, FLAC)</li>
          <li>Offline downloads</li>
        </ul>
        <div style="text-align: center; margin-top: 2rem;">
          <button data-alert="Redirecting to audio library..." style="background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; border: none; padding: 12px 24px; border-radius: 20px; font-weight: bold; cursor: pointer;">Browse Library</button>
        </div>
      `,
      certificates: `
        <h3 style="color: #FFD700; margin-bottom: 1rem;">📜 Blessing Certificates</h3>
        <p style="margin-bottom: 1rem;">Receive beautiful digital certificates after each prayer session as proof of your spiritual journey.</p>
        <div style="background: rgba(255, 215, 0, 0.1); padding: 1rem; border-radius: 10px; margin: 1rem 0; text-align: center;">
          <p style="margin-bottom: 0.5rem;"><strong>Sample Certificate Preview</strong></p>
          <div style="border: 2px solid #FFD700; padding: 1rem; border-radius: 10px; background: rgba(0,0,0,0.3);">
            <p style="color: #FFD700; font-weight: bold;">🕉️ SACRED SERVICES PREMIUM 🕉️</p>
            <p>This certifies that</p>
            <p style="font-size: 1.2rem; color: #FFD700;"><strong>[Your Name]</strong></p>
            <p>has received divine blessings through personalized chanting</p>
            <p>Date: [Session Date] | Session ID: [Unique ID]</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
          <button data-select-plan="basic" style="background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; border: none; padding: 12px 24px; border-radius: 20px; font-weight: bold; cursor: pointer;">Get Your Certificate</button>
        </div>
      `,
      festivals: `
        <h3 style="color: #FFD700; margin-bottom: 1rem;">🌟 Festival Specials</h3>
        <p style="margin-bottom: 1rem;">Participate in grand festival celebrations with special chanting sessions and elaborate rituals.</p>
        <div style="background: rgba(255, 215, 0, 0.1); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
          <p><strong>Diwali Celebration:</strong> 5-day special ceremony</p>
          <p><strong>Navratri Festival:</strong> 9 nights of divine chanting</p>
          <p><strong>Maha Shivratri:</strong> All-night prayer session</p>
          <p><strong>Holi Festival:</strong> Color celebration with mantras</p>
          <p><strong>Ganesh Chaturthi:</strong> 11-day special prayers</p>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
          <button data-select-plan="annual" style="background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; border: none; padding: 12px 24px; border-radius: 20px; font-weight: bold; cursor: pointer;">Join Festival Celebrations</button>
        </div>
      `
    };
  }

  // Stats animation on intersection
  function setupStatsAnimation() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => animateStat(stat));
        observer.unobserve(statsSection);
      });
    }, { threshold: 0.4 });
    observer.observe(statsSection);
  }

  function animateStat(stat) {
    const finalText = stat.textContent.trim();
    if (finalText === '24/7') return;
    if (finalText.includes('%')) {
      const end = parseFloat(finalText.replace('%',''));
      animateNumber(stat, 0, end, '%');
    } else if (finalText.includes('M+')) {
      const end = parseFloat(finalText.replace('M+','')) * 1_000_000;
      animateNumberSuffix(stat, 0, end, 'M+');
    } else if (finalText.includes('K+') || finalText.includes(',')) {
      const end = parseInt(finalText.replace(/[^\d]/g, ''));
      animateNumberSuffix(stat, 0, end, '+');
    } else {
      const end = parseInt(finalText.replace(/[^\d]/g, ''));
      animateNumber(stat, 0, end, '');
    }
  }

  function animateNumber(el, start, end, suffix) {
    const duration = 1800; const step = Math.max(1, Math.floor(end / (duration / 16)));
    let current = start;
    const timer = setInterval(() => {
      current += step; if (current >= end) { current = end; clearInterval(timer); }
      el.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 16);
  }

  function animateNumberSuffix(el, start, end, suffix) {
    const duration = 1800; const steps = duration / 16; const inc = (end - start) / steps;
    let current = start;
    const timer = setInterval(() => {
      current += inc; if (current >= end) { current = end; clearInterval(timer); }
      let display;
      if (suffix === 'M+') display = (current / 1_000_000).toFixed(1) + 'M+';
      else if (current >= 1000) display = (current / 1000).toFixed(0) + 'K+';
      else display = Math.floor(current).toLocaleString() + '+';
      el.textContent = display;
    }, 16);
  }

  // Parallax effect
  function setupParallax() {
    const parallaxEls = document.querySelectorAll('.floating-element');
    if (!parallaxEls.length) return;
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset; const speed = 0.5;
      parallaxEls.forEach(el => { el.style.transform = `translateY(${-(scrolled * speed)}px)`; });
    });
  }

  // Smooth scroll for internal links
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  // Feature cards expand and button actions
  function setupFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      card.addEventListener('click', function(e) {
        if ((e.target).classList && (e.target).classList.contains('feature-action-btn')) return;
        const expanded = this.classList.contains('expanded');
        featureCards.forEach(o => o.classList.remove('expanded'));
        if (!expanded) this.classList.add('expanded');
      });
    });

    // Buttons: open modal or select plan
    document.addEventListener('click', function(e){
      const btn = e.target.closest('.feature-action-btn');
      if (btn && btn.dataset && btn.dataset.feature) {
        openFeatureModal(btn.dataset.feature);
      }
      const selectPlanBtn = e.target.closest('[data-select-plan]');
      if (selectPlanBtn) { selectPlan(selectPlanBtn.getAttribute('data-select-plan')); }
      const alertBtn = e.target.closest('[data-alert]');
      if (alertBtn) { alert(alertBtn.getAttribute('data-alert')); }
    });

    // Modal close button
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) closeModal.addEventListener('click', closeFeatureModal);
    window.addEventListener('click', function(event) {
      const modal = document.getElementById('featureModal');
      if (event.target === modal) closeFeatureModal();
    });
  }

  // Bind plan buttons without inline handlers
  function bindPlanButtons() {
    document.querySelectorAll('.plan-button').forEach(btn => {
      btn.addEventListener('click', function() {
        const parent = this.closest('.plan-card');
        if (!parent) return;
        const plan = parent.querySelector('.plan-name')?.textContent || '';
        // Map plan display name to key
        let key = 'basic';
        if (/annual/i.test(plan)) key = 'annual';
        else if (/premium/i.test(plan)) key = 'premium';
        else key = 'basic';
        selectPlan(key);
      });
    });
  }

  function ensureLogoutNav() {
    let logout = document.getElementById('logoutNavBtn');
    if (!logout) {
      const navList = document.querySelector('.nav-links');
      if (!navList) return null;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.id = 'logoutNavBtn';
      a.href = '#';
      a.textContent = 'Logout';
      a.style.display = 'none';
      li.appendChild(a);
      navList.appendChild(li);
      logout = a;
    }
    return logout;
  }
  function updateLoginNav() {
    const btn = document.getElementById('loginNavBtn');
    const logoutBtn = ensureLogoutNav();
    if (!btn) return;
    try {
      const isAuth = window.authAPI && window.authAPI.isAuthenticated();
      if (isAuth) {
        const user = window.authAPI.getStoredUser() || {};
        const firstName = (user.name || user.email || 'Account').split(' ')[0];
        btn.textContent = `Hi, ${firstName}`;
        btn.href = '#';
        btn.style.cursor = 'default';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
      } else {
        btn.textContent = 'Login';
        btn.href = 'login.html';
        btn.style.cursor = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    } catch(_){}
  }

  document.addEventListener('DOMContentLoaded', function(){
    setupStatsAnimation();
    setupParallax();
    setupSmoothScroll();
    setupFeatureCards();
    bindPlanButtons();

    updateLoginNav();
    const logoutBtn = ensureLogoutNav();
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function(e){
        e.preventDefault();
        try { await window.authAPI.logout(); } catch(_){ }
        updateLoginNav();
        window.location.href = 'about-llc.html';
      });
    }

    window.addEventListener('storage', function(e){
      if (['token','refreshToken','isLoggedIn','user'].includes(e.key)) updateLoginNav();
    });
  });
})();
