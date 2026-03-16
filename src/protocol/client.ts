import { FEATURES } from "../config/featureFlags.js";
import {
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

  constructor(private readonly options: XoreinClientOptions) {
    this.features = options.features ?? FEATURES;
    this.preferredSecurityModes = options.preferredSecurityModes ?? DEFAULT_PREFERRED_SECURITY_MODES;
    this.protocolOffers = options.protocolOffers ?? DEFAULT_PROTOCOL_OFFERS;
    this.maxManifestAgeMs = Math.max(0, options.maxManifestAgeMs ?? 5 * 60_000);
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.now = options.now ?? (() => Date.now());
  }

  snapshot(): XoreinSession | null {
    return cloneSession(this.currentSession);
  }

  async connectByLink(rawLink: string): Promise<XoreinSession> {
    const { serverId } = parseJoinDeepLink(rawLink);
    return this.connectToServer(serverId);
  }

  async connectToServer(serverId: string): Promise<XoreinSession> {
    const localCapabilities = deriveLocalCapabilities(this.features);
    const protocolOffers = this.protocolOffers.map((offer) => stringifyProtocolId(offer));
    this.lastServerId = serverId;

    await this.options.transport.connect();

    try {
      const response = await this.options.transport.performHandshake({
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
      return cloneSession(session)!;
    } catch (error) {
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
    await safeDisconnect(this.options.transport, reason);
  }
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
