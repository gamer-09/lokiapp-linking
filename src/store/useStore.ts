import { create } from 'zustand';
import { Platform, Message, Comment, Mention, Notification, PlatformData, MessageReply } from '@/types';

interface AuthCredential {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  connected: boolean;
}

interface StoreState {
  // Auth state
  authState: Record<Platform, AuthCredential | undefined>;
  setAuthState: (platform: Platform, auth: Omit<AuthCredential, 'connected'>) => void;
  disconnectPlatform: (platform: Platform) => void;

  // User-provided credentials
  userCredentials: Record<Platform, Record<string, string>>;
  setUserCredentials: (platform: Platform, credentials: Record<string, string>) => void;
  clearUserCredentials: (platform: Platform) => void;

  // Platform data
  platformData: Record<Platform, PlatformData>;
  setPlatformData: (platform: Platform, data: Partial<PlatformData>) => void;
  addMessage: (platform: Platform, message: Message) => void;
  addMessageReply: (platform: Platform, messageId: string, reply: MessageReply) => void;
  addComment: (platform: Platform, comment: Comment) => void;
  addMention: (platform: Platform, mention: Mention) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // UI state
  activePlatform: Platform;
  setActivePlatform: (platform: Platform) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial auth state
  authState: {
    linkedin: undefined,
    gmail: undefined,
    twitter: undefined,
    whatsapp: undefined,
    telegram: undefined,
    tiktok: undefined,
    instagram: undefined,
  },
  setAuthState: (platform, auth) =>
    set((state) => ({
      authState: {
        ...state.authState,
        [platform]: { ...auth, connected: true },
      },
    })),
  disconnectPlatform: (platform) =>
    set((state) => ({
      authState: {
        ...state.authState,
        [platform]: state.authState[platform] ? { ...state.authState[platform]!, connected: false } : undefined,
      },
    })),

  // User credentials
  userCredentials: {
    linkedin: {},
    gmail: {},
    twitter: {},
    whatsapp: {},
    telegram: {},
    tiktok: {},
    instagram: {},
  },
  setUserCredentials: (platform, credentials) =>
    set((state) => ({
      userCredentials: {
        ...state.userCredentials,
        [platform]: credentials,
      },
    })),
  clearUserCredentials: (platform) =>
    set((state) => ({
      userCredentials: {
        ...state.userCredentials,
        [platform]: {},
      },
    })),

  // Initial platform data
  platformData: {
    linkedin: { messages: [], comments: [], mentions: [] },
    gmail: { messages: [], comments: [], mentions: [] },
    twitter: { messages: [], comments: [], mentions: [] },
    whatsapp: { messages: [], comments: [], mentions: [] },
    telegram: { messages: [], comments: [], mentions: [] },
    tiktok: { messages: [], comments: [], mentions: [] },
    instagram: { messages: [], comments: [], mentions: [] },
  },
  setPlatformData: (platform, data) =>
    set((state) => ({
      platformData: {
        ...state.platformData,
        [platform]: { ...state.platformData[platform], ...data },
      },
    })),
  addMessage: (platform, message) =>
    set((state) => ({
      platformData: {
        ...state.platformData,
        [platform]: {
          ...state.platformData[platform],
          messages: [message, ...state.platformData[platform].messages],
        },
      },
    })),
  addMessageReply: (platform, messageId, reply) =>
    set((state) => ({
      platformData: {
        ...state.platformData,
        [platform]: {
          ...state.platformData[platform],
          messages: state.platformData[platform].messages.map((message) =>
            message.id === messageId
              ? { ...message, replies: [...(message.replies || []), reply] }
              : message
          ),
        },
      },
    })),
  addComment: (platform, comment) =>
    set((state) => ({
      platformData: {
        ...state.platformData,
        [platform]: {
          ...state.platformData[platform],
          comments: [comment, ...state.platformData[platform].comments],
        },
      },
    })),
  addMention: (platform, mention) =>
    set((state) => ({
      platformData: {
        ...state.platformData,
        [platform]: {
          ...state.platformData[platform],
          mentions: [mention, ...state.platformData[platform].mentions],
        },
      },
    })),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),

  // UI state
  activePlatform: 'linkedin',
  setActivePlatform: (platform) => set({ activePlatform: platform }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
