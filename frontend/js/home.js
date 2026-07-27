// Sidebar
function openSidebar() {
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebarOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Apply i18n to sidebar data-i18n elements
    document.querySelectorAll('#sidebar [data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && typeof t === 'function') el.textContent = t(key);
    });
}
function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
}

async function initIndexPage() {
    // Wire up hamburger button
    const burgerBtn = document.getElementById('menuBurgerBtn');
    if (burgerBtn) burgerBtn.addEventListener('click', openSidebar);

    setupEditMode();
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
            const shopName = getLocalizedText(shop, 'name_ru', 'name');
            const logoHtml = shop.logoUrl
                ? `<img src="${cloudinaryOptimize(shop.logoUrl)}" alt="${escHtml(shopName)}" class="featured-store-logo">`
                : `<div class="featured-store-logo">🏪</div>`;

            const catName = shop.Category ? (currentLang === 'ru' ? shop.Category.name_ru || shop.Category.name : shop.Category.name || shop.Category.name_ru) : '';

            return `
                <div class="featured-store-card" onclick="location.href='/stores/${shop.slug}'">
                    ${logoHtml}
                    <div class="featured-store-name">${escHtml(shopName)}</div>
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
        const prodName = getLocalizedText(prod, 'name_ru', 'name');

        return `
            <a href="/stores/${shop.slug}/products/${prod.slug}" class="product-card">
                <div class="product-card-img-wrap">
                    <img src="${cloudinaryOptimize(imageUrl)}" alt="${escHtml(prodName)}" class="product-card-img" loading="lazy">
                    ${arBadge}
                </div>
                <div class="product-card-content">
                    <span class="product-card-shop">${escHtml(getLocalizedText(shop, 'name_ru', 'name') || '')}</span>
                    <h3 class="product-card-name">${escHtml(prodName)}</h3>
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

// ═══════ Layout Editor (Admin-only) ═══════
const DEFAULT_LAYOUT = [
    {slug:'lighting',span:1},{slug:'furniture',span:2},
    {slug:'walls',span:1},{slug:'plants',span:1},
    {slug:'art-decor',span:2},{slug:'bathroom',span:1},
    {slug:'stone',span:1},{slug:'real-estate',span:1},
    {slug:'floor',span:2},{slug:'other',span:1},
    {slug:'specialists',span:1},
];

function getSavedLayout() {
    try {
        const saved = JSON.parse(localStorage.getItem('topin_cat_layout'));
        if (Array.isArray(saved) && saved.length === DEFAULT_LAYOUT.length) return saved;
    } catch(e) {}
    return null;
}

function getLayout() {
    return getSavedLayout() || DEFAULT_LAYOUT.map(x => ({...x}));
}

function buildGridAreas(layout) {
    const rows = [];
    const pending = [null, null];
    let i = 0;

    while (i < layout.length) {
        const L = pending[0], R = pending[1];
        pending[0] = null; pending[1] = null;

        if (L && R) { rows.push([L, R]); pending[0] = null; pending[1] = null; continue; }

        if (L) {
            const item = layout[i++];
            rows.push([L, item.slug]);
            if (item.span === 2) pending[1] = item.slug;
            continue;
        }
        if (R) {
            const item = layout[i++];
            rows.push([item.slug, R]);
            if (item.span === 2) pending[0] = item.slug;
            continue;
        }

        const left = layout[i++];
        const right = i < layout.length ? layout[i++] : null;

        if (left && right) {
            rows.push([left.slug, right.slug]);
            if (left.span === 2) pending[0] = left.slug;
            if (right.span === 2) pending[1] = right.slug;
        } else if (left) {
            rows.push([left.slug, left.slug]);
            if (left.span === 2) rows.push([left.slug, left.slug]);
        }
    }
    if (pending[0] || pending[1]) {
        rows.push([pending[0] || pending[1], pending[1] || pending[0]]);
    }

    return rows.map(r => `"${r[0]} ${r[1]}"`).join('\n        ');
}

function applyLayout(grid, layout) {
    grid.style.gridTemplateAreas = buildGridAreas(layout);
    let styleEl = document.getElementById('customGridOrder');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'customGridOrder';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = '';
}

// ═══════ Edit mode ═══════
let _editMode = false;

function setupEditMode() {
    const editBtn = document.getElementById('editLayoutBtn');
    if (!editBtn) return;
    if (!localStorage.getItem('houz_token')) {
        editBtn.style.display = 'none';
        return;
    }
    editBtn.style.display = 'flex';
    editBtn.addEventListener('click', () => {
        if (_editMode) exitEditMode();
        else enterEditMode();
    });
}

function getSlugFromCard(card) {
    const cls = Array.from(card.classList).find(c => c.startsWith('home-card--') && c !== 'home-card--dark');
    return cls ? cls.replace('home-card--', '') : '';
}

function enterEditMode() {
    _editMode = true;
    const grid = document.getElementById('homeGrid');
    const editBtn = document.getElementById('editLayoutBtn');
    if (!grid) return;

    grid.classList.add('edit-mode');
    if (editBtn) {
        editBtn.classList.add('active');
        editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }

    grid.style.gridTemplateAreas = 'none';
    grid.style.gridAutoRows = '120px';

    const layout = getLayout();

    grid.querySelectorAll('.home-card').forEach(card => {
        card.addEventListener('click', preventClick, true);
        card.setAttribute('draggable', 'true');

        if (!card.querySelector('.resize-btn')) {
            const slug = getSlugFromCard(card);
            const item = layout.find(l => l.slug === slug);
            const span = item ? item.span : 1;

            const btn = document.createElement('button');
            btn.className = 'resize-btn';
            btn.setAttribute('data-span', span);
            btn.innerHTML = span === 2
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>'
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>';
            btn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                const cur = parseInt(btn.getAttribute('data-span')) || 1;
                const nxt = cur === 1 ? 2 : 1;
                btn.setAttribute('data-span', nxt);
                btn.innerHTML = nxt === 2
                    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>'
                    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>';
            });
            card.appendChild(btn);
        }
    });

    setupDragHandlers(grid);
}

