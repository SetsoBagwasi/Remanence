// =====================
// REMANENCE ECOMMERCE - Full Script
// =====================

// =====================
// CART UTILITIES
// =====================
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline-flex' : 'none';
  });
}

// =====================
// TOAST NOTIFICATION
// =====================
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = `background:${type==='success'?'#1a472a':'#c0392b'};color:white;padding:14px 20px;border-radius:10px;font-size:14px;font-family:'Cormorant Garamond',Georgia,serif;box-shadow:0 4px 16px rgba(0,0,0,0.25);display:flex;align-items:center;gap:10px;min-width:240px;animation:slideIn 0.3s ease;`;
  toast.innerHTML = `<span style="font-size:18px">${type==='success'?'✓':'✕'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.4s'; setTimeout(()=>toast.remove(),400); }, 3000);
}

// Inject toast animation
const style = document.createElement('style');
style.textContent = `@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`;
document.head.appendChild(style);

// =====================
// ADD TO CART (with size)
// =====================
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    const sizeSelect = button.closest('.card-footer')?.querySelector('.size-select') ||
                       button.parentElement?.querySelector('.size-select');
    const size = sizeSelect ? sizeSelect.value : 'One Size';

    const cart = getCart();
    const key = name + '|' + size;
    const existing = cart.find(item => item.name === name && item.size === size);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1, size });
    }
    saveCart(cart);
    showToast(`${name} (${size}) added to cart!`);

    // Button feedback
    const orig = button.textContent;
    button.textContent = '✓ Added!';
    button.style.background = '#2d6a4f';
    setTimeout(() => { button.textContent = orig; button.style.background = ''; }, 1500);
  });
});

// =====================
// SEARCH FUNCTIONALITY
// =====================
document.querySelectorAll('.search-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = form.querySelector('input[type="search"]').value.trim().toLowerCase();
    if (!query) return;
    window.location.href = `product.html?search=${encodeURIComponent(query)}`;
  });
});

// Handle search results on product page
if (window.location.pathname.includes('product.html')) {
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('search');
  if (searchQuery) {
    document.querySelectorAll('.card').forEach(card => {
      const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
      if (!title.includes(searchQuery) && !desc.includes(searchQuery)) {
        card.closest('[class*="col"], .card')?.parentElement?.style && (card.style.display = 'none');
        card.style.display = 'none';
      }
    });
    const header = document.querySelector('.container.mt-4 h2, .container.mt-4 h3');
    const searchMsg = document.createElement('p');
    searchMsg.style.cssText = 'padding:16px;color:#555;font-style:italic;';
    searchMsg.textContent = `Showing results for "${searchQuery}"`;
    document.querySelector('.container.mt-4')?.prepend(searchMsg);
  }
}

// =====================
// WISHLIST
// =====================
function getWishlist() { return JSON.parse(localStorage.getItem('wishlist')) || []; }
function saveWishlist(w) { localStorage.setItem('wishlist', JSON.stringify(w)); }

document.querySelectorAll('.wishlist-btn').forEach(btn => {
  const name = btn.getAttribute('data-name');
  const wishlist = getWishlist();
  if (wishlist.includes(name)) btn.classList.add('wishlisted');

  btn.addEventListener('click', () => {
    const wl = getWishlist();
    const idx = wl.indexOf(name);
    if (idx === -1) {
      wl.push(name);
      btn.classList.add('wishlisted');
      showToast(`${name} saved to wishlist ♥`);
    } else {
      wl.splice(idx, 1);
      btn.classList.remove('wishlisted');
      showToast(`${name} removed from wishlist`, 'error');
    }
    saveWishlist(wl);
  });
});

// =====================
// CART PAGE
// =====================
if (document.getElementById('cart-items')) {
  function renderCart() {
    const container = document.getElementById('cart-items');
    let cart = getCart();
    let subtotal = 0;
    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#888;">
          <div style="font-size:64px;margin-bottom:16px;">🛒</div>
          <h3 style="font-family:'Cormorant Garamond',Georgia,serif;color:#333;margin-bottom:10px;">Your cart is empty</h3>
          <p>Discover our collections and add items you love.</p>
          <a href="product.html" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#1a472a;color:white;border-radius:6px;text-decoration:none;font-size:14px;">Shop Now</a>
        </div>`;
    } else {
      cart.forEach(item => {
        subtotal += item.price * item.quantity;
        container.innerHTML += `
          <div class="cart-item" style="display:flex;align-items:center;background:white;padding:20px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.07);gap:16px;flex-wrap:wrap;">
            <div class="item-details" style="flex:2;min-width:140px;">
              <h3 style="margin-bottom:4px;font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;">${item.name}</h3>
              <p style="color:#888;font-size:13px;margin-bottom:4px;">Size: ${item.size || 'One Size'}</p>
              <p style="color:#1a472a;font-weight:600;">P${item.price.toFixed(2)}</p>
            </div>
            <div class="quantity-controls" style="display:flex;align-items:center;gap:8px;margin:0 10px;">
              <button onclick="changeQuantity('${item.name}','${item.size||'One Size'}',-1)" style="width:30px;height:30px;border:1px solid #ccc;background:white;cursor:pointer;border-radius:4px;font-weight:bold;">−</button>
              <span style="min-width:24px;text-align:center;font-weight:600;">${item.quantity}</span>
              <button onclick="changeQuantity('${item.name}','${item.size||'One Size'}',1)" style="width:30px;height:30px;border:1px solid #ccc;background:white;cursor:pointer;border-radius:4px;font-weight:bold;">+</button>
            </div>
            <div style="font-weight:700;min-width:70px;text-align:right;">P${(item.price * item.quantity).toFixed(2)}</div>
            <button onclick="removeItem('${item.name}','${item.size||'One Size'}')" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:20px;padding:4px;">✕</button>
          </div>`;
      });
    }

    let shipping = subtotal > 500 || subtotal === 0 ? 0 : 50;
    let total = subtotal + shipping;
    document.getElementById('cart-subtotal').textContent = `P${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = shipping === 0 ? (subtotal > 0 ? 'FREE' : 'P0.00') : `P${shipping.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `P${total.toFixed(2)}`;

    const shippingNote = document.getElementById('shipping-note');
    if (shippingNote) {
      shippingNote.textContent = subtotal > 0 && subtotal <= 500 ? `Add P${(500 - subtotal).toFixed(2)} more for free shipping!` : '';
    }
  }

  window.changeQuantity = function(name, size, change) {
    let cart = getCart();
    const item = cart.find(i => i.name === name && (i.size || 'One Size') === size);
    if (item) {
      item.quantity += change;
      if (item.quantity < 1) item.quantity = 1;
    }
    saveCart(cart);
    renderCart();
  };

  window.removeItem = function(name, size) {
    let cart = getCart();
    cart = cart.filter(i => !(i.name === name && (i.size || 'One Size') === size));
    saveCart(cart);
    renderCart();
    showToast(`${name} removed from cart`, 'error');
  };

  if (document.getElementById('clear-cart')) {
    document.getElementById('clear-cart').addEventListener('click', () => {
      if (confirm('Clear all items from cart?')) {
        localStorage.removeItem('cart');
        saveCart([]);
        renderCart();
        showToast('Cart cleared', 'error');
      }
    });
  }

  renderCart();
}

