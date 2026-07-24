async function initIndexPage() {
    setupSearch();
    await Promise.all([
        loadCategoriesHome(),
        loadPlatformStats(),
        loadFeaturedStores(),
        loadRecentProducts(),
        loadArProducts()
    ]);
}

async function loadPlatformStats() {
    try {
        const res = await fetch('/api/analytics/public-stats');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const { totalShops, totalProducts, totalArModels } = json.data;
        
        const elShops = document.getElementById('statShopsCount');
        const elProducts = document.getElementById('statProductsCount');
        const elAr = document.getElementById('statArCount');
        
        if (elShops) elShops.textContent = totalShops;
        if (elProducts) elProducts.textContent = totalProducts;
        if (elAr) elAr.textContent = totalArModels;
    } catch (e) {
        console.error('Error loading platform stats:', e);
    }
}

async function loadFeaturedStores() {
    const scrollContainer = document.getElementById('featuredStoresScroll');
    if (!scrollContainer) return;

    try {
        const res = await fetch('/api/shops');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const shops = json.data || [];

        if (shops.length === 0) {
            scrollContainer.innerHTML = '<p style="color:var(--text3);">Магазинов пока нет</p>';
            return;
        }

        // Show up to 8 stores
        scrollContainer.innerHTML = shops.slice(0, 8).map(shop => {
            const logoHtml = shop.logoUrl 
                ? `<img src="${cloudinaryOptimize(shop.logoUrl)}" alt="${escHtml(shop.name)}" class="featured-store-logo">`
                : `<div class="featured-store-logo">🏪</div>`;

            const catName = shop.Category ? (currentLang === 'ru' ? shop.Category.name_ru || shop.Category.name : shop.Category.name || shop.Category.name_ru) : '';

            return `
                <div class="featured-store-card" onclick="location.href='/stores/${shop.slug}'">
                    ${logoHtml}
                    <div class="featured-store-name">${escHtml(shop.name)}</div>
                    ${renderRatingStarsHtml(shop.rating, shop.reviewsCount)}
                    ${catName ? `<span class="featured-store-cat">${escHtml(catName)}</span>` : ''}
                </div>
            `;
        }).join('');
    } catch (e) {
        scrollContainer.innerHTML = '<p style="color:var(--red);">Ошибка загрузки популярных брендов</p>';
    }
}

async function loadRecentProducts() {
    const grid = document.getElementById('recentProductsGrid');
    if (!grid) return;

    try {
        const res = await fetch('/api/products?limit=8');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const products = json.data || [];

        if (products.length === 0) {
            grid.innerHTML = '<p style="color:var(--text3); grid-column: 1/-1; text-align:center;">Новых товаров пока нет</p>';
            return;
        }

        grid.innerHTML = renderProductsGridHtml(products);
    } catch (e) {
        grid.innerHTML = '<p style="color:var(--red); grid-column: 1/-1; text-align:center;">Ошибка загрузки новых поступлений</p>';
    }
}

async function loadArProducts() {
    const grid = document.getElementById('arProductsGrid');
    if (!grid) return;

    try {
        const res = await fetch('/api/products?hasAr=true&limit=8');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const products = json.data || [];

        if (products.length === 0) {
            grid.innerHTML = '<p style="color:var(--text3); grid-column: 1/-1; text-align:center;">Товаров с 3D-моделями пока нет</p>';
            return;
        }

        grid.innerHTML = renderProductsGridHtml(products);
    } catch (e) {
        grid.innerHTML = '<p style="color:var(--red); grid-column: 1/-1; text-align:center;">Ошибка загрузки AR-товаров</p>';
    }
}

