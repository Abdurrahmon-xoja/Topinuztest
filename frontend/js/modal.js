let _carouselTimer = null;
let _carouselIdx = 0;
let _carouselCount = 0;
let _navigatingToStore = false;
let _modalScrollY = 0;

function _buildCarousel(images) {
    _stopCarousel();
    const el = document.getElementById('shopCarousel');
    if (!el) return;

    const sorted = [...images].sort((a, b) => a.order - b.order);

    if (!sorted.length) {
        el.innerHTML = '';
        el.style.display = 'none';
        return;
    }

    _carouselCount = sorted.length;
    _carouselIdx = 0;

    const slides = sorted.map((img, i) =>
        `<div class="carousel-slide"><img src="${escHtml(cloudinaryOptimize(img.url, 800))}" alt="Фото ${i + 1}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></div>`
    ).join('');

    const dots = sorted.length > 1
        ? `<div class="carousel-dots">${sorted.map((_, i) =>
            `<span class="carousel-dot${i === 0 ? ' active' : ''}"></span>`
          ).join('')}</div>`
        : '';

    el.innerHTML = `<div class="carousel-inner" id="carouselInner">${slides}</div>${dots}`;
    el.style.display = 'block';

    if (sorted.length > 1) {
        _carouselTimer = setInterval(() => {
            _carouselIdx = (_carouselIdx + 1) % _carouselCount;
            _goToSlide(_carouselIdx);
        }, 3000);

        _initCarouselSwipe(el);
    }
}

function _initCarouselSwipe(el) {
    let startX = 0;
    let isDragging = false;

    function resetTimer() {
        if (_carouselTimer) { clearInterval(_carouselTimer); _carouselTimer = null; }
        _carouselTimer = setInterval(() => {
            _carouselIdx = (_carouselIdx + 1) % _carouselCount;
            _goToSlide(_carouselIdx);
        }, 3000);
    }

    // Touch
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < 30) return;
        _carouselIdx = dx < 0
            ? (_carouselIdx + 1) % _carouselCount
            : (_carouselIdx - 1 + _carouselCount) % _carouselCount;
        _goToSlide(_carouselIdx);
        resetTimer();
    }, { passive: true });

    // Mouse — listen on document so mouseup fires even outside the element
    el.addEventListener('mousedown', e => {
        startX = e.clientX;
        isDragging = true;
        el.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        el.style.cursor = 'grab';
        const dx = e.clientX - startX;
        if (Math.abs(dx) < 30) return;
        _carouselIdx = dx < 0
            ? (_carouselIdx + 1) % _carouselCount
            : (_carouselIdx - 1 + _carouselCount) % _carouselCount;
        _goToSlide(_carouselIdx);
        resetTimer();
    });

    // Prevent native image drag interfering
    el.querySelectorAll('img').forEach(img => img.addEventListener('dragstart', e => e.preventDefault()));
    el.style.cursor = 'grab';
}

