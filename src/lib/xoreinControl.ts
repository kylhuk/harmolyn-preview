import { DeeplinkValidationError, parseJoinDeepLink } from '@/protocol/deeplink';
import type { XoreinRuntimeSnapshot, XoreinSessionSnapshot } from '@/types';

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

const SESSION_GLOBAL_KEYS = [
  '__HARMOLYN_XOREIN_SESSION__',
  '__HARMOLYN_SESSION_SNAPSHOT__',
  '__XOREIN_SESSION_SNAPSHOT__',
] as const;

const RUNTIME_STORAGE_KEYS = [
  'harmolyn:xorein:runtime',
  'harmolyn:runtime-snapshot',
  'xorein:runtime-snapshot',
] as const;

const SESSION_STORAGE_KEYS = [
  'harmolyn:xorein:session',
  'harmolyn:session-snapshot',
  'xorein:session-snapshot',
] as const;

interface ControlApiErrorShape {
  code?: string;
  message?: string;
}

interface ControlChannelRecord {
  id: string;
  server_id: string;
  name: string;
  voice: boolean;
  created_at?: string;
}

interface ControlManifest {
  server_id: string;
  name: string;
  description?: string;
}

interface ControlServerRecord {
  id: string;
  name: string;
  description?: string;
  invite?: string;
  manifest: ControlManifest;
  channels: Record<string, ControlChannelRecord>;
}

export interface XoreinServerPreview {
  invite: {
    server_id: string;
    expires_at?: string;
  };
  manifest: {
    server_id: string;
    name: string;
    description?: string;
    history_coverage?: string;
  };
  owner_role?: string;
  member_count?: number;
  channels?: ControlChannelRecord[];
  safety_labels?: string[];
}

export class XoreinControlError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'XoreinControlError';
    this.code = code;
    this.status = status;
  }
}

export function normalizeJoinInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new DeeplinkValidationError('empty deeplink');
  }
  if (!trimmed.toLowerCase().startsWith('aether://')) {
    throw new DeeplinkValidationError('unsupported invite format, expected aether://join/<server-id>?invite=...');
  }

  const parsed = parseJoinDeepLink(trimmed);
  if (!parsed.invite) {
    throw new DeeplinkValidationError('signed invite query parameter is required for join previews and remote joins');
  }

  return trimmed;
}

export async function previewServerByInvite(runtimeSnapshot: XoreinRuntimeSnapshot | null, raw: string): Promise<XoreinServerPreview> {
  const deeplink = normalizeJoinInput(raw);
  return requestControlApi<XoreinServerPreview>(runtimeSnapshot, 'POST', '/v1/servers/preview', { deeplink });
}

export async function createServer(runtimeSnapshot: XoreinRuntimeSnapshot | null, input: { name: string; description?: string }): Promise<XoreinRuntimeSnapshot> {
  const name = input.name.trim();
  if (!name) {
    throw new XoreinControlError('invalid_request', 'Server name is required.');
  }

  await requestControlApi<ControlServerRecord>(runtimeSnapshot, 'POST', '/v1/servers', {
    name,
    description: input.description?.trim() ?? '',
  });

  return refreshRuntimeSnapshot(runtimeSnapshot, {
    serverId: null,
    manifest: { name, description: input.description?.trim() ?? '' },
  });
}

export async function joinServerByInvite(runtimeSnapshot: XoreinRuntimeSnapshot | null, raw: string): Promise<XoreinRuntimeSnapshot> {
  const deeplink = normalizeJoinInput(raw);
  const server = await requestControlApi<ControlServerRecord>(runtimeSnapshot, 'POST', '/v1/servers/join', { deeplink });
  return refreshRuntimeSnapshot(runtimeSnapshot, {
    serverId: server.id,
    manifest: {
      name: server.manifest?.name?.trim() || server.name,
      description: server.manifest?.description?.trim() || server.description || '',
    },
  });
}

export async function refreshRuntimeSnapshot(
  runtimeSnapshot: XoreinRuntimeSnapshot | null,
  session: {
    serverId: string | null;
    manifest?: { name?: string; description?: string };
  } | null | undefined = undefined,
): Promise<XoreinRuntimeSnapshot> {
  const snapshot = await requestControlApi<XoreinRuntimeSnapshot>(runtimeSnapshot, 'GET', '/v1/state');
  publishSnapshot(snapshot, session);
  return snapshot;
}