function renderProductsGridHtml(products) {
    return products.map(prod => {
        const shop = prod.Shop || {};
        const hasAr = prod.glbUrl || prod.usdzUrl;
        const arBadge = hasAr ? `
            <div class="product-card-ar-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 12 22 12"></polyline></svg>
                3D / AR
            </div>
        ` : '';

        const currencyRaw = shop.currency || 'UZS';
        const currency = currencyRaw === 'UZS' ? "so'm" : currencyRaw;
        const priceStr = prod.price
            ? `${parseFloat(prod.price).toLocaleString()} ${currency}`
            : (currentLang === 'ru' ? 'Цена по запросу' : 'Narx soʻrov boʻyicha');
            
        const oldPriceHtml = prod.salePrice
            ? `<span class="product-card-old-price">${parseFloat(prod.price).toLocaleString()} ${currency}</span>`
            : '';
            
        const displayPriceStr = prod.salePrice
            ? `${parseFloat(prod.salePrice).toLocaleString()} ${currency}`
            : priceStr;

        const imageUrl = prod.imageUrl || 'img/placeholder.png';

        return `
            <a href="/stores/${shop.slug}/products/${prod.slug}" class="product-card">
                <div class="product-card-img-wrap">
                    <img src="${cloudinaryOptimize(imageUrl)}" alt="${escHtml(prod.name)}" class="product-card-img" loading="lazy">
                    ${arBadge}
                </div>
                <div class="product-card-content">
                    <span class="product-card-shop">${escHtml(shop.name || '')}</span>
                    <h3 class="product-card-name">${escHtml(prod.name)}</h3>
                    ${renderRatingStarsHtml(prod.rating, prod.reviewsCount)}
                    <div class="product-card-price-row">
                        <span class="product-card-price" style="${prod.salePrice ? 'color: var(--red);' : ''}">${displayPriceStr}</span>
                        ${oldPriceHtml}
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

async function loadCategoriesHome() {
    const grid = document.getElementById('homeGrid');
    if (!grid) return;
  
    // Show skeleton loader first
    grid.innerHTML = Array(10).fill().map(() => `
      <div class="skeleton-home-card"></div>
    `).join('');

    const categoryImages = {
      'furniture':   'img/Furniture.png',
      'lighting':    'img/Lighting.png',
      'art-decor':   'img/Art & Decor.png',
      'walls':       'img/Walls.png',
      'floor':       'img/Floor.png',
      'stone':       'img/Stone.png',
      'real-estate': 'img/Real Estate.png',
      'plants':      'img/Plants.png',
      'bathroom':    'img/Bathroom.png',
      'other':       'img/Other.png',
    };

    const categories = [
      { slug: 'lighting',     image: categoryImages['lighting'] },
      { slug: 'furniture',    image: categoryImages['furniture'] },
      { slug: 'walls',        image: categoryImages['walls'] },
      { slug: 'plants',       image: categoryImages['plants'] },
      { slug: 'art-decor',    image: categoryImages['art-decor'] },
      { slug: 'bathroom',     image: categoryImages['bathroom'] },
      { slug: 'stone',        image: categoryImages['stone'] },
      { slug: 'real-estate',  image: categoryImages['real-estate'] },
      { slug: 'floor',        image: categoryImages['floor'] },
      { slug: 'other',        image: categoryImages['other'] },
    ];
  
    await Promise.all(categories.map(cat => new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = cat.image;
    })));

    grid.innerHTML = categories.map(cat => {
      const catName = getCatName(cat.slug);

      return `
        <a href="/shops?category=${encodeURIComponent(cat.slug)}&name=${encodeURIComponent(catName)}"
           class="home-card home-card--${cat.slug} home-card-hidden">
          <img src="${cat.image}" alt="${escHtml(catName)}" class="home-card-bg" draggable="false" style="pointer-events:none;">
          <div class="home-card-overlay"></div>
          <div class="home-card-content">
            <span class="home-card-title">${escHtml(catName)}</span>
          </div>
        </a>
      `;
    }).join('');

    requestAnimationFrame(() => {
        grid.querySelectorAll('.home-card-hidden').forEach(el => el.classList.remove('home-card-hidden'));
    });
}

function setupSearch() {
    const headerInput = document.getElementById('headerSearchInput');
    const searchFullpageInput = document.getElementById('searchFullpageInput');
    const homeView = document.getElementById('homeView');
    const searchView = document.getElementById('searchView');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const siteHeader = document.querySelector('.site-header');
    const noResultsMsg = document.getElementById('noResultsMsg');
    const searchResultsList = document.getElementById('searchResultsList');
    const searchResultsCount = document.getElementById('searchResultsCount');

    // Desktop search icon: open full-page search view
    const desktopSearchTrigger = document.getElementById('desktopSearchTrigger');
    const searchWrap = document.querySelector('.search-wrap');

    function openSearchView() {
        homeView.style.display = 'none';
        searchView.style.display = 'block';
        if (siteHeader) siteHeader.style.display = 'none';
        loadFeaturedStoresForSearch();
        if (searchFullpageInput) searchFullpageInput.focus();
    }

    function closeSearchView() {
        searchView.style.display = 'none';
        homeView.style.display = 'flex';
        if (siteHeader) siteHeader.style.display = '';
        if (searchFullpageInput) searchFullpageInput.value = '';
        if (headerInput) headerInput.value = '';
        if (searchResultsList) searchResultsList.innerHTML = '';
        if (searchResultsCount) searchResultsCount.style.display = 'none';
        if (noResultsMsg) noResultsMsg.style.display = 'none';
    }

    // Desktop: click magnifying glass icon → open search
    if (desktopSearchTrigger) {
        desktopSearchTrigger.addEventListener('click', openSearchView);
    }

    // Mobile: header search input focus → open search
    if (headerInput && searchWrap) {
        headerInput.addEventListener('focus', () => {
            if (window.innerWidth < 768) {
                openSearchView();
                if (searchFullpageInput) {
                    searchFullpageInput.value = headerInput.value;
                    searchFullpageInput.focus();
                }
            }
        });
        headerInput.addEventListener('input', (e) => {
            if (window.innerWidth < 768 && searchView.style.display !== 'block') {
                openSearchView();
            }
            if (searchFullpageInput) searchFullpageInput.value = e.target.value;
            handleSearchInput(e.target.value);
        });
        headerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (searchView.style.display !== 'block') openSearchView();
                if (searchFullpageInput) searchFullpageInput.value = headerInput.value;
                handleSearchImmediate(headerInput.value);
            }
        });
    }

    // Full-page search input
    if (searchFullpageInput) {
        searchFullpageInput.addEventListener('input', (e) => {
            handleSearchInput(e.target.value);
        });
        searchFullpageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearchImmediate(searchFullpageInput.value);
        });
    }

    // Close button
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', closeSearchView);
    }

    window._performSearchGlobal = performSearch;

    // Load featured stores for search view
    async function loadFeaturedStoresForSearch() {
        const row = document.getElementById('searchStoresRow');
        if (!row) return;
        try {
            const res = await fetch('/api/shops?limit=10');
            const json = await res.json();
            const shops = json.data || [];
            row.innerHTML = shops.map(shop => {
                const logo = shop.logoUrl 
                    ? `<img src="${cloudinaryOptimize(shop.logoUrl)}" alt="${escHtml(shop.name)}">`
                    : `<span style="font-size:20px;">🏪</span>`;
                return `
                    <a href="/stores/${shop.slug}" class="search-store-item">
                        <div class="search-store-logo">${logo}</div>
                        <span class="search-store-name">${escHtml(shop.name)}</span>
                    </a>
                `;
            }).join('');
        } catch (e) {
            row.innerHTML = '';
        }
    }

    async function performSearch(query) {
        if (!searchResultsList || !noResultsMsg) return;

        searchResultsList.innerHTML = Array(3).fill().map(() => `
            <div style="height:100px; background:var(--surface2); border-radius:20px; margin-bottom:12px; animation: pulse 1.5s infinite;"></div>
        `).join('');
        noResultsMsg.style.display = 'none';
        if (searchResultsCount) searchResultsCount.style.display = 'none';

        try {
            const prodRes = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=50`);
            const prodJson = await prodRes.json();
            const products = prodJson.data || [];

            if (searchResultsCount) {
                searchResultsCount.innerHTML = `${currentLang === 'ru' ? 'Найдено' : 'Topildi'} <b>${products.length}${currentLang === 'ru' ? '' : ' ta'}</b>`;
                searchResultsCount.style.display = products.length > 0 ? 'block' : 'none';
            }

            if (products.length === 0) {
                searchResultsList.innerHTML = '';
                noResultsMsg.style.display = 'block';
                return;
            }

            searchResultsList.innerHTML = products.map(p => {
                const shopName = p.Shop?.name || '';
                const imgUrl = p.imageUrl ? cloudinaryOptimize(p.imageUrl) : '';
                const currencyRaw = p.Shop?.currency || 'UZS';
                const currency = currencyRaw === 'UZS' ? "so'm" : currencyRaw;
                const price = p.salePrice || p.price;
                const priceStr = price ? `${parseFloat(price).toLocaleString()} ${currency}` : (currentLang === 'ru' ? 'Цена по запросу' : "So'rov bo'yicha narx");
                const storeSlug = p.Shop?.slug || '';
                const has3D = p.glbUrl || p.usdzUrl;
                const badges = has3D ? `
                    <span class="search-result-badge">3D
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </span>` : '';

                return `
                    <a href="/stores/${storeSlug}/products/${p.slug}" class="search-result-item">
                        ${imgUrl ? `<img src="${imgUrl}" class="search-result-img" alt="${escHtml(p.name)}">` : `<div class="search-result-img" style="display:flex;align-items:center;justify-content:center;font-size:24px;">📦</div>`}
                        <div class="search-result-info">
                            <span class="search-result-shop">${escHtml(shopName)}${badges}</span>
                            <span class="search-result-title">${escHtml(p.name)}</span>
                            <span class="search-result-price">${priceStr}</span>
                        </div>
                    </a>
                `;
            }).join('');
        } catch (err) {
            searchResultsList.innerHTML = `<p style="color:var(--red);">Ошибка поиска</p>`;
        }
    }

    let searchDebounceTimeout;
    function handleSearchInput(val) {
        clearTimeout(searchDebounceTimeout);
        const query = val.trim();
        if (!query) {
            searchResultsList.innerHTML = '';
            if (searchResultsCount) searchResultsCount.style.display = 'none';
            noResultsMsg.style.display = 'none';
            return;
        }
        searchDebounceTimeout = setTimeout(() => performSearch(query), 300);
    }

    function handleSearchImmediate(val) {
        clearTimeout(searchDebounceTimeout);
        const query = val.trim();
        if (!query) return;
        performSearch(query);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'shops.html' || page === 'shops') {
        setupSearch();
    } else if (page === 'index.html' || page === '' || page === '/' || page === 'index') {
        initIndexPage();
    }
});

window.addEventListener('langchange', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'index.html' || page === '' || page === '/' || page === 'index') {
        loadCategoriesHome();
        loadFeaturedStores();
        loadRecentProducts();
        loadArProducts();
    }
    const searchView = document.getElementById('searchView');
    const btnNearSearch = document.getElementById('lblNearMeBtnSearch');
    if (btnNearSearch) btnNearSearch.textContent = t('nearMe');

    if (searchView && searchView.style.display !== 'none' && window._performSearchGlobal) {
        const queryValSpan = document.getElementById('searchQueryVal');
        if (queryValSpan && queryValSpan.textContent) {
            window._performSearchGlobal(queryValSpan.textContent);
        }
    }
});
