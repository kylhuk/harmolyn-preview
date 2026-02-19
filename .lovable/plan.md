

## Comprehensive Feature Implementation Plan with Feature Flags

### Feature Flag System

A centralized configuration file (`src/config/featureFlags.ts`) will define every feature as a boolean flag. Components check these flags before rendering UI. Features already working stay `true`; new features start as `false` and get flipped to `true` when the backend is ready.

```text
src/config/featureFlags.ts
  - Single object: FEATURES = { ... }
  - Grouped by category
  - Each flag: featureName: true | false
  - Helper hook: useFeature(name) => boolean
```

A `FeatureGate` wrapper component conditionally renders children:
```text
<FeatureGate feature="threads">
  <ThreadPanel />
</FeatureGate>
```

---

### Feature Audit: What Exists vs What Needs Building

#### Already Implemented (keep as-is, flag = `true`)

| ID | Feature | Where |
|----|---------|-------|
| 1 | Multi-pane workspace layout | Layout.tsx |
| 2 | Persistent server navigation | ServerRail.tsx |
| 4 | Context menus + hover toolbars | ChatArea.tsx (right-click, hover actions) |
| 10 | User status + custom status | StatusPicker.tsx, data.ts |
| 11 | Global user profile customization | SettingsScreen.tsx |
| 13 | Friends list | FriendsPanel.tsx |
| 17 | Channel types: text and voice | ChannelRail.tsx |
| 18 | Channel categories | ChannelRail.tsx (categories render) |
| 28 | Server Discovery | ServerExplorer.tsx |
| 30 | Message composer with Markdown | ChatArea.tsx + markdown.tsx |
| 32 | Message reactions | ChatArea.tsx (reaction chips) |
| 34 | Replies (inline threaded reference) | ChatArea.tsx (replyToId) |
| 36 | Pinned messages per channel | ChatArea.tsx (pin toggle, pins panel) |
| 38 | Editing messages | ChatArea.tsx (inline edit) |
| 40 | File and media uploads | ChatArea.tsx (file input) |
| 44 | Voice channels (join/leave) | ChannelRail.tsx (voice join UI) |
| 54 | Theme selection | ChatArea.tsx (theme settings) |
| 59 | Roles and permission management | ServerSettingsScreen.tsx (roles section) |
| 61 | Members management page | ServerSettingsScreen.tsx (members section) |
| 65 | DMs and Group DMs | Layout.tsx + data.ts (DIRECT_MESSAGES) |
| 68 | Server settings entry points | Layout.tsx (server-settings viewMode) |
| 74 | Emoji picker | EmojiPicker.tsx |
| 98 | Tab-based mobile navigation | Layout.tsx (BottomDock) |
| P2 | Typing indicators | TypingIndicator.tsx |
| P4 | Link embeds and previews | MediaEmbed.tsx |
| P12 | Member list panel | MemberSidebar.tsx |
| P13 | User popout | ChatArea.tsx (UserPopup) |

#### New Features to Build (flag = `false` initially)

Organized into implementation phases by complexity:

---

### Phase 1: Quick Wins (UI-only, no backend needed)

| ID | Feature | Implementation | File(s) |
|----|---------|---------------|---------|
| 3 | Quick Switcher (Ctrl+K) | New modal: search across servers/channels/DMs with typeahead. Keyboard listener on Layout.tsx | `src/components/QuickSwitcher.tsx`, Layout.tsx |
| 31 | Spoiler formatting | Extend markdown.tsx to parse `\|\|spoiler\|\|` syntax; render as blurred/clickable span | markdown.tsx, ChatArea.tsx |
| 35 | Message forwarding | Forward dialog modal: pick up to 5 destinations, optional note. Action button in hover toolbar | `src/components/ForwardMessageModal.tsx`, ChatArea.tsx |
| 37 | Polls in chat | Poll creation UI in composer; poll renderer in message list | `src/components/PollCreator.tsx`, `src/components/PollMessage.tsx`, ChatArea.tsx |
| 42 | Threads | Thread panel (side panel) launched from message action; thread view with its own message list | `src/components/ThreadPanel.tsx`, ChatArea.tsx |
| 67 | Server folders | Drag-to-group servers in ServerRail; folder rendering with expand/collapse | ServerRail.tsx, `src/types.ts` (add ServerFolder type) |
| 76 | Message links (copy link) | Add "Copy Link" to context menu; generate permalink | ChatArea.tsx |
| 89 | Slash commands (/) | Slash command suggestions popup when typing `/` (already partially wired) | ChatArea.tsx (expand existing) |
| P5 | Image/video viewer (lightbox) | Full-screen modal for media with zoom/nav | `src/components/MediaLightbox.tsx` |
| P6 | Message deletion UX | Confirmation dialog before delete; real-time removal animation | `src/components/ConfirmDeleteModal.tsx`, ChatArea.tsx |
| P7 | Read/unread divider + Jump to Present | Unread divider line in message list; floating "Jump to Present" button when scrolled up | ChatArea.tsx |
| P8 | Channel topic/header controls | Show channel topic in header; edit topic action | ChatArea.tsx |

