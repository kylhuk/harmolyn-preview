import test from "node:test";
import assert from "node:assert/strict";

import { parseJoinDeepLink } from "../src/protocol/deeplink.js";

test("parseJoinDeepLink accepts valid links", () => {
  assert.deepEqual(parseJoinDeepLink("aether://join/server123"), { serverId: "server123" });
  assert.deepEqual(parseJoinDeepLink("AETHER://JOIN/server_123"), { serverId: "server_123" });
});

test("parseJoinDeepLink rejects malformed links", () => {
  assert.throws(() => parseJoinDeepLink(""), /empty deeplink/);
  assert.throws(() => parseJoinDeepLink("http://join/server123"), /invalid scheme/);
  assert.throws(() => parseJoinDeepLink("aether://connect/server123"), /host must be join/);
  assert.throws(() => parseJoinDeepLink("aether://join/"), /missing server identifier/);
  assert.throws(() => parseJoinDeepLink("aether://join/server123?invite=1"), /query parameters and fragments are not allowed/);
  assert.throws(() => parseJoinDeepLink("aether://user@join/server123"), /userinfo is not allowed/);
  assert.throws(() => parseJoinDeepLink("aether://join/!!@@"), /server identifier invalid/);
});
