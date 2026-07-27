/**
 * editorAdmin.js — Visual HTML/CSS Editor for Topin Admin
 * Loads the live site in an iframe, lets admin click elements to inspect/edit their styles,
 * and generates a CSS override sheet that persists to localStorage (and optionally the server).
 */

(function () {
    'use strict';

    const iframe = document.getElementById('previewFrame');
    const overlay = document.getElementById('editorOverlay');
    const highlight = document.getElementById('editorHighlight');
    const iframeWrap = document.getElementById('iframeWrap');
    const pageSelector = document.getElementById('pageSelector');
    const changesList = document.getElementById('changesList');
    const changesCount = document.getElementById('changesCount');

    let selectedEl = null;
    let iframeDoc = null;
    let changes = JSON.parse(localStorage.getItem('topin_editor_changes') || '[]');
    let customSheet = null; // <style> inside iframe

    // ─── Page switching ───
    pageSelector.addEventListener('change', () => {
        iframe.src = pageSelector.value;
        selectedEl = null;
        hideHighlight();
        showNoSelection();
    });

    // ─── Device switching ───
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            iframeWrap.style.width = btn.dataset.w + 'px';
            iframeWrap.style.height = btn.dataset.h + 'px';
        });
    });

    // ─── Iframe load ───
    iframe.addEventListener('load', () => {
        try {
            iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        } catch (e) {
            console.error('Cannot access iframe (cross-origin)', e);
            return;
        }

        // Inject custom style sheet for overrides
        customSheet = iframeDoc.createElement('style');
        customSheet.id = 'editor-overrides';
        iframeDoc.head.appendChild(customSheet);

        // Apply saved changes
        applyAllChanges();

        // Set up click handler via overlay
        setupOverlayEvents();
    });

    // ─── Overlay events (element selection) ───
    function setupOverlayEvents() {
        let hoverEl = null;

        overlay.addEventListener('mousemove', (e) => {
            const rect = iframeWrap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Get element at point in iframe
            overlay.style.pointerEvents = 'none';
            const el = iframeDoc.elementFromPoint(x, y);
            overlay.style.pointerEvents = 'auto';

            if (el && el !== hoverEl && el !== iframeDoc.body && el !== iframeDoc.documentElement) {
                hoverEl = el;
                showHighlight(el);
            }
        });

        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            if (!hoverEl) return;
            selectElement(hoverEl);
        });

        overlay.addEventListener('mouseleave', () => {
            if (!selectedEl) hideHighlight();
            hoverEl = null;
        });
    }

    // ─── Highlight box ───
    function showHighlight(el) {
        const elRect = el.getBoundingClientRect();
        highlight.style.display = 'block';
        highlight.style.left = elRect.left + 'px';
        highlight.style.top = elRect.top + 'px';
        highlight.style.width = elRect.width + 'px';
        highlight.style.height = elRect.height + 'px';

        const tag = el.tagName.toLowerCase();
        const cls = el.className ? '.' + String(el.className).split(' ').filter(c => c && !c.startsWith('editor-')).join('.') : '';
        const id = el.id ? '#' + el.id : '';
        highlight.setAttribute('data-tag', tag + id + (cls.length < 40 ? cls : ''));
    }

    function hideHighlight() {
        highlight.style.display = 'none';
    }

    // ─── Element selection ───
    function selectElement(el) {
        selectedEl = el;
        showHighlight(el);

        document.getElementById('noSelectionHint').style.display = 'none';
        document.getElementById('selectionPanel').style.display = 'block';

        // Tag + class
        const tag = el.tagName.toLowerCase();
        document.getElementById('selTagName').textContent = tag;
        const cls = el.className ? '.' + String(el.className).split(' ').filter(c => c).slice(0, 3).join('.') : '';
        const id = el.id ? '#' + el.id : '';
        document.getElementById('selClassName').textContent = id + cls || '(no class)';

        // Read computed styles
        const cs = iframe.contentWindow.getComputedStyle(el);

        // Text
        const textNode = getDirectText(el);
        document.getElementById('propText').value = textNode || '';

        // Typography
        document.getElementById('propFontSize').value = cs.fontSize;
        document.getElementById('propFontWeight').value = closestWeight(cs.fontWeight);
        setColorInputs('propColor', 'propColorText', cs.color);
        document.getElementById('propTextAlign').value = cs.textAlign;

        // Padding
        document.getElementById('propPaddingTop').value = cs.paddingTop;
        document.getElementById('propPaddingRight').value = cs.paddingRight;
        document.getElementById('propPaddingBottom').value = cs.paddingBottom;
        document.getElementById('propPaddingLeft').value = cs.paddingLeft;

        // Margin
        document.getElementById('propMarginTop').value = cs.marginTop;
        document.getElementById('propMarginRight').value = cs.marginRight;
        document.getElementById('propMarginBottom').value = cs.marginBottom;
        document.getElementById('propMarginLeft').value = cs.marginLeft;

        // Background
        setColorInputs('propBgColor', 'propBgColorText', cs.backgroundColor);
        document.getElementById('propBorderRadius').value = cs.borderRadius;
        document.getElementById('propBorder').value = cs.border === 'none' ? '' : cs.border;

        // Size
        document.getElementById('propWidth').value = cs.width;
        document.getElementById('propHeight').value = cs.height;
        document.getElementById('propDisplay').value = cs.display;
        document.getElementById('propGap').value = cs.gap || '';

        // Clear custom CSS
        document.getElementById('customCssEditor').value = '';
    }

    function showNoSelection() {
        document.getElementById('noSelectionHint').style.display = 'block';
        document.getElementById('selectionPanel').style.display = 'none';
    }

    // ─── Property change handlers ───
    const propMap = [
        { id: 'propFontSize', prop: 'font-size' },
        { id: 'propFontWeight', prop: 'font-weight' },
        { id: 'propTextAlign', prop: 'text-align' },
        { id: 'propPaddingTop', prop: 'padding-top' },
        { id: 'propPaddingRight', prop: 'padding-right' },
        { id: 'propPaddingBottom', prop: 'padding-bottom' },
        { id: 'propPaddingLeft', prop: 'padding-left' },
        { id: 'propMarginTop', prop: 'margin-top' },
        { id: 'propMarginRight', prop: 'margin-right' },
        { id: 'propMarginBottom', prop: 'margin-bottom' },
        { id: 'propMarginLeft', prop: 'margin-left' },
        { id: 'propBorderRadius', prop: 'border-radius' },
        { id: 'propBorder', prop: 'border' },
        { id: 'propWidth', prop: 'width' },
        { id: 'propHeight', prop: 'height' },
        { id: 'propDisplay', prop: 'display' },
        { id: 'propGap', prop: 'gap' },
    ];

    propMap.forEach(({ id, prop }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', () => applyProp(prop, el.value));
        el.addEventListener('input', () => {
            if (selectedEl) selectedEl.style[cssPropToJs(prop)] = el.value;
        });
    });

    // Text content
    document.getElementById('propText').addEventListener('change', (e) => {
        if (!selectedEl) return;
        setDirectText(selectedEl, e.target.value);
        addChange(getSelector(selectedEl), 'textContent', e.target.value);
    });

    // Color inputs
    document.getElementById('propColor').addEventListener('input', (e) => {
        if (!selectedEl) return;
        selectedEl.style.color = e.target.value;
        document.getElementById('propColorText').value = e.target.value;
    });
    document.getElementById('propColor').addEventListener('change', (e) => applyProp('color', e.target.value));
    document.getElementById('propColorText').addEventListener('change', (e) => {
        document.getElementById('propColor').value = e.target.value;
        applyProp('color', e.target.value);
    });

    document.getElementById('propBgColor').addEventListener('input', (e) => {
        if (!selectedEl) return;
        selectedEl.style.backgroundColor = e.target.value;
        document.getElementById('propBgColorText').value = e.target.value;
    });
    document.getElementById('propBgColor').addEventListener('change', (e) => applyProp('background-color', e.target.value));
    document.getElementById('propBgColorText').addEventListener('change', (e) => {
        document.getElementById('propBgColor').value = e.target.value;
        applyProp('background-color', e.target.value);
    });

    // Custom CSS apply
    document.getElementById('applyCssBtn').addEventListener('click', () => {
        if (!selectedEl) return;
        const css = document.getElementById('customCssEditor').value.trim();
        if (!css) return;
        const selector = getSelector(selectedEl);
        css.split(';').forEach(decl => {
            const [p, v] = decl.split(':').map(s => s.trim());
            if (p && v) {
                addChange(selector, p, v);
            }
        });
        applyAllChanges();
    });

    // ─── Apply a property change ───
    function applyProp(prop, value) {
        if (!selectedEl) return;
        selectedEl.style[cssPropToJs(prop)] = value;
        addChange(getSelector(selectedEl), prop, value);
    }

    // ─── Changes management ───
    function addChange(selector, prop, value) {
        // Remove existing same-selector+prop
        changes = changes.filter(c => !(c.selector === selector && c.prop === prop));
        changes.push({ selector, prop, value, time: Date.now() });
        saveChanges();
        renderChanges();
        applyAllChanges();
    }

    function saveChanges() {
        localStorage.setItem('topin_editor_changes', JSON.stringify(changes));
    }

    function renderChanges() {
        changesCount.textContent = changes.length;
        if (changes.length === 0) {
            changesList.innerHTML = '<div class="empty-hint" style="padding:8px; font-size:12px;">Нет изменений</div>';
            return;
        }
        changesList.innerHTML = changes.slice().reverse().map((c, i) => {
            const idx = changes.length - 1 - i;
            return `<div class="change-item">
                <span><span class="change-prop">${c.prop}</span>: ${c.value.substring(0, 20)}</span>
                <button class="change-undo" onclick="window._editorUndo(${idx})">✕</button>
            </div>`;
        }).join('');
    }

    window._editorUndo = (idx) => {
        changes.splice(idx, 1);
        saveChanges();
        renderChanges();
        applyAllChanges();
    };

    function applyAllChanges() {
        if (!customSheet) return;
        // Group by selector
        const grouped = {};
        changes.forEach(c => {
            if (c.prop === 'textContent') {
                // Apply text changes directly
                try {
                    const el = iframeDoc.querySelector(c.selector);
                    if (el) setDirectText(el, c.value);
                } catch (e) {}
                return;
            }
            if (!grouped[c.selector]) grouped[c.selector] = {};
            grouped[c.selector][c.prop] = c.value;
        });

        let css = '/* Topin Editor Overrides */\n';
        for (const [sel, props] of Object.entries(grouped)) {
            css += `${sel} {\n`;
            for (const [p, v] of Object.entries(props)) {
                css += `    ${p}: ${v} !important;\n`;
            }
            css += '}\n';
        }
        customSheet.textContent = css;
    }

    // ─── Toolbar buttons ───
    document.getElementById('undoBtn').addEventListener('click', () => {
        if (changes.length === 0) return;
        changes.pop();
        saveChanges();
        renderChanges();
        applyAllChanges();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (!confirm('Сбросить все изменения?')) return;
        changes = [];
        saveChanges();
        renderChanges();
        applyAllChanges();
        if (selectedEl) selectElement(selectedEl);
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        // Generate CSS and save to server
        const grouped = {};
        changes.filter(c => c.prop !== 'textContent').forEach(c => {
            if (!grouped[c.selector]) grouped[c.selector] = {};
            grouped[c.selector][c.prop] = c.value;
        });

        let css = '/* Generated by Topin Visual Editor */\n';
        for (const [sel, props] of Object.entries(grouped)) {
            css += `${sel} {\n`;
            for (const [p, v] of Object.entries(props)) {
                css += `    ${p}: ${v};\n`;
            }
            css += '}\n';
        }

        // Save to localStorage for now
        localStorage.setItem('topin_editor_css', css);

        // Copy to clipboard
        navigator.clipboard.writeText(css).then(() => {
            const btn = document.getElementById('saveBtn');
            btn.textContent = '✓ Скопировано!';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.textContent = 'Сохранить CSS';
                btn.style.background = '';
            }, 2000);
        });
    });

    // ─── Utility functions ───
    function getSelector(el) {
        if (el.id) return '#' + el.id;
        const classes = Array.from(el.classList).filter(c => c && !c.startsWith('editor-'));
        if (classes.length > 0) {
            const sel = el.tagName.toLowerCase() + '.' + classes.join('.');
            // Check uniqueness
            try {
                const matches = iframeDoc.querySelectorAll(sel);
                if (matches.length === 1) return sel;
            } catch (e) {}
            // Try with parent
            if (el.parentElement && el.parentElement.id) {
                return '#' + el.parentElement.id + ' > ' + sel;
            }
            return sel;
        }
        // Fallback: nth-child
        const parent = el.parentElement;
        if (parent) {
            const idx = Array.from(parent.children).indexOf(el) + 1;
            return getSelector(parent) + ' > ' + el.tagName.toLowerCase() + ':nth-child(' + idx + ')';
        }
        return el.tagName.toLowerCase();
    }

    function cssPropToJs(prop) {
        return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    }

    function getDirectText(el) {
        for (const node of el.childNodes) {
            if (node.nodeType === 3 && node.textContent.trim()) {
                return node.textContent.trim();
            }
        }
        if (el.children.length === 0) return el.textContent.trim();
        return '';
    }

    function setDirectText(el, text) {
        for (const node of el.childNodes) {
            if (node.nodeType === 3 && node.textContent.trim()) {
                node.textContent = text;
                return;
            }
        }
        if (el.children.length === 0) el.textContent = text;
    }

    function closestWeight(w) {
        const n = parseInt(w, 10);
        const weights = [300, 400, 500, 600, 700, 800];
        return String(weights.reduce((prev, curr) => Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev));
    }

    function rgbToHex(rgb) {
        const m = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return '#000000';
        return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }

    function setColorInputs(colorId, textId, value) {
        try {
            document.getElementById(colorId).value = rgbToHex(value);
        } catch (e) {}
        document.getElementById(textId).value = value;
    }

    // ─── Init ───
    renderChanges();

})();
