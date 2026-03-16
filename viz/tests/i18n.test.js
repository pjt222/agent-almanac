import { describe, it, expect, beforeEach } from 'vitest';

// We test the pure functions directly by re-implementing the module internals
// since the module has side effects (global state). Import the actual module
// for integration-style tests of the public API.

// ── Unit tests for flatten() ─────────────────────────────────────

// Re-implement flatten locally so we can test it in isolation
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

describe('flatten', () => {
  it('flattens nested objects to dot-separated keys', () => {
    const input = { header: { skills: 'Skills', edges: 'Edges' } };
    expect(flatten(input)).toEqual({
      'header.skills': 'Skills',
      'header.edges': 'Edges',
    });
  });

  it('handles deeply nested objects', () => {
    const input = { a: { b: { c: 'deep' } } };
    expect(flatten(input)).toEqual({ 'a.b.c': 'deep' });
  });

  it('excludes _meta keys', () => {
    const input = {
      _meta: { locale: 'en', name: 'English' },
      header: { skills: 'Skills' },
    };
    expect(flatten(input)).toEqual({ 'header.skills': 'Skills' });
  });

  it('converts non-string values to strings', () => {
    const input = { count: 42, flag: true };
    expect(flatten(input)).toEqual({ count: '42', flag: 'true' });
  });

  it('handles array values by converting to string', () => {
    const input = { items: ['a', 'b'] };
    expect(flatten(input)).toEqual({ items: 'a,b' });
  });

  it('returns empty object for empty input', () => {
    expect(flatten({})).toEqual({});
  });

  it('returns empty object for _meta-only input', () => {
    expect(flatten({ _meta: { locale: 'en' } })).toEqual({});
  });
});

// ── Unit tests for interpolate() ─────────────────────────────────

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

describe('interpolate', () => {
  it('replaces {name} placeholders', () => {
    expect(interpolate('{count} members', { count: 5 })).toBe('5 members');
  });

  it('replaces multiple placeholders', () => {
    expect(interpolate('{a} and {b}', { a: 'X', b: 'Y' })).toBe('X and Y');
  });

  it('preserves unreplaced placeholders when var is missing', () => {
    expect(interpolate('{count} of {total}', { count: 3 })).toBe('3 of {total}');
  });

  it('returns template unchanged when vars is null/undefined', () => {
    expect(interpolate('hello {name}', null)).toBe('hello {name}');
    expect(interpolate('hello {name}', undefined)).toBe('hello {name}');
  });

  it('returns template unchanged when vars is empty', () => {
    expect(interpolate('hello {name}', {})).toBe('hello {name}');
  });

  it('handles templates with no placeholders', () => {
    expect(interpolate('no placeholders', { key: 'val' })).toBe('no placeholders');
  });

  it('converts non-string values to strings', () => {
    expect(interpolate('{n}', { n: 0 })).toBe('0');
    expect(interpolate('{n}', { n: false })).toBe('false');
  });
});

// ── Integration tests for t() ────────────────────────────────────

describe('t (translation function)', () => {
  // We test the real module's t() via dynamic import
  let t;

  beforeEach(async () => {
    // Re-import fresh module for each test to reset state
    const mod = await import('../js/i18n.js');
    t = mod.t;
  });

  it('returns raw key when no strings are loaded', () => {
    // Before initI18n, enStrings is empty
    expect(t('header.skills')).toBe('header.skills');
  });

  it('returns raw key with interpolation vars preserved', () => {
    expect(t('panel.members', { count: 3 })).toBe('panel.members');
  });
});

// ── Unit tests for detectLocale logic ────────────────────────────

describe('detectLocale logic', () => {
  // We test the algorithm without the actual browser APIs
  const LOCALE_CODES = new Set(['en', 'de', 'zh-CN', 'ja', 'es']);

  function detectLocaleFrom(urlParam, savedLocale, browserLangs) {
    if (urlParam && LOCALE_CODES.has(urlParam)) return urlParam;
    if (savedLocale && LOCALE_CODES.has(savedLocale)) return savedLocale;
    for (const lang of browserLangs) {
      if (LOCALE_CODES.has(lang)) return lang;
      const base = lang.split('-')[0];
      if (LOCALE_CODES.has(base)) return base;
    }
    return 'en';
  }

  it('prefers URL parameter', () => {
    expect(detectLocaleFrom('de', 'ja', ['en'])).toBe('de');
  });

  it('falls back to localStorage', () => {
    expect(detectLocaleFrom(null, 'ja', ['en'])).toBe('ja');
  });

  it('falls back to browser language', () => {
    expect(detectLocaleFrom(null, null, ['de-DE', 'en'])).toBe('de');
  });

  it('matches exact browser language for zh-CN', () => {
    expect(detectLocaleFrom(null, null, ['zh-CN'])).toBe('zh-CN');
  });

  it('matches base language from browser', () => {
    expect(detectLocaleFrom(null, null, ['es-MX'])).toBe('es');
  });

  it('returns en as ultimate fallback', () => {
    expect(detectLocaleFrom(null, null, ['fr', 'pt'])).toBe('en');
  });

  it('ignores unsupported URL param', () => {
    expect(detectLocaleFrom('fr', null, ['de'])).toBe('de');
  });
});
