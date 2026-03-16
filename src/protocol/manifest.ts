export const MANIFEST_VERSION_V1 = 1;

export interface ManifestCapabilities {
  chat: boolean;
  voice: boolean;
}

export interface Manifest {
  serverId: string;
  identity: string;
  version: number;
  description: string;
  updatedAt: string;
  capabilities: ManifestCapabilities;
  signature: string;
}

export type Sha256Digest = (payload: string) => Promise<string>;

export class ManifestValidationError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "ManifestValidationError";
  }
}

export function cloneManifest(manifest: Manifest): Manifest {
  return {
    ...manifest,
    capabilities: { ...manifest.capabilities },
  };
}

export function validateManifestFields(manifest: Manifest | null | undefined): asserts manifest is Manifest {
  if (!manifest) {
    throw new ManifestValidationError("manifest required");
  }
  if (!manifest.serverId.trim()) {
    throw new ManifestValidationError("server id required");
  }
  if (manifest.version < MANIFEST_VERSION_V1) {
    throw new ManifestValidationError("manifest version must be >= 1");
  }
  if (!manifest.updatedAt.trim()) {
    throw new ManifestValidationError("updated_at required");
  }
  if (Number.isNaN(Date.parse(manifest.updatedAt))) {
    throw new ManifestValidationError("updated_at invalid");
  }
}

export function canonicalizeManifest(manifest: Manifest): string {
  validateManifestFields(manifest);
  return JSON.stringify({
    server_id: manifest.serverId.trim(),
    identity: manifest.identity.trim(),
    version: manifest.version,
    description: manifest.description ?? "",
    updated_at: manifest.updatedAt.trim(),
    capabilities: {
      chat: Boolean(manifest.capabilities?.chat),
      voice: Boolean(manifest.capabilities?.voice),
    },
  });
}

export async function signManifest(
  manifest: Omit<Manifest, "identity" | "signature"> & Partial<Pick<Manifest, "identity" | "signature">>,
  identity: string,
  digest?: Sha256Digest,
): Promise<Manifest> {
  const normalizedIdentity = identity.trim();
  if (!normalizedIdentity) {
    throw new ManifestValidationError("identity required for signing");
  }

  const signed: Manifest = {
    serverId: manifest.serverId,
    identity: normalizedIdentity,
    version: manifest.version,
    description: manifest.description ?? "",
    updatedAt: manifest.updatedAt,
    capabilities: {
      chat: Boolean(manifest.capabilities?.chat),
      voice: Boolean(manifest.capabilities?.voice),
    },
    signature: "",
  };

  const serialized = canonicalizeManifest(signed);
  signed.signature = await sha256Hex(`${serialized}${normalizedIdentity}`, digest);
  return signed;
}

export async function validateManifestSignature(
  manifest: Manifest,
  identity: string,
  digest?: Sha256Digest,
): Promise<boolean> {
  const normalizedIdentity = identity.trim();
  if (!normalizedIdentity || !manifest.signature.trim()) {
    return false;
  }
  const serialized = canonicalizeManifest(manifest);
  const expected = await sha256Hex(`${serialized}${normalizedIdentity}`, digest);
  return expected === manifest.signature.trim();
}

export async function validateStoredSignature(manifest: Manifest, digest?: Sha256Digest): Promise<void> {
  validateManifestFields(manifest);
  if (!manifest.identity.trim()) {
    throw new ManifestValidationError("manifest identity required");
  }
  if (!manifest.signature.trim()) {
    throw new ManifestValidationError("manifest signature required");
  }
  if (!(await validateManifestSignature(manifest, manifest.identity, digest))) {
    throw new ManifestValidationError("manifest signature invalid");
  }
}

export function validateManifestFreshness(
  manifest: Manifest,
  reference: Date = new Date(),
  maxAgeMs = 0,
): void {
  validateManifestFields(manifest);
  if (maxAgeMs <= 0) {
    return;
  }
  const referenceMs = reference.getTime();
  const updatedMs = Date.parse(manifest.updatedAt);
  if (referenceMs - updatedMs > maxAgeMs) {
    throw new ManifestValidationError("manifest is stale");
  }
}

export async function sha256Hex(payload: string, digest?: Sha256Digest): Promise<string> {
  if (digest) {
    return digest(payload);
  }
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const bytes = new TextEncoder().encode(payload);
    const hash = await subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  const processLike = typeof globalThis === "object" && globalThis && "process" in globalThis
    ? (globalThis as { process?: { versions?: { node?: string } } }).process
    : undefined;
  if (processLike?.versions?.node) {
    const nodeCrypto = await import("node:crypto");
    return nodeCrypto.createHash("sha256").update(payload).digest("hex");
  }

  throw new Error("WebCrypto unavailable");
}
