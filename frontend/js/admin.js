let _adminShops = [];
let _currentAdminCategoryId = null;

async function adminLoadShops() {
  const catGrid = document.getElementById('adminCatGrid');
  if (!catGrid) return;

  try {
    window._adminCategories = [];
    window._adminSubCategories = [];

    const [shopsRes, catsRes, subcatsRes] = await Promise.all([
      fetch(`${API}/api/shops`),
      fetch(`${API}/api/categories`),
      fetch(`${API}/api/subcategories`)
    ]);
    
    if (!shopsRes.ok) throw new Error();
    const shopsJson = await shopsRes.json();
    _adminShops = shopsJson.data || shopsJson || [];

    if (catsRes.ok) window._adminCategories = (await catsRes.json()).data || [];
    if (subcatsRes.ok) window._adminSubCategories = (await subcatsRes.json()).data || [];
  } catch {
    catGrid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Ошибка подключения</h3>
      <p>Не удалось получить данные с сервера.</p>
    </div>`;
    return;
  }

  renderAdminCategories();
  loadFeaturedShopsAdmin();
}

function renderAdminCategories() {
    const catGrid = document.getElementById('adminCatGrid');
    if (!catGrid || !window._adminCategories) return;

    if (window._adminCategories.length === 0) {
        catGrid.innerHTML = `<div class="empty-state"><p>${t('catsNotFound')}</p></div>`;
        return;
    }

    catGrid.innerHTML = window._adminCategories.map(cat => {
        const count = _adminShops.filter(s => s.CategoryId === cat.id).length;
        const nameRu = i18n.ru.cat[cat.slug] || cat.name;
        const icon = cat.icon || '📁';

        return `
        <div class="admin-cat-card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;" onclick="showAdminShopsView(${cat.id}, '${escHtml(nameRu)}')">
                <div class="admin-cat-info" style="flex: 1;">
                    <div class="admin-cat-icon">${icon}</div>
                    <div class="admin-cat-text">
                        <h3 style="margin:0">${escHtml(nameRu)}</h3>
                        <p style="margin: 4px 0 0 0;">${count} ${t('shopsCountLabel')}</p>
                    </div>
                </div>
                <div class="admin-cat-chevron">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
                 <button type="button" class="btn-edit" onclick="event.stopPropagation(); window.showFiltersView(${cat.id}, '${escHtml(nameRu)}')" style="padding: 6px 12px;">${t('manageFilters')}</button>
            </div>
        </div>
        `;
    }).join('');
}

window.showAdminCategoryView = () => {
    _currentAdminCategoryId = null;
    document.getElementById('adminShopsView').style.display = 'none';
    const filtersView = document.getElementById('adminFiltersView');
    if(filtersView) filtersView.style.display = 'none';
    document.getElementById('adminCategoryView').style.display = 'block';
    
    renderAdminCategories();
};

window.showAdminShopsView = (categoryId, categoryName) => {
    _currentAdminCategoryId = categoryId;
    document.getElementById('adminCategoryView').style.display = 'none';
    const filtersView = document.getElementById('adminFiltersView');
    if(filtersView) filtersView.style.display = 'none';
    
    const shopsView = document.getElementById('adminShopsView');
    shopsView.style.display = 'block';
    
    document.getElementById('adminShopsTitle').textContent = categoryName || t('shops');

    loadCategoryTop(categoryId);

    const tbody = document.getElementById('adminTableBody');
    const filteredShops = _adminShops
        .filter(s => s.CategoryId === categoryId)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    if (filteredShops.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:40px">${t('noShopsInCat')}</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredShops.map(shop => `
    <tr>
      <td class="td-logo"><div class="admin-logo-thumb">${logoFallback(shop.logoUrl, shop.name_ru || shop.name)}</div></td>
      <td class="td-name">${escHtml(shop.name)}</td>
      <td class="td-location">${escHtml(shop.location || '–')}</td>
      <td class="td-phone">${shop.phone
        ? `<a href="tel:${escHtml(shop.phone)}">${escHtml(shop.phone)}</a>`
        : '–'}</td>
      <td>${escHtml((shop.Category ? i18n[currentLang].cat[shop.Category.slug] || shop.Category.name : null) || shop.category || shop.categorySlug || '–')}</td>
      <td>${shop.isActive !== false ? '<span style="color:var(--green);font-weight:600;">Активен</span>' : '<span style="color:var(--red);font-weight:600;">Приостановлен</span>'}</td>
      <td>
        <div class="action-btns" style="display:flex; gap:8px;">
          ${shop.storeEnabled ? `<button class="btn-edit" onclick="impersonateShop(${shop.id})" style="background:var(--blue); color:white; border:none; padding:4px 8px; border-radius:6px; cursor:pointer;">Войти</button>` : ''}
          <button class="btn-edit" onclick="editShop(${shop.id})">${t('edit')}</button>
          <button class="btn-delete" onclick="deleteShop(${shop.id})">${t('delete')}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Per-category top 5 ──────────────────────────────────────────
// Distinct from the site-wide featured list above: these pin to the head of
// /shops?category=… while everything below stays in the server's random order.
const CATEGORY_TOP_LIMIT = 5;
let _catTopShopIds = [];

async function loadCategoryTop(categoryId) {
    _catTopShopIds = [];
    try {
        const res = await fetch(`${API}/api/shops/category-featured/${categoryId}`);
        if (res.ok) {
            const json = await res.json();
            _catTopShopIds = (json.data || []).map(s => s.id);
        }
    } catch (e) {}
    renderCategoryTop();
}

function renderCategoryTop() {
    const listEl = document.getElementById('catTopList');
    const selectEl = document.getElementById('addCatTopSelect');
    if (!listEl || !selectEl) return;

    const inCategory = _adminShops.filter(s => s.CategoryId === _currentAdminCategoryId);

    if (_catTopShopIds.length === 0) {
        listEl.innerHTML = '<div class="admin-fs-md" style="color:var(--text3);padding:6px 0;">Пока никто не закреплён — вся категория показывается в случайном порядке.</div>';
    } else {
        listEl.innerHTML = _catTopShopIds.map((shopId, idx) => {
            const shop = inCategory.find(s => s.id === shopId);
            if (!shop) return '';
            const name = shop.name_ru || shop.name;
            return `<div class="cat-top-item">
                <span class="rank">${idx + 1}</span>
                <div class="admin-logo-thumb">${logoFallback(shop.logoUrl, name)}</div>
                <span class="nm admin-fs-base">${escHtml(name)}</span>
                <button type="button" title="Выше" onclick="moveCategoryTop(${shop.id}, -1)" ${idx === 0 ? 'disabled' : ''}>↑</button>
                <button type="button" title="Ниже" onclick="moveCategoryTop(${shop.id}, 1)" ${idx === _catTopShopIds.length - 1 ? 'disabled' : ''}>↓</button>
                <button type="button" class="danger" title="Убрать" onclick="removeCategoryTop(${shop.id})">✕</button>
            </div>`;
        }).join('');
    }

    selectEl.innerHTML = '<option value="">+ Добавить магазин...</option>';
    inCategory
        .filter(s => !_catTopShopIds.includes(s.id))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .forEach(shop => {
            const opt = document.createElement('option');
            opt.value = shop.id;
            opt.textContent = shop.name_ru || shop.name;
            selectEl.appendChild(opt);
        });
    selectEl.disabled = _catTopShopIds.length >= CATEGORY_TOP_LIMIT;
}

window.addCategoryTopShop = function() {
    const selectEl = document.getElementById('addCatTopSelect');
    const shopId = parseInt(selectEl.value, 10);
    if (!shopId) return;
    if (_catTopShopIds.length >= CATEGORY_TOP_LIMIT) {
        showToast(`Максимум ${CATEGORY_TOP_LIMIT} магазинов в категории`, 'error');
        return;
    }
    if (!_catTopShopIds.includes(shopId)) {
        _catTopShopIds.push(shopId);
        renderCategoryTop();
    }
    selectEl.value = '';
};

window.removeCategoryTop = function(shopId) {
    _catTopShopIds = _catTopShopIds.filter(id => id !== shopId);
    renderCategoryTop();
};

window.moveCategoryTop = function(shopId, delta) {
    const i = _catTopShopIds.indexOf(shopId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= _catTopShopIds.length) return;
    [_catTopShopIds[i], _catTopShopIds[j]] = [_catTopShopIds[j], _catTopShopIds[i]];
    renderCategoryTop();
};

window.saveCategoryTop = async function() {
    const btn = document.getElementById('saveCatTopBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Сохранение…'; }
    try {
        const res = await fetch(`${API}/api/shops/category-featured/order`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify({
                categoryId: _currentAdminCategoryId,
                orders: _catTopShopIds.map((shopId, idx) => ({ shopId, order: idx + 1 }))
            })
        });
        if (handle401(res)) return;
        if (!res.ok) throw new Error('save failed');
        showToast('Топ-5 категории сохранён', 'success');
    } catch (e) {
        showToast('Не удалось сохранить топ-5', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Сохранить'; }
    }
};

window.impersonateShop = async (shopId) => {
    try {
        const res = await fetch(`/api/impersonate/${shopId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('houz_token')}`
            }
        });
        if (!res.ok) throw new Error('Failed to impersonate');
        const json = await res.json();
        
        // Save current admin credentials so they can log back in if needed
        localStorage.setItem('admin_token', localStorage.getItem('houz_token'));
        localStorage.setItem('admin_role', localStorage.getItem('houz_role'));
        
        localStorage.setItem('houz_token', json.token);
        localStorage.setItem('houz_role', 'vendor');
        
        showToast('Вход в панель магазина выполнен успешно. Перенаправление...', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    } catch (err) {
        showToast('Ошибка входа: ' + err.message, 'error');
    }
};

// ─── Featured Shops Management ───
let _featuredShopIds = [];

async function loadFeaturedShopsAdmin() {
    const listEl = document.getElementById('featuredShopsList');
    const selectEl = document.getElementById('addFeaturedSelect');
    if (!listEl || !selectEl) return;

    // Get current featured
    try {
        const res = await fetch(`${API}/api/shops/featured`);
        if (res.ok) {
            const json = await res.json();
            const featured = json.data || [];
            _featuredShopIds = featured.map(s => s.id);
        }
    } catch(e) {}

    renderFeaturedList();
    populateFeaturedSelect();
}

function populateFeaturedSelect() {
    const selectEl = document.getElementById('addFeaturedSelect');
    if (!selectEl) return;

    selectEl.innerHTML = '<option value="">+ Добавить магазин...</option>';
    _adminShops
        .filter(s => !_featuredShopIds.includes(s.id))
        .forEach(shop => {
            const opt = document.createElement('option');
            opt.value = shop.id;
            opt.textContent = shop.name_ru || shop.name;
            selectEl.appendChild(opt);
        });
}

function renderFeaturedList() {
    const listEl = document.getElementById('featuredShopsList');
    if (!listEl) return;

    if (_featuredShopIds.length === 0) {
        listEl.innerHTML = '<div class="admin-fs-md" style="text-align:center;color:var(--text3);padding:16px;">Нет рекомендуемых магазинов</div>';
        return;
    }

    listEl.innerHTML = _featuredShopIds.map((shopId, idx) => {
        const shop = _adminShops.find(s => s.id === shopId);
        if (!shop) return '';
        const name = shop.name_ru || shop.name;
        const logo = `<div class="admin-logo-thumb">${logoFallback(shop.logoUrl, name)}</div>`;
        
        return `<div class="featured-item" draggable="true" data-idx="${idx}" data-shop-id="${shopId}" 
                    style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-radius:10px;border:1px solid var(--border);cursor:grab;">
            <span class="admin-fs-sm" style="color:var(--text3);font-weight:700;min-width:20px;">${idx + 1}</span>
            ${logo}
            <span class="admin-fs-base" style="flex:1;font-weight:500;color:var(--text);">${name}</span>
            <button onclick="removeFeaturedShop(${shopId})" class="admin-fs-lg" style="background:none;border:none;color:var(--red);cursor:pointer;padding:4px 8px;">✕</button>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </div>`;
    }).join('');

    // Setup drag-and-drop
    setupFeaturedDragDrop();
}

function setupFeaturedDragDrop() {
    const items = document.querySelectorAll('.featured-item');
    let dragIdx = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            dragIdx = parseInt(item.dataset.idx);
            item.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
            items.forEach(i => i.style.borderTop = '');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.style.borderTop = '2px solid var(--accent)';
        });

        item.addEventListener('dragleave', () => {
            item.style.borderTop = '';
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderTop = '';
            const dropIdx = parseInt(item.dataset.idx);
            if (dragIdx === null || dragIdx === dropIdx) return;
            
            // Reorder
            const moved = _featuredShopIds.splice(dragIdx, 1)[0];
            _featuredShopIds.splice(dropIdx, 0, moved);
            renderFeaturedList();
        });
    });
}

