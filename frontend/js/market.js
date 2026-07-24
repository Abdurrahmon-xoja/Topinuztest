let _allShops = [];
let _activeMainCategory = 'all';
let _activeSubCategory = 'all';
let _liveSubCategories = [];

// Geolocation & Map state
let _userCoords = null;
let _nearMeFilterActive = false;
let _currentViewMode = 'list'; // 'list' or 'map'
let _shopsLayoutMode = localStorage.getItem('topin_layout_mode') || 'list';
let _map = null;
let _mapMarkers = [];

async function initShopsPage() {
  const params = new URLSearchParams(window.location.search);
  const catSlug = params.get('category') || 'all';
  const catName = catSlug === 'all' ? t('allShops') : getCatName(catSlug);

  _activeMainCategory = catSlug;
  _activeSubCategory = 'all';

  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = catName;

  const btnNear = document.getElementById('lblNearMeBtn');
  if (btnNear) btnNear.textContent = t('nearMe');

  _syncLayoutToggleIcon();

  await Promise.all([
    buildCategoryTabs(_activeMainCategory),
    fetchAndRenderShops(_activeMainCategory),
  ]);

  // Floating mobile search → live-filter shops
  const floatingInput = document.getElementById('floatingSearchInput');
  const floatingBar = document.getElementById('floatingSearchBar');
  const clearBtn = document.getElementById('clearFloatingSearchBtn');
  if (floatingInput) {
    let searchTid;
    floatingInput.addEventListener('input', () => {
      const val = floatingInput.value.trim();
      if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
      clearTimeout(searchTid);
      searchTid = setTimeout(() => {
        fetchAndRenderShops(_activeMainCategory, _activeSubCategory, val);
      }, 300);
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        floatingInput.value = '';
        clearBtn.style.display = 'none';
        fetchAndRenderShops(_activeMainCategory, _activeSubCategory, '');
      });
    }

    // Keep floating search bar visible right above mobile soft keyboard
    if (floatingBar && window.visualViewport) {
      const handleVisualViewportChange = () => {
        const viewport = window.visualViewport;
        const offsetBottom = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        if (offsetBottom > 80) {
          floatingBar.style.bottom = `${offsetBottom}px`;
          floatingBar.classList.add('keyboard-active');
        } else {
          floatingBar.style.bottom = '';
          floatingBar.classList.remove('keyboard-active');
        }
      };

      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);

      floatingInput.addEventListener('focus', () => {
        setTimeout(handleVisualViewportChange, 100);
      });
      floatingInput.addEventListener('blur', () => {
        setTimeout(() => {
          floatingBar.style.bottom = '';
          floatingBar.classList.remove('keyboard-active');
        }, 100);
      });
    }
  }

  document.getElementById('shopModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('shopModal')) closeShopModal();
  });
  document.getElementById('modalClose')?.addEventListener('click', closeShopModal);
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeShopModal);
}

