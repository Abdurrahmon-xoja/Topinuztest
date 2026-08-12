/* ─── Image Cropper Module for Admin ──────────────────────── */
let _cropperInstance = null;
let _cropperResolve = null;
let _cropperMode = 'logo'; // 'logo' or 'gallery'

/**
 * Opens the crop modal with the given image file.
 * Returns a Promise that resolves with the cropped File, or null if cancelled.
 */
window.openImageCropper = function(fileOrUrl, mode = 'logo') {
    return new Promise((resolve) => {
        _cropperResolve = resolve;
        _cropperMode = mode;

        const overlay = document.getElementById('cropperOverlay');
        const img = document.getElementById('cropperImage');
        const aspectInfo = document.getElementById('cropperAspectInfo');
        if (!overlay || !img) { resolve(typeof fileOrUrl === 'string' ? null : fileOrUrl); return; }

        // Set aspect ratio info text
        if (aspectInfo) {
            aspectInfo.textContent = mode === 'logo' 
                ? 'Логотип (1:1 квадрат)' 
                : 'Фото галереи (свободная обрезка)';
        }

        const initCropper = (src) => {
            img.src = src;
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            if (_cropperInstance) {
                _cropperInstance.destroy();
                _cropperInstance = null;
            }

            _cropperInstance = new Cropper(img, {
                aspectRatio: mode === 'logo' ? 1 : NaN,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.85,
                responsive: true,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                background: true,
                modal: true,
                checkCrossOrigin: false,
            });
        };

        if (typeof fileOrUrl === 'string') {
            // URL string — load directly
            initCropper(fileOrUrl);
        } else {
            // File object — read as data URL
            const reader = new FileReader();
            reader.onload = (e) => initCropper(e.target.result);
            reader.readAsDataURL(fileOrUrl);
        }
    });
};

window.cropperApply = async function() {
    if (!_cropperInstance || !_cropperResolve) return;

    // getCroppedCanvas returns null for a zero-area selection or an image that
    // failed to decode. Calling toBlob on that threw, and because the throw
    // escaped before _cropperResolve ran, the promise awaited by
    // _handleLogoUpload / _handleGalleryUpload never settled — the crop window
    // stayed open with the form stuck behind it. Every path must now resolve.
    try {
        const canvas = _cropperInstance.getCroppedCanvas({
            maxWidth: _cropperMode === 'logo' ? 800 : 1600,
            maxHeight: _cropperMode === 'logo' ? 800 : 1600,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        if (!canvas) {
            showToast(t('uploadError'), 'error');
            _cropperResolve(null);
            closeCropper();
            return;
        }

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
                _cropperResolve(croppedFile);
            } else {
                showToast(t('uploadError'), 'error');
                _cropperResolve(null);
            }
            closeCropper();
        }, 'image/jpeg', 0.92);
    } catch (e) {
        showToast(t('uploadError'), 'error');
        _cropperResolve(null);
        closeCropper();
    }
};

window.cropperCancel = function() {
    if (_cropperResolve) _cropperResolve(null);
    closeCropper();
};

window.cropperRotateLeft = function() {
    if (_cropperInstance) _cropperInstance.rotate(-90);
};

window.cropperRotateRight = function() {
    if (_cropperInstance) _cropperInstance.rotate(90);
};

window.cropperFlipH = function() {
    if (_cropperInstance) {
        const data = _cropperInstance.getData();
        _cropperInstance.scaleX(data.scaleX === -1 ? 1 : -1);
    }
};

window.cropperReset = function() {
    if (_cropperInstance) _cropperInstance.reset();
};

window.cropperZoomIn = function() {
    if (_cropperInstance) _cropperInstance.zoom(0.1);
};

window.cropperZoomOut = function() {
    if (_cropperInstance) _cropperInstance.zoom(-0.1);
};

function closeCropper() {
    const overlay = document.getElementById('cropperOverlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = 'hidden'; // Keep shop form modal scroll locked
    if (_cropperInstance) {
        _cropperInstance.destroy();
        _cropperInstance = null;
    }
    _cropperResolve = null;
}
