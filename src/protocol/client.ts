import { FEATURES } from "../config/featureFlags.js";
import {
  validFeatureFlagName,
  negotiateCapabilities,
  negotiateConversationSecurityMode,
  type CapabilityNegotiationResult,
  type FeatureFlag,
  type SecurityMode,
} from "./capabilities.js";
import { computeReconnectDelay, type BackoffPolicy } from "./backoff.js";
import { parseJoinDeepLink } from "./deeplink.js";
import {
  cloneManifest,
  MANIFEST_VERSION_V1,
  type Manifest,
  type Sha256Digest,
  validateManifestFreshness,
  validateStoredSignature,
} from "./manifest.js";
import {
  buildFeatureProtocolContract,
  deriveLocalCapabilities,
  type FeatureProtocolContract,
  type FeatureToggleSet,
} from "./featureBridge.js";
import { parseProtocolId, stringifyProtocolId, type ProtocolId } from "./protocolId.js";
import type { Message } from "../types.js";

export interface XoreinHandshakeRequest {
  serverId: string;
  localCapabilities: FeatureFlag[];
  preferredSecurityModes: SecurityMode[];
  protocolOffers: string[];
}

export interface XoreinHandshakeResponse {
  manifest: Manifest;
  advertisedCapabilities?: string[];
  requiredCapabilities?: string[];
  offeredSecurityModes?: SecurityMode[];
  acceptedProtocol?: string;
}

export interface XoreinTransport {
  connect(): Promise<void>;
  disconnect(reason?: string): Promise<void>;
  performHandshake(request: XoreinHandshakeRequest): Promise<XoreinHandshakeResponse>;
  joinByLink?(rawLink: string, request: XoreinHandshakeRequest): Promise<XoreinHandshakeResponse>;
}

export interface XoreinSession {
  serverId: string;
  manifest: Manifest;
  securityMode: SecurityMode;
  acceptedProtocol: ProtocolId | null;
  capabilityNegotiation: CapabilityNegotiationResult;
  featureContract: FeatureProtocolContract;
  connectedAtMs: number;
  reconnectAttempts: number;
}

export type XoreinConnectionLifecycleState = "connected" | "disconnected" | "reconnecting" | "no-peer" | "no-relay";

export interface XoreinConnectionSnapshot {
  state: XoreinConnectionLifecycleState;
  detail: string;
  serverId: string | null;
  reconnectAttempts: number;
  updatedAtMs: number;
  session: XoreinSession | null;
}