---

### Phase 2: Medium Complexity (new screens/panels)

| ID | Feature | Implementation | File(s) |
|----|---------|---------------|---------|
| 5-7 | Login / Register / QR login | Auth screens (login form, register form, QR code panel). Behind feature flag, currently bypassed | `src/components/auth/LoginScreen.tsx`, `src/components/auth/RegisterScreen.tsx`, `src/components/auth/QRLogin.tsx` |
| 8 | Multi-factor authentication | MFA setup UI in Settings (TOTP, passkeys) | SettingsScreen.tsx (new section) |
| 9 | Account switching | Account switcher dropdown in user footer | `src/components/AccountSwitcher.tsx`, ChannelRail.tsx |
| 12 | Per-server profile | Server-specific nickname/avatar editor in user popup or server settings | `src/components/ServerProfileEditor.tsx` |
| 14 | Message Requests | Message Requests tab in Home/DMs area with accept/ignore actions | FriendsPanel.tsx (new tab), `src/components/MessageRequests.tsx` |
| 15-16 | Join server via invite / Vanity URLs | Join Server modal (paste invite link); vanity URL management in server settings | `src/components/JoinServerModal.tsx`, ServerSettingsScreen.tsx |
| 19 | Private channels | Lock icon on channels; permission override UI in channel settings | ChannelRail.tsx, `src/components/ChannelSettingsModal.tsx` |
| 22 | Forum channels | New channel type with post-based UI: title, tags, sorting | `src/components/ForumChannel.tsx`, `src/components/ForumPost.tsx` |
| 25-26 | Community Onboarding + Server Guide | Onboarding wizard for new members; Server Guide with welcome tasks | `src/components/onboarding/OnboardingWizard.tsx`, `src/components/onboarding/ServerGuide.tsx` |
| 39 | Slowmode | Cooldown timer in composer; channel setting toggle | ChatArea.tsx, `src/components/ChannelSettingsModal.tsx` |
| 41 | Voice messages | Record button in composer; voice message playback component | `src/components/VoiceMessage.tsx`, ChatArea.tsx |
| 45 | Go Live / Screen share | Screen share button in voice controls; stream preview | `src/components/voice/ScreenSharePanel.tsx` |
| 49 | In-channel search with filters | Expanded search panel with filter chips (author, date, has:file, etc.) | `src/components/SearchPanel.tsx` |
| 50 | Inbox (mentions aggregation) | Inbox panel accessible from top bar; aggregates @mentions | `src/components/InboxPanel.tsx` |
| 51 | Mention suggestions (@typeahead) | Autocomplete dropdown when typing `@` in composer | `src/components/MentionAutocomplete.tsx`, ChatArea.tsx |
| 52 | Notification settings (global/server/channel) | Settings sections for notification preferences | SettingsScreen.tsx, `src/components/NotificationSettings.tsx` |
| 55 | Accessibility settings | Settings section with high contrast toggle, reduced motion, font size | SettingsScreen.tsx (new section) |
| 57 | Keyboard shortcuts + custom keybinds | Shortcuts overlay (Ctrl+/); keybind settings page | `src/components/KeyboardShortcutsOverlay.tsx`, SettingsScreen.tsx |
| 80 | Scheduled events | Events list in server; create event modal | `src/components/events/EventsList.tsx`, `src/components/events/CreateEventModal.tsx` |
| P9 | Voice controls bar | Persistent voice controls (mute/deafen/disconnect) at bottom of channel rail | ChannelRail.tsx (expand voice footer), `src/components/voice/VoiceControlBar.tsx` |
| P14 | Channel pins view | Dedicated pins side panel with jump-to-message | `src/components/PinsPanel.tsx` |
| P15 | Audit log UI | Server Settings > Audit Log with filtering | ServerSettingsScreen.tsx (new section) |
| P17 | Desktop notifications + in-app banners | Toast notification system for mentions/messages | `src/components/NotificationToast.tsx` |

---

### Phase 3: Complex / Backend-Dependent

