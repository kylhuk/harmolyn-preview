import type { XoreinRuntimeSnapshot } from '@/types';

const CONTROL_GLOBAL_KEYS = [
  '__HARMOLYN_XOREIN_CONTROL_TOKEN__',
  '__HARMOLYN_CONTROL_TOKEN__',
  '__XOREIN_CONTROL_TOKEN__',
] as const;

const CONTROL_STORAGE_KEYS = [
  'harmolyn:xorein:control-token',
  'harmolyn:control-token',
  'xorein:control-token',
] as const;

const RUNTIME_GLOBAL_KEYS = [
  '__HARMOLYN_XOREIN_RUNTIME__',
  '__HARMOLYN_RUNTIME_SNAPSHOT__',
  '__XOREIN_RUNTIME_SNAPSHOT__',
] as const;

const RUNTIME_STORAGE_KEYS = [
  'harmolyn:xorein:runtime',
  'harmolyn:runtime-snapshot',
  'xorein:runtime-snapshot',
] as const;

export interface AuthPreviewResult {
  ok: boolean;
  code: 'invalid' | 'unsupported';
  message: string;
}

export interface AuthPreviewContext {
  runtimeSnapshot: XoreinRuntimeSnapshot | null;
  hasRuntimeIdentity: boolean;
  hasControlEndpoint: boolean;
  hasControlToken: boolean;
  identityLabel: string;
}

export interface RegisterPreviewInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

export function readBrowserAuthContext(): AuthPreviewContext {
  const runtimeSnapshot = readRuntimeSnapshot();
  const identityPeerId = runtimeSnapshot?.identity?.peer_id?.trim() ?? '';
  const displayName = runtimeSnapshot?.identity?.profile?.display_name?.trim() ?? '';
  const controlEndpoint = runtimeSnapshot?.control_endpoint?.trim() || runtimeSnapshot?.settings?.control_endpoint?.trim() || '';
  const controlToken = readControlToken();

  return {
    runtimeSnapshot,
    hasRuntimeIdentity: Boolean(identityPeerId),
    hasControlEndpoint: Boolean(controlEndpoint),
    hasControlToken: Boolean(controlToken),
    identityLabel: displayName || identityPeerId || 'local runtime',
  };
}

export function submitCredentialLogin(input: { email: string; password: string }): AuthPreviewResult {
  const email = input.email.trim();
  const password = input.password.trim();
  if (!email || !password) {
    return { ok: false, code: 'invalid', message: 'Enter both an identity link and access key.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, code: 'invalid', message: 'Enter a valid identity link before authenticating.' };
  }
  if (password.length < 8) {
    return { ok: false, code: 'invalid', message: 'Access keys must be at least 8 characters long.' };
  }

  return unsupportedCredentialAuthMessage();
}

export function submitRegistration(input: RegisterPreviewInput): AuthPreviewResult {
  const username = input.username.trim();
  const email = input.email.trim();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!username || !email || !password || !confirmPassword) {
    return { ok: false, code: 'invalid', message: 'Fill in every field before creating a node identity.' };
  }
  if (!/^[A-Za-z0-9_]{3,32}$/.test(username)) {
    return { ok: false, code: 'invalid', message: 'Operator aliases must be 3-32 characters using letters, numbers, or underscores.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, code: 'invalid', message: 'Enter a valid identity link before initializing a node.' };
  }
  if (password.length < 8) {
    return { ok: false, code: 'invalid', message: 'Choose an access key with at least 8 characters.' };
  }
  if (password !== confirmPassword) {
    return { ok: false, code: 'invalid', message: 'Access key confirmation does not match.' };
  }
  if (!input.agreed) {
    return { ok: false, code: 'invalid', message: 'Accept the Terms of Service and Privacy Protocol to continue.' };
  }

  return unsupportedCredentialAuthMessage();
}

export function describeQrAuthUnsupportedState(): string {
  const context = readBrowserAuthContext();
  if (!context.hasRuntimeIdentity) {
    return 'QR and deep-link auth are unavailable because no local xorein identity is active in this browser session.';
  }
  if (!context.hasControlEndpoint || !context.hasControlToken) {
    return 'QR and deep-link auth are unavailable because the local xorein control bridge is not fully available in this browser session.';
  }
  return `QR and deep-link auth are not supported yet for ${context.identityLabel} because the current local xorein control API does not expose a pairing endpoint.`;
}

function unsupportedCredentialAuthMessage(): AuthPreviewResult {
  const context = readBrowserAuthContext();
  if (!context.hasRuntimeIdentity) {
    return {
      ok: false,
      code: 'unsupported',
      message: 'Credential auth is unsupported in this preview because no local xorein identity is active yet.',
    };
  }
  if (!context.hasControlEndpoint || !context.hasControlToken) {
    return {
      ok: false,
      code: 'unsupported',
      message: 'Credential auth is unsupported in this preview because the local xorein control bridge is not fully available in this browser session.',
    };
  }
  return {
    ok: false,
    code: 'unsupported',
    message: `Credential auth is unsupported in this preview for ${context.identityLabel} because the local xorein control API does not expose login or registration endpoints.`,
  };
}

function readRuntimeSnapshot(): XoreinRuntimeSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const windowRecord = window as unknown as Record<string, unknown>;
  for (const key of RUNTIME_GLOBAL_KEYS) {
    const value = windowRecord[key];
    if (isRuntimeSnapshot(value)) {
      return value;
    }
  }

  for (const key of RUNTIME_STORAGE_KEYS) {
    const value = parseJson(window.localStorage.getItem(key));
    if (isRuntimeSnapshot(value)) {
      return value;
    }
  }

  return null;
}

function readControlToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const windowRecord = window as unknown as Record<string, unknown>;
  for (const key of CONTROL_GLOBAL_KEYS) {
    const value = windowRecord[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  for (const key of CONTROL_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value?.trim()) {
      return value.trim();
    }
  }

  return '';
}

function parseJson(raw: string | null): unknown {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isRuntimeSnapshot(value: unknown): value is XoreinRuntimeSnapshot {
  return typeof value === 'object' && value !== null;
}
