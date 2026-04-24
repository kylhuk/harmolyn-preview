import { FEATURES } from "../config/featureFlags.js";
import { validFeatureFlagName, negotiateCapabilities, negotiateConversationSecurityMode, } from "./capabilities.js";
import { computeReconnectDelay } from "./backoff.js";
import { parseJoinDeepLink } from "./deeplink.js";
import { cloneManifest, MANIFEST_VERSION_V1, validateManifestFreshness, validateStoredSignature, } from "./manifest.js";
import { buildFeatureProtocolContract, deriveLocalCapabilities, } from "./featureBridge.js";
import { parseProtocolId, stringifyProtocolId } from "./protocolId.js";
const DEFAULT_PREFERRED_SECURITY_MODES = ["seal", "tree", "clear"];
const DEFAULT_PROTOCOL_OFFERS = [
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
];
const CONTROL_STORAGE_KEYS = [
    "harmolyn:xorein:control-token",
    "harmolyn:control-token",
    "xorein:control-token",
];
const RUNTIME_GLOBAL_KEYS = [
    "__HARMOLYN_XOREIN_RUNTIME__",
    "__HARMOLYN_RUNTIME_SNAPSHOT__",
    "__XOREIN_RUNTIME_SNAPSHOT__",
];
const RUNTIME_STORAGE_KEYS = [
    "harmolyn:xorein:runtime",
    "harmolyn:runtime-snapshot",
    "xorein:runtime-snapshot",
];
const PROTOCOL_CAPABILITY_REQUIREMENTS = {
    chat: "cap.chat",
    voice: "cap.voice",
    manifest: "cap.manifest",
    identity: "cap.identity",
    dm: "cap.dm",
    friends: "cap.friends",
    presence: "cap.presence",
    notify: "cap.notify",
};
export class XoreinControlTransport {
    options;
    fetchImpl;
    constructor(options) {
        this.options = options;
        const fetchImpl = options.fetch ?? globalThis.fetch;
        if (!fetchImpl) {
            throw new Error("fetch unavailable for xorein control transport");
        }
        this.fetchImpl = fetchImpl;
    }
    async connect() {
        await this.request("GET", "/v1/state");
    }
    async disconnect() {
        // The local control bridge is stateless; disconnect only clears caller state.
    }
    async performHandshake(request) {
        const state = await this.request("GET", "/v1/state");
        const server = state.servers.find((candidate) => candidate.id === request.serverId);
        if (!server) {
            throw new Error(`server not found in local runtime: ${request.serverId}`);
        }
        return handshakeResponseFromServerRecord(server, request);
    }
    async joinByLink(rawLink, request) {
        const server = await this.request("POST", "/v1/servers/join", { deeplink: rawLink });
        return handshakeResponseFromServerRecord(server, request);
    }
    async request(method, path, body) {
        const response = await this.fetchImpl(new URL(path, this.options.endpoint), {
            method,
            headers: {
                Authorization: `Bearer ${this.options.token}`,
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            let parsedError;
            try {
                parsedError = await response.json();
            }
            catch {
                parsedError = undefined;
            }
            const code = parsedError?.code?.trim() || `http-${response.status}`;
            const message = parsedError?.message?.trim() || response.statusText || "request failed";
            throw new Error(`xorein ${code}: ${message}`);
        }
        return response.json();
    }
}
export function readPersistedChatScopeState(scopeId) {
    if (typeof window === "undefined" || !scopeId.trim()) {
        return createEmptyPersistedChatScopeState();
    }
    const raw = window.localStorage.getItem(buildChatScopeStorageKey(scopeId));
    if (!raw) {
        return createEmptyPersistedChatScopeState();
    }
    try {
        const parsed = JSON.parse(raw);
        return {
            version: 1,
            nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
            mutedUserIds: Array.isArray(parsed.mutedUserIds) ? parsed.mutedUserIds.filter((value) => typeof value === "string") : [],
            inboxReadIds: Array.isArray(parsed.inboxReadIds) ? parsed.inboxReadIds.filter((value) => typeof value === "string") : [],
            deletedMessageIds: Array.isArray(parsed.deletedMessageIds) ? parsed.deletedMessageIds.filter((value) => typeof value === "string") : [],
            messages: Array.isArray(parsed.messages) ? parsed.messages.filter(isStoredMessage) : [],
            threads: normalizeStoredThreads(parsed.threads),
        };
    }
    catch {
        return createEmptyPersistedChatScopeState();
    }
}
export function writePersistedChatScopeState(scopeId, state) {
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
    }));
}
export function readBrowserChatActionSupport() {
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
    options;
    features;
    preferredSecurityModes;
    protocolOffers;
    maxManifestAgeMs;
    sleep;
    now;
    lastServerId = null;
    currentSession = null;
    reconnectAttempts = 0;
    healPromise = null;
    connectionListeners = new Set();
    connectionSnapshot;
    constructor(options) {
        this.options = options;
        this.features = options.features ?? FEATURES;
        this.preferredSecurityModes = options.preferredSecurityModes ?? DEFAULT_PREFERRED_SECURITY_MODES;
        this.protocolOffers = options.protocolOffers ?? DEFAULT_PROTOCOL_OFFERS;
        this.maxManifestAgeMs = Math.max(0, options.maxManifestAgeMs ?? 5 * 60_000);
        this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
        this.now = options.now ?? (() => Date.now());
        this.connectionSnapshot = this.buildConnectionSnapshot("disconnected", "Not connected to a xorein server.");
    }
    snapshot() {
        return cloneSession(this.currentSession);
    }
    connection() {
        return cloneConnectionSnapshot(this.connectionSnapshot);
    }
    subscribe(listener) {
        this.connectionListeners.add(listener);
        listener(this.connection());
        return () => {
            this.connectionListeners.delete(listener);
        };
    }
    async connectByLink(rawLink) {
        const { serverId } = parseJoinDeepLink(rawLink);
        return this.establishSession(serverId, (request) => this.options.transport.joinByLink
            ? this.options.transport.joinByLink(rawLink, request)
            : this.options.transport.performHandshake(request));
    }
    async connectToServer(serverId) {
        return this.establishSession(serverId, (request) => this.options.transport.performHandshake(request));
    }
    async establishSession(serverId, resolveHandshake) {
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
            const capabilityNegotiation = negotiateCapabilities(localCapabilities, response.advertisedCapabilities ?? [], response.requiredCapabilities ?? []);
            if (capabilityNegotiation.missingRequired.length > 0) {
                throw new Error(`required capabilities unsupported: ${capabilityNegotiation.missingRequired.join(", ")}`);
            }
            const securityResult = negotiateConversationSecurityMode(this.preferredSecurityModes, response.offeredSecurityModes ?? []);
            if (securityResult.reason !== "matched") {
                throw new Error(`security mode negotiation failed: ${securityResult.reason}`);
            }
            let acceptedProtocol = null;
            if (response.acceptedProtocol) {
                acceptedProtocol = parseProtocolId(response.acceptedProtocol);
                if (!protocolOffers.includes(response.acceptedProtocol)) {
                    throw new Error("accepted protocol was not offered locally");
                }
            }
            const featureContract = buildFeatureProtocolContract(capabilityNegotiation, this.features);
            const attemptCount = this.reconnectAttempts;
            const session = {
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
            return cloneSession(session);
        }
        catch (error) {
            this.currentSession = null;
            this.updateConnection(mapConnectionFailure(error), error instanceof Error ? error.message : "connection failed");
            await safeDisconnect(this.options.transport, "handshake-failed");
            throw error;
        }
    }
    async selfHeal() {
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
                return await this.connectToServer(this.lastServerId);
            }
            finally {
                this.healPromise = null;
            }
        })();
        return this.healPromise;
    }
    async disconnect(reason = "client-disconnect") {
        this.currentSession = null;
        this.healPromise = null;
        this.reconnectAttempts = 0;
        this.updateConnection("disconnected", reason === "client-disconnect" ? "Disconnected from xorein." : reason);
        await safeDisconnect(this.options.transport, reason);
    }
    buildConnectionSnapshot(state, detail) {
        return {
            state,
            detail,
            serverId: this.lastServerId,
            reconnectAttempts: this.reconnectAttempts,
            updatedAtMs: this.now(),
            session: cloneSession(this.currentSession),
        };
    }
    updateConnection(state, detail) {
        this.connectionSnapshot = this.buildConnectionSnapshot(state, detail);
        for (const listener of this.connectionListeners) {
            listener(this.connection());
        }
    }
}
function handshakeResponseFromServerRecord(server, request) {
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
function normalizeManifestCapabilities(capabilities) {
    const normalized = new Set();
    for (const rawCapability of capabilities) {
        const capability = rawCapability.trim();
        if (!capability) {
            continue;
        }
        if (!validFeatureFlagName(capability)) {
            throw new Error(`invalid manifest capability: ${capability}`);
        }
        normalized.add(capability);
    }
    return [...normalized].sort();
}
function selectAcceptedProtocol(protocolOffers, advertisedCapabilities) {
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
async function safeDisconnect(transport, reason) {
    try {
        await transport.disconnect(reason);
    }
    catch {
        // Transport shutdown should not prevent recovery or caller cleanup.
    }
}
function cloneCapabilityNegotiation(negotiation) {
    return {
        accepted: [...negotiation.accepted],
        ignoredRemote: [...negotiation.ignoredRemote],
        missingRequired: [...negotiation.missingRequired],
        feedback: negotiation.feedback,
    };
}
function cloneFeatureContract(contract) {
    return {
        localSupported: [...contract.localSupported],
        blockedProtocolFeatures: [...contract.blockedProtocolFeatures],
        localOnlyEnabledFeatures: [...contract.localOnlyEnabledFeatures],
    };
}
function cloneSession(session) {
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
function cloneConnectionSnapshot(snapshot) {
    return {
        ...snapshot,
        session: cloneSession(snapshot.session),
    };
}
function mapConnectionFailure(error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("server not found in local runtime") || message.includes("no previous server")) {
        return "no-peer";
    }
    if (message.includes("relay") || message.includes("delivery failed on direct and relay paths")) {
        return "no-relay";
    }
    return "disconnected";
}
function buildChatScopeStorageKey(scopeId) {
    return `${CHAT_SCOPE_STATE_STORAGE_PREFIX}${scopeId.trim()}`;
}
function createEmptyPersistedChatScopeState() {
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
function normalizeStoredThreads(value) {
    if (!value || typeof value !== "object") {
        return {};
    }
    const entries = Object.entries(value);
    return Object.fromEntries(entries.map(([key, threadMessages]) => [
        key,
        Array.isArray(threadMessages) ? threadMessages.filter(isStoredMessage) : [],
    ]));
}
function isStoredMessage(value) {
    if (!value || typeof value !== "object") {
        return false;
    }
    const candidate = value;
    return typeof candidate.id === "string"
        && typeof candidate.userId === "string"
        && typeof candidate.content === "string"
        && typeof candidate.timestamp === "string";
}
function readBrowserRuntimeSnapshot() {
    const windowRecord = window;
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
function readBrowserControlToken() {
    const windowRecord = window;
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
function parseBrowserJson(value) {
    if (!value) {
        return null;
    }
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    }
    if (typeof value === "object") {
        return value;
    }
    return null;
}
