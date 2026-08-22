/**
 * Admin: manage the subcategory ("filter") chips shown on a category page.
 *
 * The order set here is the order visitors see, so this screen is where the
 * important filters get put on top. It cannot be derived automatically —
 * ordering by shop count reflects how many shops sell something, not how many
 * people look for it, and filter taps are not tracked.
 */

// Slug goes in URLs and is matched by every migration script, so keep it strict.
const FILTER_SLUG_RE = /^[a-z0-9-]+$/;

let _filterEditingId = null;   // null = adding, otherwise the id being edited
let _filterDragId = null;

/**
 * SubCategoryId -> how many shops carry it, counted from data admin.js already
 * fetched. `_adminShops` is a top-level `let` in admin.js, which loads after
 * this file, so a bare reference would throw rather than read undefined if that
 * script ever fails to run — hence the typeof guard.
 */
function filterShopCounts() {
    const counts = {};
    const shops = (typeof _adminShops !== 'undefined' && _adminShops) || [];
    shops.forEach(shop => {
        (shop.SubCategories || []).forEach(sc => {
            counts[sc.id] = (counts[sc.id] || 0) + 1;
        });
    });
    return counts;
}

function filtersInCategory() {
    return window._adminSubCategories
        .filter(sc => String(sc.CategoryId) === String(_currentAdminCategoryId))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
}

window.showFiltersView = (categoryId, categoryName) => {
    _currentAdminCategoryId = categoryId;
    document.getElementById('adminCategoryView').style.display = 'none';
    const shopsView = document.getElementById('adminShopsView');
    if (shopsView) shopsView.style.display = 'none';

    document.getElementById('adminFiltersView').style.display = 'block';

    const titleEl = document.getElementById('adminFiltersCategoryName') || document.getElementById('adminFiltersTitle');
    if (titleEl) titleEl.textContent = categoryName || '';

    renderAdminFilters();
};

window.renderAdminFilters = () => {
    const container = document.getElementById('adminFiltersList');
    if (!container || !_currentAdminCategoryId) return;

    const subCats = filtersInCategory();
    if (subCats.length === 0) {
        container.innerHTML = `<div style="text-align:center;color:var(--text3);padding:40px">${t('noFilters')}</div>`;
        return;
    }

    const counts = filterShopCounts();

    container.innerHTML = subCats.map((sc, index) => {
        const n = counts[sc.id] || 0;
        // An empty filter is a chip that returns nothing — worth flagging here,
        // since this screen is where someone decides what to keep.
        const countLabel = n
            ? `<span style="font-weight:600">${n}</span> <span style="color:var(--text3)">магазинов</span>`
            : `<span style="color:var(--text3)">пусто</span>`;
        const ruWarn = sc.name_ru
            ? ''
            : ` <span class="admin-fs-xs" style="color:var(--red)">(нет RU)</span>`;

        return `
        <div class="filter-row" draggable="true" data-id="${sc.id}" data-idx="${index}"
             style="display:flex; align-items:center; justify-content:space-between; gap:12px;
                    padding:12px; background:var(--surface); border:1px solid var(--border);
                    border-radius:8px; cursor:grab; transition:0.15s;">
            <div style="display:flex; align-items:center; gap:12px; min-width:0;">
                <span title="Перетащите, чтобы изменить порядок"
                      class="admin-fs-lg" style="color:var(--text3); line-height:1; cursor:grab;">⠿</span>
                <div style="display:flex; flex-direction:column; gap:3px;">
                    <button class="btn-icon" onclick="moveFilter(${sc.id}, -1)" aria-label="Выше"
                        ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>⬆️</button>
                    <button class="btn-icon" onclick="moveFilter(${sc.id}, 1)" aria-label="Ниже"
                        ${index === subCats.length - 1 ? 'disabled style="opacity:0.3"' : ''}>⬇️</button>
                </div>
                <div style="display:flex; flex-direction:column; min-width:0;">
                    <span style="font-weight:500">${escHtml(sc.name_ru || sc.name)}${ruWarn}</span>
                    <span class="admin-fs-xs" style="color:var(--text3)">
                        ${escHtml(sc.name)} • ${escHtml(sc.slug)} • ${countLabel}
                    </span>
                </div>
            </div>
            <div style="display:flex; gap:8px; flex-shrink:0">
                <button class="btn-edit" onclick="openFilterForm(${sc.id})" style="padding:6px 12px">${t('edit')}</button>
                <button class="btn-delete" onclick="deleteFilter(${sc.id})">${t('delete')}</button>
            </div>
        </div>`;
    }).join('');

    setupFilterDragDrop();
};