export async function joinVoiceChannel(
  runtimeSnapshot: XoreinRuntimeSnapshot | null,
  channelID: string,
  muted = false,
): Promise<XoreinRuntimeSnapshot> {
  await requestControlApi<void>(runtimeSnapshot, 'POST', `/v1/voice/${channelID}/join`, { muted });
  return refreshRuntimeSnapshot(runtimeSnapshot, undefined);
}

export async function leaveVoiceChannel(
  runtimeSnapshot: XoreinRuntimeSnapshot | null,
  channelID: string,
): Promise<XoreinRuntimeSnapshot> {
  await requestControlApi<void>(runtimeSnapshot, 'POST', `/v1/voice/${channelID}/leave`);
  return refreshRuntimeSnapshot(runtimeSnapshot, undefined);
}

export async function setVoiceMuted(
  runtimeSnapshot: XoreinRuntimeSnapshot | null,
  channelID: string,
  muted: boolean,
): Promise<XoreinRuntimeSnapshot> {
  await requestControlApi<void>(runtimeSnapshot, 'POST', `/v1/voice/${channelID}/mute`, { muted });
  return refreshRuntimeSnapshot(runtimeSnapshot, undefined);
}

export async function sendVoiceFrame(
  runtimeSnapshot: XoreinRuntimeSnapshot | null,
  channelID: string,
  payload: unknown,
): Promise<XoreinRuntimeSnapshot> {
  await requestControlApi<void>(runtimeSnapshot, 'POST', `/v1/voice/${channelID}/frames`, { data: encodeVoiceFrameData(payload) });
  return refreshRuntimeSnapshot(runtimeSnapshot, undefined);
}

function publishSnapshot(
  runtimeSnapshot: XoreinRuntimeSnapshot,
  session: {
    serverId: string | null;
    manifest?: { name?: string; description?: string };
  } | null | undefined,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  for (const key of RUNTIME_GLOBAL_KEYS) {
    (window as Window & Record<string, unknown>)[key] = runtimeSnapshot;
  }
  const serializedRuntime = JSON.stringify(runtimeSnapshot);
  for (const key of RUNTIME_STORAGE_KEYS) {
    window.localStorage.setItem(key, serializedRuntime);
  }

  if (session === undefined) {
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
    return;
  }

  const sessionSnapshot = session?.serverId
    ? createSessionSnapshot(session.serverId, session.manifest)
    : null;
  for (const key of SESSION_GLOBAL_KEYS) {
    (window as Window & Record<string, unknown>)[key] = sessionSnapshot;
  }
  const serializedSession = JSON.stringify(sessionSnapshot);
  for (const key of SESSION_STORAGE_KEYS) {
    window.localStorage.setItem(key, serializedSession);
  }

  window.dispatchEvent(new Event('focus'));
  document.dispatchEvent(new Event('visibilitychange'));
}

function encodeVoiceFrameData(payload: unknown): string {
  const raw = payload instanceof Uint8Array
    ? payload
    : payload instanceof ArrayBuffer
      ? new Uint8Array(payload)
      : new TextEncoder().encode(typeof payload === 'string' ? payload : JSON.stringify(payload));

  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of raw) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  return Buffer.from(raw).toString('base64');
}

function createSessionSnapshot(
  serverId: string,
  manifest?: { name?: string; description?: string },
): XoreinSessionSnapshot {
  return {
    serverId,
    securityMode: 'clear',
    connectedAtMs: Date.now(),
    reconnectAttempts: 0,
    manifest: {
      name: manifest?.name?.trim() || serverId,
      description: manifest?.description?.trim() || '',
    },
    acceptedProtocol: null,
  };
}

async function requestControlApi<T>(
  runtimeSnapshot: XoreinRuntimeSnapshot | null,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const endpoint = runtimeSnapshot?.control_endpoint?.trim() || runtimeSnapshot?.settings?.control_endpoint?.trim() || '';
  if (!endpoint) {
    throw new XoreinControlError('runtime_unavailable', 'The local xorein control endpoint is unavailable.');
  }

  const token = readControlToken();
  if (!token) {
    throw new XoreinControlError('missing_control_token', 'The local xorein control token is missing from the browser session.');
  }

  const response = await fetch(new URL(path, endpoint), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let parsed: ControlApiErrorShape | null = null;
    try {
      parsed = await response.json() as ControlApiErrorShape;
    } catch {
      parsed = null;
    }
    throw new XoreinControlError(
      parsed?.code?.trim() || `http_${response.status}`,
      parsed?.message?.trim() || response.statusText || 'xorein request failed',
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

function readControlToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const windowRecord = window as Window & Record<string, unknown>;
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
