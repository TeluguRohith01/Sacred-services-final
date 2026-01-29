// login-helpers.js
// External helpers for login.html to comply with CSP (no inline scripts or inline event handlers)

(function() {
  function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const authTabs = document.getElementById('authTabs');

    if (!loginForm || !signupForm || !loginTab || !signupTab || !authTabs) return;

    loginTab.classList.remove('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');

    if (tab === 'login') {
      loginForm.classList.add('active');
      loginTab.classList.add('active');
      authTabs.classList.remove('signup-active');
    } else {
      signupForm.classList.add('active');
      signupTab.classList.add('active');
      authTabs.classList.add('signup-active');
    }
  }

  async function showForgotPassword() {
    const email = window.prompt('Enter your email address to reset password:');
    if (!email) return;
    if (!window.FormValidator || !window.FormValidator.validateEmail(email)) {
      window.MessageSystem && window.MessageSystem.show('Please enter a valid email address.', 'error');
      return;
    }
    try {
      await window.authAPI.forgotPassword(email);
      window.MessageSystem && window.MessageSystem.show('Password reset email sent.', 'success');
    } catch (err) {
      window.MessageSystem && window.MessageSystem.show(err.message || 'Failed to send reset email', 'error');
    }
  }

  function bindEvents() {
    const loginTabBtn = document.getElementById('loginTab');
    const signupTabBtn = document.getElementById('signupTab');
    const forgotLink = document.getElementById('forgotPasswordLink');

    if (loginTabBtn) loginTabBtn.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('login'); });
    if (signupTabBtn) signupTabBtn.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signup'); });
    if (forgotLink) forgotLink.addEventListener('click', (e) => { e.preventDefault(); showForgotPassword(); });

    // Handle links that switch between forms
    document.querySelectorAll('.auth-switch a.switch-auth').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        switchAuthTab(target === 'signup' ? 'signup' : 'login');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', bindEvents);

  // Expose functions in case other scripts need them
  window.switchAuthTab = switchAuthTab;
  window.showForgotPassword = showForgotPassword;
})();