| ID | Feature | Implementation | File(s) |
|----|---------|---------------|---------|
| 20-21 | Announcement channels + Follow | Channel type: announcement; Follow/Publish actions; followed channels management | ChannelRail.tsx, ServerSettingsScreen.tsx |
| 23 | Stage channels | Channel type: stage; speaker/listener roles; stage controls | `src/components/voice/StageChannel.tsx` |
| 24 | Server boosting | Boost UI, perk display, server cosmetics | `src/components/ServerBoost.tsx` |
| 27 | Server Member Applications | Application form builder and reviewer | `src/components/ServerApplications.tsx` |
| 33 | Super Reactions | Enhanced reaction animations (monetization gated) | ChatArea.tsx |
| 43 | Text chat inside voice channels | Embedded text chat in voice channel view | `src/components/voice/VoiceTextChat.tsx` |
| 46 | Soundboard | Sound picker in voice controls; per-server sound management | `src/components/voice/Soundboard.tsx` |
| 47 | Activities (embedded games/apps) | Activity launcher in voice; iframe-based activity hosting | `src/components/voice/ActivityLauncher.tsx` |
| 48 | DM calls (voice/video/screenshare) | Call controls in DM header; video/screenshare UI | `src/components/voice/DMCallControls.tsx` |
| 53 | Role mention suppression | Server notification setting for @everyone/@here suppression | NotificationSettings.tsx |
| 63 | AutoMod configuration | AutoMod rules editor in server settings | ServerSettingsScreen.tsx (new section) |
| 62 | Time Out moderation action | Timeout action in user context menu/profile | ChatArea.tsx, MemberSidebar.tsx |
| 91-94 | Monetization (Nitro, Shop, Quests, Server Tags) | Premium surfaces, shop tab, quest system | `src/components/monetization/` directory |

---

### Technical Implementation Details

#### 1. Feature Flags File

New file: `src/config/featureFlags.ts`

```text
Structure:
  FEATURES object with categories:
    // App Shell
    quickSwitcher: false,
    serverFolders: false,
    contextMenus: true,  // already works
    
    // Auth
    loginScreen: false,
    registerScreen: false,
    qrLogin: false,
    mfa: false,
    accountSwitching: false,
    
    // Messaging
    spoilerText: false,
    messageForwarding: false,
    polls: false,
    threads: false,
    voiceMessages: false,
    slashCommands: false,  // partially exists
    messageLinks: false,
    superReactions: false,
    slowmode: false,
    jumpToPresent: false,
    unreadDivider: false,
    imageLightbox: false,
    deleteConfirmation: false,
    mentionAutocomplete: false,
    
    // Voice & Video
    screenShare: false,
    soundboard: false,
    activities: false,
    dmCalls: false,
    stageChannels: false,
    voiceTextChat: false,
    voiceControlBar: false,
    
    // Channels
    forumChannels: false,
    announcementChannels: false,
    privateChannels: false,
    channelFollowing: false,
    scheduledEvents: false,
    channelCreationFlow: false,
    
    // Server
    serverBoost: false,
    serverApplications: false,
    joinViaInvite: false,
    vanityUrls: false,
    serverProfile: false,
    
    // Community
    communityOnboarding: false,
    serverGuide: false,
    browseChannels: false,
    discoverTab: true,  // ServerExplorer exists
    
    // Moderation
    autoMod: false,
    auditLog: false,
    timeout: false,
    roleHierarchyDragDrop: false,
    duplicateChannel: false,
    
    // Search & Navigation
    advancedSearch: false,
    inbox: false,
    searchShortcuts: false,
    channelPinsView: false,
    
    // Settings
    accessibilitySettings: false,
    keyboardShortcuts: false,
    notificationSettings: false,
    
    // Notifications
    desktopNotifications: false,
    muteChannel: false,
    roleMentionSuppression: false,
    
    // Monetization
    nitro: false,
    shop: false,
    quests: false,
    serverTags: false,
    
    // Already implemented (true)
    multiPaneLayout: true,
    serverNavigation: true,
    userStatus: true,
    profileCustomization: true,
    friendsList: true,
    textVoiceChannels: true,
    channelCategories: true,
    serverDiscovery: true,
    markdownComposer: true,
    messageReactions: true,
    messageReplies: true,
    pinnedMessages: true,
    messageEditing: true,
    fileUploads: true,
    voiceJoinLeave: true,
    themeSelection: true,
    rolesManagement: true,
    membersManagement: true,
    directMessages: true,
    serverSettings: true,
    emojiPicker: true,
    mobileBottomNav: true,
    typingIndicators: true,
    linkEmbeds: true,
    memberListPanel: true,
    userPopout: true,
```

