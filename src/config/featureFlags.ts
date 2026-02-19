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
  quickSwitcher: false,
  serverFolders: false,

  // ─── Auth ────────────────────────────────────────────────
  loginScreen: false,
  registerScreen: false,
  qrLogin: false,
  mfa: false,
  accountSwitching: false,

  // ─── User ────────────────────────────────────────────────
  userStatus: true,
  profileCustomization: true,
  serverProfile: false,
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
  spoilerText: false,
  messageForwarding: false,
  polls: false,
  threads: false,
  voiceMessages: false,
  slashCommands: false,
  messageLinks: false,
  superReactions: false,
  slowmode: false,
  jumpToPresent: false,
  unreadDivider: false,
  imageLightbox: false,
  deleteConfirmation: false,
  mentionAutocomplete: false,

  // ─── Voice & Video ───────────────────────────────────────
  voiceJoinLeave: true,
  screenShare: false,
  soundboard: false,
  activities: false,
  dmCalls: false,
  stageChannels: false,
  voiceTextChat: false,
  voiceControlBar: false,

  // ─── Channels ────────────────────────────────────────────
  textVoiceChannels: true,
  channelCategories: true,
  forumChannels: false,
  announcementChannels: false,
  privateChannels: false,
  channelFollowing: false,
  scheduledEvents: false,
  channelCreationFlow: false,
  channelPinsView: false,

  // ─── Server ──────────────────────────────────────────────
  serverSettings: true,
  serverDiscovery: true,
  rolesManagement: true,
  membersManagement: true,
  serverBoost: false,
  serverApplications: false,
  joinViaInvite: false,
  vanityUrls: false,

  // ─── Community ───────────────────────────────────────────
  communityOnboarding: false,
  serverGuide: false,
  browseChannels: false,
  discoverTab: true,

  // ─── Direct Messages ─────────────────────────────────────
  directMessages: true,
  messageRequests: false,

  // ─── Moderation ──────────────────────────────────────────
  autoMod: false,
  auditLog: false,
  timeout: false,
  roleHierarchyDragDrop: false,
  duplicateChannel: false,

  // ─── Search & Navigation ─────────────────────────────────
  advancedSearch: false,
  inbox: false,
  searchShortcuts: false,

  // ─── Settings ────────────────────────────────────────────
  themeSelection: true,
  accessibilitySettings: false,
  keyboardShortcuts: false,
  notificationSettings: false,

  // ─── Notifications ───────────────────────────────────────
  desktopNotifications: false,
  muteChannel: false,
  roleMentionSuppression: false,

  // ─── Monetization ────────────────────────────────────────
  nitro: false,
  shop: false,
  quests: false,
  serverTags: false,

  // ─── Other Implemented ───────────────────────────────────
  memberListPanel: true,
} as const;

/** Union type of all feature flag keys */
export type FeatureKey = keyof typeof FEATURES;
