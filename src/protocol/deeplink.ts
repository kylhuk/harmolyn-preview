const SERVER_ID_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;

export class DeeplinkValidationError extends Error {
  constructor(reason: string) {
    super(`deeplink validation: ${reason}`);
    this.name = "DeeplinkValidationError";
  }
}

export interface DeepLink {
  serverId: string;
}

export function parseJoinDeepLink(raw: string): DeepLink {
  if (!raw) {
    throw new DeeplinkValidationError("empty deeplink");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch (error) {
    throw new Error(`invalid deeplink: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (parsed.protocol.toLowerCase() !== "aether:") {
    throw new DeeplinkValidationError("invalid scheme, expected aether");
  }
  if (parsed.hostname.toLowerCase() !== "join") {
    throw new DeeplinkValidationError("deeplink host must be join");
  }
  if (parsed.username || parsed.password) {
    throw new DeeplinkValidationError("userinfo is not allowed");
  }
  if (parsed.search || parsed.hash) {
    throw new DeeplinkValidationError("query parameters and fragments are not allowed");
  }

  const serverId = parsed.pathname.replace(/^\/+|\/+$/g, "");
  if (!serverId) {
    throw new DeeplinkValidationError("missing server identifier");
  }
  if (!SERVER_ID_PATTERN.test(serverId)) {
    throw new DeeplinkValidationError("server identifier invalid (alphanumeric/_/- only, 3-64 chars)");
  }

  return { serverId };
}
