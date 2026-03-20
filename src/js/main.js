import { initLanguage } from './lang.js';

let revealObserver = null;
let mobileToggle = null;
let navLinks = null;
let header = null;
let hiddenAt = 0;
let lifecycleBound = false;

function cacheElements() {
    mobileToggle = document.getElementById('mobile-toggle');
    navLinks = document.querySelector('.nav-links');
    header = document.querySelector('.header');
}

function closeMobileMenu() {
    if (!mobileToggle || !navLinks) {
        return;
    }

    navLinks.classList.remove('active');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
}

function syncHeaderState() {
    if (!header) {
        return;
    }

    header.classList.toggle('scrolled', window.scrollY > 50);
}

function setupMobileMenu() {
    if (!mobileToggle || !navLinks || mobileToggle.dataset.bound === 'true') {
        return;
    }

    mobileToggle.dataset.bound = 'true';
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (event) => {
        if (!navLinks.classList.contains('active')) {
            return;
        }

        if (navLinks.contains(event.target) || mobileToggle.contains(event.target)) {
            return;
        }

        closeMobileMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            closeMobileMenu();
        }
    });
}

function setupHeader() {
    syncHeaderState();

    if (!header || header.dataset.bound === 'true') {
        return;
    }

    header.dataset.bound = 'true';
    window.addEventListener('scroll', syncHeaderState, { passive: true });
}

function setupRevealObserver() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach((element) => element.classList.add('active'));
        return;
    }

    revealObserver?.disconnect();
    revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    });

    revealElements.forEach((element) => {
        if (element.classList.contains('active')) {
            return;
        }

        revealObserver.observe(element);
    });
}

function recoverPageAfterIdle() {
    cacheElements();
    syncHeaderState();
    closeMobileMenu();

    if (document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = '';
    }

    window.requestAnimationFrame(() => {
        setupRevealObserver();
    });
}

function bindLifecycleRecovery() {
    if (lifecycleBound) {
        return;
    }

    lifecycleBound = true;

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            hiddenAt = Date.now();
            revealObserver?.disconnect();
            closeMobileMenu();
            return;
        }

        const wasIdle = hiddenAt && (Date.now() - hiddenAt) > 1000;
        hiddenAt = 0;

        if (wasIdle) {
            recoverPageAfterIdle();
            return;
        }

        window.requestAnimationFrame(() => {
            syncHeaderState();
            setupRevealObserver();
        });
    });

    window.addEventListener('pageshow', recoverPageAfterIdle);
    window.addEventListener('focus', recoverPageAfterIdle);
    window.addEventListener('online', recoverPageAfterIdle);
}

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    cacheElements();
    setupMobileMenu();
    setupHeader();
    setupRevealObserver();
    bindLifecycleRecovery();
});
