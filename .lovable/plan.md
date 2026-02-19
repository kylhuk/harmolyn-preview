

# Missing Features: Discord Parity Roadmap

## Overview
This plan covers the major features and screens missing when comparing the current Harmolyn implementation to Discord. The work is organized into prioritized phases, starting with the most impactful user-facing gaps.

---

## Phase 1: Friends List and Home Screen Overhaul

The Home view currently only shows a basic DM list. Discord's Home has a full **Friends** tab with sub-tabs and an **Add Friend** flow.

**What to build:**
- A `FriendsPanel` component replacing the bare DM list when "Home" is selected
- Tab bar with: **Online**, **All**, **Pending**, **Blocked**
- Each tab renders a filtered list of users with status indicators, role badges, and action buttons (Message, Call, Remove)
- "Add Friend" button and input field at the top
- Empty states for each tab

**Files involved:**
- New: `src/components/FriendsPanel.tsx`
- Edit: `src/components/Layout.tsx` (render FriendsPanel in the main area when Home is active and no DM is selected)
- Edit: `src/types.ts` (add `FriendRequest` type, friend status fields)
- Edit: `src/data.ts` (add mock friend requests, blocked users)

---

## Phase 2: Message Reply / Thread System

Currently there is no way to reply to a specific message. Discord shows a referenced message above the reply.

**What to build:**
- A `replyingTo` state in ChatArea tracking which message is being replied to
- A reply preview bar above the input showing the referenced message with a cancel button
- Visual thread indicator on messages that are replies (compact quoted block above the message content)
- Add `replyToId` field to the `Message` type

**Files involved:**
- Edit: `src/types.ts` (add `replyToId?: string` to Message)
- Edit: `src/data.ts` (add some mock replies)
- Edit: `src/components/ChatArea.tsx` (reply bar UI, reply indicator on messages, wire up Reply action buttons that currently do nothing)

---

## Phase 3: Message Editing and Markdown Rendering

Messages can only be deleted, not edited. No markdown formatting is rendered.

**What to build:**
- **Edit mode**: double-click or context menu "Edit" puts the message into an inline edit state with Save/Cancel
- Add `editedAt?: string` field to Message, show "(edited)" indicator
- **Markdown rendering**: bold (`**text**`), italic (`*text*`), inline code (`` `code` ``), code blocks (` ```code``` `), and links rendered as clickable anchors
- A small `renderMarkdown` utility function (no heavy library needed for basic syntax)

**Files involved:**
- Edit: `src/types.ts` (add `editedAt` to Message)
- New: `src/utils/markdown.tsx` (lightweight markdown parser)
- Edit: `src/components/ChatArea.tsx` (edit mode state, render markdown in message content, context menu "Edit" option)

---

## Phase 4: Full Emoji Picker

The current emoji "picker" is just 8 hardcoded emojis in a small popup.

**What to build:**
- A proper `EmojiPicker` component with categorized emoji grid (Smileys, People, Nature, Food, Activities, Travel, Objects, Symbols)
- Search/filter bar at the top
- "Recently Used" section (stored in local state)
- Skin tone selector
- Triggered from the smiley icon in the input bar and from the reaction button on messages

**Files involved:**
- New: `src/components/EmojiPicker.tsx`
- New: `src/data/emojis.ts` (emoji dataset organized by category)
- Edit: `src/components/ChatArea.tsx` (replace inline emoji buttons with EmojiPicker component)

---

## Phase 5: Server Settings and Role Management

The settings button on server headers currently does nothing. Discord has a full server settings panel.

**What to build:**
- `ServerSettingsScreen` (full-screen overlay like the existing `SettingsScreen`)
- Sections: **Overview** (name, icon, description, region), **Roles** (list roles, assign colors/permissions), **Channels** (reorder, create, delete), **Members** (list with role assignment), **Invites** (generate invite link)
- Role badges visible in MemberSidebar and chat usernames

