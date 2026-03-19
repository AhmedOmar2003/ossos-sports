export function initLanguage() {
    let currentLang = localStorage.getItem('ossos_lang') || 'ar';
    setLanguage(currentLang);

    const langBtn = document.getElementById('lang-switcher');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('ossos_lang', currentLang);
            setLanguage(currentLang);
        });
    }
}

export function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    const langBtn = document.getElementById('lang-switcher');
    if (langBtn) {
        langBtn.innerHTML = lang === 'ar' ? 'EN' : 'عربي';
    }

    const translatableElements = document.querySelectorAll('[data-ar][data-en]');
    translatableElements.forEach(el => {
        el.innerHTML = el.getAttribute(`data-${lang}`);
    });
    
    const inputs = document.querySelectorAll('input[data-ar], textarea[data-ar]');
    inputs.forEach(el => {
        el.placeholder = el.getAttribute(`data-${lang}`);
    });
}
