// build-info.js - Build metadata shared across modules
// __BUILD_TIME__ is injected by vite (see vite.config.js define);
// the typeof guard keeps non-vite contexts (tests, direct loads) working.

export const CACHE_BUST = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : Date.now();
