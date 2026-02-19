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
  serverFolders: false,

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
  superReactions: false,
  slowmode: true,
  jumpToPresent: true,
  unreadDivider: true,
  imageLightbox: true,
  deleteConfirmation: true,
  mentionAutocomplete: true,

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
  forumChannels: true,
  announcementChannels: false,
  privateChannels: true,
  channelFollowing: false,
  scheduledEvents: true,
  channelCreationFlow: true,
  channelPinsView: false,

  // ─── Server ──────────────────────────────────────────────
  serverSettings: true,
  serverDiscovery: true,
  rolesManagement: true,
  membersManagement: true,
  serverBoost: false,
  serverApplications: false,
  joinViaInvite: true,
  vanityUrls: false,

  // ─── Community ───────────────────────────────────────────
  communityOnboarding: false,
  serverGuide: false,
  browseChannels: false,
  discoverTab: true,

  // ─── Direct Messages ─────────────────────────────────────
  directMessages: true,
  messageRequests: true,

  // ─── Moderation ──────────────────────────────────────────
  autoMod: false,
  auditLog: false,
  timeout: false,
  roleHierarchyDragDrop: false,
  duplicateChannel: false,

  // ─── Search & Navigation ─────────────────────────────────
  advancedSearch: true,
  inbox: true,
  searchShortcuts: false,

  // ─── Settings ────────────────────────────────────────────
  themeSelection: true,
  accessibilitySettings: true,
  keyboardShortcuts: true,
  notificationSettings: true,

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
