// Common UI Utilities for 7amo Store

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api'
  : '/api';

async function apiFetch(endpoint, options = {}) {
  const token = safeStorage.get('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}


// Safe Storage Wrapper to prevent crashes on file:// protocol in some browsers
const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      try {
        const data = JSON.parse(window.name || '{}');
        return data[key] || null;
      } catch (err) {
        return null;
      }
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      try {
        const data = JSON.parse(window.name || '{}');
        data[key] = value;
        window.name = JSON.stringify(data);
        return true;
      } catch (err) {
        return false;
      }
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      try {
        const data = JSON.parse(window.name || '{}');
        delete data[key];
        window.name = JSON.stringify(data);
        return true;
      } catch (err) {
        return false;
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('error', handleBrokenImage, true);

  // Mobile Nav Menu Toggle
  const mobileToggleBtn = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileToggleBtn && mobileMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      mobileToggleBtn.innerHTML = isOpen ? icon('close', 18) : icon('menu', 18);
    });
  }

  // Highlight Active Link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '#') {
      link.classList.add('active');
    } else if (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
      link.classList.add('active');
    }
  });

  // Render icons inside the document where icon-data is specified
  renderInlineIcons();

  // Initialize Cart Badge
  updateCartBadge();

  // Initialize Auth navbar components
  updateAuthNavbar();
});

function handleBrokenImage(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;

  const visualWrap = img.closest('.product-thumb, .cart-item-image, .category-card, .detail-image-wrap');
  if (!visualWrap) return;

  visualWrap.style.padding = '';
  visualWrap.innerHTML = icon('box', 72);
}

// Helper: SVG Icons Generator
function icon(name, size = 20) {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.3 18h8.6a2 2 0 0 0 1.9-1.4L21.5 9H6"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevDown: '<path d="M6 9l6 6 6-6"/>',
    chevRight: '<path d="M9 6l6 6-6 6"/>',
    chevLeft: '<path d="M15 6l-6 6 6 6"/>',
    star: '<path d="M12 3l2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.3-.6L12 3z"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
    headset: '<path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1.4"/><rect x="17" y="13" width="4" height="6" rx="1.4"/>',
    inbox: '<path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5"/><path d="M3 12l3.5 5h11L21 12"/><path d="M3 12h6l1.5 2.5h3L15 12h6"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    tag: '<path d="M20.6 12.4L12 21 3 12V3h9z"/><circle cx="7" cy="7" r="1.3"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.4.4 4 2.2 4 5.8"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    logout: '<path d="M15 17l5-5-5-5"/><path d="M20 12H8"/><path d="M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>',
    store: '<path d="M4 21V9.5L2 7l1.6-3h16.8L22 7l-2 2.5V21"/><path d="M9 21v-6h6v6"/><path d="M2 7h20"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 16l-5.5-5.5L9 17"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 14l5 2v4a2 2 0 0 1-2 2C10.6 22 2 13.4 2 4a2 2 0 0 1 2-2z"/>',
    pin: '<path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    upload: '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    rocket: '<path d="M14 4c4 0 7 3 7 7-3 0-5 1-7 3-2 2-3 4-3 7-3 0-5-2-5-5 0-5 4-12 8-12z"/><circle cx="14.5" cy="9.5" r="1.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/>',
    ig: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.2"/>',
    tw: '<path d="M4 4l6.8 9.2L4 20h1.8l5.7-5.7L16 20h4.2l-7.2-9.8L19.2 4H17.4l-5.2 5.2L8 4H4zm2.4 1.2h2.3l9 13.6h-2.3l-9-13.6z"/>',
    whatsapp: '<path d="M17.5 14.4l-2-1c-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.3.3-.6.1s-1.2-.4-2.3-1.4c-.8-.8-1.4-1.7-1.6-2s0-.5.1-.6l.4-.5.3-.4c.1-.1.1-.3 0-.4l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1.1 2.8 1.2 3 2.1 3.2 5.1 4.5c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4s.2-1.3.2-1.4-.3-.3-.6-.4z"/><path d="M12 2a10 10 0 0 0-8.6 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.3 8.3 0 1 1 12 20.3z"/>',
    tiktok: '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/><path d="M13 8V16a4 4 0 0 1-4 4"/>',
    youtube: '<path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6z"/><path d="M9.8 15.5l5.7-3.5-5.7-3.5v7z"/>',
    snapchat: '<path d="M12 2c-2.8 0-4.5 1.7-4.8 4.7L7 8.5c-.3 0-.7-.1-1-.1-.5 0-.8.2-.8.6 0 .5.5.8 1.2 1 .8.2 1 .3.9.8-.3 1.2-1.1 2.4-2.5 3.2-.5.3-.8.5-.7.8.1.3.5.4 1.2.4.3 0 .7 0 1.1-.1.3 0 .5.1.7.5.3.5.6 1 1.1 1 .4 0 .9-.3 1.7-.6.9-.4 2-.8 3.1-.1 1-.7 2.2-.3 3.1.1.8.3 1.3.6 1.7.6.5 0 .8-.5 1.1-1 .2-.4.4-.5.7-.5.4.1.8.1 1.1.1.7 0 1.1-.1 1.2-.4.1-.3-.2-.5-.7-.8-1.4-.8-2.2-2-2.5-3.2-.1-.5.1-.6.9-.8.7-.2 1.2-.5 1.2-1 0-.4-.3-.6-.8-.6-.3 0-.7.1-1 .1l-.2-1.8C16.5 3.7 14.8 2 12 2z"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}

// Render Inline SVGs
function renderInlineIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const iconName = el.getAttribute('data-icon');
    const iconSize = el.getAttribute('data-size') || 20;
    el.innerHTML = icon(iconName, iconSize);
  });
}

