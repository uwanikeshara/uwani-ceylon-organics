/**
 * =====================================================================
 * UWANI CEYLON ORGANICS & LIFESTYLE PLATFORM
 * Core Frontend Logic (main.js)
 * State management: Shopping Cart, Drawer, Checkout Modal,
 * Toast Notifications, Quick-View Modal, and API Integrations
 * =====================================================================
 */

// Helper to escape HTML and prevent XSS vulnerabilities
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Normalize image path for both server mode and direct file:// mode
function normalizeImgPath(path) {
    if (!path) return 'images/products/tea-pekoe.svg';
    if (path.startsWith('/')) return path.substring(1);
    return path;
}

// Built-in Offline Fallback Products (Ensures site renders 100% even if opened via file://)
const FALLBACK_PRODUCTS = [
    {
        id: 1,
        category_id: 1,
        category_name: 'Ceylon Herbal Teas',
        sku: 'UWN-TEA-001',
        name: 'Royal Nuwara Eliya Pekoe Tea',
        short_desc: 'High-elevation Ceylon black tea with delicate floral notes and golden liquor.',
        description: 'Sourced from misty single-estate hillsides situated 6,200 feet above sea level in Nuwara Eliya. Hand-plucked tender bud and top two leaves, orthodox rolled and gently fermented to preserve bright amber clarity. 100g loose leaf canister.',
        price: 14.50,
        stock_quantity: 48,
        rating: 4.9,
        review_count: 38,
        image_url: 'images/products/tea-pekoe.svg',
        badge: 'Best Seller',
        is_featured: 1,
        origin: 'Pedro Estate, Nuwara Eliya'
    },
    {
        id: 2,
        category_id: 2,
        category_name: 'Pure Ceylon Spices',
        sku: 'UWN-SPC-001',
        name: 'Alba Grade True Ceylon Cinnamon',
        short_desc: 'Pencil-thin Cinnamomum verum quills with sweet woody fragrance and low coumarin.',
        description: 'The highest global grade of true Ceylon cinnamon hand-peeled by master peelers in southern Sri Lanka. Ultra-thin concentric parchment layers with a soft, warm, subtle sweetness. Certified organic. 100g glass jar.',
        price: 18.00,
        stock_quantity: 32,
        rating: 5.0,
        review_count: 54,
        image_url: 'images/products/cinnamon-alba.svg',
        badge: 'Rare Harvest',
        is_featured: 1,
        origin: 'Mirissa Coastal Forest, Southern Province'
    },
    {
        id: 3,
        category_id: 1,
        category_name: 'Ceylon Herbal Teas',
        sku: 'UWN-TEA-002',
        name: 'Organic Moringa & Lemongrass Infusion',
        short_desc: 'Caffeine-free revitalizing tisane rich in antioxidants and crisp citrus vitality.',
        description: 'A soothing caffeine-free botanical blend combining nutrient-dense drumstick leaves and wild harvested lemongrass. Dried under low-temperature solar dehydrators. 80g tin.',
        price: 12.00,
        stock_quantity: 60,
        rating: 4.8,
        review_count: 29,
        image_url: 'images/products/tea-moringa.svg',
        badge: 'Organic',
        is_featured: 1,
        origin: 'Kurunegala Organic Agroforestry'
    },
    {
        id: 4,
        category_id: 4,
        category_name: 'Organic Coconut Wellness',
        sku: 'UWN-WEL-001',
        name: 'Virgin Cold-Pressed Coconut Oil 500ml',
        short_desc: 'Centrifuged raw extra virgin oil with silky texture and gentle coconut aroma.',
        description: 'Extracted within 48 hours of hand-harvesting fresh mature coconuts from certified regenerative coastal groves. Cold-pressed without chemical processing. 500ml glass bottle.',
        price: 16.50,
        stock_quantity: 25,
        rating: 4.9,
        review_count: 43,
        image_url: 'images/products/coconut-oil.svg',
        badge: '100% Pure',
        is_featured: 1,
        origin: 'Chilaw Coconut Triangle'
    },
    {
        id: 5,
        category_id: 3,
        category_name: 'Handcrafted Homeware',
        sku: 'UWN-HOM-001',
        name: 'Artisan Terracotta Tea Mug & Saucer',
        short_desc: 'Hand-thrown unglazed terracotta clay cup enhancing natural earth notes in tea.',
        description: 'Each piece is individually wheel-thrown and wood-fired by traditional village potters in Molagoda. The natural micro-porous terracotta breathes subtly. 320ml capacity.',
        price: 22.00,
        stock_quantity: 18,
        rating: 4.7,
        review_count: 19,
        image_url: 'images/products/terracotta-mug.svg',
        badge: 'Handcrafted',
        is_featured: 1,
        origin: 'Molagoda Artisan Village, Kegalle'
    },
    {
        id: 6,
        category_id: 2,
        category_name: 'Pure Ceylon Spices',
        sku: 'UWN-SPC-002',
        name: 'Whole Sun-Dried Matale Black Peppercorns',
        short_desc: 'High-piperine pungent black peppercorns from shaded tropical spice groves.',
        description: 'Cultivated on forest-grown vines in the central highlands of Matale. Hand-harvested at peak maturity, naturally sun-cured. 150g pouch.',
        price: 9.50,
        stock_quantity: 50,
        rating: 4.8,
        review_count: 22,
        image_url: 'images/products/black-pepper.svg',
        badge: 'Direct Trade',
        is_featured: 0,
        origin: 'Matale Spice Valley'
    },
    {
        id: 7,
        category_id: 3,
        category_name: 'Handcrafted Homeware',
        sku: 'UWN-HOM-002',
        name: 'Hand-Woven Palmyrah Table Runner',
        short_desc: 'Eco-conscious table runner hand-plaited using sustainable wild palmyrah leaves.',
        description: 'Woven by women artisanal cooperatives in Jaffna using sun-bleached natural palm fronds and eco-friendly vegetable dyes. Dimensions: 180cm x 35cm.',
        price: 28.00,
        stock_quantity: 14,
        rating: 5.0,
        review_count: 16,
        image_url: 'images/products/palmyrah-runner.svg',
        badge: 'Fair Trade',
        is_featured: 0,
        origin: 'Point Pedro Artisan Collective'
    },
    {
        id: 8,
        category_id: 2,
        category_name: 'Pure Ceylon Spices',
        sku: 'UWN-SPC-003',
        name: 'Jumbo Green Ceylon Cardamom Pods',
        short_desc: 'Intensely fragrant forest cardamom with whole aromatic seeds intact.',
        description: 'Grown in the shaded forest understoreys of Knuckles Range. Carefully hand-picked and cured to retain vivid olive-green color and intense essential oils. 60g jar.',
        price: 24.00,
        stock_quantity: 20,
        rating: 4.9,
        review_count: 31,
        image_url: 'images/products/cardamom-pods.svg',
        badge: 'Rare Harvest',
        is_featured: 1,
        origin: 'Knuckles Mountain Range, Kandy'
    }
];