export interface XoreinClientOptions {
  transport: XoreinTransport;
  features?: FeatureToggleSet;
  preferredSecurityModes?: readonly SecurityMode[];
  protocolOffers?: readonly ProtocolId[];
  maxManifestAgeMs?: number;
  backoff?: Partial<BackoffPolicy>;
  digest?: Sha256Digest;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

export interface XoreinControlTransportOptions {
  endpoint: string;
  token: string;
  fetch?: typeof globalThis.fetch;
}

export interface PersistedChatScopeState {
  version: 1;
  nickname: string;
  mutedUserIds: string[];
  inboxReadIds: string[];
  deletedMessageIds: string[];
  messages: Message[];
  threads: Record<string, Message[]>;
}

export interface BrowserChatActionSupport {
  mode: "local-preview" | "offline";
  canPersistLocally: boolean;
  canAttemptAttachments: boolean;
  detail: string;
}

const DEFAULT_PREFERRED_SECURITY_MODES: readonly SecurityMode[] = ["seal", "tree", "clear"];
const DEFAULT_PROTOCOL_OFFERS: readonly ProtocolId[] = [
  { family: "chat", version: { major: 0, minor: 1 }, name: "chat/0.1" },
  { family: "voice", version: { major: 0, minor: 1 }, name: "voice/0.1" },
  { family: "manifest", version: { major: 0, minor: 1 }, name: "manifest/0.1" },
  { family: "identity", version: { major: 0, minor: 1 }, name: "identity/0.1" },
  { family: "dm", version: { major: 0, minor: 2 }, name: "dm/0.2" },
  { family: "friends", version: { major: 0, minor: 2 }, name: "friends/0.2" },
  { family: "presence", version: { major: 0, minor: 2 }, name: "presence/0.2" },
  { family: "notify", version: { major: 0, minor: 2 }, name: "notify/0.2" },
];

const CHAT_SCOPE_STATE_STORAGE_PREFIX = "harmolyn:xorein:chat-scope:";
const CONTROL_GLOBAL_KEYS = [
  "__HARMOLYN_XOREIN_CONTROL_TOKEN__",
  "__HARMOLYN_CONTROL_TOKEN__",
  "__XOREIN_CONTROL_TOKEN__",
] as const;
const CONTROL_STORAGE_KEYS = [
  "harmolyn:xorein:control-token",
  "harmolyn:control-token",
  "xorein:control-token",
] as const;
const RUNTIME_GLOBAL_KEYS = [
  "__HARMOLYN_XOREIN_RUNTIME__",
  "__HARMOLYN_RUNTIME_SNAPSHOT__",
  "__XOREIN_RUNTIME_SNAPSHOT__",
] as const;
const RUNTIME_STORAGE_KEYS = [
  "harmolyn:xorein:runtime",
  "harmolyn:runtime-snapshot",
  "xorein:runtime-snapshot",
] as const;

const PROTOCOL_CAPABILITY_REQUIREMENTS: Readonly<Record<string, FeatureFlag>> = {
  chat: "cap.chat",
  voice: "cap.voice",
  manifest: "cap.manifest",
  identity: "cap.identity",
  dm: "cap.dm",
  friends: "cap.friends",
  presence: "cap.presence",
  notify: "cap.notify",
};

interface XoreinControlStateResponse {
  servers: XoreinControlServerRecord[];
}

interface XoreinControlApiError {
  code?: string;
  message?: string;
}

interface XoreinControlServerRecord {
  id: string;
  name: string;
  description?: string;
  manifest: XoreinControlManifest;
}

interface XoreinControlManifest {
  server_id: string;
  name: string;
  description?: string;
  owner_peer_id: string;
  owner_public_key: string;
  owner_addresses: string[];
  bootstrap_addrs?: string[];
  relay_addrs?: string[];
  capabilities: string[];
  history_retention_messages?: number;
  history_coverage?: string;
  history_durability?: string;
  issued_at: string;
  updated_at: string;
  expires_at?: string;
  signature: string;
}

export class XoreinControlTransport implements XoreinTransport {
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(private readonly options: XoreinControlTransportOptions) {
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) {
      throw new Error("fetch unavailable for xorein control transport");
    }
    this.fetchImpl = fetchImpl;
  }

  async connect(): Promise<void> {
    await this.request<XoreinControlStateResponse>("GET", "/v1/state");
  }

  async disconnect(): Promise<void> {
    // The local control bridge is stateless; disconnect only clears caller state.
  }

  async performHandshake(request: XoreinHandshakeRequest): Promise<XoreinHandshakeResponse> {
    const state = await this.request<XoreinControlStateResponse>("GET", "/v1/state");
    const server = state.servers.find((candidate) => candidate.id === request.serverId);
    if (!server) {
      throw new Error(`server not found in local runtime: ${request.serverId}`);
    }
    return handshakeResponseFromServerRecord(server, request);
  }