async function buildCategoryTabs(activeMainSlug) {
  const tabsEl = document.getElementById('catTabs');
  if (!tabsEl) return;

  // Let's fetch the dynamic subcategories from our new structured backend
  if (_liveSubCategories.length === 0) {
    try {
        const res = await fetch(`${API}/api/subcategories`);
        const json = await res.json();
        _liveSubCategories = json.data;
    } catch (e) {
        console.error("Could not fetch dynamic subcategories", e);
    }
  }

  // Filter subcategories for this specific main category slug
  const mainCategoryIdObj = window._adminCategories ? window._adminCategories.find(c => c.slug === activeMainSlug) : null;
  
  let subCats = [];
  if (mainCategoryIdObj) {
      subCats = _liveSubCategories.filter(sc => String(sc.CategoryId) === String(mainCategoryIdObj.id));
  } else {
      // Fallback to static if backend isn't loaded completely
      subCats = subCategoriesData[activeMainSlug] || [];
  }

  if (subCats.length === 0) {
      tabsEl.parentNode.style.display = 'none';
      return;
  } else {
      tabsEl.parentNode.style.display = '';
  }

  const allTabs = [{ name: t('hammasi'), nameRu: t('hammasi'), slug: 'all', id: 'all' }, ...subCats];

  tabsEl.innerHTML = allTabs.map(cat => {
    const displayName = currentLang === 'uz' ? (cat.name || cat.name_ru)
                      : (cat.name_ru || cat.name);
    return `
    <button class="cat-pill ${cat.slug === _activeSubCategory || String(cat.id) === _activeSubCategory ? 'active' : ''}"
            data-slug="${escHtml(cat.slug)}"
            data-id="${cat.id || cat.slug}"
            data-name="${escHtml(displayName)}">
      ${escHtml(displayName)}
    </button>
  `}).join('');

  tabsEl.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeSubCategory = btn.dataset.id; // use ID for filtering backend dynamically
      
      const isAll = btn.dataset.slug === 'all' || btn.dataset.id === 'all';
      const titleEl = document.getElementById('pageTitle');
      if (titleEl) {
        titleEl.textContent = isAll 
          ? (_activeMainCategory === 'all' ? t('allShops') : getCatName(_activeMainCategory)) 
          : btn.dataset.name;
      }
      
      const searchVal = document.getElementById('shopSearch')?.value || '';
      // We pass the actual Main DB Category ID instead of slug to backend
      const mCat = window._adminCategories ? window._adminCategories.find(c => c.slug === _activeMainCategory) : null;
      fetchAndRenderShops(mCat ? mCat.id : _activeMainCategory, _activeSubCategory, searchVal);
    });
  });
}

async function fetchAndRenderShops(activeMainIdOrSlug = 'all', activeSubIdOrSlug = 'all', searchVal = '') {
  const grid = document.getElementById('shopsGrid');
  if (!grid) return;

  grid.innerHTML = Array(6).fill().map(() => `
    <div class="skeleton-card">
      <div class="skeleton-logo"></div>
      <div class="skeleton-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');

  try {
    let url = `${API}/api/shops`;
    const params = new URLSearchParams();
    
    let resolvedMainId = activeMainIdOrSlug;
    if (resolvedMainId && resolvedMainId !== 'all' && isNaN(resolvedMainId)) {
        const mCat = window._adminCategories ? window._adminCategories.find(c => c.slug === resolvedMainId) : null;
        if (mCat) resolvedMainId = mCat.id;
    }

    if (resolvedMainId && resolvedMainId !== 'all') params.append('category', resolvedMainId);
    if (activeSubIdOrSlug && activeSubIdOrSlug !== 'all') params.append('subcategory', activeSubIdOrSlug);
    if (searchVal) params.append('search', searchVal);
    
    const queryStr = params.toString();
    if (queryStr) url += `?${queryStr}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    _allShops = json.data || json || [];
  } catch (err) {
      console.error(err);
      _allShops = [];
  }

  const shopsToRender = _nearMeFilterActive ? getSortedShops(_allShops) : _allShops;
  renderShops(shopsToRender);
  
  if (_currentViewMode === 'map') {
    initLeafletMap(shopsToRender);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const shopIdParam = urlParams.get('shop');
  
  if (shopIdParam && !window._shopModalOpened) {
      window._shopModalOpened = true; 
      setTimeout(() => openShopModal(parseInt(shopIdParam)), 100);
  }
}

function getActiveCategoryName() {
  if (_activeSubCategory !== 'all') {
    const activeBtn = document.querySelector('#catTabs .cat-pill.active');
    if (activeBtn) {
      return activeBtn.dataset.name;
    }
  }

  if (_activeMainCategory === 'all') return t('shopsCount');
  const translated = getCatName(_activeMainCategory);
  // getCatName returns the slug itself if no i18n match — fall back to DB name
  if (translated === _activeMainCategory && window._adminCategories) {
    const cat = window._adminCategories.find(c => c.slug === _activeMainCategory);
    if (cat) return cat.name;
  }
  return translated;
}

function renderShops(shops) {
  const grid = document.getElementById('shopsGrid');
  const countEl = document.getElementById('shopCount');
  const pageCountEl = document.getElementById('pageCount');
  if (!grid) return;

  if (countEl) countEl.innerHTML = `${t('found')} <b>${shops.length}</b>`;
  if (pageCountEl) pageCountEl.textContent = `${shops.length} ta`;

  const filterBtn = document.querySelector('.btn-outline-small.btn-filter');
  if(filterBtn) filterBtn.innerHTML = `${t('filter')} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;

  if (shops.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text3); margin: 0 auto 12px; display: block;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <h3>${t('notFound')}</h3>
        <p>${t('searchOther')}</p>
      </div>`;
    return;
  }

  grid.className = _shopsLayoutMode === 'grid' ? 'shops-grid grid-layout' : 'shops-grid list-layout';

  grid.innerHTML = shops.map(shop => {
    const desc = escHtml((currentLang === 'ru' ? shop.description_ru : shop.description) || '');
    if (_shopsLayoutMode === 'grid') {
      return `
      <div class="market-card grid-card market-card-hidden"
           onclick="openShopModal(${shop.id})" role="button" tabindex="0"
           onkeydown="if(event.key==='Enter')openShopModal(${shop.id})">
        <div class="market-logo-box">
          ${logoFallback(shop.logoUrl, shop.name)}
        </div>
        <div class="market-info">
          <div class="market-name">${escHtml(shop.name)}</div>
          <div class="market-desc">${desc}</div>
        </div>
      </div>`;
    } else {
      return `
      <div class="market-card list-card market-card-hidden"
           onclick="openShopModal(${shop.id})" role="button" tabindex="0"
           onkeydown="if(event.key==='Enter')openShopModal(${shop.id})">
        <div class="market-logo-box">
          ${logoFallback(shop.logoUrl, shop.name)}
        </div>
        <div class="market-info">
          <div class="market-name">${escHtml(shop.name)}</div>
          <div class="market-desc">${desc}</div>
        </div>
        <div class="market-chevron">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>`;
    }
  }).join('');

  requestAnimationFrame(() => {
    grid.querySelectorAll('.market-card-hidden').forEach(el => el.classList.remove('market-card-hidden'));
  });
}

