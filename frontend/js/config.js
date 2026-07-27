const API = '';          // same origin — backend serves frontend statically
const TOKEN_KEY = 'houz_token';
let currentLang = localStorage.getItem('houz_lang_v2') || 'uz';

const i18n = {
  uz: {
    home: "Bosh sahifa",
    allShops: "Barcha do'konlar",
    hammasi: "Hammasi",
    shopsCount: "Dokonlar",
    filter: "Filter",
    searchPlaceholder: "Qidiruv...",
    share: "Ulashish",
    linkCopied: "Havola nusxalandi",
    copyError: "Xatolik yuz berdi",
    directions: "Yo'nalish",
    close: "Yopish",
    notFound: "Do'kon topilmadi",
    notFoundSpecialist: "Mutaxassis topilmadi",
    searchOther: "Boshqa kalit so'z yoki kategoriya tanlang.",
    searchOtherSpecialist: "Boshqa toifa yoki kalit so'z tanlang.",
    descPlaceholder: "Ma'lumot kiritilmagan",
    locPlaceholder: "Bosh ofis joylashuvi kiritilmagan",
    goToStore: "Do'konga o'tish",
    // admin
    catsNotFound: "Kategoriyalar topilmadi.",
    manageFilters: "Filtrlarni Boshqarish",
    shopsCountLabel: "do'kon",
    noShopsInCat: "Bu kategoriyada hali do'konlar yo'q.",
    edit: "✏️ Tahrirlash",
    delete: "🗑️ O'chirish",
    selectOption: "Tanlang...",
    selectCategory: "Kategoriyani tanlang...",
    noSubcats: "Bu kategoriyada filtrlar yo'q",
    dropLogo: "📁 Logotipni bu yerga torting yoki bosing",
    editShopTitle: "Do'konni tahrirlash",
    addShopTitle: "Do'kon qo'shish",
    nameRequired: "❗ Nom - majburiy maydon",
    catRequired: "❗ Kategoriya - majburiy maydon",
    subCatRequired: "❗ Podkategoriya - majburiy maydon",
    fillBothFields: "❗ Barcha qo'shimcha havolalar uchun ikkala maydonni to'ldiring",
    saving: "Saqlanmoqda…",
    save: "Saqlash",
    updated: "✅ Muvaffaqiyatli yangilandi",
    shopAdded: "✅ Do'kon qo'shildi",
    shopDeleted: "🗑️ Do'kon o'chirildi",
    saveFailed: "❌ Xatolik yuz berdi: ",
    deleteFailed: "❌ O'chirishda xatolik",
    uploading: "⏳ Yuklanmoqda...",
    uploadError: "❌ Xatolik. Qayta urinib ko'ring.",
    logoUploaded: "🖼️ Logotip yuklandi!",
    onlyImages: "❗ Faqat rasmlarni yuklash mumkin",
    imageTooLarge: "❗ Rasm hajmi 2MB dan kichik bo'lishi kerak",
    uploadFailed: "❌ Yuklash xatosi: ",
    linkLabel: "Nomi (YouTube, TikTok...)",
    linkUrl: "Havola",
    filtersTitle: "Filtrlar: ",
    noFilters: "Qo'shimcha filtrlar hali yo'q.",
    filterAdded: "✅ Filtr qo'shildi",
    filterDeleted: "🗑️ Filtr o'chirildi",
    addFilterError: "❌ Qo'shishda xatolik",
    deleteFilterError: "❌ O'chirishda xatolik",
    reorderError: "❌ Tartibni sinxronlashda xatolik",
    shops: "Do'konlar",
    cat: {
      "furniture": "Mebel",
      "lighting": "Yoritish",
      "art-decor": "San'at va dekor",
      "walls": "Devorlar",
      "floor": "Pol qoplamalari",
      "stone": "Tosh materiallari",
      "real-estate": "Eksteryer",
      "plants": "O'simliklar",
      "bathroom": "Hammom",
      "other": "Boshqa",
      "specialists": "Ustalar"
    },
    found: "Topildi",
    // New dynamic translation keys
    searchHeaderPlaceholder: "Do'konlar va tovarlarni qidirish...",
    searchShopsPlaceholder: "Do'konlarni qidirish...",
    catalogCategories: "Katalog kategoriyalari",
    searchResultsFor: "\"{query}\" uchun qidiruv natijalari",
    closeSearch: "✕ Qidiruvni yopish",
    tabProducts: "Mahsulotlar",
    tabShops: "Do'konlar",
    nothingFound: "Hech narsa topilmadi",
    shopProducts: "Do'kon mahsulotlari",
    viewInRoom: "AR ko'rish",
    contactTelegram: "Telegramda bog'lanish",
    locationTitle: "Joylashuv",
    productsTitle: "Mahsulotlar",
    productLabel: "Mahsulot",
    download3d: "3D modelni yuklab olish",
    telegramConnect: "Telegramda bog'lanish",
    back: "Ortga",
    homeCrumb: "Asosiy",
    callPhone: "Qo'ng'iroq qilish",
    descriptionTitle: "Tavsif",
    view3dModel: "3D modelni ko'rish",
    searchInStore: "Do'kon bo'ylab qidiruv",
    searchProductPlaceholder: "Mahsulot qidirish...",
    categoryLabel: "Kategoriya",
    stockLabel: "Mavjudligi",
    onlyInStock: "Faqat mavjud",
    onlyWith3d: "Faqat 3D model bilan",
    productsCountText: "{count} ta mahsulot",
    sortNewest: "Yangiliklar",
    sortPriceAsc: "Narx: arzon",
    sortPriceDesc: "Narx: qimmat",
    sortRatingDesc: "Reyting: yuqori",
    aboutCompany: "Kompaniya haqida",
    workingHoursTitle: "Ish vaqti",
    closedDay: "Yopiq",
    priceOnRequest: "Narx soʻrov boʻyicha",
    inStockStatus: "Mavjud",
    outOfStockStatus: "Mavjud emas",
    preorderStatus: "Buyurtma bo'yicha",
    daysAbbrev: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'],
    pageNotFound: "Sahifa topilmadi",
    // Reviews
    reviewsTitle: "Fikrlar va baholar",
    writeReview: "Fikr qoldirish",
    yourName: "Sizning ismingiz",
    yourRating: "Sizning bahoingiz",
    yourComment: "Fikr-mulohaza",
    submitReviewBtn: "Yuborish",
    reviewSuccess: "Fikr muvaffaqiyatli qo'shildi!",
    yourPhone: "Telefon raqamingiz",
    inputPhonePlaceholder: "+998 XX XXX XX XX",
    reviewDuplicatePhone: "Siz allaqachon ushbu do'kon uchun fikr qoldirdingiz",
    reviewInvalidPhone: "Noto'g'ri telefon raqam formati",
    inputNamePlaceholder: "Ismingizni kiriting...",
    inputCommentPlaceholder: "Fikringizni yozing...",
    noReviewsYet: "Fikrlar hali yo'q. Birinchi bo'lib fikr qoldiring!",
    nearMe: "Yaqin atrofda",
    listView: "Ro'yxat",
    mapView: "Xarita",
    kmAway: "{km} km uzoqlikda",
    recommendedStores: "Tavsiya etilgan do'konlar",
    allShops: "Barcha do'konlar",
    aboutCompany: "Kompaniya haqida",
    privacyPolicy: "Maxfiylik siyosati"
  },
  ru: {
    home: "Главная",
    allShops: "Все магазины",
    hammasi: "Все",
    shopsCount: "Магазины",
    filter: "Фильтр",
    searchPlaceholder: "Поиск...",
    share: "Поделиться",
    linkCopied: "Ссылка скопирована",
    copyError: "Ошибка",
    directions: "Маршрут",
    close: "Закрыть",
    notFound: "Магазины не найдены",
    notFoundSpecialist: "Специалист не найден",
    searchOther: "Укажите другое ключевое слово или категорию.",
    searchOtherSpecialist: "Выберите другую категорию или ключевое слово.",
    descPlaceholder: "Информация не предоставлена",
    locPlaceholder: "Адрес главного офиса не предоставлен",
    goToStore: "Перейти в магазин",
    // admin
    catsNotFound: "Категории не найдены.",
    manageFilters: "Управление фильтрами",
    shopsCountLabel: "магазинов",
    noShopsInCat: "В этой категории пока нет магазинов.",
    edit: "✏️ Редактировать",
    delete: "🗑️ Удалить",
    selectOption: "Выберите...",
    selectCategory: "Выберите категорию...",
    noSubcats: "В этой категории нет подкатегорий",
    dropLogo: "📁 Перетащите логотип сюда или нажмите",
    editShopTitle: "Редактировать магазин",
    addShopTitle: "Добавить магазин",
    nameRequired: "❗ Название - обязательное поле",
    catRequired: "❗ Категория - обязательное поле",
    subCatRequired: "❗ Подкатегория - обязательное поле",
    fillBothFields: "❗ Заполните оба поля (Название и Ссылка) для всех дополнительных ссылок",
    saving: "Сохранение…",
    save: "Сохранить",
    updated: "✅ Успешно обновлено",
    shopAdded: "✅ Магазин добавлен",
    shopDeleted: "🗑️ Магазин удален",
    saveFailed: "❌ Произошла ошибка: ",
    deleteFailed: "❌ Ошибка при удалении",
    uploading: "⏳ Загрузка...",
    uploadError: "❌ Ошибка. Попробуйте снова.",
    logoUploaded: "🖼️ Логотип загружен!",
    onlyImages: "❗ Можно загружать только изображения",
    imageTooLarge: "❗ Размер изображения должен быть меньше 2МБ",
    uploadFailed: "❌ Ошибка при загрузке: ",
    linkLabel: "Название (YouTube, TikTok...)",
    linkUrl: "Ссылка",
    filtersTitle: "Фильтры: ",
    noFilters: "Дополнительных фильтров пока нет.",
    filterAdded: "✅ Фильтр добавлен",
    filterDeleted: "🗑️ Фильтр удален",
    addFilterError: "❌ Ошибка добавления",
    deleteFilterError: "❌ Ошибка удаления",
    reorderError: "❌ Ошибка синхронизации порядка",
    shops: "Магазины",
    cat: {
      "furniture": "Мебель",
      "lighting": "Освещение",
      "art-decor": "Искусство и декор",
      "walls": "Стены",
      "floor": "Напольные покрытия",
      "stone": "Каменные материалы",
      "real-estate": "Экстерьер",
      "plants": "Растения",
      "bathroom": "Ванная",
      "other": "Другое",
      "specialists": "Специалисты"
    },
    found: "Найдено",
    // New dynamic translation keys
    searchHeaderPlaceholder: "Поиск магазинов и товаров...",
    searchShopsPlaceholder: "Поиск магазинов...",
    catalogCategories: "Категории каталога",
    searchResultsFor: "Результаты поиска для \"{query}\"",
    closeSearch: "✕ Закрыть поиск",
    tabProducts: "Товары",
    tabShops: "Магазины",
    nothingFound: "Ничего не найдено",
    shopProducts: "Товары магазина",
    viewInRoom: "Смотреть в AR",
    contactTelegram: "Написать в Telegram",
    locationTitle: "Локация",
    productsTitle: "Товары",
    productLabel: "Товаров",
    download3d: "Скачать 3D модель",
    telegramConnect: "Написать в Telegram",
    back: "Назад",
    homeCrumb: "Главная",
    callPhone: "Позвонить",
    descriptionTitle: "Описание",
    view3dModel: "Просмотр 3D модели",
    searchInStore: "Поиск по магазину",
    searchProductPlaceholder: "Поиск товара...",
    categoryLabel: "Категория",
    stockLabel: "Наличие",
    onlyInStock: "Только в наличии",
    onlyWith3d: "Только с 3D моделью",
    productsCountText: "{count} товаров",
    sortNewest: "Новинки",
    sortPriceAsc: "Цена: дешевые",
    sortPriceDesc: "Цена: дорогие",
    sortRatingDesc: "По рейтингу",
    sortDefault: "По умолчанию",
    sortAlphabetical: "А-Я (A-Z)",
    aboutCompany: "О компании",
    workingHoursTitle: "Рабочие часы",
    closedDay: "Выходной",
    priceOnRequest: "Цена по запросу",
    inStockStatus: "В наличии",
    outOfStockStatus: "Нет в наличии",
    preorderStatus: "Под заказ",
    daysAbbrev: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    pageNotFound: "Магазин не найден",
    // Reviews
    reviewsTitle: "Отзывы и оценки",
    writeReview: "Оставить отзыв",
    yourName: "Ваше имя",
    yourRating: "Ваша оценка",
    yourComment: "Комментарий",
    submitReviewBtn: "Отправить отзыв",
    reviewSuccess: "Отзыв успешно добавлен!",
    yourPhone: "Номер телефона",
    inputPhonePlaceholder: "+998 XX XXX XX XX",
    reviewDuplicatePhone: "Вы уже оставляли отзыв для этого магазина",
    reviewInvalidPhone: "Неверный формат номера телефона",
    inputNamePlaceholder: "Введите имя...",
    inputCommentPlaceholder: "Напишите ваш отзыв...",
    noReviewsYet: "Отзывов пока нет. Оставьте первый отзыв!",
    nearMe: "Рядом со мной",
    listView: "Список",
    mapView: "Карта",
    kmAway: "в {km} км от вас",
    recommendedStores: "Рекомендуемые магазины",
    allShops: "Все магазины",
    aboutCompany: "О компании",
    privacyPolicy: "Политика конфиденциальности"
  }
};