/**
 * Drag to reorder. The arrow buttons above stay, because dragging is not
 * reachable by keyboard or on a touchscreen.
 * Mirrors setupFeaturedDragDrop() in admin.js.
 */
function setupFilterDragDrop() {
    const rows = document.querySelectorAll('#adminFiltersList .filter-row');

    rows.forEach(row => {
        row.addEventListener('dragstart', () => {
            _filterDragId = Number(row.dataset.id);
            row.style.opacity = '0.4';
        });

        row.addEventListener('dragend', () => {
            row.style.opacity = '1';
            rows.forEach(r => { r.style.borderTop = ''; r.style.borderBottom = ''; });
        });

        row.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (Number(row.dataset.id) === _filterDragId) return;
            // Show the insertion point on the side the row would land on.
            const box = row.getBoundingClientRect();
            const above = e.clientY < box.top + box.height / 2;
            row.style.borderTop = above ? '2px solid var(--accent)' : '';
            row.style.borderBottom = above ? '' : '2px solid var(--accent)';
        });

        row.addEventListener('dragleave', () => {
            row.style.borderTop = '';
            row.style.borderBottom = '';
        });

        row.addEventListener('drop', e => {
            e.preventDefault();
            row.style.borderTop = '';
            row.style.borderBottom = '';
            const targetId = Number(row.dataset.id);
            if (!_filterDragId || targetId === _filterDragId) return;

            const box = row.getBoundingClientRect();
            const above = e.clientY < box.top + box.height / 2;

            const list = filtersInCategory();
            const from = list.findIndex(sc => sc.id === _filterDragId);
            const moved = list.splice(from, 1)[0];
            let to = list.findIndex(sc => sc.id === targetId);
            if (!above) to += 1;
            list.splice(to, 0, moved);

            persistFilterOrder(list);
        });
    });
}

