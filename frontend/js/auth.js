// Authentication API client
class AuthAPI {
  constructor() {
    this.baseURL = '/api/auth';
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Set authorization headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make API request with error handling
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(options.includeAuth !== false),
          ...options.headers
        },
        credentials: 'include' // Include cookies for refresh token
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          return this.makeRequest(url, options);
        } else {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData) {
    const response = await this.makeRequest(`${this.baseURL}/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false
    });

    if (response.success && response.token) {
      this.setTokens(response.token, response.refreshToken);
    }

    return response;
  }

  // Login user
  async login(credentials) {
    const response = await this.makeRequest(`${this.baseURL}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false
    });

    if (response.success && response.token) {
      this.setTokens(response.token, response.refreshToken);
    }

    return response;
  }

  // Logout user
  async logout() {
    try {
      await this.makeRequest(`${this.baseURL}/logout`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      window.location.href = '/login.html';
    }
  }

  // Get current user
  async getCurrentUser() {
    return this.makeRequest(`${this.baseURL}/me`);
  }

  // Update user profile
  async updateProfile(profileData) {
    return this.makeRequest(`${this.baseURL}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Change password
  async changePassword(passwordData) {
    return this.makeRequest(`${this.baseURL}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // Forgot password
  async forgotPassword(email) {
    return this.makeRequest(`${this.baseURL}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      includeAuth: false
    });
  }

  // Reset password
  async resetPassword(token, passwordData) {
    return this.makeRequest(`${this.baseURL}/reset-password/${token}`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
      includeAuth: false
    });
  }

  // Resend email verification
  async resendEmailVerification() {
    return this.makeRequest(`${this.baseURL}/resend-verification`, {
      method: 'POST'
    });
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const response = await this.makeRequest(`${this.baseURL}/refresh-token`, {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        includeAuth: false
      });

      if (response.success && response.token) {
        this.setTokens(response.token, response.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Set tokens in localStorage
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('isLoggedIn', 'true');
  }

  // Clear tokens from localStorage
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && localStorage.getItem('isLoggedIn') === 'true';
  }

  // Get stored user data
  getStoredUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  // Store user data
  storeUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
}

// Create global auth instance
const authAPI = new AuthAPI();

// Enhanced form validation
class FormValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  }

  static validateName(name) {
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    
    return null;
  }
}

// Enhanced message system
class MessageSystem {
  static show(text, type = 'success', duration = 5000) {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Clear existing messages
    messageContainer.innerHTML = '';
    messageContainer.appendChild(message);
    
    // Trigger animation
    requestAnimationFrame(() => {
      message.classList.add('show');
    });
    
    // Auto-hide after duration
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => {
        if (messageContainer.contains(message)) {
          messageContainer.removeChild(message);
        }
      }, 300);
    }, duration);
  }

  static clear() {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    const messages = messageContainer.querySelectorAll('.message');
    messages.forEach(message => {
      message.classList.remove('show');
      setTimeout(() => {
        if (messageContainer.contains(message)) {
          messageContainer.removeChild(message);
        }
      }, 300);
    });
  }

  static showValidationErrors(errors) {
    if (Array.isArray(errors) && errors.length > 0) {
      const errorMessages = errors.map(error => error.message || error).join(', ');
      this.show(errorMessages, 'error');
    }
  }
}

// Loading state management
class LoadingManager {
  static setLoading(form, isLoading) {
    const btn = form.querySelector('.btn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.loading-spinner');
    
    if (isLoading) {
      btn.classList.add('loading');
      btnText.textContent = 'Processing...';
      btn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
    } else {
      btn.classList.remove('loading');
      btnText.textContent = form.id === 'loginForm' ? 'Sign In' : 'Create Account';
      btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
    }
  }
}

// Enhanced login form handler
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Client-side validation
  if (!email || !password) {
    MessageSystem.show('Please fill in all required fields.', 'error');
    return;
  }
  
  if (!FormValidator.validateEmail(email)) {
    MessageSystem.show('Please enter a valid email address.', 'error');
    document.getElementById('loginEmail').focus();
    return;
  }
  
  LoadingManager.setLoading(form, true);
  MessageSystem.clear();
  
  try {
    const response = await authAPI.login({ email, password });
    
    if (response.success) {
      // Store user data
      authAPI.storeUser(response.user);
      
      MessageSystem.show('Welcome back! Redirecting to your dashboard...', 'success');
      
      setTimeout(() => {
        const pendingService = sessionStorage.getItem('pendingService');
        if (pendingService) {
          sessionStorage.removeItem('pendingService');
          window.location.href = `index.html#checkout-${pendingService}`;
        } else {
          window.location.href = 'index.html';
        }
      }, 1500);
    }
  } catch (error) {
    console.error('Login error:', error);
    MessageSystem.show(error.message, 'error');
    
    // Focus on relevant field based on error
    if (error.message.includes('email')) {
      document.getElementById('loginEmail').focus();
    } else if (error.message.includes('password') || error.message.includes('credentials')) {
      document.getElementById('loginPassword').focus();
    }
  } finally {
    LoadingManager.setLoading(form, false);
  }
}