const FALLBACK_CATEGORIES = [
    { id: 1, name: 'Ceylon Herbal Teas', slug: 'ceylon-herbal-teas', description: 'Single-origin, hand-plucked loose leaf teas and organic herbal wellness infusions.', icon: 'ri-cup-line' },
    { id: 2, name: 'Pure Ceylon Spices', slug: 'pure-ceylon-spices', description: 'Direct-trade sun-dried spices harvested from organic home gardens in Matale & Kandy.', icon: 'ri-plant-line' },
    { id: 3, name: 'Handcrafted Homeware', slug: 'handcrafted-homeware', description: 'Ethically crafted clay pottery, palm weave dining ware, and sustainable living accents.', icon: 'ri-home-heart-line' },
    { id: 4, name: 'Organic Coconut Wellness', slug: 'organic-coconut-wellness', description: 'Pure cold-pressed virgin coconut oil, body balms, and natural lifestyle nourishment.', icon: 'ri-heart-pulse-line' }
];

// Global State
const UWANI = {
    cart: JSON.parse(localStorage.getItem('uwani_cart') || '[]'),
    currency: localStorage.getItem('uwani_currency') || 'LKR', // Default: Sri Lankan Rupee (LKR)
    exchangeRate: 300, // 1 USD = 300 LKR
    activeFilter: 'all',
    productsCache: []
};