function _goToSlide(idx) {
    const inner = document.getElementById('carouselInner');
    if (inner) inner.style.transform = `translateX(-${idx * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function _stopCarousel() {
    if (_carouselTimer) { clearInterval(_carouselTimer); _carouselTimer = null; }
    _carouselIdx = 0;
    _carouselCount = 0;
}

function openShopModal(shopId) {
    window._currentOpenShopId = shopId;
    const shop = _allShops.find(s => s.id === shopId);
    if (!shop) return;

    // Logo
    document.getElementById('modalLogo').innerHTML = logoFallback(shop.logoUrl, shop.name);

    // Info Column
    document.getElementById('modalName').textContent = shop.name;

    // Rating
    const ratingContainer = document.getElementById('modalRatingContainer');
    if (ratingContainer) {
      ratingContainer.innerHTML = renderRatingStarsHtml(shop.rating, shop.reviewsCount);
    }

    const desc = currentLang === 'ru' ? shop.description_ru : shop.description;
    const descEl = document.getElementById('modalDescFull');
    if (descEl) {
      if (desc && desc.trim()) {
        descEl.textContent = desc;
        descEl.style.display = '-webkit-box';
        descEl.classList.remove('expanded');
        descEl.onclick = () => descEl.classList.toggle('expanded');
      } else {
        descEl.textContent = '';
        descEl.style.display = 'none';
      }
    }

    document.getElementById('modalLocText').textContent = shop.location || t('locPlaceholder');

    // Localized labels for the redesigned modal
    const locTitleEl = document.getElementById('modalLocTitle');
    if (locTitleEl) locTitleEl.textContent = t('locationTitle');
    const tgLabelEl = document.getElementById('modalTgLabel');
    if (tgLabelEl) tgLabelEl.textContent = t('contactTelegram');
    const productsTitleEl = document.getElementById('modalProductsTitle');
    if (productsTitleEl) productsTitleEl.textContent = t('productsTitle');
    const allBtnEl = document.getElementById('modalAllBtn');
    if (allBtnEl && shop.slug) allBtnEl.href = `/stores/${shop.slug}`;
    const allBtnTextEl = document.getElementById('modalAllBtnText');
    if (allBtnTextEl) allBtnTextEl.textContent = t('hammasi');

    // Directions icon: open map link explicitly
    const directionsEl = document.getElementById('modalDirectionsBtn');
    if (directionsEl) {
      const mapUrl = shop.locationLink || (shop.location ? `https://maps.google.com/?q=${encodeURIComponent(shop.location)}` : null);
      directionsEl.style.display = mapUrl ? 'flex' : 'none';
      directionsEl.onclick = (e) => {
        if (!mapUrl) return;
        e.stopPropagation();
        goExternal(mapUrl);
      };
    }

    // Make location clickable if a map link exists
    const locEl = document.getElementById('modalLoc');
    if (locEl) {
      if (shop.locationLink) {
        locEl.style.cursor = 'pointer';
        locEl.style.textDecoration = 'none';
        locEl.onclick = () => goExternal(shop.locationLink);
      } else if (shop.location) {
        locEl.style.cursor = 'pointer';
        locEl.style.textDecoration = 'none';
        locEl.onclick = () => goExternal(`https://maps.google.com/?q=${encodeURIComponent(shop.location)}`);
      } else {
        locEl.style.cursor = '';
        locEl.style.textDecoration = '';
        locEl.onclick = null;
      }
    }

    // Load dynamic map
    const mapContainer = document.getElementById('modalMapContainer');
    const mapIframe = document.getElementById('modalMapIframe');
    if (mapContainer && mapIframe) {
      if (shop.location) {
        mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(shop.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        mapContainer.style.display = 'block';
      } else {
        mapIframe.src = '';
        mapContainer.style.display = 'none';
      }
    }

    // Sticky Bottom Actions setup
    const tgAction = document.getElementById('modalTgActionBtn');
    const phoneAction = document.getElementById('modalPhoneActionBtn');
    const phoneActionText = document.getElementById('modalPhoneActionText');
    const stickyActions = document.getElementById('modalStickyActions');
    
    if (stickyActions) {
      if (shop.telegram || shop.phone) {
        stickyActions.style.display = 'flex';
        if (tgAction) {
          if (shop.telegram) {
            tgAction.style.display = 'flex';
            tgAction.href = shop.telegram.startsWith('http') ? shop.telegram : `https://t.me/${shop.telegram.replace('@', '')}`;
          } else {
            tgAction.style.display = 'none';
          }
        }
        if (phoneAction) {
          if (shop.phone) {
            phoneAction.style.display = 'flex';
            phoneAction.href = `tel:${shop.phone}`;
            if (phoneActionText) phoneActionText.textContent = shop.phone;
          } else {
            phoneAction.style.display = 'none';
          }
        }
      } else {
        stickyActions.style.display = 'none';
      }
    }

    // Rows
    const rows = [];
    if (shop.instagram) {
      const handle = shop.instagram.split('/').pop().replace('?','');
      rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.instagram)}')" style="cursor:pointer">
        <svg class="modal-row-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
        <span class="modal-row-text">@${escHtml(handle)}</span>
      </div>`);
    }
    if (shop.telegram) {
      const handle = shop.telegram.split('/').pop();
      rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.telegram)}')" style="cursor:pointer">
        <svg class="modal-row-svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21.94 2.4a1.5 1.5 0 0 0-1.53-.26L2.7 9.07a1.5 1.5 0 0 0 .1 2.83l4.63 1.48 1.77 5.79a1.5 1.5 0 0 0 2.55.6l2.28-2.42 4.36 3.22a1.5 1.5 0 0 0 2.37-.92l2.16-15.79a1.5 1.5 0 0 0-.98-1.46zM9.5 13.5l8.4-7.4-6.8 8.9-.3 3.2-1.3-4.7z"></path>
        </svg>
        <span class="modal-row-text">@${escHtml(handle)}</span>
      </div>`);
    }
    if (shop.customLinks) {
      try {
        const links = JSON.parse(shop.customLinks);
        links.forEach(link => {
          rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(link.url)}')" style="cursor:pointer">
            <svg class="modal-row-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span class="modal-row-text">${escHtml(link.label)}</span>
          </div>`);
        });
      } catch(e) { showToast(t('copyError'), 'error'); }
    }
    if (shop.website) {
      const host = new URL(shop.website).hostname.replace('www.','');
      rows.push(`<div class="modal-row" onclick="goExternal('${escHtml(shop.website)}')" style="cursor:pointer">
        <svg class="modal-row-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
        <span class="modal-row-text">www.${escHtml(host)}</span>
      </div>`);
    }

    document.getElementById('modalRows').innerHTML = rows.join('');

    // Carousel
    _buildCarousel(shop.ShopImages || []);

    // Primary buttons
    const shareBtn = document.getElementById('modalShareBtn');

    if (shareBtn) {
      shareBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      `;
      shareBtn.onclick = async () => {
        const shareCat = shop.Category && shop.Category.slug ? shop.Category.slug : _activeMainCategory;
        const shareUrl = `${window.location.origin}${window.location.pathname}?category=${shareCat}&shop=${shop.id}`;
        
        let descParts = [];
        if (shop.description_ru || shop.description) {
            descParts.push((currentLang === 'ru' ? shop.description_ru : shop.description) || shop.description || shop.description_ru);
        }
        if (shop.workingHours) {
            descParts.push(currentLang === 'ru' ? `🕒 Время работы: ${shop.workingHours}` : `🕒 Ish vaqti: ${shop.workingHours}`);
        }
        const contacts = [];
        if (shop.phone) contacts.push(shop.phone);
        if (shop.telegram) contacts.push(`@${shop.telegram.replace('@', '')}`);
        if (contacts.length > 0) {
            descParts.push(currentLang === 'ru' ? `📞 Контакты: ${contacts.join(', ')}` : `📞 Kontaktlar: ${contacts.join(', ')}`);
        }
        if (shop.location) {
            descParts.push(currentLang === 'ru' ? `📍 Адрес: ${shop.location}` : `📍 Manzil: ${shop.location}`);
        }
        
        const shopTitle = shop.name;
        const shopText = descParts.join('\n');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shopTitle,
                    text: shopText,
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showCustomShareMenu(shareUrl, shopTitle, shopText);
                }
            }
        } else {
            showCustomShareMenu(shareUrl, shopTitle, shopText);
        }
      };
    }

    const overlay = document.getElementById('shopModal');
    if (overlay) {
        overlay.style.display = 'flex';
        const floatingBar = document.getElementById('floatingSearchBar');
        if (floatingBar) floatingBar.style.display = 'none';
        
        // Lock background scroll
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Reset sheet layout and scroll position
        const sheet = document.getElementById('modalSheet');
        if (sheet) {
            sheet.classList.remove('expanded');
        }
        
        const modalBody = overlay.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        _navigatingToStore = false;

        // Reset reviews form
        selectedModalRating = 5;
        const authorInput = document.getElementById('modalReviewAuthor');
        const commentInput = document.getElementById('modalReviewComment');
        if (authorInput) authorInput.value = '';
        if (commentInput) commentInput.value = '';
        const starSelector = document.getElementById('modalStarSelector');
        if (starSelector) {
            const stars = starSelector.querySelectorAll('span');
            stars.forEach(s => {
                s.textContent = parseInt(s.dataset.val) <= 5 ? '★' : '☆';
                s.classList.add('selected');
            });
        }

        // Load reviews list
        loadModalReviews(shop.id);

        // Fetch and render the store's products inside the bottom sheet
        _loadModalProducts(shop.id, shop.slug, shop.name, shop.currency || 'UZS');
    }
}