function exitEditMode() {
    _editMode = false;
    const grid = document.getElementById('homeGrid');
    const editBtn = document.getElementById('editLayoutBtn');
    if (!grid) return;

    grid.classList.remove('edit-mode');
    if (editBtn) {
        editBtn.classList.remove('active');
        editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    }

    const cards = grid.querySelectorAll('.home-card');
    const newLayout = [];
    cards.forEach(card => {
        const slug = getSlugFromCard(card);
        const resizeBtn = card.querySelector('.resize-btn');
        const span = resizeBtn ? parseInt(resizeBtn.getAttribute('data-span')) || 1 : 1;
        if (slug) newLayout.push({ slug, span });
    });

    if (newLayout.length === DEFAULT_LAYOUT.length) {
        localStorage.setItem('topin_cat_layout', JSON.stringify(newLayout));
        applyLayout(grid, newLayout);
    }

    grid.style.gridAutoRows = '90px';

    grid.querySelectorAll('.home-card').forEach(card => {
        card.removeEventListener('click', preventClick, true);
        card.removeAttribute('draggable');
        const btn = card.querySelector('.resize-btn');
        if (btn) btn.remove();
    });

    removeDragHandlers(grid);
}

function preventClick(e) {
    if (e.target.closest('.resize-btn')) return;
    e.preventDefault(); e.stopPropagation();
}

// ═══════ Touch drag ═══════
let _dragEl = null;

