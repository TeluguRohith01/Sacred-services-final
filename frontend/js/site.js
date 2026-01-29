// site.js
// Externalized UI logic for index.html to satisfy CSP (no inline scripts)

(function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => { navLinks.classList.toggle('active'); });
  }

  // Smooth scrolling only when a valid in-page target exists
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navLinks) navLinks.classList.remove('active');
    });
  });

  // Booking form submission (UI only)
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Thank you for your booking request! Pandit Sravan Kumar will contact you within 2-4 hours to confirm.');
      bookingForm.reset();
    });
  }

  // Public booking function used by service cards
  window.bookService = function(serviceValue) {
    if (!window.authAPI || !window.authAPI.isAuthenticated()) {
      sessionStorage.setItem('pendingService', serviceValue);
      window.location.href = 'login.html';
      return;
    }
    showCheckout(serviceValue);
  };

  function showCheckout(serviceValue) {
    const services = {
      'griha-pravesh': { name: 'Griha Pravesh (Housewarming)', price: 2500, desc: 'Traditional house warming ceremony' },
      'wedding': { name: 'Wedding Ceremonies', price: 15000, desc: 'Complete Hindu wedding rituals' },
      'ganesh-puja': { name: 'Ganesh Puja', price: 1500, desc: 'Lord Ganesha worship' },
      'lakshmi-puja': { name: 'Lakshmi Puja', price: 2000, desc: 'Goddess Lakshmi worship' },
      'havan': { name: 'Havan & Yagya', price: 3000, desc: 'Sacred fire ceremonies' },
      'festival': { name: 'Festival Celebrations', price: 1800, desc: 'Hindu festival pujas' },
      'namkaran': { name: 'Naming Ceremony', price: 2200, desc: 'Traditional baby naming ceremony' },
      'shraddh': { name: 'Pitra Paksha & Shraddh', price: 3500, desc: 'Ancestral worship' },
      'personal': { name: 'Personal Puja Services', price: 1200, desc: 'Customized puja services' }
    };

    const service = services[serviceValue];
    if (service) {
      const selectedServiceName = document.getElementById('selectedServiceName');
      const selectedServiceDesc = document.getElementById('selectedServiceDesc');
      const selectedServicePrice = document.getElementById('selectedServicePrice');
      const totalAmount = document.getElementById('totalAmount');
      const advanceAmount = document.getElementById('advanceAmount');
      const balanceAmount = document.getElementById('balanceAmount');
      const paymentAmount = document.getElementById('paymentAmount');

      if (!selectedServiceName) return;

      selectedServiceName.textContent = service.name;
      selectedServiceDesc.textContent = service.desc;
      selectedServicePrice.textContent = `₹${service.price}`;
      const total = service.price + 200 + 100;
      const advance = Math.round(total * 0.50);
      const balance = total - advance;
      totalAmount.textContent = `₹${total}`;
      advanceAmount.textContent = advance;
      balanceAmount.textContent = balance;
      paymentAmount.textContent = advance;
    }

    showPage('checkoutPage');
  }

  function showPage(pageId) {
    const main = document.querySelector('.main-content');
    if (main) main.classList.add('hidden');
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
  }

  window.showMainContent = function() {
    const main = document.querySelector('.main-content');
    if (main) main.classList.remove('hidden');
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  };

  // Payment selection
  window.selectPayment = function(method) {
    const options = document.querySelectorAll('.payment-option');
    options.forEach(option => option.classList.remove('selected'));
    const radio = document.querySelector(`input[value="${method}"]`);
    if (!radio) return;
    const selectedOption = radio.closest('.payment-option');
    if (selectedOption) selectedOption.classList.add('selected');
    radio.checked = true;
  };

  // Checkout form submission (UI only)
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const selectedPayment = document.querySelector('input[name="payment"]:checked');
      if (!selectedPayment) { alert('Please select a payment method'); return; }
      alert(`Payment initiated via ${selectedPayment.value.toUpperCase()}. You will receive booking confirmation shortly!`);
      window.showMainContent();
    });
  }

  // Star rating system
  const stars = document.querySelectorAll('.star');
  let selectedRating = 0;
  if (stars && stars.length) {
    stars.forEach((star, index) => {
      star.addEventListener('click', () => { selectedRating = index + 1; updateStars(); });
      star.addEventListener('mouseover', () => { highlightStars(index + 1); });
    });
    const ratingEl = document.getElementById('starRating');
    if (ratingEl) ratingEl.addEventListener('mouseleave', updateStars);
  }
  function updateStars() { stars.forEach((star, index) => { star.classList.toggle('active', index < selectedRating); }); }
  function highlightStars(rating) { stars.forEach((star, index) => { star.classList.toggle('active', index < rating); }); }

  // Review submission (UI only)
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (selectedRating === 0) { alert('Please select a rating'); return; }
      const reviewerName = document.getElementById('reviewerName').value;
      const reviewerService = document.getElementById('reviewerService').value;
      const reviewText = document.getElementById('reviewText').value;
      const reviewsContainer = document.getElementById('reviewsDisplay');
      if (!reviewsContainer) return;
      const reviewCard = document.createElement('div'); reviewCard.className = 'review-card';
      const starsDisplay = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);
      const serviceName = reviewerService ? ' - ' + document.querySelector(`option[value="${reviewerService}"]`).textContent : '';
      reviewCard.innerHTML = `<div class="review-header"><div class="reviewer-name">${reviewerName}${serviceName}</div><div class="review-date">${new Date().toLocaleDateString()}</div></div><div class="review-stars">${starsDisplay}</div><div class="review-text">${reviewText}</div>`;
      reviewsContainer.prepend(reviewCard);
      reviewForm.reset(); selectedRating = 0; updateStars();
      alert('Thank you for your review!');
    });
  }

  // Payment calculator logic
  const serviceCalculator = document.getElementById('serviceCalculator');
  const advanceAmountEl = document.getElementById('advanceAmount');
  const balanceAmountEl = document.getElementById('balanceAmount');
  if (serviceCalculator) {
    serviceCalculator.addEventListener('change', function() {
      const value = parseInt(this.value || '0', 10);
      const travel = 200, fee = 100;
      const total = value + travel + fee;
      const advance = Math.round(total * 0.5);
      const balance = total - advance;
      if (advanceAmountEl) advanceAmountEl.textContent = advance;
      if (balanceAmountEl) balanceAmountEl.textContent = balance;
    });
  }

  // Helper: update nav login button according to auth state
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
        btn.classList.remove('login-btn');
        btn.style.cursor = 'default';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
      } else {
        btn.textContent = 'Login';
        btn.href = 'login.html';
        if (!btn.classList.contains('login-btn')) btn.classList.add('login-btn');
        btn.style.cursor = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
      }
    } catch (_) { /* noop */ }
  }

  // DOMContentLoaded bindings to replace previous inline handlers
  document.addEventListener('DOMContentLoaded', function() {
    updateLoginNav();

    // Bind logout
    const logoutBtn = ensureLogoutNav();
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function(e){
        e.preventDefault();
        try { await window.authAPI.logout(); } catch(_) {}
        updateLoginNav();
        window.location.href = 'index.html';
      });
    }

    window.addEventListener('storage', function(e){
      if (['token','refreshToken','isLoggedIn','user'].includes(e.key)) updateLoginNav();
    });

    // Service cards click -> bookService
    document.querySelectorAll('.service-card[data-service]').forEach(card => {
      card.addEventListener('click', function() {
        const service = this.getAttribute('data-service');
        if (service) window.bookService(service);
      });
    });

    // Back to services button
    const backBtn = document.getElementById('backToServices');
    if (backBtn) backBtn.addEventListener('click', function(e) { e.preventDefault(); window.showMainContent(); });

    // UPI QR open/close
    const showQR = document.getElementById('showUPIQR');
    const closeQR = document.getElementById('closeUPIQR');
    const modal = document.getElementById('upiQRModal');
    if (showQR && modal) showQR.addEventListener('click', function(e){ e.preventDefault(); modal.style.display = 'flex'; });
    if (closeQR && modal) closeQR.addEventListener('click', function(){ modal.style.display = 'none'; });

    // Payment option card click -> toggle radio and select style
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', function(e){
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          window.selectPayment(radio.value);
        }
      });
    });
  });
})();
