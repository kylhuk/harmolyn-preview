<!-- Replace YOUR_ORG/YOUR_REPO and links. Keep badges that you actually support. -->

<p align="center">
  <img src="assets/harmolyn-banner.png" alt="Harmolyn" width="900" />
</p>

<h1 align="center">Harmolyn</h1>

<p align="center">
  Private-by-default messaging and communities, powered by the Xorein protocol.
</p>

<p align="center">
  <a href="https://github.com/YOUR_ORG/harmolyn/releases"><img alt="Release" src="https://img.shields.io/github/v/release/YOUR_ORG/harmolyn?display_name=tag&sort=semver"></a>
  <a href="https://github.com/YOUR_ORG/harmolyn/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/YOUR_ORG/harmolyn/total"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/YOUR_ORG/harmolyn"></a>
  <a href="https://github.com/YOUR_ORG/harmolyn/actions"><img alt="Build" src="https://img.shields.io/github/actions/workflow/status/YOUR_ORG/harmolyn/ci.yml"></a>
  <a href="https://github.com/YOUR_ORG/harmolyn/security/policy"><img alt="Security Policy" src="https://img.shields.io/badge/security-policy-blue"></a>
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/YOUR_ORG/harmolyn"><img alt="OpenSSF Scorecard" src="https://img.shields.io/ossf-scorecard/github.com/YOUR_ORG/harmolyn?label=OpenSSF%20Scorecard"></a>
</p>

<p align="center">
  <img alt="E2EE" src="https://img.shields.io/badge/E2EE-visible%20in%20UI-success">
  <img alt="Protocol" src="https://img.shields.io/badge/protocol-Xorein-informational">
  <img alt="Advanced Users" src="https://img.shields.io/badge/audience-advanced%20end%20users-9cf">
</p>

---

## What Harmolyn is

Harmolyn is a chat client for people who want modern communities (servers, channels, roles, media) without giving up end-to-end encryption and explicit security guarantees.

Harmolyn is built on **Xorein**, a peer-to-peer protocol designed for secure messaging, group communication, and optional user-run infrastructure.

## What you get

- **End-to-end encryption (E2EE)** where supported, with security shown **per chat/channel**
- **Verification** (QR / safety number / fingerprints) to prevent impersonation
- **Servers & channels** with community-grade features (roles, emojis, channels, media)
- **Optional nodes** to improve availability and routing (without changing who can read content)
- **Local-first UX**: your device is the source of truth for your keys

## What’s intentionally different

Harmolyn trades a few “normal app conveniences” for stronger security:

- **Search is local-first** (no server-side indexing of private content)
- **History portability is explicit** (new devices don’t automatically have old content unless you enable encrypted sync/export)
- **No silent downgrade**: if a medium isn’t E2EE, the UI shows it

## Install

Download the latest release from:
- **Releases:** https://github.com/YOUR_ORG/harmolyn/releases

Recommended: verify the download (signatures/checksums) if you care about supply-chain integrity.

## First-run checklist (do this)

1. **Create identity** (keys are generated locally)
2. **Back up your recovery key** (no recovery = no restore)
3. **Verify contacts** you care about (QR / safety number)
4. Check your **Security Indicator** in each chat/channel

## Security indicator (how to read it)

In every conversation, Harmolyn shows a one-tap security summary. Typical fields:

- **Encryption:** E2EE on/off (and the negotiated suite)
- **Forward secrecy:** on/off
- **Verification:** verified/unverified
- **Transport:** direct / relayed / offline-queued (transport does not imply readability)
- **Notes:** what metadata may still leak (IP/timing/membership)

If something is not end-to-end encrypted, Harmolyn should show that clearly.

## Limits and expectations

E2EE protects message content. It does not magically remove all metadata.

Depending on how you use Harmolyn, some or all of these can still be visible to network participants:
- your IP address (unless you use a privacy network)
- timing/volume of messages
- which servers/channels you join (depending on your design)
- who is online

Also note:
- **Push notifications** may leak metadata to OS vendors unless you use a “sealed notification” design or disable them.
- **Link previews** may contact third-party servers unless disabled.

## Running your own node (optional)

If you run a node, you typically get:
- better availability for communities you care about
- improved routing/relaying
- optional encrypted storage replication (depending on Xorein configuration)

See: **Xorein node docs** in the Xorein repository.

## Support and security issues

- User help: `docs/` (or your website)
- Vulnerabilities: see `SECURITY.md`
- If you are handling serious security reports, publish a signed security policy and an embargo process.

## License

See `LICENSE`.
