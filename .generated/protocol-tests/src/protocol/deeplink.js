const SERVER_ID_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;
export class DeeplinkValidationError extends Error {
    constructor(reason) {
        super(`deeplink validation: ${reason}`);
        this.name = "DeeplinkValidationError";
    }
}
export function parseJoinDeepLink(raw) {
    if (!raw) {
        throw new DeeplinkValidationError("empty deeplink");
    }
    let parsed;
    try {
        parsed = new URL(raw);
    }
    catch (error) {
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
    if (parsed.hash) {
        throw new DeeplinkValidationError("fragments are not allowed");
    }
    const serverId = parsed.pathname.replace(/^\/+|\/+$/g, "");
    if (!serverId) {
        throw new DeeplinkValidationError("missing server identifier");
    }
    if (!SERVER_ID_PATTERN.test(serverId)) {
        throw new DeeplinkValidationError("server identifier invalid (alphanumeric/_/- only, 3-64 chars)");
    }
    const invite = parsed.searchParams.get("invite");
    if (parsed.search) {
        const entries = [...parsed.searchParams.entries()];
        if (entries.length !== 1 || entries[0]?.[0] !== "invite" || !invite) {
            throw new DeeplinkValidationError("deeplink requires only a non-empty invite query parameter");
        }
    }
    return { serverId, invite: invite?.trim() || null };
}