window.addFeaturedShop = function() {
    const selectEl = document.getElementById('addFeaturedSelect');
    const shopId = parseInt(selectEl.value);
    if (!shopId) return;
    if (_featuredShopIds.length >= 15) {
        showToast('Максимум 15 рекомендуемых магазинов', 'error');
        return;
    }
    if (!_featuredShopIds.includes(shopId)) {
        _featuredShopIds.push(shopId);
        renderFeaturedList();
        populateFeaturedSelect();
    }
};

window.removeFeaturedShop = function(shopId) {
    _featuredShopIds = _featuredShopIds.filter(id => id !== shopId);
    renderFeaturedList();
    populateFeaturedSelect();
};

window.saveFeaturedOrder = async function() {
    const btn = document.getElementById('saveFeaturedBtn');
    btn.textContent = 'Сохранение...';
    btn.disabled = true;

    try {
        const orders = _featuredShopIds.map((shopId, idx) => ({ shopId, order: idx + 1 }));
        const res = await fetch(`${API}/api/shops/featured/order`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('houz_token')}`
            },
            body: JSON.stringify({ orders })
        });
        
        if (res.ok) {
            showToast('Порядок рекомендуемых магазинов сохранён!', 'success');
        } else {
            showToast('Ошибка сохранения', 'error');
        }
    } catch(e) {
        showToast('Ошибка сети: ' + e.message, 'error');
    }

    btn.textContent = 'Сохранить порядок';
    btn.disabled = false;
};