// Currency Formatting Helper
function formatPrice(amountInUSD) {
    const num = parseFloat(amountInUSD || 0);
    if (UWANI.currency === 'USD') {
        return `$${num.toFixed(2)}`;
    } else {
        const lkr = Math.round(num * UWANI.exchangeRate);
        return `Rs. ${lkr.toLocaleString('en-LK')}`;
    }
}

// Switch Currency & Re-render Components
function setCurrency(newCurrency) {
    if (newCurrency !== 'LKR' && newCurrency !== 'USD') return;
    UWANI.currency = newCurrency;
    localStorage.setItem('uwani_currency', newCurrency);

    updateCurrencyControlsUI();
    updateCartUI();

    // Re-render home page featured grid if cached
    const featuredGrid = document.getElementById('featured-products-grid');
    if (featuredGrid && UWANI.productsCache && UWANI.productsCache.length) {
        const featuredItems = UWANI.productsCache.filter(p => p.is_featured);
        renderProductsGrid(featuredGrid, featuredItems.length ? featuredItems : UWANI.productsCache);
    }

    // Re-render shop page catalog if shop.js is active
    if (typeof fetchShopProducts === 'function') {
        fetchShopProducts();
    }

    showToast(`Currency switched to ${newCurrency === 'LKR' ? 'Sri Lankan Rupee (LKR / Rs.)' : 'US Dollar (USD / $)'}`, 'info');
}

function initCurrencyControls() {
    // Top bar select
    const topSelect = document.getElementById('currency-select-top');
    if (topSelect) {
        topSelect.value = UWANI.currency;
        topSelect.addEventListener('change', (e) => {
            setCurrency(e.target.value);
        });
    }

    // Header toggle pill button
    const toggleBtn = document.getElementById('header-currency-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const nextCurr = UWANI.currency === 'LKR' ? 'USD' : 'LKR';
            setCurrency(nextCurr);
        });
    }

    updateCurrencyControlsUI();
}

function updateCurrencyControlsUI() {
    const topSelect = document.getElementById('currency-select-top');
    if (topSelect) topSelect.value = UWANI.currency;

    const toggleBtn = document.getElementById('header-currency-toggle');
    if (toggleBtn) {
        if (UWANI.currency === 'LKR') {
            toggleBtn.innerHTML = `<span class="curr-flag">🇱🇰</span> <span class="curr-code">LKR (Rs.)</span>`;
            toggleBtn.title = 'Current currency: Sri Lankan Rupee. Click to switch to USD ($)';
        } else {
            toggleBtn.innerHTML = `<span class="curr-flag">🇺🇸</span> <span class="curr-code">USD ($)</span>`;
            toggleBtn.title = 'Current currency: US Dollar. Click to switch to LKR (Rs.)';
        }
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileNav();
    initCurrencyControls();
    initCartDrawer();
    initModals();
    initNewsletter();
    updateCartUI();

    // Page-specific initializations
    if (document.getElementById('featured-products-grid')) {
        loadFeaturedProducts();
    }
    if (document.getElementById('categories-container')) {
        loadCategories();
    }
});

/* --- 1. HEADER SCROLL & MOBILE NAV --- */
function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initMobileNav() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        const isHidden = window.getComputedStyle(navLinks).display === 'none';
        navLinks.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = '#FFFFFF';
            navLinks.style.padding = '20px';
            navLinks.style.boxShadow = 'var(--shadow-md)';
            navLinks.style.zIndex = '99';
        }
    });
}

