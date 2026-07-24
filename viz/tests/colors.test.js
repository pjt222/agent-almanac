import { describe, it, expect } from 'vitest';
import {
  getColor,
  getAgentColor,
  getTeamColor,
  getCurrentThemeName,
  getThemeNames,
  setTheme,
  hexToRgba,
} from '../js/colors.js';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

describe('getColor', () => {
  it('returns a valid hex string for a known domain', () => {
    const color = getColor('r-packages');
    expect(color).toMatch(HEX_RE);
  });

  it('returns #ffffff for an unknown domain', () => {
    expect(getColor('nonexistent-domain-xyz')).toBe('#ffffff');
  });
});

describe('getAgentColor', () => {
  it('returns a valid hex string for a known agent', () => {
    const color = getAgentColor('r-developer');
    expect(color).toMatch(HEX_RE);
  });

  it('returns a fallback color for an unknown agent', () => {
    const color = getAgentColor('nonexistent-agent-xyz');
    expect(color).toMatch(HEX_RE);
  });
});

describe('getTeamColor', () => {
  it('returns a valid hex string for a known team', () => {
    const color = getTeamColor('r-package-review');
    expect(color).toMatch(HEX_RE);
  });

  it('returns a fallback color for an unknown team', () => {
    const color = getTeamColor('nonexistent-team-xyz');
    expect(color).toMatch(HEX_RE);
  });
});

describe('getCurrentThemeName', () => {
  it('returns a string that is in getThemeNames()', () => {
    const name = getCurrentThemeName();
    expect(typeof name).toBe('string');
    expect(getThemeNames()).toContain(name);
  });
});

describe('setTheme', () => {
  it('changes the active theme', () => {
    const names = getThemeNames();
    const other = names.find((n) => n !== getCurrentThemeName());
    if (other) {
      setTheme(other);
      expect(getCurrentThemeName()).toBe(other);
      // Reset to default
      setTheme('cyberpunk');
    }
  });

  it('ignores invalid theme names', () => {
    const before = getCurrentThemeName();
    setTheme('invalid-theme-xyz');
    expect(getCurrentThemeName()).toBe(before);
  });
});

describe('hexToRgba', () => {
  it('converts hex to rgba string', () => {
    expect(hexToRgba('#ff0000', 1)).toBe('rgba(255,0,0,1)');
    expect(hexToRgba('#00ff00', 0.5)).toBe('rgba(0,255,0,0.5)');
  });
});
