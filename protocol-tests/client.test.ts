import test from "node:test";
import assert from "node:assert/strict";

import { XoreinClient, type XoreinHandshakeRequest, type XoreinHandshakeResponse, type XoreinTransport } from "../src/protocol/client.js";
import { signManifest } from "../src/protocol/manifest.js";

class MockTransport implements XoreinTransport {
  connectCalls = 0;
  disconnectCalls = 0;
  handshakeCalls = 0;
  requests: XoreinHandshakeRequest[] = [];
  responseFactory: (request: XoreinHandshakeRequest) => Promise<XoreinHandshakeResponse>;

  constructor(responseFactory: (request: XoreinHandshakeRequest) => Promise<XoreinHandshakeResponse>) {
    this.responseFactory = responseFactory;
  }

  async connect(): Promise<void> {
    this.connectCalls += 1;
  }

  async disconnect(): Promise<void> {
    this.disconnectCalls += 1;
  }

  async performHandshake(request: XoreinHandshakeRequest): Promise<XoreinHandshakeResponse> {
    this.handshakeCalls += 1;
    this.requests.push({
      ...request,
      localCapabilities: [...request.localCapabilities],
      preferredSecurityModes: [...request.preferredSecurityModes],
      protocolOffers: [...request.protocolOffers],
    });
    return this.responseFactory(request);
  }
}

const BASE_MANIFEST = {
  serverId: "test-server",
  version: 1,
  description: "preview",
  updatedAt: "2026-01-01T00:00:00Z",
  capabilities: { chat: false, voice: true },
};

test("XoreinClient connects, validates the manifest, and derives per-session feature gating", async () => {
  const manifest = await signManifest(BASE_MANIFEST, "remote-signer");
  const transport = new MockTransport(async () => ({
    manifest,
    advertisedCapabilities: ["cap.dm", "cap.voice"],
    requiredCapabilities: [],
    offeredSecurityModes: ["tree", "clear"],
    acceptedProtocol: "/aether/dm/0.2",
  }));

  const client = new XoreinClient({
    transport,
    features: {
      directMessages: true,
      voiceJoinLeave: true,
      serverNavigation: true,
    },
    now: () => Date.parse("2026-01-01T00:01:00Z"),
  });

  const session = await client.connectByLink("aether://join/test-server");

  assert.equal(transport.connectCalls, 1);
  assert.equal(transport.handshakeCalls, 1);
  assert.deepEqual(transport.requests[0].localCapabilities, ["cap.dm", "cap.voice"]);
  assert.equal(session.securityMode, "tree");
  assert.equal(session.acceptedProtocol?.family, "dm");
  assert.deepEqual(session.featureContract.blockedProtocolFeatures, []);
  assert.deepEqual(session.featureContract.localOnlyEnabledFeatures, ["serverNavigation"]);

  session.manifest.description = "tampered locally";
  assert.equal(client.snapshot()?.manifest.description, "preview");
});

test("XoreinClient rejects handshakes that require unsupported frontend capabilities", async () => {
  const manifest = await signManifest(BASE_MANIFEST, "remote-signer");
  const transport = new MockTransport(async () => ({
    manifest,
    advertisedCapabilities: ["cap.dm"],
    requiredCapabilities: ["cap.voice"],
    offeredSecurityModes: ["tree", "clear"],
    acceptedProtocol: "/aether/dm/0.2",
  }));

  const client = new XoreinClient({
    transport,
    features: { directMessages: true },
    now: () => Date.parse("2026-01-01T00:01:00Z"),
  });

  await assert.rejects(
    () => client.connectToServer("test-server"),
    /required capabilities unsupported: cap.voice/,
  );
});

test("XoreinClient selfHeal coalesces concurrent reconnects and uses deterministic backoff", async () => {
  const manifest = await signManifest(BASE_MANIFEST, "remote-signer");
  const transport = new MockTransport(async () => ({
    manifest,
    advertisedCapabilities: ["cap.voice"],
    requiredCapabilities: [],
    offeredSecurityModes: ["tree", "clear"],
    acceptedProtocol: "/aether/voice/0.1",
  }));

  const sleeps: number[] = [];
  const client = new XoreinClient({
    transport,
    features: { voiceJoinLeave: true },
    now: () => Date.parse("2026-01-01T00:01:00Z"),
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  });

  await client.connectToServer("test-server");
  await client.disconnect();

  const [first, second] = await Promise.all([client.selfHeal(), client.selfHeal()]);

  assert.equal(transport.connectCalls, 2);
  assert.equal(transport.handshakeCalls, 2);
  assert.deepEqual(sleeps, [250]);
  assert.equal(first.serverId, "test-server");
  assert.equal(second.serverId, "test-server");
  assert.equal(first.reconnectAttempts, 1);
  assert.equal(second.reconnectAttempts, 1);
});
