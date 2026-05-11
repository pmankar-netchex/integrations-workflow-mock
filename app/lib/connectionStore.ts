'use client';
import * as React from 'react';

export type ConnectionStatus = 'not-connected' | 'connected' | 'error' | 'testing';

export type ConnectionRecord = {
  status: ConnectionStatus;
  /** ISO timestamp of the last successful test */
  lastTested?: string;
  lastError?: string;
  /** field key → value. Secrets are stored as the literal string '••••••' once saved (mock only). */
  values: Record<string, string>;
  /** Pre-seeded webhook for vendors that need it (TCP) */
  webhookUrl?: string;
};

const STORAGE_KEY = 'netchex.integrations.connections.v1';

const SEED: Record<string, ConnectionRecord> = {
  // Daxko ships not-connected so the credentials path is the primary demo
  daxko: { status: 'not-connected', values: {} },
  // Delaget is connected so users can land in the wizard directly
  delaget: {
    status: 'connected',
    lastTested: '2026-05-06T18:32:00Z',
    values: { apiKey: '••••••••', siteId: '4501' },
  },
  // TCP is connected and showing a stale-error to demo the broken state
  tcp: {
    status: 'error',
    lastTested: '2026-05-06T02:14:00Z',
    lastError: 'Webhook signature verification failed on last push. Check the shared secret in TCP.',
    values: {
      subdomain: 'acme',
      username: 'svc-netchex',
      password: '••••••••',
      webhookUrl: 'https://hooks.netchex.com/tcp/in/abc123',
    },
    webhookUrl: 'https://hooks.netchex.com/tcp/in/abc123',
  },
};

function readAll(): Record<string, ConnectionRecord> {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return { ...SEED, ...parsed };
  } catch {
    return SEED;
  }
}

function writeAll(state: Record<string, ConnectionRecord>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — ignore */
  }
  window.dispatchEvent(new CustomEvent('netchex.connections.changed'));
}

export function useConnections() {
  const [state, setState] = React.useState<Record<string, ConnectionRecord>>(SEED);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(readAll());
    setHydrated(true);
    const handler = () => setState(readAll());
    window.addEventListener('netchex.connections.changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('netchex.connections.changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const update = React.useCallback((slug: string, patch: Partial<ConnectionRecord>) => {
    setState((prev) => {
      const next = { ...prev, [slug]: { ...prev[slug], ...patch } as ConnectionRecord };
      writeAll(next);
      return next;
    });
  }, []);

  const get = React.useCallback(
    (slug: string): ConnectionRecord =>
      state[slug] ?? { status: 'not-connected', values: {} },
    [state],
  );

  const reset = React.useCallback((slug: string) => {
    setState((prev) => {
      const next = { ...prev };
      delete next[slug];
      writeAll(next);
      return { ...SEED, ...next };
    });
  }, []);

  return { state, hydrated, get, update, reset };
}

export function describeStatus(status: ConnectionStatus): {
  label: string;
  color: 'success' | 'warning' | 'error' | 'default' | 'info';
} {
  switch (status) {
    case 'connected':
      return { label: 'Connected', color: 'success' };
    case 'not-connected':
      return { label: 'Not connected', color: 'default' };
    case 'error':
      return { label: 'Connection issue', color: 'error' };
    case 'testing':
      return { label: 'Testing…', color: 'info' };
  }
}