#### 2. FeatureGate Component

New file: `src/components/FeatureGate.tsx`

A simple wrapper:
- Takes a `feature` string prop
- Looks up `FEATURES[feature]`
- If `true`, renders `children`
- If `false`, renders nothing (or optional `fallback` prop)

#### 3. useFeature Hook

New file: `src/hooks/useFeature.ts`

```text
useFeature(featureName: string): boolean
  - Returns FEATURES[featureName]
  - Components use this for conditional logic (not just rendering)
  - Example: hiding a button, disabling an action
```

#### 4. Integration Pattern

Existing components wrap new UI sections with FeatureGate:

```text
// In ChatArea.tsx header:
<FeatureGate feature="inbox">
  <button onClick={openInbox}><InboxIcon /></button>
</FeatureGate>

// In ServerRail.tsx:
const groupedServers = useFeature('serverFolders') 
  ? groupIntoFolders(servers) 
  : servers;

// In Layout.tsx:
<FeatureGate feature="loginScreen">
  {!isAuthenticated && <LoginScreen />}
</FeatureGate>
```

#### 5. New Files Summary

```text
src/config/featureFlags.ts          -- Flag definitions
src/components/FeatureGate.tsx       -- Wrapper component
src/hooks/useFeature.ts             -- Hook

-- Phase 1 components (UI-only):
src/components/QuickSwitcher.tsx
src/components/ForwardMessageModal.tsx
src/components/PollCreator.tsx
src/components/PollMessage.tsx
src/components/ThreadPanel.tsx
src/components/MediaLightbox.tsx
src/components/ConfirmDeleteModal.tsx

-- Phase 2 components:
src/components/auth/LoginScreen.tsx
src/components/auth/RegisterScreen.tsx
src/components/auth/QRLogin.tsx
src/components/AccountSwitcher.tsx
src/components/ServerProfileEditor.tsx
src/components/MessageRequests.tsx
src/components/JoinServerModal.tsx
src/components/ChannelSettingsModal.tsx
src/components/ForumChannel.tsx
src/components/ForumPost.tsx
src/components/onboarding/OnboardingWizard.tsx
src/components/onboarding/ServerGuide.tsx
src/components/VoiceMessage.tsx
src/components/voice/ScreenSharePanel.tsx
src/components/SearchPanel.tsx
src/components/InboxPanel.tsx
src/components/MentionAutocomplete.tsx
src/components/NotificationSettings.tsx
src/components/KeyboardShortcutsOverlay.tsx
src/components/events/EventsList.tsx
src/components/events/CreateEventModal.tsx
src/components/voice/VoiceControlBar.tsx
src/components/PinsPanel.tsx
src/components/NotificationToast.tsx

-- Phase 3 components:
src/components/voice/StageChannel.tsx
src/components/voice/Soundboard.tsx
src/components/voice/ActivityLauncher.tsx
src/components/voice/DMCallControls.tsx
src/components/voice/VoiceTextChat.tsx
src/components/ServerBoost.tsx
src/components/ServerApplications.tsx
src/components/monetization/ (multiple files)
```

#### 6. Modified Existing Files

Every existing component that surfaces new features gets `FeatureGate` wraps or `useFeature` checks added:

- **Layout.tsx**: Quick Switcher keyboard listener, auth gate, inbox button
- **ChatArea.tsx**: Spoiler rendering, forward action, polls, threads, slash commands expansion, lightbox, delete confirmation, mention autocomplete, unread divider, jump-to-present, voice messages
- **ServerRail.tsx**: Server folders
- **ChannelRail.tsx**: Private channel indicators, forum/announcement/stage channel types, channel creation flow
- **MemberSidebar.tsx**: Timeout action
- **SettingsScreen.tsx**: MFA, accessibility, notification, keybind sections
- **ServerSettingsScreen.tsx**: Audit log, AutoMod, channel following, vanity URLs sections
- **markdown.tsx**: Spoiler syntax parsing

### Recommended Build Order

1. Feature flag system (featureFlags.ts, FeatureGate, useFeature) -- foundation for everything
2. Phase 1 quick wins -- visible progress, no backend dependency
3. Phase 2 medium features -- one category at a time (auth, search, voice, etc.)
4. Phase 3 complex features -- as backend APIs become available, flip flags to `true`

### Key Principle

Nothing gets deleted. Every existing feature stays. New features are additive and gated behind flags. Flipping a flag from `false` to `true` in `featureFlags.ts` instantly enables the feature across the entire app.

