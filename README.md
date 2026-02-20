<div align="center">
  <h1>Harmolyn</h1>
  <p><b>Advanced chat client</b> for the <b>xorein</b> network — Discord-like UX with explicit, verifiable security modes.</p>

  <p>
    <img alt="status" src="https://img.shields.io/badge/status-active-blue" />
    <img alt="protocol" src="https://img.shields.io/badge/protocol-xorein-black" />
    <img alt="security" src="https://img.shields.io/badge/security-explicit%20modes%20%2B%20E2EE-success" />
    <img alt="local-api" src="https://img.shields.io/badge/local%20API-local--only%20transport-important" />
  </p>

  <p>
    <a href="https://github.com/kylhuk/harmolyn/releases"><img alt="release" src="https://img.shields.io/github/v/release/kylhuk/harmolyn?display_name=tag&sort=semver" /></a>
    <a href="https://github.com/kylhuk/harmolyn/releases"><img alt="downloads" src="https://img.shields.io/github/downloads/kylhuk/harmolyn/total" /></a>
    <a href="https://github.com/kylhuk/harmolyn/actions"><img alt="build" src="https://img.shields.io/github/actions/workflow/status/kylhuk/harmolyn/ci.yml" /></a>
    <a href="https://github.com/kylhuk/harmolyn/security"><img alt="security-policy" src="https://img.shields.io/badge/security-policy-blue" /></a>
    <a href="https://opensource.org/licenses/AGPL-3.0"><img alt="license" src="https://img.shields.io/github/license/kylhuk/harmolyn" /></a>
  </p>

  <p>
    <a href="https://github.com/kylhuk/harmolyn/blob/main/README.md#security-model">Security</a> ·
    <a href="https://github.com/kylhuk/harmolyn/blob/main/README.md#what-e2ee-can-and-cannot-do">Limits</a> ·
    <a href="https://github.com/kylhuk/harmolyn/blob/main/README.md#verification">Verification</a> ·
    <a href="https://github.com/kylhuk/xorein">xorein protocol</a>
  </p>
</div>

---

## What Harmolyn is

Harmolyn is the **end-user client** for the **xorein** network stack.

- The UI is Harmolyn.
- The local network engine is xorein (runs on your machine and speaks the P2P protocols).
- Harmolyn connects to xorein using a **local-only transport** (Unix domain socket / Windows named pipe). No remote bind.

If you care about *how* it works, Harmolyn is for you: the UI surfaces real security state (mode, coverage, retention) instead of hiding it behind marketing words.

---

## Key features (end-user, power-user friendly)

- **Explicit security modes per conversation surface** (no silent E2EE “toggle”)
- **E2EE by default where it makes sense**, and **Clear** mode must be labeled
- **Coverage labels** for search and history (Full / Partial / Empty)
- **Retention-aware history** (no pretending history is “infinite”)
- **Runs on a P2P network**; relays help reliability but are not trusted for plaintext
- **Signed + reproducible release artifacts** (verify what you run)

---

## Security model

Every conversation shows a badge in the header:

- **Seal** — 1:1 E2EE (X3DH + Double Ratchet)
- **Tree** — small-group E2EE (MLS)
- **Crowd / Channel** — large-scale E2EE using epoch rotation (revocation happens on rotation)
- **Clear** — readable by infrastructure (explicitly labeled; not default for private spaces)

Tap the badge to see:
- the mode name,
- algorithm family,
- whether history is locked across epochs,
- search coverage label,
- connection type (direct vs relay).

---

## What E2EE can and cannot do

E2EE protects **content** (message bodies, attachments; media where supported). It does not magically remove:
- metadata (who/when/where routing),
- endpoint compromise risk,
- usability trade-offs (e.g., server-side full-text search is not available in strict E2EE chats).

Harmolyn shows this honestly in the UI via labels instead of burying it in docs.

---

## Quick start

1) Install from Releases  
- Download Harmolyn (and the bundled xorein runtime if your build ships them together).

2) First launch  
- Create your identity.
- Make an encrypted backup (recommended immediately).

3) Connect  
- Add a friend via key / QR / deep link, or join a space via invite.

---

## Verification

Harmolyn releases ship with:
- checksums,
- signatures,
- reproducible-build evidence (release manifest).

Verify before running if you’re strict about supply chain.

---

## FAQ (short)

**Can the network read my DMs?**  
No in Seal mode (E2EE). The network can still see unavoidable routing metadata.

**Why does search say “Partial”?**  
Because E2EE prevents plaintext server-side indexing. “Partial” means your device searched only the history it currently has access to.

**Can I run my own relay?**  
Yes — xorein can run in relay/bootstrap modes. Harmolyn stays a client.

---

## License

- Runtime/client code: **AGPL-3.0** (see LICENSE)
- Protocol/spec text: **CC-BY-SA 4.0** (see spec files)