// Enhanced signup form handler
async function handleSignup(event) {
  event.preventDefault();
  
  const form = event.target;
  const userData = {
    name: document.getElementById('signupName').value.trim(),
    email: document.getElementById('signupEmail').value.trim(),
    phone: document.getElementById('signupPhone').value.trim(),
    password: document.getElementById('signupPassword').value,
    confirmPassword: document.getElementById('signupConfirmPassword').value
  };
  
  // Client-side validation
  const nameError = FormValidator.validateName(userData.name);
  if (nameError) {
    MessageSystem.show(nameError, 'error');
    document.getElementById('signupName').focus();
    return;
  }
  
  if (!FormValidator.validateEmail(userData.email)) {
    MessageSystem.show('Please enter a valid email address.', 'error');
    document.getElementById('signupEmail').focus();
    return;
  }
  
  if (!FormValidator.validatePhone(userData.phone)) {
    MessageSystem.show('Please enter a valid phone number.', 'error');
    document.getElementById('signupPhone').focus();
    return;
  }
  
  const passwordErrors = FormValidator.validatePassword(userData.password);
  if (passwordErrors.length > 0) {
    MessageSystem.show(passwordErrors[0], 'error');
    document.getElementById('signupPassword').focus();
    return;
  }
  
  if (userData.password !== userData.confirmPassword) {
    MessageSystem.show('Passwords do not match.', 'error');
    document.getElementById('signupConfirmPassword').focus();
    return;
  }
  
  LoadingManager.setLoading(form, true);
  MessageSystem.clear();
  
  try {
    const response = await authAPI.register(userData);
    
    if (response.success) {
      // Store user data
      authAPI.storeUser(response.user);
      
      MessageSystem.show('Account created successfully! Please check your email to verify your account.', 'success');
      
      setTimeout(() => {
        const pendingService = sessionStorage.getItem('pendingService');
        if (pendingService) {
          sessionStorage.removeItem('pendingService');
          window.location.href = `index.html#checkout-${pendingService}`;
        } else {
          window.location.href = 'index.html';
        }
      }, 2000);
    }
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message.includes('validation') && error.errors) {
      MessageSystem.showValidationErrors(error.errors);
    } else {
      MessageSystem.show(error.message, 'error');
    }
    
    // Focus on relevant field based on error
    if (error.message.includes('name')) {
      document.getElementById('signupName').focus();
    } else if (error.message.includes('email')) {
      document.getElementById('signupEmail').focus();
    } else if (error.message.includes('phone')) {
      document.getElementById('signupPhone').focus();
    } else if (error.message.includes('password')) {
      document.getElementById('signupPassword').focus();
    }
  } finally {
    LoadingManager.setLoading(form, false);
  }
}

// Forgot password handler
async function handleForgotPassword(email) {
  try {
    const response = await authAPI.forgotPassword(email);
    
    if (response.success) {
      MessageSystem.show('Password reset email sent successfully. Please check your inbox.', 'success');
      return true;
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    MessageSystem.show(error.message, 'error');
    return false;
  }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  if (authAPI.isAuthenticated()) {
    const user = authAPI.getStoredUser();
    if (user && user.name) {
      MessageSystem.show(`Welcome back, ${user.name}! Redirecting to your dashboard...`, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
  }
  
  // Set up form event listeners
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  // Real-time password confirmation validation
  const confirmPasswordField = document.getElementById('signupConfirmPassword');
  if (confirmPasswordField) {
    confirmPasswordField.addEventListener('input', function() {
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = this.value;
      
      if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#ff6b6b';
        this.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.2)';
      } else {
        this.style.borderColor = '';
        this.style.boxShadow = '';
      }
    });
  }
  
  // Enhanced keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      MessageSystem.clear();
    }
  });
  
  // Focus on first input for better accessibility
  setTimeout(() => {
    const firstInput = document.querySelector('.auth-form.active input');
    if (firstInput) {
      firstInput.focus();
    }
  }, 100);
});

// Export for use in other scripts
window.authAPI = authAPI;
window.MessageSystem = MessageSystem;
window.FormValidator = FormValidator;