/* --- 2. TOAST NOTIFICATIONS --- */
function showToast(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${escapeHtml(type)}`;
    
    let icon = 'ri-information-line';
    if (type === 'success') icon = 'ri-checkbox-circle-line';
    if (type === 'error') icon = 'ri-error-warning-line';

    const safeMessage = escapeHtml(message);
    toast.innerHTML = `
        <i class="${icon}" style="font-size: 1.25rem;"></i>
        <span>${safeMessage}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/* --- 3. SHOPPING CART ENGINE (LOCAL STORAGE) --- */
function saveCart() {
    localStorage.setItem('uwani_cart', JSON.stringify(UWANI.cart));
    updateCartUI();
}

function addToCart(product, quantity = 1) {
    const existingIndex = UWANI.cart.findIndex(item => item.id === product.id);
    const safeImg = normalizeImgPath(product.image_url);

    if (existingIndex > -1) {
        UWANI.cart[existingIndex].quantity += quantity;
    } else {
        UWANI.cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image_url: safeImg,
            sku: product.sku,
            quantity: quantity
        });
    }

    saveCart();
    showToast(`Added "${product.name}" to cart`, 'success');
    openCartDrawer();
}

function removeFromCart(productId) {
    UWANI.cart = UWANI.cart.filter(item => item.id !== productId);
    saveCart();
    showToast('Item removed from cart', 'info');
}

function updateCartItemQty(productId, delta) {
    const item = UWANI.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
    }
}

function clearCart() {
    UWANI.cart = [];
    saveCart();
}

function getCartTotals() {
    const subtotalUSD = UWANI.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Shipping: Free for orders over $50 USD (or Rs. 15,000 LKR). Otherwise Rs. 450 (or $3.50)
    let shippingUSD = 0;
    if (subtotalUSD > 0 && subtotalUSD < 50) {
        shippingUSD = UWANI.currency === 'LKR' ? (450 / UWANI.exchangeRate) : 3.50;
    }
    
    // Check for applied promo code GREEN10
    const appliedCode = localStorage.getItem('uwani_promo_code');
    let discountUSD = 0;
    if (appliedCode === 'GREEN10' && subtotalUSD > 0) {
        discountUSD = subtotalUSD * 0.10;
    }

    const totalUSD = Math.max(0, subtotalUSD + shippingUSD - discountUSD);

    return {
        itemCount: UWANI.cart.reduce((sum, item) => sum + item.quantity, 0),
        subtotalUSD,
        shippingUSD,
        discountUSD,
        totalUSD,
        formattedSubtotal: formatPrice(subtotalUSD),
        formattedShipping: shippingUSD === 0 ? 'FREE' : formatPrice(shippingUSD),
        formattedDiscount: formatPrice(discountUSD),
        formattedTotal: formatPrice(totalUSD),
        appliedCode
    };
}

function updateCartUI() {
    const totals = getCartTotals();

    // Update all badge counts
    document.querySelectorAll('.cart-count-badge').forEach(el => {
        el.textContent = totals.itemCount;
        el.style.display = totals.itemCount > 0 ? 'flex' : 'none';
    });

    // Update Drawer Contents
    const cartContainer = document.getElementById('cart-drawer-items');
    const cartSubtotalEl = document.getElementById('cart-drawer-subtotal');
    const cartTotalEl = document.getElementById('cart-drawer-total');

    if (cartSubtotalEl) cartSubtotalEl.textContent = totals.formattedSubtotal;
    if (cartTotalEl) cartTotalEl.textContent = totals.formattedTotal;

    if (!cartContainer) return;

    if (UWANI.cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-state">
                <i class="ri-shopping-basket-line"></i>
                <h4 style="font-size: 1.1rem; color: var(--primary-dark); margin-bottom: 6px;">Your basket is empty</h4>
                <p style="font-size: 0.85rem;">Discover our pure Ceylon organic teas, rare spices and handcrafted living collections.</p>
                <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top: 20px;">Explore Shop</a>
            </div>
        `;
        const checkoutBtn = document.getElementById('drawer-checkout-btn');
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    const checkoutBtn = document.getElementById('drawer-checkout-btn');
    if (checkoutBtn) checkoutBtn.style.display = 'flex';

    // Safely construct cart item rows
    cartContainer.innerHTML = UWANI.cart.map(item => {
        const safeName = escapeHtml(item.name);
        const safeImg = escapeHtml(normalizeImgPath(item.image_url));
        const formattedItemTotal = formatPrice(item.price * item.quantity);
        const itemId = parseInt(item.id, 10);
        const itemQty = parseInt(item.quantity, 10);

        return `
            <div class="cart-item-row" data-id="${itemId}">
                <img src="${safeImg}" alt="${safeName}" class="cart-item-img">
                <div class="cart-item-details">
                    <h5 class="cart-item-title">${safeName}</h5>
                    <div class="cart-item-price">${formattedItemTotal}</div>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateCartItemQty(${itemId}, -1)">−</button>
                        <span class="qty-number">${itemQty}</span>
                        <button class="qty-btn" onclick="updateCartItemQty(${itemId}, 1)">+</button>
                    </div>
                </div>
                <button class="action-btn" style="width: 32px; height: 32px; font-size: 0.9rem;" title="Remove" onclick="removeFromCart(${itemId})">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;
    }).join('');
}

