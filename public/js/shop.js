/**
 * =====================================================================
 * UWANI CEYLON ORGANICS & LIFESTYLE PLATFORM
 * Shop & Catalog Controller (shop.js)
 * Real-time dynamic search, category filtering, and sorting
 * =====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initShopPage();
});

let currentCategory = 'all';
let currentSort = 'featured';
let currentSearch = '';

function initShopPage() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('category')) {
        currentCategory = urlParams.get('category');
    }
    if (urlParams.has('search')) {
        currentSearch = urlParams.get('search');
        const searchInput = document.getElementById('shop-search-input');
        if (searchInput) searchInput.value = currentSearch;
    }

    // Set active category pill in UI
    document.querySelectorAll('.filter-pill').forEach(pill => {
        if (pill.dataset.category === currentCategory) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }

        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.dataset.category;
            fetchShopProducts();
        });
    });

    // Search Input with Debounce
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = e.target.value.trim();
                fetchShopProducts();
            }, 300);
        });
    }

    // Sort Select
    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            fetchShopProducts();
        });
    }

    fetchShopProducts();
}

async function fetchShopProducts() {
    const grid = document.getElementById('shop-products-grid');
    const countEl = document.getElementById('catalog-results-count');
    if (!grid) return;

    let products = [];
    let isLiveFetch = false;

    try {
        const queryParams = new URLSearchParams();
        if (currentCategory && currentCategory !== 'all') {
            queryParams.append('category', currentCategory);
        }
        if (currentSearch) {
            queryParams.append('search', currentSearch);
        }
        if (currentSort && currentSort !== 'featured') {
            queryParams.append('sort', currentSort);
        }

        const url = `/api/products?${queryParams.toString()}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            products = result.data;
            isLiveFetch = true;
        }
    } catch (err) {
        // Use local fallback products filtering
    }

    if (!isLiveFetch) {
        // Client-side filtering over FALLBACK_PRODUCTS
        products = FALLBACK_PRODUCTS.filter(p => {
            let catMatch = true;
            if (currentCategory && currentCategory !== 'all') {
                const catSlug = (p.category_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                catMatch = catSlug === currentCategory;
            }
            let searchMatch = true;
            if (currentSearch) {
                const q = currentSearch.toLowerCase();
                searchMatch = p.name.toLowerCase().includes(q) ||
                              p.short_desc.toLowerCase().includes(q) ||
                              p.sku.toLowerCase().includes(q);
            }
            return catMatch && searchMatch;
        });

        // Client-side sorting
        if (currentSort === 'price_asc') {
            products.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price_desc') {
            products.sort((a, b) => b.price - a.price);
        } else if (currentSort === 'rating') {
            products.sort((a, b) => b.rating - a.rating);
        } else if (currentSort === 'name') {
            products.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    if (countEl) {
        countEl.textContent = `${products.length} Products Found`;
    }

    if (!products.length) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
                <i class="ri-search-line" style="font-size: 3rem; color: var(--border-subtle);"></i>
                <h3 style="font-size: 1.25rem; color: var(--primary-dark); margin: 12px 0 6px;">No products match your criteria</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">Try adjusting your keyword or reset filters to view all products.</p>
                <button class="btn btn-outline btn-sm" onclick="resetShopFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    UWANI.productsCache = products;
    renderProductsGrid(grid, products);
}

function resetShopFilters() {
    currentCategory = 'all';
    currentSearch = '';
    currentSort = 'featured';

    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    document.querySelectorAll('.filter-pill').forEach(pill => {
        if (pill.dataset.category === 'all') pill.classList.add('active');
        else pill.classList.remove('active');
    });

    fetchShopProducts();
}