function t(key) {
  return i18n[currentLang]?.[key] || key;
}

function getCatName(slug) {
  return i18n[currentLang]?.cat?.[slug] || slug;
}

function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('houz_lang_v2', lang);
  document.documentElement.setAttribute('lang', lang);
  
  // ── Sync UI language switcher state across layout ──
  updateLanguageSwitcherUI(lang);
  
  // ── Translate static elements on the active page ──
  translateStaticElements();
  
  // ── Notify page scripts to rebuild/re-render localized contents ──
  window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

function updateLanguageSwitcherUI(lang) {
  const langText = document.getElementById('langText');
  if (langText) {
    langText.textContent = lang.toUpperCase();
  }
}

function translateStaticElements() {
  document.documentElement.setAttribute('lang', currentLang);

  // Translate header search input placeholder
  const headerSearchInput = document.getElementById('headerSearchInput');
  if (headerSearchInput) {
    const isShops = window.location.pathname.includes('shops');
    headerSearchInput.placeholder = t(isShops ? 'searchShopsPlaceholder' : 'searchHeaderPlaceholder');
  }

  // Translate fullpage search input placeholder
  const searchFullpageInput = document.getElementById('searchFullpageInput');
  if (searchFullpageInput) searchFullpageInput.placeholder = t('searchPlaceholder');

  // Translate floating search (shops page)
  const floatingSearchInput = document.getElementById('floatingSearchInput');
  if (floatingSearchInput) floatingSearchInput.placeholder = t('searchShopsPlaceholder');

  // Translate all data-i18n-placeholder elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.placeholder = t(key);
  });

  // index.html specific elements
  const catalogTitle = document.querySelector('.categories-section .section-title');
  if (catalogTitle) catalogTitle.textContent = t('catalogCategories');


  // search tabs text
  const searchTabProducts = document.getElementById('searchTabProducts');
  if (searchTabProducts) {
    const countSpan = document.getElementById('searchCountProducts');
    const countVal = countSpan ? countSpan.textContent : '0';
    searchTabProducts.innerHTML = `${t('tabProducts')} (<span id="searchCountProducts">${countVal}</span>)`;
  }
  const searchTabShops = document.getElementById('searchTabShops');
  if (searchTabShops) {
    const countSpan = document.getElementById('searchCountShops');
    const countVal = countSpan ? countSpan.textContent : '0';
    searchTabShops.innerHTML = `${t('tabShops')} (<span id="searchCountShops">${countVal}</span>)`;
  }

  // noResultsMsg
  const noResultsMsg = document.getElementById('noResultsMsg');
  if (noResultsMsg) noResultsMsg.textContent = t('nothingFound');

  // modalProductsTitle (shops.html modal)
  const modalProductsTitle = document.getElementById('modalProductsTitle');
  if (modalProductsTitle) modalProductsTitle.textContent = t('shopProducts');

  // modalStoreBtnText (shops.html modal)
  const modalStoreBtnText = document.getElementById('modalStoreBtnText');
  if (modalStoreBtnText) modalStoreBtnText.textContent = t('goToStore');

  // product.html elements
  const lblViewAR = document.getElementById('lblViewAR');
  if (lblViewAR) lblViewAR.textContent = t('viewInRoom');

  const lblContactTG = document.getElementById('lblContactTG');
  if (lblContactTG) lblContactTG.textContent = t('contactTelegram');

  const lblContactPhone = document.getElementById('lblContactPhone');
  if (lblContactPhone) lblContactPhone.textContent = t('callPhone');

  const lblVisitStore = document.getElementById('lblVisitStore');
  if (lblVisitStore) lblVisitStore.textContent = t('goToStore');

  const lblDescription = document.getElementById('lblDescription');
  if (lblDescription) lblDescription.textContent = t('descriptionTitle');

  const lblModalTitle = document.getElementById('lblModalTitle');
  if (lblModalTitle) lblModalTitle.textContent = t('view3dModel');

  // shops.html filter menu
  const filterDropdownBtn = document.getElementById('filterDropdownBtn');
  if (filterDropdownBtn) {
    const span = filterDropdownBtn.querySelector('span');
    if (span) span.textContent = currentLang === 'ru' ? 'Вид и фильтры' : 'Ko\'rinish va filtrlar';
  }
  const lblViewTitle = document.getElementById('lblViewTitle');
  if (lblViewTitle) lblViewTitle.textContent = currentLang === 'ru' ? 'Отображение' : 'Ko\'rinish';
  
  const lblSortTitle = document.getElementById('lblSortTitle');
  if (lblSortTitle) lblSortTitle.textContent = currentLang === 'ru' ? 'Сортировка' : 'Saralash';

  const optSortDefault = document.getElementById('optSortDefault');
  if (optSortDefault) optSortDefault.textContent = t('sortDefault');

  const optSortName = document.getElementById('optSortName');
  if (optSortName) optSortName.textContent = t('sortAlphabetical');

  const optSortNear = document.getElementById('optSortNear');
  if (optSortNear) optSortNear.textContent = t('nearMe');

  const btnListView = document.getElementById('btnListView');
  if (btnListView) btnListView.textContent = currentLang === 'ru' ? 'Список' : 'Ro\'yxat';

  const btnMapView = document.getElementById('btnMapView');
  if (btnMapView) btnMapView.textContent = currentLang === 'ru' ? 'Карта' : 'Xarita';

  // store.html elements
  const tabProducts = document.getElementById('tabProducts');
  if (tabProducts) tabProducts.textContent = t('tabProducts');

  const tabAbout = document.getElementById('tabAbout');
  if (tabAbout) tabAbout.textContent = t('aboutCompany');

  const lblSearch = document.getElementById('lblSearch');
  if (lblSearch) lblSearch.textContent = t('searchInStore');

  const prodSearch = document.getElementById('prodSearch');
  if (prodSearch) prodSearch.placeholder = t('searchProductPlaceholder');

  const lblCategory = document.getElementById('lblCategory');
  if (lblCategory) lblCategory.textContent = t('categoryLabel');

  const lblStock = document.getElementById('lblStock');
  if (lblStock) lblStock.textContent = t('stockLabel');

  const lblInStockOnly = document.getElementById('lblInStockOnly');
  if (lblInStockOnly) lblInStockOnly.textContent = t('onlyInStock');

  const lblAROnly = document.getElementById('lblAROnly');
  if (lblAROnly) lblAROnly.textContent = t('onlyWith3d');

  const aboutTitle = document.getElementById('aboutTitle');
  if (aboutTitle) aboutTitle.textContent = t('aboutCompany');

  const lblRecommendedStores = document.getElementById('lblRecommendedStores');
  if (lblRecommendedStores) lblRecommendedStores.textContent = t('recommendedStores');

  // Reviews forms & sections
  const lblReviewsTitle = document.getElementById('lblReviewsTitle');
  if (lblReviewsTitle) lblReviewsTitle.textContent = t('reviewsTitle');

  const lblWriteReview = document.getElementById('lblWriteReview');
  if (lblWriteReview) lblWriteReview.textContent = t('writeReview');

  const lblYourName = document.getElementById('lblYourName');
  if (lblYourName) lblYourName.textContent = t('yourName');

  const lblYourPhone = document.getElementById('lblYourPhone');
  if (lblYourPhone) lblYourPhone.textContent = t('yourPhone');

  const lblYourRating = document.getElementById('lblYourRating');
  if (lblYourRating) lblYourRating.textContent = t('yourRating');

  const lblYourComment = document.getElementById('lblYourComment');
  if (lblYourComment) lblYourComment.textContent = t('yourComment');

  const btnSubmitReview = document.getElementById('btnSubmitReview');
  if (btnSubmitReview) btnSubmitReview.textContent = t('submitReviewBtn');

  const reviewAuthor = document.getElementById('reviewAuthor');
  if (reviewAuthor) reviewAuthor.placeholder = t('inputNamePlaceholder');

  const reviewComment = document.getElementById('reviewComment');
  if (reviewComment) reviewComment.placeholder = t('inputCommentPlaceholder');

  // Re-translate search results title if visible
  const searchQueryVal = document.getElementById('searchQueryVal');
  if (searchQueryVal && searchQueryVal.textContent) {
    const titleContainer = document.querySelector('.search-results-title');
    if (titleContainer) {
      titleContainer.innerHTML = t('searchResultsFor').replace('{query}', `<span id="searchQueryVal">${searchQueryVal.textContent}</span>`);
    }
  }

  // Update option values in catalogSort dropdown
  const catalogSort = document.getElementById('catalogSort');
  if (catalogSort) {
    const optNewest = catalogSort.querySelector('option[value="newest"]');
    if (optNewest) optNewest.textContent = t('sortNewest');
    const optPriceAsc = catalogSort.querySelector('option[value="price-asc"]');
    if (optPriceAsc) optPriceAsc.textContent = t('sortPriceAsc');
    const optPriceDesc = catalogSort.querySelector('option[value="price-desc"]');
    if (optPriceDesc) optPriceDesc.textContent = t('sortPriceDesc');
    const optRatingDesc = catalogSort.querySelector('option[value="rating-desc"]');
    if (optRatingDesc) optRatingDesc.textContent = t('sortRatingDesc');
    const optNameAsc = catalogSort.querySelector('option[value="name-asc"]');
    if (optNameAsc) optNameAsc.textContent = t('sortAlphabetical');
  }

  // Update option values in shopSort dropdown
  const shopSort = document.getElementById('shopSort');
  if (shopSort) {
    const optShopDefault = shopSort.querySelector('option[value="default"]');
    if (optShopDefault) optShopDefault.textContent = t('sortDefault');
    const optShopNameAsc = shopSort.querySelector('option[value="name-asc"]');
    if (optShopNameAsc) optShopNameAsc.textContent = t('sortAlphabetical');
  }

  // Update category select 'all' option in store.html
  const prodCategory = document.getElementById('prodCategory');
  if (prodCategory) {
    const optAll = prodCategory.querySelector('option[value="all"]');
    if (optAll) optAll.textContent = t('hammasi');
  }

  // Footer text
  const footerText = document.querySelector('.site-footer div[style*="font-size"]');
  if (footerText) {
    footerText.textContent = currentLang === 'ru' 
      ? '© 2026 Topin · Ташкент, Узбекистан' 
      : '© 2026 Topin · Toshkent, O\'zbekiston';
  }
}

document.addEventListener('DOMContentLoaded', () => {
    // Translate static strings immediately on DOM load
    translateStaticElements();

    // Simple language toggle button (click to switch UZ ↔ RU)
    const langToggleBtn = document.getElementById('langToggleBtn');
    if (langToggleBtn) {
        updateLanguageSwitcherUI(currentLang);
        langToggleBtn.addEventListener('click', () => {
            const nextLang = currentLang === 'uz' ? 'ru' : 'uz';
            switchLang(nextLang);
        });
    }
});
