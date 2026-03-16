/**
 * i18n.js - Lightweight internationalization for Skillnet viz
 *
 * Loads JSON locale files from viz/locales/, provides t() for string lookup
 * with interpolation, and applyLocaleToDOM() for data-i18n attribute binding.
 * Fallback chain: current locale → English → raw key.
 */

let currentLocale = 'en';
let strings = {};       // current locale strings (flat: "header.skills" → "skills")
let enStrings = {};     // English fallback (always loaded)
const localeChangeCallbacks = [];

const SUPPORTED_LOCALES = [
  { code: 'en',    name: 'English' },
  { code: 'de',    name: 'Deutsch' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'ja',    name: '日本語' },
  { code: 'es',    name: 'Español' },
];

const LOCALE_CODES = new Set(SUPPORTED_LOCALES.map(l => l.code));

// Cache-bust parameter — build timestamp in production, epoch in dev
const __cacheBust = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : Date.now();

// ── Flatten nested JSON to dot-separated keys ──────────────────────

function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_meta') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, path));
    } else {
      result[path] = String(value);
    }
  }
  return result;
}

// ── Interpolation: replace {name} placeholders ────────────────────

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Translate a key with optional interpolation.
 * @param {string} key - Dot-separated key, e.g. "panel.relatedSkills"
 * @param {Object} [vars] - Interpolation variables, e.g. { count: 5 }
 * @returns {string} Translated string, or English fallback, or raw key
 */
export function t(key, vars) {
  const template = strings[key] || enStrings[key] || key;
  return interpolate(template, vars);
}

/**
 * Load a locale. Fetches the JSON file and applies to DOM.
 * @param {string} code - Locale code, e.g. "de"
 */
export async function loadLocale(code) {
  if (!LOCALE_CODES.has(code)) code = 'en';

  try {
    const res = await fetch(`locales/${code}.json?v=${__cacheBust}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    strings = flatten(data);
    currentLocale = code;
  } catch {
    // Fall back to English
    strings = { ...enStrings };
    currentLocale = 'en';
  }

  document.documentElement.lang = currentLocale;
  applyLocaleToDOM();
  for (const cb of localeChangeCallbacks) cb(currentLocale);
}

/**
 * Load English strings (must be called once at startup before loadLocale).
 */
export async function initI18n() {
  try {
    const res = await fetch(`locales/en.json?v=${__cacheBust}`);
    if (res.ok) {
      const data = await res.json();
      enStrings = flatten(data);
      strings = { ...enStrings };
    } else {
      console.warn(`[i18n] Failed to load en.json: HTTP ${res.status} — UI will show raw keys`);
    }
  } catch (err) {
    console.warn('[i18n] Failed to load en.json — UI will show raw keys:', err.message);
  }
}

/**
 * Walk DOM elements with data-i18n attributes and apply translations.
 *
 * Supported attributes:
 *   data-i18n="key"         → sets textContent
 *   data-i18n-title="key"   → sets title attribute
 *   data-i18n-aria="key"    → sets aria-label attribute
 *   data-i18n-placeholder="key" → sets placeholder attribute
 */
export function applyLocaleToDOM() {
  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of document.querySelectorAll('[data-i18n-title]')) {
    el.title = t(el.dataset.i18nTitle);
  }
  for (const el of document.querySelectorAll('[data-i18n-aria]')) {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  }
  for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  }
}

export function getLocale() {
  return currentLocale;
}

export function getSupportedLocales() {
  return SUPPORTED_LOCALES;
}

/**
 * Register a callback invoked after every locale change (after DOM is updated).
 * @param {function(string): void} cb - Receives the new locale code
 */
export function onLocaleChange(cb) {
  localeChangeCallbacks.push(cb);
}

/**
 * Detect the best locale from URL param, localStorage, or browser setting.
 * @returns {string} Locale code
 */
export function detectLocale() {
  // 1. URL parameter ?lang=de
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (urlLang && LOCALE_CODES.has(urlLang)) return urlLang;

  // 2. localStorage
  const saved = localStorage.getItem('skillnet-locale');
  if (saved && LOCALE_CODES.has(saved)) return saved;

  // 3. Browser language
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    // Exact match first (e.g. "zh-CN")
    if (LOCALE_CODES.has(lang)) return lang;
    // Base language match (e.g. "de-DE" → "de")
    const base = lang.split('-')[0];
    if (LOCALE_CODES.has(base)) return base;
  }

  return 'en';
}