// =====================
// CHECKOUT MODAL VALIDATION
// =====================
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', (e) => {
    const cart = getCart();
    if (cart.length === 0) {
      e.stopPropagation();
      e.preventDefault();
      showToast('Your cart is empty!', 'error');
      return false;
    }
    // Fill order summary in modal
    const orderSummaryEl = document.getElementById('modal-order-summary');
    if (orderSummaryEl) {
      let html = '';
      let total = 0;
      cart.forEach(item => {
        total += item.price * item.quantity;
        html += `<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;"><span>${item.name} x${item.quantity}</span><span>P${(item.price*item.quantity).toFixed(2)}</span></div>`;
      });
      html += `<hr><div style="display:flex;justify-content:space-between;font-weight:700;"><span>Total</span><span>P${total.toFixed(2)}</span></div>`;
      orderSummaryEl.innerHTML = html;
    }
  });
}

// Card number formatting
const cardInput = document.getElementById('card-number');
if (cardInput) {
  cardInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g,'').substring(0,16);
    e.target.value = val.replace(/(.{4})/g,'$1 ').trim();
  });
}
const expiryInput = document.getElementById('expiry');
if (expiryInput) {
  expiryInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g,'').substring(0,4);
    if (val.length >= 2) val = val.substring(0,2)+'/'+val.substring(2);
    e.target.value = val;
  });
}

if (document.getElementById('pay-btn')) {
  document.getElementById('pay-btn').addEventListener('click', () => {
    const name = document.getElementById('cardholder-name')?.value.trim();
    const card = document.getElementById('card-number')?.value.replace(/\s/g,'');
    const expiry = document.getElementById('expiry')?.value;
    const cvv = document.getElementById('cvv')?.value;

    if (!name || card?.length < 16 || !expiry || cvv?.length < 3) {
      showToast('Please fill in all payment details correctly.', 'error');
      return;
    }

    const btn = document.getElementById('pay-btn');
    btn.textContent = 'Processing...';
    btn.disabled = true;
    setTimeout(() => {
      localStorage.removeItem('cart');
      updateCartBadge();
      // Close modal
      const modal = document.querySelector('#checkoutModal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }
      showToast('🎉 Payment successful! Order confirmed. Thank you!');
      setTimeout(() => window.location.href = 'index.html', 2500);
    }, 1500);
  });
}

// =====================
// LOGIN / REGISTER
// =====================
if (document.getElementById('login-btn')) {
  document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) { showToast('Please fill in all fields.', 'error'); return; }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      showToast(`Welcome back, ${user.name}!`);
      setTimeout(() => window.location.href = 'index.html', 1200);
    } else {
      showToast('Incorrect email or password.', 'error');
    }
  });
}

if (document.getElementById('register-btn')) {
  document.getElementById('register-btn').addEventListener('click', () => {
    const name = document.getElementById('reg-name')?.value.trim() || document.getElementById('name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim() || document.getElementById('email')?.value.trim();
    const password = document.getElementById('reg-password')?.value || document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    if (!name || !email || !password || !confirmPassword) { showToast('Please fill in all fields.', 'error'); return; }
    if (password !== confirmPassword) { showToast('Passwords do not match.', 'error'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) { showToast('An account with this email already exists.', 'error'); return; }
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    showToast('Account created! Please login.');
    setTimeout(() => window.location.href = 'login.html', 1500);
  });
}

// =====================
// NAV: Show logged in user + logout
// =====================
function updateNavUser() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const loginLinks = document.querySelectorAll('a[href="login.html"]');
  loginLinks.forEach(link => {
    if (user) {
      link.textContent = `👤 ${user.name.split(' ')[0]}`;
      link.href = '#';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Log out?')) {
          localStorage.removeItem('loggedInUser');
          window.location.reload();
        }
      });
    }
  });
}
updateNavUser();

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
updateCartBadge();