function enableDragScroll(el) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let didDrag = false;

    el.addEventListener('mousedown', (e) => {
        isDown = true;
        didDrag = false;
        el.style.cursor = 'grabbing';
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        e.preventDefault();
    });

    el.addEventListener('mouseleave', () => {
        isDown = false;
        el.style.cursor = '';
    });

    el.addEventListener('mouseup', () => {
        isDown = false;
        el.style.cursor = '';
    });

    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - el.offsetLeft;
        const walk = x - startX;
        if (Math.abs(walk) > 5) didDrag = true;
        el.scrollLeft = scrollLeft - walk;
    });

    // Block click on children if user dragged (prevents accidental pill activation)
    el.addEventListener('click', (e) => {
        if (didDrag) {
            e.stopPropagation();
            didDrag = false;
        }
    }, true);

    el.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        }
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch categories + subcategories in parallel to reduce load time
    try {
        const [catsRes, subsRes] = await Promise.all([
            fetch(`${API}/api/categories`),
            fetch(`${API}/api/subcategories`),
        ]);
        window._adminCategories = (await catsRes.json()).data || [];
        _liveSubCategories = (await subsRes.json()).data || [];
    } catch(e) {}

    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'shops.html' || page === 'shops') {
        initShopsPage();
        const wrap = document.querySelector('.cat-tabs-scroll');
        if (wrap) enableDragScroll(wrap);
    }
});

async function handleLangChangeMarket() {
  const btnNear = document.getElementById('lblNearMeBtn');
  if (btnNear) btnNear.textContent = t('nearMe');

  await buildCategoryTabs(_activeMainCategory);

  // Update title based on selected subcategory
  const activeBtn = document.querySelector('#catTabs .cat-pill.active');
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) {
    if (activeBtn && _activeSubCategory !== 'all') {
      titleEl.textContent = activeBtn.dataset.name;
    } else {
      titleEl.textContent = _activeMainCategory === 'all' ? t('allShops') : getCatName(_activeMainCategory);
    }
  }

  const shopsToRender = _nearMeFilterActive ? getSortedShops(_allShops) : _allShops;
  renderShops(shopsToRender);
}

