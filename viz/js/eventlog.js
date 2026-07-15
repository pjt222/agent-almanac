/**
 * eventlog.js - Shared event logging for all visualization modes
 *
 * Enabled only when the URL contains ?eventlog. When disabled,
 * logEvent() is a no-op with zero overhead.
 */

const enabled = new URLSearchParams(window.location.search).has('eventlog');
const eventLog = [];
const sessionMeta = {
  startedAt: new Date().toISOString(),
  url: window.location.href,
  userAgent: navigator.userAgent,
};

export function logEvent(source, entry) {
  if (!enabled) return;
  entry.ts = new Date().toISOString();
  entry.source = source;
  eventLog.push(entry);
  console.log(`[eventlog:${source}]`, entry);
}

export function isEnabled() {
  return enabled;
}

export function downloadLog() {
  const payload = {
    session: sessionMeta,
    endedAt: new Date().toISOString(),
    totalEvents: eventLog.length,
    events: eventLog,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eventlog-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function clearLog() {
  eventLog.length = 0;
}