  async joinByLink(rawLink: string, request: XoreinHandshakeRequest): Promise<XoreinHandshakeResponse> {
    const server = await this.request<XoreinControlServerRecord>("POST", "/v1/servers/join", { deeplink: rawLink });
    return handshakeResponseFromServerRecord(server, request);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await this.fetchImpl(new URL(path, this.options.endpoint), {
      method,
      headers: {
        Authorization: `Bearer ${this.options.token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let parsedError: XoreinControlApiError | undefined;
      try {
        parsedError = await response.json() as XoreinControlApiError;
      } catch {
        parsedError = undefined;
      }
      const code = parsedError?.code?.trim() || `http-${response.status}`;
      const message = parsedError?.message?.trim() || response.statusText || "request failed";
      throw new Error(`xorein ${code}: ${message}`);
    }

    return response.json() as Promise<T>;
  }
}

export function readPersistedChatScopeState(scopeId: string): PersistedChatScopeState {
  if (typeof window === "undefined" || !scopeId.trim()) {
    return createEmptyPersistedChatScopeState();
  }

  const raw = window.localStorage.getItem(buildChatScopeStorageKey(scopeId));
  if (!raw) {
    return createEmptyPersistedChatScopeState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedChatScopeState>;
    return {
      version: 1,
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      mutedUserIds: Array.isArray(parsed.mutedUserIds) ? parsed.mutedUserIds.filter((value): value is string => typeof value === "string") : [],
      inboxReadIds: Array.isArray(parsed.inboxReadIds) ? parsed.inboxReadIds.filter((value): value is string => typeof value === "string") : [],
      deletedMessageIds: Array.isArray(parsed.deletedMessageIds) ? parsed.deletedMessageIds.filter((value): value is string => typeof value === "string") : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages.filter(isStoredMessage) : [],
      threads: normalizeStoredThreads(parsed.threads),
    };
  } catch {
    return createEmptyPersistedChatScopeState();
  }
}

export function writePersistedChatScopeState(scopeId: string, state: PersistedChatScopeState): void {
  if (typeof window === "undefined" || !scopeId.trim()) {
    return;
  }

  window.localStorage.setItem(buildChatScopeStorageKey(scopeId), JSON.stringify({
    version: 1,
      nickname: state.nickname,
      mutedUserIds: [...new Set(state.mutedUserIds)].sort(),
      inboxReadIds: [...new Set(state.inboxReadIds)].sort(),
      deletedMessageIds: [...new Set(state.deletedMessageIds)].sort(),
      messages: state.messages.filter(isStoredMessage),
      threads: normalizeStoredThreads(state.threads),
    } satisfies PersistedChatScopeState));
}

export function readBrowserChatActionSupport(): BrowserChatActionSupport {
  if (typeof window === "undefined") {
    return {
      mode: "offline",
      canPersistLocally: false,
      canAttemptAttachments: false,
      detail: "Chat actions require a browser session.",
    };
  }

  const runtime = readBrowserRuntimeSnapshot();
  const peerId = runtime?.identity?.peer_id?.trim() ?? "";
  const endpoint = runtime?.control_endpoint?.trim() || runtime?.settings?.control_endpoint?.trim() || "";
  const token = readBrowserControlToken();
  const runtimeReady = Boolean(peerId && endpoint && token);

  if (!runtimeReady) {
    return {
      mode: "offline",
      canPersistLocally: true,
      canAttemptAttachments: false,
      detail: "Offline preview mode — chat text stays local in this browser, and attachments are disabled until the local xorein runtime returns.",
    };
  }

  return {
    mode: "local-preview",
    canPersistLocally: true,
    canAttemptAttachments: true,
    detail: "Local preview mode — the current xorein control API exposes runtime state only, so chat mutations persist deterministically in this browser until transport write endpoints exist.",
  };
}

export class XoreinClient {
  private readonly features: FeatureToggleSet;
  private readonly preferredSecurityModes: readonly SecurityMode[];
  private readonly protocolOffers: readonly ProtocolId[];
  private readonly maxManifestAgeMs: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;

  private lastServerId: string | null = null;
  private currentSession: XoreinSession | null = null;
  private reconnectAttempts = 0;
  private healPromise: Promise<XoreinSession> | null = null;
  private readonly connectionListeners = new Set<(snapshot: XoreinConnectionSnapshot) => void>();
  private connectionSnapshot: XoreinConnectionSnapshot;

  constructor(private readonly options: XoreinClientOptions) {
    this.features = options.features ?? FEATURES;
    this.preferredSecurityModes = options.preferredSecurityModes ?? DEFAULT_PREFERRED_SECURITY_MODES;
    this.protocolOffers = options.protocolOffers ?? DEFAULT_PROTOCOL_OFFERS;
    this.maxManifestAgeMs = Math.max(0, options.maxManifestAgeMs ?? 5 * 60_000);
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.now = options.now ?? (() => Date.now());
    this.connectionSnapshot = this.buildConnectionSnapshot("disconnected", "Not connected to a xorein server.");
  }

  snapshot(): XoreinSession | null {
    return cloneSession(this.currentSession);
  }

  connection(): XoreinConnectionSnapshot {
    return cloneConnectionSnapshot(this.connectionSnapshot);
  }

  subscribe(listener: (snapshot: XoreinConnectionSnapshot) => void): () => void {
    this.connectionListeners.add(listener);
    listener(this.connection());
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  async connectByLink(rawLink: string): Promise<XoreinSession> {
    const { serverId } = parseJoinDeepLink(rawLink);
    return this.establishSession(serverId, (request) =>
      this.options.transport.joinByLink
        ? this.options.transport.joinByLink(rawLink, request)
        : this.options.transport.performHandshake(request));
  }

  async connectToServer(serverId: string): Promise<XoreinSession> {
    return this.establishSession(serverId, (request) => this.options.transport.performHandshake(request));
  }

  private async establishSession(
    serverId: string,
    resolveHandshake: (request: XoreinHandshakeRequest) => Promise<XoreinHandshakeResponse>,
  ): Promise<XoreinSession> {
    const localCapabilities = deriveLocalCapabilities(this.features);
    const protocolOffers = this.protocolOffers.map((offer) => stringifyProtocolId(offer));
    this.lastServerId = serverId;

    this.updateConnection(this.reconnectAttempts > 0 ? "reconnecting" : "disconnected", `Connecting to ${serverId}...`);

    await this.options.transport.connect();

    try {
      const response = await resolveHandshake({
        serverId,
        localCapabilities,
        preferredSecurityModes: [...this.preferredSecurityModes],
        protocolOffers,
      });

      if (response.manifest.serverId !== serverId) {
        throw new Error("manifest server mismatch");
      }
      await validateStoredSignature(response.manifest, this.options.digest);
      validateManifestFreshness(response.manifest, new Date(this.now()), this.maxManifestAgeMs);

      const capabilityNegotiation = negotiateCapabilities(
        localCapabilities,
        response.advertisedCapabilities ?? [],
        response.requiredCapabilities ?? [],
      );
      if (capabilityNegotiation.missingRequired.length > 0) {
        throw new Error(`required capabilities unsupported: ${capabilityNegotiation.missingRequired.join(", ")}`);
      }

      const securityResult = negotiateConversationSecurityMode(
        this.preferredSecurityModes,
        response.offeredSecurityModes ?? [],
      );
      if (securityResult.reason !== "matched") {
        throw new Error(`security mode negotiation failed: ${securityResult.reason}`);
      }

      let acceptedProtocol: ProtocolId | null = null;
      if (response.acceptedProtocol) {
        acceptedProtocol = parseProtocolId(response.acceptedProtocol);
        if (!protocolOffers.includes(response.acceptedProtocol)) {
          throw new Error("accepted protocol was not offered locally");
        }
      }

      const featureContract = buildFeatureProtocolContract(capabilityNegotiation, this.features);
      const attemptCount = this.reconnectAttempts;
      const session: XoreinSession = {
        serverId,
        manifest: cloneManifest(response.manifest),
        securityMode: securityResult.mode,
        acceptedProtocol,
        capabilityNegotiation: cloneCapabilityNegotiation(capabilityNegotiation),
        featureContract: cloneFeatureContract(featureContract),
        connectedAtMs: this.now(),
        reconnectAttempts: attemptCount,
      };

      this.currentSession = session;
      this.reconnectAttempts = 0;
      this.updateConnection("connected", `Connected to ${session.manifest.name || serverId}.`);
      return cloneSession(session)!;
    } catch (error) {
      this.currentSession = null;
      this.updateConnection(mapConnectionFailure(error), error instanceof Error ? error.message : "connection failed");
      await safeDisconnect(this.options.transport, "handshake-failed");
      throw error;
    }
  }

  async selfHeal(): Promise<XoreinSession> {
    if (!this.lastServerId) {
      throw new Error("no previous server to reconnect to");
    }
    if (this.healPromise) {
      return this.healPromise;
    }

    const attempt = ++this.reconnectAttempts;
    const delayMs = computeReconnectDelay(attempt, this.options.backoff);
    this.updateConnection("reconnecting", `Reconnect attempt ${attempt} scheduled in ${delayMs}ms.`);

    this.healPromise = (async () => {
      await this.sleep(delayMs);
      try {
        return await this.connectToServer(this.lastServerId!);
      } finally {
        this.healPromise = null;
      }
    })();

    return this.healPromise;
  }

  async disconnect(reason = "client-disconnect"): Promise<void> {
    this.currentSession = null;
    this.healPromise = null;
    this.reconnectAttempts = 0;
    this.updateConnection("disconnected", reason === "client-disconnect" ? "Disconnected from xorein." : reason);
    await safeDisconnect(this.options.transport, reason);
  }

  private buildConnectionSnapshot(state: XoreinConnectionLifecycleState, detail: string): XoreinConnectionSnapshot {
    return {
      state,
      detail,
      serverId: this.lastServerId,
      reconnectAttempts: this.reconnectAttempts,
      updatedAtMs: this.now(),
      session: cloneSession(this.currentSession),
    };
  }

  private updateConnection(state: XoreinConnectionLifecycleState, detail: string): void {
    this.connectionSnapshot = this.buildConnectionSnapshot(state, detail);
    for (const listener of this.connectionListeners) {
      listener(this.connection());
    }
  }
}

function handshakeResponseFromServerRecord(
  server: XoreinControlServerRecord,
  request: XoreinHandshakeRequest,
): XoreinHandshakeResponse {
  if (!server?.manifest) {
    throw new Error("manifest required from xorein bridge");
  }

  const advertisedCapabilities = normalizeManifestCapabilities(server.manifest.capabilities);
  return {
    manifest: {
      serverId: server.manifest.server_id,
      identity: server.manifest.owner_peer_id,
      version: MANIFEST_VERSION_V1,
      name: server.manifest.name,
      description: server.manifest.description ?? server.description ?? "",
      ownerPeerId: server.manifest.owner_peer_id,
      ownerPublicKey: server.manifest.owner_public_key,
      ownerAddresses: [...(server.manifest.owner_addresses ?? [])],
      bootstrapAddrs: [...(server.manifest.bootstrap_addrs ?? [])],
      relayAddrs: [...(server.manifest.relay_addrs ?? [])],
      updatedAt: server.manifest.updated_at,
      issuedAt: server.manifest.issued_at,
      expiresAt: server.manifest.expires_at,
      historyRetentionMessages: server.manifest.history_retention_messages,
      historyCoverage: server.manifest.history_coverage,
      historyDurability: server.manifest.history_durability,
      capabilities: advertisedCapabilities,
      signature: server.manifest.signature,
    },
    advertisedCapabilities,
    requiredCapabilities: [],
    offeredSecurityModes: ["clear"],
    acceptedProtocol: selectAcceptedProtocol(request.protocolOffers, advertisedCapabilities),
  };
}

function normalizeManifestCapabilities(capabilities: readonly string[]): FeatureFlag[] {
  const normalized = new Set<FeatureFlag>();
  for (const rawCapability of capabilities) {
    const capability = rawCapability.trim();
    if (!capability) {
      continue;
    }
    if (!validFeatureFlagName(capability)) {
      throw new Error(`invalid manifest capability: ${capability}`);
    }
    normalized.add(capability as FeatureFlag);
  }
  return [...normalized].sort();
}

function selectAcceptedProtocol(protocolOffers: readonly string[], advertisedCapabilities: readonly FeatureFlag[]): string | undefined {
  const remoteCapabilities = new Set(advertisedCapabilities);
  for (const offer of protocolOffers) {
    const parsed = parseProtocolId(offer);
    const requiredCapability = PROTOCOL_CAPABILITY_REQUIREMENTS[parsed.family];
    if (requiredCapability && remoteCapabilities.has(requiredCapability)) {
      return offer;
    }
  }
  return undefined;
}

async function safeDisconnect(transport: XoreinTransport, reason: string): Promise<void> {
  try {
    await transport.disconnect(reason);
  } catch {
    // Transport shutdown should not prevent recovery or caller cleanup.
  }
}

function cloneCapabilityNegotiation(
  negotiation: CapabilityNegotiationResult,
): CapabilityNegotiationResult {
  return {
    accepted: [...negotiation.accepted],
    ignoredRemote: [...negotiation.ignoredRemote],
    missingRequired: [...negotiation.missingRequired],
    feedback: negotiation.feedback,
  };
}

function cloneFeatureContract(contract: FeatureProtocolContract): FeatureProtocolContract {
  return {
    localSupported: [...contract.localSupported],
    blockedProtocolFeatures: [...contract.blockedProtocolFeatures],
    localOnlyEnabledFeatures: [...contract.localOnlyEnabledFeatures],
  };
}

function cloneSession(session: XoreinSession | null): XoreinSession | null {
  if (!session) {
    return null;
  }
  return {
    ...session,
    manifest: cloneManifest(session.manifest),
    acceptedProtocol: session.acceptedProtocol ? { ...session.acceptedProtocol, version: { ...session.acceptedProtocol.version } } : null,
    capabilityNegotiation: cloneCapabilityNegotiation(session.capabilityNegotiation),
    featureContract: cloneFeatureContract(session.featureContract),
  };
}

function cloneConnectionSnapshot(snapshot: XoreinConnectionSnapshot): XoreinConnectionSnapshot {
  return {
    ...snapshot,
    session: cloneSession(snapshot.session),
  };
}

function mapConnectionFailure(error: unknown): XoreinConnectionLifecycleState {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("server not found in local runtime") || message.includes("no previous server")) {
    return "no-peer";
  }
  if (message.includes("relay") || message.includes("delivery failed on direct and relay paths")) {
    return "no-relay";
  }
  return "disconnected";
}

function buildChatScopeStorageKey(scopeId: string): string {
  return `${CHAT_SCOPE_STATE_STORAGE_PREFIX}${scopeId.trim()}`;
}

function createEmptyPersistedChatScopeState(): PersistedChatScopeState {
  return {
    version: 1,
    nickname: "",
    mutedUserIds: [],
    inboxReadIds: [],
    deletedMessageIds: [],
    messages: [],
    threads: {},
  };
}

function normalizeStoredThreads(value: unknown): Record<string, Message[]> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>);
  return Object.fromEntries(entries.map(([key, threadMessages]) => [
    key,
    Array.isArray(threadMessages) ? threadMessages.filter(isStoredMessage) : [],
  ]));
}

function isStoredMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Message>;
  return typeof candidate.id === "string"
    && typeof candidate.userId === "string"
    && typeof candidate.content === "string"
    && typeof candidate.timestamp === "string";
}

function readBrowserRuntimeSnapshot(): {
  identity?: { peer_id?: string };
  control_endpoint?: string;
  settings?: Record<string, string>;
} | null {
  const windowRecord = window as unknown as Record<string, unknown>;
  for (const key of RUNTIME_GLOBAL_KEYS) {
    const value = parseBrowserJson(windowRecord[key]);
    if (value) {
      return value;
    }
  }

  for (const key of RUNTIME_STORAGE_KEYS) {
    const value = parseBrowserJson(window.localStorage.getItem(key)) || parseBrowserJson(window.sessionStorage.getItem(key));
    if (value) {
      return value;
    }
  }

  return null;
}

function readBrowserControlToken(): string {
  const windowRecord = window as unknown as Record<string, unknown>;
  for (const key of CONTROL_GLOBAL_KEYS) {
    const value = windowRecord[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  for (const key of CONTROL_STORAGE_KEYS) {
    const localValue = window.localStorage.getItem(key);
    if (localValue?.trim()) {
      return localValue.trim();
    }
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue?.trim()) {
      return sessionValue.trim();
    }
  }

  return "";
}

function parseBrowserJson(value: unknown): {
  identity?: { peer_id?: string };
  control_endpoint?: string;
  settings?: Record<string, string>;
} | null {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as {
        identity?: { peer_id?: string };
        control_endpoint?: string;
        settings?: Record<string, string>;
      };
    } catch {
      return null;
    }
  }
  if (typeof value === "object") {
    return value as {
      identity?: { peer_id?: string };
      control_endpoint?: string;
      settings?: Record<string, string>;
    };
  }
  return null;
}
