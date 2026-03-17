/**
 * adapters/index.js — Adapter registry and lookup.
 */

import { UniversalAdapter } from './universal.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { OpenCodeAdapter } from './opencode.js';
import { OpenClawAdapter } from './openclaw.js';
import { HermesAdapter } from './hermes.js';
import { VibeAdapter } from './vibe.js';
import { CursorAdapter } from './cursor.js';
import { WindsurfAdapter } from './windsurf.js';
import { CopilotAdapter } from './copilot.js';
import { CodexAdapter } from './codex.js';
import { GeminiAdapter } from './gemini.js';
import { AiderAdapter } from './aider.js';

/** All registered adapters, keyed by id. */
const ADAPTERS = new Map();

function register(AdapterClass) {
  ADAPTERS.set(AdapterClass.id, AdapterClass);
}

// Universal (covers 8+ tools via .agents/skills/)
register(UniversalAdapter);

// Full content type support (skills + agents + teams)
register(ClaudeCodeAdapter);

// Agent platform adapters (skills + agents)
register(OpenCodeAdapter);
register(OpenClawAdapter);
register(HermesAdapter);
register(VibeAdapter);
register(CodexAdapter);

// Skills-only adapters
register(CursorAdapter);
register(WindsurfAdapter);
register(CopilotAdapter);
register(GeminiAdapter);
register(AiderAdapter);

/**
 * Get an adapter instance by framework id.
 * @param {string} id
 * @returns {import('./base.js').FrameworkAdapter|null}
 */
export function getAdapter(id) {
  const AdapterClass = ADAPTERS.get(id);
  return AdapterClass ? new AdapterClass() : null;
}

/**
 * Get adapter instances for a list of detected frameworks.
 * @param {object[]} detections - From detector.detectFrameworks()
 * @returns {import('./base.js').FrameworkAdapter[]}
 */
export function getAdaptersForDetections(detections) {
  const adapters = [];
  for (const d of detections) {
    const adapter = getAdapter(d.id);
    if (adapter) adapters.push(adapter);
  }
  return adapters;
}

/**
 * List all registered adapter ids.
 * @returns {string[]}
 */
export function listAdapterIds() {
  return [...ADAPTERS.keys()];
}

/**
 * List all registered adapters with metadata.
 * @returns {{ id: string, displayName: string, contentTypes: string[] }[]}
 */
export function listAdapters() {
  return [...ADAPTERS.values()].map(A => ({
    id: A.id,
    displayName: A.displayName,
    contentTypes: A.contentTypes,
    strategy: A.strategy,
  }));
}