**Files involved:**
- New: `src/components/ServerSettingsScreen.tsx`
- Edit: `src/types.ts` (add `Role` type with permissions, add `roles` to Server)
- Edit: `src/data.ts` (add mock roles)
- Edit: `src/components/Layout.tsx` (state for showing server settings)
- Edit: `src/components/ChannelRail.tsx` (add settings gear to server header)
- Edit: `src/components/MemberSidebar.tsx` (show role badges)

---

## Phase 6: Typing Indicators and Presence

**What to build:**
- "X is typing..." indicator bar above the message input
- Simulated typing from mock users on a timer
- Animated three-dot indicator

**Files involved:**
- New: `src/components/TypingIndicator.tsx`
- Edit: `src/components/ChatArea.tsx` (render typing indicator above input)

---

## Phase 7: Unread Indicators and Notification Badges

Currently, unread counts exist in the data but are not shown on server icons.

**What to build:**
- Red/white badge dot on server icons in ServerRail when any channel has unread messages
- Bold channel names for unread channels (partially exists but inconsistent)
- A notification panel (bell icon dropdown) showing recent activity across servers

**Files involved:**
- Edit: `src/components/ServerRail.tsx` (add unread badge dots)
- Edit: `src/components/ChannelRail.tsx` (bold unread channel names consistently)
- New: `src/components/NotificationPanel.tsx` (dropdown from bell icon)
- Edit: `src/components/ChatArea.tsx` (wire up bell icon to notification panel)

---

## Phase 8: User Status and Custom Status

**What to build:**
- Status picker dropdown (Online, Idle, DND, Invisible) on the user footer in ChannelRail
- Custom status field ("Playing...", "Listening to...", custom text + emoji)
- Show custom status in MemberSidebar and user popups

**Files involved:**
- New: `src/components/StatusPicker.tsx`
- Edit: `src/types.ts` (add `customStatus` to User)
- Edit: `src/components/ChannelRail.tsx` (status picker on avatar click)
- Edit: `src/components/MemberSidebar.tsx` (show custom status)
- Edit: `src/components/ChatArea.tsx` (show in UserPopup)

---

## Phase 9: Image/Media Embeds and Link Previews

**What to build:**
- Image attachments render inline as thumbnails with lightbox on click
- Link detection in messages with unfurled previews (title, description, thumbnail)
- Video embed support (YouTube/etc. as iframe)

**Files involved:**
- New: `src/components/MediaEmbed.tsx`
- New: `src/components/LinkPreview.tsx`
- Edit: `src/components/ChatArea.tsx` (detect links/images in message content, render embed components)
- Edit: `src/types.ts` (expand `attachments` type to include metadata)

---

## Phase 10: Pinned Messages Drawer

The pinned messages popup exists but is minimal. Discord has a proper scrollable drawer.

**What to build:**
- Slide-in panel (right side or modal) showing all pinned messages with full formatting
- Pin/unpin toggle that actually updates message state
- Pin count indicator in the header

**Files involved:**
- Edit: `src/components/ChatArea.tsx` (upgrade pinned messages panel, wire pin action button)

---

## Suggested Implementation Order

1. **Phase 2** (Replies) -- small scope, high impact on chat usability
2. **Phase 3** (Edit + Markdown) -- completes core messaging
3. **Phase 1** (Friends) -- fills the biggest screen gap
4. **Phase 4** (Emoji Picker) -- polishes existing feature
5. **Phase 7** (Unread badges) -- essential navigation feedback
6. **Phase 6** (Typing indicators) -- quick win, adds life
7. **Phase 8** (Status picker) -- user personalization
8. **Phase 5** (Server settings) -- largest scope, do later
9. **Phase 9** (Media embeds) -- rich content
10. **Phase 10** (Pinned drawer) -- polish

Each phase is self-contained and can be implemented in 1-2 prompts. I recommend tackling them one phase at a time.