async function _loadModalProducts(shopId, shopSlug, shopName, shopCurrency) {
    const container = document.getElementById('modalProductsSection');
    const grid = document.getElementById('modalProductsGrid');
    if (!container || !grid) return;

    container.style.display = 'block';
    // Render placeholders
    grid.innerHTML = Array(4).fill().map(() => `
        <div class="skeleton-card" style="height: 250px; width: 168px; flex-shrink: 0; opacity: 0.6;"></div>
    `).join('');

    try {
        const res = await fetch(`/api/shops/${shopId}/products?limit=24`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const products = json.data || [];

        if (products.length === 0) {
            container.style.display = 'none';
            return;
        }

        grid.innerHTML = products.map(prod => {
            const hasAr = prod.glbUrl || prod.usdzUrl;
            const arBadge = hasAr ? `
                <div class="product-card-ar-badge">3D
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
            ` : '';

            const currency = (!shopCurrency || shopCurrency === 'UZS') ? (currentLang === 'ru' ? 'сум' : "so'm") : shopCurrency;
            const priceStr = prod.price 
                ? `${parseFloat(prod.price).toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ')} ${currency}`
                : (currentLang === 'ru' ? 'Цена по запросу' : 'Narx soʻrov boʻyicha');
                
            const oldPriceHtml = prod.salePrice
                ? `<span class="product-card-old-price">${parseFloat(prod.price).toLocaleString()} ${currency}</span>`
                : '';
                
            const displayPriceStr = prod.salePrice
                ? `${parseFloat(prod.salePrice).toLocaleString()} ${currency}`
                : priceStr;

            const imageUrl = prod.imageUrl || 'img/placeholder.png';

            return `
                <a href="/stores/${shopSlug}/products/${prod.slug}" class="product-card">
                    <div class="product-card-img-wrap">
                        <img src="${cloudinaryOptimize(imageUrl)}" alt="${escHtml(prod.name)}" class="product-card-img" loading="lazy">
                        ${arBadge}
                    </div>
                    <div class="product-card-content">
                        <span class="product-card-shop">${escHtml(shopName)}</span>
                        <h3 class="product-card-name">${escHtml(prod.name)}</h3>
                        <div class="product-card-price-row">
                            <span class="product-card-price" ${prod.salePrice ? 'style="color: var(--red);"' : ''}>${displayPriceStr}</span>
                            ${oldPriceHtml}
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (e) {
        console.error('Error loading modal products:', e);
        container.style.display = 'none';
    }
}

function closeShopModal(immediate = false) {
    window._currentOpenShopId = null;
    _stopCarousel();
    const overlay = document.getElementById('shopModal');
    const sheet = document.getElementById('modalSheet');
    const floatingBar = document.getElementById('floatingSearchBar');
    if (floatingBar) floatingBar.style.display = '';
    
    // Unlock background scroll helper
    const unlockBody = () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    };

    if (overlay) {
        if (immediate) {
            overlay.style.display = 'none';
            overlay.classList.remove('closing');
            if (sheet) {
                sheet.classList.remove('expanded');
                sheet.style.transform = '';
                sheet.style.transition = '';
            }
            unlockBody();
            return;
        }

        if (overlay.classList.contains('closing')) return;

        overlay.classList.add('closing');
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('closing');
            if (sheet) {
                sheet.classList.remove('expanded');
                sheet.style.transform = '';
                sheet.style.transition = '';
            }
            unlockBody();
        }, 280);
    }
}

// Close with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShopModal();
      if (typeof closeShopForm === 'function') closeShopForm();
    }
});

// Auto-expand/collapse bottom sheet on mobile scroll & swipe down to close
function initModalScrollRedirect() {
    const overlay = document.getElementById('shopModal');
    const modalBody = document.querySelector('#shopModal .modal-body');
    const sheet = document.getElementById('modalSheet');
    if (modalBody && sheet && overlay) {
        let lastScrollTopTime = 0;

        modalBody.addEventListener('scroll', () => {
            if (modalBody.scrollTop > 0) {
                lastScrollTopTime = Date.now();
            }
            // Check if mobile view (e.g. width < 600px)
            if (window.innerWidth < 600) {
                if (modalBody.scrollTop > 15) {
                    sheet.classList.add('expanded');
                } else if (modalBody.scrollTop <= 0) {
                    sheet.classList.remove('expanded');
                }
            }
        });

        // Touch swipe-down to close on mobile
        let startY = 0;
        let dragStartY = 0;
        let isDraggingSheet = false;
        let startedAtTop = false;

        overlay.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startedAtTop = (modalBody.scrollTop <= 0);
        }, { passive: true });

        overlay.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const dy = currentY - startY;

            const isBody = e.target.closest('.modal-body');
            const isBackdrop = e.target === overlay;
            const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;

            // If touch starts outside modal-body (e.g. header, handle, backdrop), block background scrolling
            if (!isBody) {
                if ((isBackdrop || (startedAtTop && modalBody.scrollTop <= 0)) && dy > 0) {
                    if (!isDraggingSheet) {
                        isDraggingSheet = true;
                        dragStartY = currentY;
                    }
                }

                if (isDraggingSheet) {
                    const dragDistance = currentY - dragStartY;
                    if (dragDistance > 0) {
                        sheet.style.transform = `translateY(${dragDistance}px)`;
                        sheet.style.transition = 'none';
                    } else {
                        sheet.style.transform = '';
                        isDraggingSheet = false;
                    }
                }
                if (e.cancelable) e.preventDefault();
                return;
            }

            // Inside modal-body
            if ((startedAtTop && modalBody.scrollTop <= 0) && dy > 0) {
                if (!isDraggingSheet) {
                    isDraggingSheet = true;
                    dragStartY = currentY;
                }
            }

            if (isDraggingSheet) {
                const dragDistance = currentY - dragStartY;
                if (dragDistance > 0) {
                    sheet.style.transform = `translateY(${dragDistance}px)`;
                    sheet.style.transition = 'none';
                    if (e.cancelable) e.preventDefault();
                } else {
                    sheet.style.transform = '';
                    isDraggingSheet = false;
                }
            } else if (!isScrollable) {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        overlay.addEventListener('touchend', (e) => {
            if (isDraggingSheet) {
                isDraggingSheet = false;
                sheet.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

                const endY = e.changedTouches[0] ? e.changedTouches[0].clientY : startY;
                const dragDistance = endY - dragStartY;

                if (dragDistance > 100) {
                    sheet.style.transform = 'translateY(100%)';
                    overlay.classList.add('closing');
                    setTimeout(() => {
                        closeShopModal(true);
                    }, 300);
                } else {
                    sheet.style.transform = '';
                    setTimeout(() => {
                        sheet.style.transition = '';
                    }, 300);
                }
            }
            startY = 0;
            dragStartY = 0;
            startedAtTop = false;
        }, { passive: true });

        // Scroll wheel / trackpad close on desktop when at the top (avoiding inertial scroll artifacts)
        overlay.addEventListener('wheel', (e) => {
            const isBody = e.target.closest('.modal-body');
            if (isBody) {
                const timeSinceScroll = Date.now() - lastScrollTopTime;
                if (modalBody.scrollTop <= 0 && e.deltaY < -5 && timeSinceScroll > 200) {
                    closeShopModal();
                    return;
                }
                
                // Prevent background scroll chain propagation
                const isScrollingUp = e.deltaY < 0;
                const isScrollingDown = e.deltaY > 0;
                const isAtTop = modalBody.scrollTop <= 0;
                const isAtBottom = modalBody.scrollHeight - modalBody.clientHeight - modalBody.scrollTop <= 1;

                if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
                    if (e.cancelable) e.preventDefault();
                }
            } else {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });
    }
}

let selectedModalRating = 5;

function setupModalStarSelector() {
    const stars = document.querySelectorAll('#modalStarSelector span');
    if (stars.length === 0) return;

    function updateStarsVisuals(rating) {
        stars.forEach(s => {
            const val = parseInt(s.dataset.val);
            if (val <= rating) {
                s.textContent = '★';
                s.classList.add('selected');
            } else {
                s.textContent = '☆';
                s.classList.remove('selected');
            }
        });
    }

    // Default
    updateStarsVisuals(5);

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const hoverVal = parseInt(star.dataset.val);
            stars.forEach(s => {
                const val = parseInt(s.dataset.val);
                s.classList.toggle('hovered', val <= hoverVal);
            });
        });

        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });

        star.addEventListener('click', () => {
            selectedModalRating = parseInt(star.dataset.val);
            updateStarsVisuals(selectedModalRating);
        });
    });
}

async function loadModalReviews(shopId) {
    const listEl = document.getElementById('modalReviewsList');
    if (!listEl) return;

    listEl.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text3);">${currentLang === 'ru' ? '⏳ Загрузка отзывов...' : '⏳ Fikrlar yuklanmoqda...'}</div>`;

    try {
        const res = await fetch(`/api/shops/${shopId}/reviews`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const reviews = json.data || [];

        if (reviews.length === 0) {
            listEl.innerHTML = `<div class="empty-reviews">${t('noReviewsYet')}</div>`;
            return;
        }

        listEl.innerHTML = reviews.map(r => {
            const dateStr = new Date(r.createdAt).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += i <= r.rating ? '★' : '☆';
            }

            let maskedPhone = '';
            if (r.phone && r.phone.length >= 4) {
                maskedPhone = `<span class="review-phone">+998 ** *** ** ${r.phone.slice(-2)}</span>`;
            }

            return `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-author">${escHtml(r.authorName)} ${maskedPhone}</span>
                        <span class="review-date">${dateStr}</span>
                    </div>
                    <div class="review-stars">${starsHtml}</div>
                    <p class="review-comment">${escHtml(r.comment)}</p>
                </div>
            `;
        }).join('');
    } catch (err) {
        listEl.innerHTML = `<div style="color:var(--red); text-align:center;">${currentLang === 'ru' ? 'Ошибка загрузки отзывов.' : 'Fikrlar yuklashda xatolik.'}</div>`;
    }
}

function formatPhoneInput(el) {
    let digits = el.value.replace(/\D/g, '').slice(0, 9);
    let formatted = '';
    if (digits.length > 0) formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
    el.value = formatted;
}

async function submitModalReview(event) {
    event.preventDefault();
    const shopId = window._currentOpenShopId;
    if (!shopId) return;

    const authorInput = document.getElementById('modalReviewAuthor');
    const phoneInput = document.getElementById('modalReviewPhone');
    const commentInput = document.getElementById('modalReviewComment');
    const btnSubmit = document.querySelector('#modalReviewForm button[type="submit"]');

    if (!commentInput.value.trim()) return;

    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    if (phoneDigits.length !== 9) {
        showToast(t('reviewInvalidPhone'), 'error');
        phoneInput.focus();
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = '...';

    try {
        const res = await fetch(`/api/shops/${shopId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authorName: authorInput.value.trim() || 'Mehmon',
                phone: '+998' + phoneDigits,
                comment: commentInput.value.trim(),
                rating: selectedModalRating
            })
        });

        if (res.status === 409) {
            showToast(t('reviewDuplicatePhone'), 'error');
            return;
        }
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            if (json.message && json.message.includes('phone')) {
                showToast(t('reviewInvalidPhone'), 'error');
            } else {
                showToast(t('copyError'), 'error');
            }
            return;
        }
        
        authorInput.value = '';
        phoneInput.value = '';
        commentInput.value = '';
        selectedModalRating = 5;
        const starSelector = document.getElementById('modalStarSelector');
        if (starSelector) {
            const stars = starSelector.querySelectorAll('span');
            stars.forEach(s => {
                s.textContent = parseInt(s.dataset.val) <= 5 ? '\u2605' : '\u2606';
                s.classList.add('selected');
            });
        }

        showToast(t('reviewSuccess'), 'success');

        const form = document.getElementById('modalReviewForm');
        const icon = document.getElementById('modalReviewToggleIcon');
        if (form) form.style.display = 'none';
        if (icon) icon.textContent = '\u2795';

        const shopRes = await fetch(`/api/shops/${shopId}`);
        if (shopRes.ok) {
            const updatedShop = (await shopRes.json()).data;
            if (typeof _allShops !== 'undefined' && Array.isArray(_allShops)) {
                const idx = _allShops.findIndex(s => s.id === shopId);
                if (idx !== -1) {
                    _allShops[idx] = updatedShop;
                }
                if (typeof renderShops === 'function') {
                    renderShops(_allShops);
                }
            }
            const ratingContainer = document.getElementById('modalRatingContainer');
            if (ratingContainer) {
                ratingContainer.innerHTML = renderRatingStarsHtml(updatedShop.rating, updatedShop.reviewsCount);
            }
        }
        
        await loadModalReviews(shopId);
    } catch (err) {
        showToast(t('copyError'), 'error');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = t('submitReviewBtn');
    }
}

function toggleModalReviewForm() {
    const form = document.getElementById('modalReviewForm');
    const icon = document.getElementById('modalReviewToggleIcon');
    if (form.style.display === 'none') {
        form.style.display = 'flex';
        icon.textContent = '➖';
    } else {
        form.style.display = 'none';
        icon.textContent = '➕';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initModalScrollRedirect();
        setupModalStarSelector();
    });
} else {
    initModalScrollRedirect();
    setupModalStarSelector();
}

window.addEventListener('langchange', () => {
    const modal = document.getElementById('shopModal');
    if (modal && (modal.style.display === 'block' || modal.style.display === 'flex') && window._currentOpenShopId) {
        openShopModal(window._currentOpenShopId);
    }
});

function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(t('linkCopied'), 'success');
        } else {
            showToast(t('copyError'), 'error');
        }
    } catch (err) {
        showToast(t('copyError'), 'error');
    }
    document.body.removeChild(textArea);
}

function showCustomShareMenu(url, title, text) {
    let menu = document.getElementById('customShareMenu');
    if (menu) {
        menu.classList.add('show');
        return;
    }

    menu = document.createElement('div');
    menu.id = 'customShareMenu';
    menu.className = 'custom-share-menu-overlay';
    
    const isRu = currentLang === 'ru';
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const tgUrl = isMobile 
        ? `tg://msg_url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + '\n' + text)}`
        : `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + '\n' + text)}`;
    
    const waUrl = isMobile
        ? `whatsapp://send?text=${encodeURIComponent(title + '\n' + text + '\n\n' + url)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + text + '\n\n' + url)}`;
        
    const targetAttr = isMobile ? '' : 'target="_blank"';
    
    menu.innerHTML = `
        <div class="custom-share-card">
            <div class="share-card-header">
                <h4>${isRu ? 'Поделиться' : 'Ulashish'}</h4>
                <button class="share-card-close" onclick="closeCustomShareMenu()">&times;</button>
            </div>
            <div class="share-options">
                <button class="share-opt-btn copy" id="shareCopyBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>${isRu ? 'Копировать ссылку' : 'Havolani nusxalash'}</span>
                </button>
                <a class="share-opt-btn telegram" href="${tgUrl}" ${targetAttr} onclick="closeCustomShareMenu()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    <span>Telegram</span>
                </a>
                <a class="share-opt-btn whatsapp" href="${waUrl}" ${targetAttr} onclick="closeCustomShareMenu()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span>WhatsApp</span>
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(menu);
    
    document.getElementById('shareCopyBtn').addEventListener('click', async () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(url);
                showToast(isRu ? 'Ссылка скопирована' : 'Havola nusxalandi', 'success');
            } catch (err) {
                fallbackCopyText(url);
            }
        } else {
            fallbackCopyText(url);
        }
        closeCustomShareMenu();
    });

    menu.addEventListener('click', (e) => {
        if (e.target === menu) closeCustomShareMenu();
    });

    setTimeout(() => menu.classList.add('show'), 10);
}

window.closeCustomShareMenu = function() {
    const menu = document.getElementById('customShareMenu');
    if (menu) {
        menu.classList.remove('show');
        setTimeout(() => {
            if (menu && menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        }, 300);
    }
}
