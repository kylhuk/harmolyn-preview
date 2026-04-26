/**
 * Harmolyn Feature Flags
 * 
 * Centralized feature toggle system. Set a flag to `true` to enable the feature UI.
 * Features flagged `false` are hidden but their code remains — flip to `true` when
 * the backend is ready.
 */

export const FEATURES = {
  // ─── App Shell ───────────────────────────────────────────
  multiPaneLayout: true,
  serverNavigation: true,
  mobileBottomNav: true,
  contextMenus: true,
  quickSwitcher: true,
  serverFolders: true,

  // ─── Auth ────────────────────────────────────────────────
  loginScreen: true,
  registerScreen: true,
  qrLogin: true,
  mfa: true,
  accountSwitching: true,

  // ─── User ────────────────────────────────────────────────
  userStatus: true,
  profileCustomization: true,
  serverProfile: true,
  friendsList: true,
  userPopout: true,

  // ─── Messaging ───────────────────────────────────────────
  markdownComposer: true,
  messageReactions: true,
  messageReplies: true,
  pinnedMessages: true,
  messageEditing: true,
  fileUploads: true,
  emojiPicker: true,
  typingIndicators: true,
  linkEmbeds: true,
  spoilerText: true,
  messageForwarding: true,
  polls: true,
  threads: true,
  voiceMessages: true,
  slashCommands: true,
  messageLinks: true,
  superReactions: true,
  slowmode: true,
  jumpToPresent: true,
  unreadDivider: true,
  imageLightbox: true,
  deleteConfirmation: true,
  mentionAutocomplete: true,

  // ─── Voice & Video ───────────────────────────────────────
  voiceJoinLeave: true,
  screenShare: true,
  soundboard: true,
  activities: true,
  dmCalls: true,
  stageChannels: true,
  voiceTextChat: false,
  voiceControlBar: true,

  // ─── Channels ────────────────────────────────────────────
  textVoiceChannels: true,
  channelCategories: true,
  forumChannels: false,
  announcementChannels: false,
  privateChannels: true,
  channelFollowing: false,
  scheduledEvents: false,
  channelCreationFlow: true,
  channelPinsView: true,

  // ─── Server ──────────────────────────────────────────────
  serverSettings: true,
  serverDiscovery: false,
  rolesManagement: false,
  membersManagement: true,
  serverBoost: false,
  serverApplications: false,
  joinViaInvite: true,
  vanityUrls: true,

  // ─── Community ───────────────────────────────────────────
  communityOnboarding: true,
  serverGuide: true,
  browseChannels: true,
  discoverTab: true,

  // ─── Direct Messages ─────────────────────────────────────
  directMessages: true,
  messageRequests: true,

  // ─── Moderation ──────────────────────────────────────────
  autoMod: false,
  auditLog: false,
  timeout: true,
  roleHierarchyDragDrop: true,
  duplicateChannel: true,

  // ─── Search & Navigation ─────────────────────────────────
  advancedSearch: true,
  inbox: true,
  searchShortcuts: true,

  // ─── Settings ────────────────────────────────────────────
  themeSelection: true,
  accessibilitySettings: true,
  keyboardShortcuts: true,
  notificationSettings: true,

  // ─── Notifications ───────────────────────────────────────
  desktopNotifications: true,
  muteChannel: true,
  roleMentionSuppression: true,

  // ─── Monetization ────────────────────────────────────────
  donations: true,
  shop: true,
  quests: true,
  serverTags: true,

  // ─── Other Implemented ───────────────────────────────────
  memberListPanel: true,
} as const;

/** Union type of all feature flag keys */
export type FeatureKey = keyof typeof FEATURES;

export const FEATURE_OVERRIDES_STORAGE_KEY = 'harmolyn:feature-overrides';

export type FeatureOverrides = Partial<Record<FeatureKey, boolean>>;

export function readFeatureOverrides(): FeatureOverrides {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = window.localStorage.getItem(FEATURE_OVERRIDES_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const overrides: FeatureOverrides = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (key in FEATURES && typeof value === 'boolean') {
        overrides[key as FeatureKey] = value;
      }
    }

    return overrides;
  } catch {
    return {};
  }
}

export function resolveFeatureFlag(feature: FeatureKey, overrides: FeatureOverrides = readFeatureOverrides()): boolean {
  return overrides[feature] ?? FEATURES[feature];
}