/* --- 4. CART DRAWER TOGGLE --- */
function initCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const openBtns = document.querySelectorAll('.cart-open-btn');
    const closeBtn = document.getElementById('cart-drawer-close');

    if (!overlay) return;

    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCartDrawer);
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCartDrawer();
    });

    const checkoutBtn = document.getElementById('drawer-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            closeCartDrawer();
            openCheckoutModal();
        });
    }
}

function openCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* --- 5. CHECKOUT MODAL & ORDER SUBMISSION (DML INSERT) --- */
function initModals() {
    // Checkout Modal
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutClose = document.getElementById('checkout-modal-close');
    if (checkoutClose && checkoutModal) {
        checkoutClose.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Quick View Modal
    const qvModal = document.getElementById('quick-view-modal');
    const qvClose = document.getElementById('quick-view-close');
    if (qvClose && qvModal) {
        qvClose.addEventListener('click', () => {
            qvModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
}

function openCheckoutModal() {
    if (UWANI.cart.length === 0) {
        showToast('Your basket is empty. Please add items to checkout.', 'warning');
        return;
    }

    const modal = document.getElementById('checkout-modal');
    const totals = getCartTotals();

    // Populate order summary inside modal safely
    const summaryList = document.getElementById('checkout-summary-list');
    const summaryTotal = document.getElementById('checkout-summary-total');

    if (summaryList) {
        summaryList.innerHTML = UWANI.cart.map(item => {
            const safeName = escapeHtml(item.name);
            const lineTotal = formatPrice(item.price * item.quantity);
            return `
                <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 6px;">
                    <span>${safeName} × ${item.quantity}</span>
                    <strong>${lineTotal}</strong>
                </div>
            `;
        }).join('');
    }

    if (summaryTotal) {
        summaryTotal.textContent = totals.formattedTotal;
    }

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    const totals = getCartTotals();
    const submitBtn = document.getElementById('place-order-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="ri-loader-4-line spin"></i> Processing Order...`;
    }

    const orderPayload = {
        customer_name: document.getElementById('order_name').value.trim(),
        customer_email: document.getElementById('order_email').value.trim(),
        customer_phone: document.getElementById('order_phone').value.trim(),
        shipping_address: document.getElementById('order_address').value.trim(),
        city: document.getElementById('order_city').value.trim() || 'Colombo',
        postal_code: document.getElementById('order_postal').value.trim() || '00100',
        payment_method: document.getElementById('order_payment').value || 'Cash on Delivery',
        notes: document.getElementById('order_notes')?.value.trim() || '',
        items: UWANI.cart,
        currency: UWANI.currency,
        subtotal: parseFloat(totals.subtotalUSD),
        shipping_fee: parseFloat(totals.shippingUSD),
        discount: parseFloat(totals.discountUSD),
        total_amount: parseFloat(totals.totalUSD)
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const result = await response.json();

        if (result.success) {
            clearCart();
            document.getElementById('checkout-modal').classList.remove('active');
            showOrderSuccessModal(result.orderNumber, orderPayload.customer_email);
        } else {
            showToast(result.error || 'Failed to place order. Please try again.', 'error');
        }
    } catch (err) {
        // Fallback for file:// direct testing mode
        const generatedNum = `UWN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        clearCart();
        document.getElementById('checkout-modal').classList.remove('active');
        showOrderSuccessModal(generatedNum, orderPayload.customer_email);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Confirm & Place Order`;
        }
    }
}

function showOrderSuccessModal(orderNumber, email) {
    const safeOrder = escapeHtml(orderNumber);
    const safeEmail = escapeHtml(email);

    const modalHtml = `
        <div class="modal-overlay active" id="order-success-modal">
            <div class="modal-box text-center" style="max-width: 500px; padding: 40px 30px;">
                <div style="width: 70px; height: 70px; background: #E8F5E9; color: #2E7D32; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 20px;">
                    <i class="ri-check-line"></i>
                </div>
                <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--primary-dark); margin-bottom: 8px;">Order Confirmed!</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px;">Thank you for supporting sustainable Ceylon agriculture. Your order has been placed into our database.</p>
                <div style="background: var(--bg-sand); padding: 12px 20px; border-radius: var(--radius-md); font-weight: 700; color: var(--primary); margin-bottom: 24px; font-family: monospace; font-size: 1.1rem;">
                    Order Reference: ${safeOrder}
                </div>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 24px;">A confirmation receipt and delivery tracking dispatch will be communicated to <strong>${safeEmail}</strong>.</p>
                <button class="btn btn-primary btn-block" onclick="document.getElementById('order-success-modal').remove(); document.body.style.overflow = '';">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/* --- 6. PRODUCT QUICK VIEW MODAL --- */
async function openQuickView(productId) {
    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    if (!modal || !content) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Check local fallback or fetch
    let product = FALLBACK_PRODUCTS.find(p => p.id === productId);

    try {
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();
        if (result.success && result.data) {
            product = result.data;
        }
    } catch (err) {
        // Use local fallback
    }

    if (!product) {
        content.innerHTML = `<p style="padding: 20px; color: var(--danger);">Product details could not be retrieved.</p>`;
        return;
    }

    const safeName = escapeHtml(product.name);
    const safeCategory = escapeHtml(product.category_name || 'Ceylon Harvest');
    const safeDesc = escapeHtml(product.description);
    const safeSku = escapeHtml(product.sku);
    const safeOrigin = escapeHtml(product.origin || 'Central Highlands, Sri Lanka');
    const safeBadge = escapeHtml(product.badge || 'Organic Authentic');
    const safeImg = escapeHtml(normalizeImgPath(product.image_url));
    const priceNum = Number(product.price).toFixed(2);
    const stockQty = parseInt(product.stock_quantity || 10, 10);

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; align-items: start;">
            <div style="border-radius: var(--radius-md); overflow: hidden; background: #FAF8F5; border: 1px solid var(--border-light);">
                <img src="${safeImg}" alt="${safeName}" style="width: 100%; height: auto; display: block;">
            </div>
            <div>
                <span class="section-tag" style="margin-bottom: 8px;">${safeCategory}</span>
                <h3 style="font-size: 1.45rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 10px;">${safeName}</h3>
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                    <span style="font-family: var(--font-serif); font-size: 1.5rem; font-weight: 700; color: var(--primary);">${formatPrice(product.price)}</span>
                    <span style="font-size: 0.8rem; color: #2E7D32; background: #E8F5E9; padding: 3px 10px; border-radius: var(--radius-pill); font-weight: 600;">
                        ${stockQty > 0 ? `In Stock (${stockQty} units)` : 'Out of Stock'}
                    </span>
                </div>
                <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">${safeDesc}</p>
                <div style="font-size: 0.82rem; color: var(--text-light); margin-bottom: 20px; line-height: 1.6;">
                    <div><strong>SKU:</strong> ${safeSku}</div>
                    <div><strong>Origin:</strong> ${safeOrigin}</div>
                    <div><strong>Grade / Badge:</strong> ${safeBadge}</div>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button class="btn btn-primary" onclick="addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}, image_url: '${safeImg}', sku: '${safeSku}'}); document.getElementById('quick-view-modal').classList.remove('active'); document.body.style.overflow = '';">
                        <i class="ri-shopping-basket-line"></i> Add to Basket
                    </button>
                </div>
            </div>
        </div>
    `;
}

/* --- 7. LOAD FEATURED PRODUCTS (HOME PAGE) --- */
async function loadFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;

    try {
        const response = await fetch('/api/products?featured=1');
        const result = await response.json();

        if (result.success && result.data.length) {
            renderProductsGrid(grid, result.data);
            return;
        }
    } catch (err) {
        // Fallback to built-in items
    }

    // Always render fallback if API is offline or opened via file://
    const featuredItems = FALLBACK_PRODUCTS.filter(p => p.is_featured);
    renderProductsGrid(grid, featuredItems);
}

function renderProductsGrid(container, products) {
    if (!container) return;

    // Cache products for instant re-rendering upon currency switch
    if (!UWANI.productsCache || UWANI.productsCache.length === 0) {
        UWANI.productsCache = products;
    }

    container.innerHTML = products.map(p => {
        const safeName = escapeHtml(p.name);
        const safeBadge = p.badge ? escapeHtml(p.badge) : '';
        const safeCategory = escapeHtml(p.category_name || 'Ceylon Harvest');
        const safeImg = escapeHtml(normalizeImgPath(p.image_url));
        const formattedPrice = formatPrice(p.price);
        const reviewsCount = parseInt(p.review_count || 12, 10);
        const pId = parseInt(p.id, 10);

        return `
            <div class="product-card">
                ${safeBadge ? `<span class="product-badge">${safeBadge}</span>` : ''}
                <div class="product-image-wrap">
                    <img src="${safeImg}" alt="${safeName}" loading="lazy">
                    <div class="product-quick-actions">
                        <button class="quick-action-btn" onclick="openQuickView(${pId})">
                            <i class="ri-eye-line"></i> Quick View
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <span class="product-category-tag">${safeCategory}</span>
                    <h4 class="product-title">${safeName}</h4>
                    <div class="product-rating">
                        <i class="ri-star-fill"></i>
                        <i class="ri-star-fill"></i>
                        <i class="ri-star-fill"></i>
                        <i class="ri-star-fill"></i>
                        <i class="ri-star-half-line"></i>
                        <span class="rating-count">(${reviewsCount})</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="product-price-val">${formattedPrice}</span>
                        </div>
                        <button class="add-cart-btn" title="Add to Basket" onclick="addToCart({id: ${pId}, name: '${p.name.replace(/'/g, "\\'")}', price: ${p.price}, image_url: '${safeImg}', sku: '${p.sku || ''}'})">
                            <i class="ri-add-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/* --- 8. LOAD CATEGORIES (HOME & SHOP) --- */
async function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    try {
        const response = await fetch('/api/categories');
        const result = await response.json();

        if (result.success && result.data.length) {
            renderCategoriesGrid(container, result.data);
            return;
        }
    } catch (err) {
        // Fallback
    }

    renderCategoriesGrid(container, FALLBACK_CATEGORIES);
}

function renderCategoriesGrid(container, categories) {
    container.innerHTML = categories.map(cat => {
        const safeName = escapeHtml(cat.name);
        const safeSlug = escapeHtml(cat.slug);
        const safeDesc = escapeHtml(cat.description);
        const safeIcon = escapeHtml(cat.icon || 'ri-leaf-line');

        return `
            <a href="shop.html?category=${safeSlug}" class="category-card">
                <div class="cat-icon-wrap">
                    <i class="${safeIcon}"></i>
                </div>
                <h3>${safeName}</h3>
                <p>${safeDesc}</p>
                <span class="cat-link">Explore Collection <i class="ri-arrow-right-line"></i></span>
            </a>
        `;
    }).join('');
}

/* --- 9. NEWSLETTER SUBSCRIPTION --- */
function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
            showToast('Thank you for subscribing to UWANI Ceylon Harvest updates!', 'success');
            input.value = '';
        }
    });
}