function getSortedShops(shopsList) {
  let list = [...shopsList];
  const sortVal = document.getElementById('shopSort')?.value || 'default';
  
  if (sortVal === 'name-asc') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', currentLang === 'ru' ? 'ru' : 'uz'));
  } else if (sortVal === 'near-me' && _nearMeFilterActive && _userCoords) {
    list.sort((a, b) => {
      const hasA = a.latitude && a.longitude;
      const hasB = b.latitude && b.longitude;
      if (!hasA && !hasB) return 0;
      if (!hasA) return 1;
      if (!hasB) return -1;
      const distA = calculateDistance(_userCoords.lat, _userCoords.lng, a.latitude, a.longitude);
      const distB = calculateDistance(_userCoords.lat, _userCoords.lng, b.latitude, b.longitude);
      return distA - distB;
    });
  }
  return list;
}

function handleShopSortChange() {
  const sortVal = document.getElementById('shopSort')?.value || 'default';
  
  if (sortVal === 'near-me') {
    if (!_nearMeFilterActive) {
      showToast(currentLang === 'ru' ? '📍 Определение геопозиции...' : '📍 Geopozitsiyani aniqlash...', 'info');
      getUserLocation(
        (position) => {
          _userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          window._userCoords = _userCoords;
          _nearMeFilterActive = true;
          
          const sorted = getSortedShops(_allShops);
          renderShops(sorted);
          if (_currentViewMode === 'map') {
            initLeafletMap(sorted);
          }
          showToast('✅ Список отсортирован по расстоянию', 'success');
        },
        (error) => {
          console.error(error);
          showToast(currentLang === 'ru' ? '❌ Доступ к геопозиции отклонен или недоступен' : '❌ Geopozitsiyaga ruxsat rad etildi yoki mavjud emas', 'error');
          // reset back to default
          const selectEl = document.getElementById('shopSort');
          if (selectEl) selectEl.value = 'default';
          _nearMeFilterActive = false;
          const sorted = getSortedShops(_allShops);
          renderShops(sorted);
        }
      );
    } else {
      const sorted = getSortedShops(_allShops);
      renderShops(sorted);
      if (_currentViewMode === 'map') {
        initLeafletMap(sorted);
      }
    }
  } else {
    _nearMeFilterActive = false;
    const sorted = getSortedShops(_allShops);
    renderShops(sorted);
    if (_currentViewMode === 'map') {
      initLeafletMap(sorted);
    }
  }
}

// ─── Filter Dropdown Handlers ─────────────────────────────────────
window.toggleFilterDropdown = (e) => {
  e.stopPropagation();
  const menu = document.getElementById('filterDropdownMenu');
  if (menu) {
    const isHidden = menu.style.display === 'none' || menu.style.display === '';
    menu.style.display = isHidden ? 'flex' : 'none';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    const menu = document.getElementById('filterDropdownMenu');
    if (menu) menu.style.display = 'none';
  });

  // Prevent dropdown closure when clicking inside the menu
  const menuEl = document.getElementById('filterDropdownMenu');
  if (menuEl) {
    menuEl.addEventListener('click', (e) => e.stopPropagation());
  }
});

function switchViewMode(mode) {
  _currentViewMode = mode;
  const listBtn = document.getElementById('btnListView');
  const mapBtn = document.getElementById('btnMapView');
  const listGrid = document.getElementById('shopsGrid');
  const mapDiv = document.getElementById('shopsMap');
  
  if (!listBtn || !mapBtn || !listGrid || !mapDiv) return;

  const shopsToRender = _nearMeFilterActive ? getSortedShops(_allShops) : _allShops;

  if (mode === 'map') {
    listBtn.classList.remove('active');
    listBtn.style.background = 'transparent';
    listBtn.style.color = 'var(--text2)';
    
    mapBtn.classList.add('active');
    mapBtn.style.background = 'var(--accent)';
    mapBtn.style.color = '#fff';
    
    listGrid.style.display = 'none';
    mapDiv.style.display = 'block';
    
    initLeafletMap(shopsToRender);
    setTimeout(() => {
      if (_map) _map.invalidateSize();
    }, 100);
  } else {
    mapBtn.classList.remove('active');
    mapBtn.style.background = 'transparent';
    mapBtn.style.color = 'var(--text2)';
    
    listBtn.classList.add('active');
    listBtn.style.background = 'var(--accent)';
    listBtn.style.color = '#fff';
    
    mapDiv.style.display = 'none';
    listGrid.style.display = 'grid';
  }
}