/** Renumber 0..n-1 and save. Sending the whole list keeps the write idempotent. */
async function persistFilterOrder(ordered) {
    const previous = ordered.map(sc => ({ id: sc.id, order: sc.order }));
    ordered.forEach((sc, i) => { sc.order = i; });
    renderAdminFilters();                        // optimistic

    try {
        const res = await fetch(`${API}/api/subcategories/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify(ordered.map(sc => ({ id: sc.id, order: sc.order })))
        });
        if (handle401(res)) return;
        if (!res.ok) throw new Error('Reorder failed');
    } catch {
        // Put the old order back rather than leaving the screen lying about it.
        previous.forEach(p => {
            const sc = window._adminSubCategories.find(x => x.id === p.id);
            if (sc) sc.order = p.order;
        });
        renderAdminFilters();
        showToast(t('reorderError'), 'error');
    }
}

window.moveFilter = (id, direction) => {
    const list = filtersInCategory();
    const index = list.findIndex(sc => sc.id === id);
    if (index === -1) return;
    const target = index + direction;
    if (target < 0 || target >= list.length) return;

    [list[index], list[target]] = [list[target], list[index]];
    persistFilterOrder(list);
};

// ── Add / edit form ───────────────────────────────────────────────────────

window.openFilterForm = (id = null) => {
    _filterEditingId = id;
    const sc = id ? window._adminSubCategories.find(s => s.id === id) : null;

    document.getElementById('filterFormTitle').textContent = sc ? 'Изменить фильтр' : 'Добавить фильтр';
    document.getElementById('fFilterNameUz').value = sc ? (sc.name || '') : '';
    document.getElementById('fFilterNameRu').value = sc ? (sc.name_ru || '') : '';
    document.getElementById('fFilterSlug').value = sc ? (sc.slug || '') : '';
    document.getElementById('fFilterError').style.display = 'none';
    document.getElementById('fFilterRuHint').style.display = 'none';

    document.getElementById('filterFormOverlay').style.display = 'flex';
    document.getElementById('fFilterNameUz').focus();
};

window.closeFilterForm = () => {
    document.getElementById('filterFormOverlay').style.display = 'none';
    _filterEditingId = null;
};

function filterFormError(msg) {
    const el = document.getElementById('fFilterError');
    el.textContent = msg;
    el.style.display = 'block';
}

window.saveFilterForm = async () => {
    const name = document.getElementById('fFilterNameUz').value.trim();
    const nameRu = document.getElementById('fFilterNameRu').value.trim();
    const slug = document.getElementById('fFilterSlug').value.trim().toLowerCase();

    if (!name) return filterFormError('Укажите название на узбекском.');
    if (!slug) return filterFormError('Укажите системный ключ.');
    if (!FILTER_SLUG_RE.test(slug)) {
        return filterFormError('Ключ может содержать только латиницу, цифры и дефис — например porcelain-stoneware.');
    }

    // Unique within the category: two chips with one slug make the filter ambiguous.
    const clash = window._adminSubCategories.find(sc =>
        String(sc.CategoryId) === String(_currentAdminCategoryId) &&
        sc.slug === slug && sc.id !== _filterEditingId);
    if (clash) return filterFormError(`Ключ "${slug}" уже занят фильтром «${clash.name_ru || clash.name}».`);

    // Missing RU is what made Специалисты show "Plitkachilar" to Russian
    // visitors. Warn once, then allow it — sometimes there is no translation yet.
    const ruHint = document.getElementById('fFilterRuHint');
    if (!nameRu && ruHint.style.display === 'none') {
        ruHint.style.display = 'block';
        return;
    }

    const payload = { name, name_ru: nameRu || null, slug };
    const editing = _filterEditingId !== null;

    try {
        const res = await fetch(
            editing ? `${API}/api/subcategories/${_filterEditingId}` : `${API}/api/subcategories`,
            {
                method: editing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                },
                body: JSON.stringify(editing ? payload : {
                    ...payload,
                    CategoryId: _currentAdminCategoryId,
                    order: filtersInCategory().length      // new chips go last
                })
            });

        if (handle401(res)) return;
        if (!res.ok) throw new Error();
        const saved = (await res.json()).data;

        if (editing) {
            const idx = window._adminSubCategories.findIndex(s => s.id === _filterEditingId);
            if (idx !== -1) window._adminSubCategories[idx] = saved;
            showToast(t('updated'), 'success');
        } else {
            window._adminSubCategories.push(saved);
            showToast(t('filterAdded'), 'success');
        }

        closeFilterForm();
        renderAdminFilters();
    } catch {
        filterFormError(editing ? 'Не удалось сохранить.' : 'Не удалось добавить фильтр.');
    }
};

window.deleteFilter = async (id) => {
    const sc = window._adminSubCategories.find(s => s.id === id);
    if (!sc) return;
    const label = sc.name_ru || sc.name;
    const n = filterShopCounts()[id] || 0;

    // Deleting takes the shop tags with it and they are not recoverable from the
    // catalogue, so a busy filter has to be confirmed by typing its name.
    if (n > 0) {
        const typed = prompt(
            `К фильтру «${label}» привязано ${n} магазинов.\n` +
            `Удаление снимет эти теги — восстановить их можно только вручную.\n\n` +
            `Чтобы подтвердить, введите название фильтра:`);
        if (typed === null) return;
        if (typed.trim() !== label) {
            showToast('Название не совпало — удаление отменено', 'error');
            return;
        }
    } else if (!confirm(`${t('delete')} «${label}»?`)) {
        return;
    }

    try {
        const res = await fetch(`${API}/api/subcategories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        });
        if (handle401(res)) return;
        if (!res.ok) throw new Error('Deletion failed');

        window._adminSubCategories = window._adminSubCategories.filter(x => x.id !== id);
        showToast(t('filterDeleted'), 'success');
        renderAdminFilters();
    } catch {
        showToast(t('deleteFilterError'), 'error');
    }
};