function setupDragHandlers(grid) {
    grid._onTouchStart = (e) => {
        if (!_editMode || e.target.closest('.resize-btn')) return;
        const card = e.target.closest('.home-card');
        if (!card) return;
        _dragEl = card;
        setTimeout(() => { if (_dragEl === card) card.classList.add('dragging'); }, 150);
    };
    grid._onTouchMove = (e) => {
        if (!_dragEl || !_editMode) return;
        e.preventDefault();
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const tc = target?.closest('.home-card');
        if (tc && tc !== _dragEl) {
            const all = [...grid.querySelectorAll('.home-card')];
            if (all.indexOf(_dragEl) < all.indexOf(tc)) tc.after(_dragEl);
            else tc.before(_dragEl);
        }
    };
    grid._onTouchEnd = () => { if (_dragEl) { _dragEl.classList.remove('dragging'); _dragEl = null; } };
    grid.addEventListener('touchstart', grid._onTouchStart, { passive: true });
    grid.addEventListener('touchmove', grid._onTouchMove, { passive: false });
    grid.addEventListener('touchend', grid._onTouchEnd, { passive: true });
}

function removeDragHandlers(grid) {
    if (grid._onTouchStart) grid.removeEventListener('touchstart', grid._onTouchStart);
    if (grid._onTouchMove) grid.removeEventListener('touchmove', grid._onTouchMove);
    if (grid._onTouchEnd) grid.removeEventListener('touchend', grid._onTouchEnd);
}