function initLeafletMap(shops) {
  if (!_map) {
    const center = _userCoords ? [_userCoords.lat, _userCoords.lng] : [41.311081, 69.240562];
    _map = L.map('shopsMap').setView(center, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(_map);
  }
  
  _mapMarkers.forEach(m => _map.removeLayer(m));
  _mapMarkers = [];
  
  const bounds = [];
  
  if (_userCoords) {
    const userLatLng = [_userCoords.lat, _userCoords.lng];
    bounds.push(userLatLng);
    
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    const userMarker = L.marker(userLatLng, { icon: redIcon })
      .addTo(_map)
      .bindPopup(`<strong style="color:var(--red);">${currentLang === 'ru' ? 'Вы здесь' : 'Siz shu yerdamisiz'}</strong>`);
    _mapMarkers.push(userMarker);
  }

  shops.forEach(shop => {
    if (shop.latitude && shop.longitude) {
      const latLng = [shop.latitude, shop.longitude];
      bounds.push(latLng);
      
      let distanceText = '';
      if (_userCoords) {
        const dist = calculateDistance(_userCoords.lat, _userCoords.lng, shop.latitude, shop.longitude);
        if (dist !== null) {
          const text = t('kmAway').replace('{km}', dist.toFixed(1));
          distanceText = `<div style="font-size:12px;color:var(--accent);font-weight:700;margin-top:4px;">📍 ${text}</div>`;
        }
      }
      
      const marker = L.marker(latLng)
        .addTo(_map)
        .bindPopup(`
          <div style="font-family:inherit;padding:4px;min-width:180px;text-align:left;">
            <strong style="font-size:14px;color:var(--text);display:block;margin-bottom:2px;">${escHtml(shop.name)}</strong>
            <div style="font-size:11px;color:var(--text2);margin-bottom:6px;">${escHtml(shop.location || '')}</div>
            ${distanceText}
            <button onclick="openShopModal(${shop.id})" class="btn-primary-ar" style="width:100%;margin-top:8px;padding:6px 12px;font-size:11px;border-radius:6px;box-shadow:none;color:#fff;border:none;cursor:pointer;justify-content:center;display:flex;align-items:center;">
              ${currentLang === 'ru' ? 'Войти в магазин' : 'Do\'konga kirish'}
            </button>
          </div>
        `);
      _mapMarkers.push(marker);
    }
  });

  if (bounds.length > 0) {
    _map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    const center = _userCoords ? [_userCoords.lat, _userCoords.lng] : [41.311081, 69.240562];
    _map.setView(center, 12);
  }
}

window.addEventListener('langchange', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    if (page === 'shops.html' || page === 'shops') {
        handleLangChangeMarket();
    }
});

function _syncLayoutToggleIcon() {
  const btnIcon = document.getElementById('layoutToggleIcon');
  if (!btnIcon) return;
  if (_shopsLayoutMode === 'list') {
    // currently list → icon shows grid option
    btnIcon.innerHTML = `
      <rect x="4" y="4" width="6" height="16" rx="1"></rect>
      <rect x="14" y="4" width="6" height="16" rx="1"></rect>
    `;
  } else {
    // currently grid → icon shows list option
    btnIcon.innerHTML = `
      <rect x="4" y="4" width="16" height="6" rx="1"></rect>
      <rect x="4" y="14" width="16" height="6" rx="1"></rect>
    `;
  }
}

function toggleLayoutMode() {
  _shopsLayoutMode = _shopsLayoutMode === 'grid' ? 'list' : 'grid';
  localStorage.setItem('topin_layout_mode', _shopsLayoutMode);
  _syncLayoutToggleIcon();

  const shopsToRender = _nearMeFilterActive ? getSortedShops(_allShops) : _allShops;
  renderShops(shopsToRender);
}