// Cart Management Helpers
function getCartKey() {
  const user = getLoggedInUser();
  // Using user._id if available, otherwise user.id, fallback to 'guest'
  const userId = user ? (user._id || user.id) : null;
  return userId ? `cart_${userId}` : 'cart_guest';
}

function getCart() {
  try {
    return JSON.parse(safeStorage.get(getCartKey())) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  safeStorage.set(getCartKey(), JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge-count');
  if (badge) {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalCount > 0) {
      badge.textContent = totalCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

// Auth State Management Helpers
function getRole() {
  const user = getLoggedInUser();
  return user ? (user.role === 'admin' ? 'admin' : 'customer') : 'guest';
}

function getLoggedInUser() {
  try {
    return JSON.parse(safeStorage.get('user')) || null;
  } catch (e) {
    return null;
  }
}

function login(userDetails) {
  safeStorage.set('user', JSON.stringify(userDetails));
  if (userDetails.token) {
    safeStorage.set('token', userDetails.token);
  }
  updateAuthNavbar();
}

function logout() {
  safeStorage.remove('user');
  safeStorage.remove('token');
  window.location.href = 'index.html';
}

function updateAuthNavbar() {
  const role = getRole();
  const authNavContainer = document.getElementById('auth-nav-container');
  if (!authNavContainer) return;

  if (role === 'guest') {
    authNavContainer.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Login</a>
    `;
  } else {
    const user = getLoggedInUser();
    const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : (role === 'admin' ? 'Admin' : 'Customer');
    const dashboardBtn = role === 'admin' ? `<a href="dashboard.html" class="btn btn-primary btn-sm">Dashboard</a>` : '';
    
    authNavContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:14px; font-weight:600; color:var(--primary-light);">Hi, ${name}</span>
        ${dashboardBtn}
        <button class="btn btn-ghost btn-sm" onclick="logout()" style="display:flex;align-items:center;gap:6px;">
          ${icon('logout', 16)} Logout
        </button>
      </div>
    `;
  }
}

// Toast Notification Helper
function showToast(message, type = 'success') {
  let toastEl = document.getElementById('toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }

  // Create style dynamically if needed
  toastEl.innerHTML = icon('check', 16) + `<span>${message}</span>`;
  toastEl.classList.add('show');
  
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}