async function loadCategoriesHome() {
    const grid = document.getElementById('homeGrid');
    if (!grid) return;
  
    // Show skeleton loader first
    grid.innerHTML = Array(11).fill().map(() => `
      <div class="skeleton-home-card"></div>
    `).join('');

    const categoryImages = {
      'furniture':   'img/home/furniture.jpg',
      'lighting':    'img/home/lighting.jpg',
      'art-decor':   'img/home/art-decor.jpg',
      'walls':       'img/home/walls.jpg',
      'floor':       'img/home/floor.jpg',
      'stone':       'img/home/stone.jpg',
      'real-estate': 'img/home/real-estate.jpg',
      'plants':      'img/home/plants.jpg',
      'bathroom':    'img/home/bathroom.jpg',
      'other':       'img/home/other.jpg',
      'specialists': 'img/home/specialists.jpg',
    };

    // Cards whose photo is dark → light label + light chip (per Figma)
    const darkCards = new Set(['furniture', 'floor']);

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
      { slug: 'specialists',  image: categoryImages['specialists'] },
    ];

    // Apply saved layout order
    const layout = getLayout();
    const orderMap = {};
    layout.forEach((item, idx) => orderMap[item.slug] = idx);
    categories.sort((a, b) => (orderMap[a.slug] ?? 99) - (orderMap[b.slug] ?? 99));
  
    await Promise.all(categories.map(cat => new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = cat.image;
    })));

    grid.innerHTML = categories.map(cat => {
      const catName = getCatName(cat.slug);
      const darkCls = darkCards.has(cat.slug) ? ' home-card--dark' : '';

      return `
        <a href="/shops?category=${encodeURIComponent(cat.slug)}&name=${encodeURIComponent(catName)}"
           class="home-card home-card--${cat.slug}${darkCls} home-card-hidden">
          <img src="${cat.image}" alt="${escHtml(catName)}" class="home-card-bg" draggable="false" style="pointer-events:none;">
          <div class="home-card-content">
            <span class="home-card-title">${escHtml(catName)}</span>
          </div>
        </a>
      `;
    }).join('');

    // Apply layout (order + spans) to grid-template-areas
    applyLayout(grid, layout);

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
                const shopName = getLocalizedText(shop, 'name_ru', 'name');
                const logo = shop.logoUrl
                    ? `<img src="${cloudinaryOptimize(shop.logoUrl)}" alt="${escHtml(shopName)}">`
                    : `<span style="font-size:20px;">🏪</span>`;
                return `
                    <a href="/stores/${shop.slug}" class="search-store-item">
                        <div class="search-store-logo">${logo}</div>
                        <span class="search-store-name">${escHtml(shopName)}</span>
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
            // Search both shops and products in parallel
            const [shopsRes, prodRes] = await Promise.all([
                fetch(`/api/shops?search=${encodeURIComponent(query)}`),
                fetch(`/api/products?search=${encodeURIComponent(query)}&limit=50`)
            ]);

            const shopsJson = await shopsRes.json();
            const prodJson = await prodRes.json();
            const shops = shopsJson.data || [];
            const products = prodJson.data || [];

            const totalResults = shops.length + products.length;

            if (searchResultsCount) {
                searchResultsCount.innerHTML = `${currentLang === 'ru' ? 'Найдено' : 'Topildi'} <b>${totalResults}${currentLang === 'ru' ? '' : ' ta'}</b>`;
                searchResultsCount.style.display = totalResults > 0 ? 'block' : 'none';
            }

            if (totalResults === 0) {
                searchResultsList.innerHTML = '';
                noResultsMsg.style.display = 'block';
                return;
            }

            let html = '';

            // --- Stores section ---
            if (shops.length > 0) {
                const storesLabel = currentLang === 'ru' ? 'Магазины' : "Do'konlar";
                html += `<div class="search-section-label">${storesLabel}</div>`;
                html += `<div class="search-shops-grid">`;
                html += shops.map(shop => {
                    const shopName = getLocalizedText(shop, 'name_ru', 'name');
                    const logo = shop.logoUrl
                        ? `<img src="${cloudinaryOptimize(shop.logoUrl, 200)}" alt="${escHtml(shopName)}" class="search-shop-card-logo">`
                        : `<div class="search-shop-card-logo search-shop-card-logo--placeholder">${(shopName || '?').charAt(0).toUpperCase()}</div>`;
                    const catName = shop.Category
                        ? (currentLang === 'ru'
                            ? (i18n.ru.cat[shop.Category.slug] || shop.Category.name)
                            : (i18n.uz.cat[shop.Category.slug] || shop.Category.name))
                        : '';
                    return `
                        <a href="/stores/${shop.slug}" class="search-shop-card">
                            ${logo}
                            <div class="search-shop-card-info">
                                <span class="search-shop-card-name">${escHtml(shopName)}</span>
                                ${catName ? `<span class="search-shop-card-cat">${escHtml(catName)}</span>` : ''}
                            </div>
                            <svg class="search-shop-card-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </a>
                    `;
                }).join('');
                html += `</div>`;
            }

            // --- Products section ---
            if (products.length > 0) {
                if (shops.length > 0) {
                    const productsLabel = currentLang === 'ru' ? 'Товары' : 'Mahsulotlar';
                    html += `<div class="search-section-label">${productsLabel}</div>`;
                }
                html += products.map(p => {
                    const shopName = getLocalizedText(p.Shop || {}, 'name_ru', 'name');
                    const prodName = getLocalizedText(p, 'name_ru', 'name');
                    const imgUrl = p.imageUrl ? cloudinaryOptimize(p.imageUrl) : '';
                    const currencyRaw = p.Shop?.currency || 'UZS';
                    const currency = (currencyRaw === 'UZS' || !currencyRaw) ? (currentLang === 'ru' ? 'сум' : "so'm") : currencyRaw;
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
                            ${imgUrl ? `<img src="${imgUrl}" class="search-result-img" alt="${escHtml(prodName)}">` : `<div class="search-result-img" style="display:flex;align-items:center;justify-content:center;font-size:24px;">📦</div>`}
                            <div class="search-result-info">
                                <span class="search-result-shop">${escHtml(shopName)}${badges}</span>
                                <span class="search-result-title">${escHtml(prodName)}</span>
                                <span class="search-result-price">${priceStr}</span>
                            </div>
                        </a>
                    `;
                }).join('');
            }

            searchResultsList.innerHTML = html;
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
