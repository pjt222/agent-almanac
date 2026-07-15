import { describe, it, expect } from 'vitest';
import { smartTitleCase } from '../js/title-case.js';

describe('smartTitleCase', () => {
  it('capitalises plain words', () => {
    expect(smartTitleCase('gardening')).toBe('Gardening');
  });

  it('handles hyphenated slugs', () => {
    expect(smartTitleCase('r-packages')).toBe('R Packages');
  });

  it('applies MCP override', () => {
    expect(smartTitleCase('mcp-integration')).toBe('MCP Integration');
  });

  it('applies GxP override', () => {
    expect(smartTitleCase('gxp-compliance')).toBe('GxP Compliance');
  });

  it('applies DevOps override', () => {
    expect(smartTitleCase('devops')).toBe('DevOps');
  });

  it('applies MLOps override', () => {
    expect(smartTitleCase('mlops')).toBe('MLOps');
  });

  it('handles multi-word slugs', () => {
    expect(smartTitleCase('stochastic-processes')).toBe('Stochastic Processes');
  });

  it('applies AI override', () => {
    expect(smartTitleCase('ai-self-care')).toBe('AI Self Care');
  });

  it('applies A2A override', () => {
    expect(smartTitleCase('a2a-protocol')).toBe('A2A Protocol');
  });
});
