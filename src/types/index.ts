export type Platform = 'linkedin' | 'gmail' | 'twitter' | 'whatsapp' | 'telegram' | 'tiktok' | 'instagram';

export interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  hasAuth: boolean;
}

export interface MessageReply {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  platform: Platform;
  sender: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  threadId?: string;
  replies?: MessageReply[];
}

export interface Comment {
  id: string;
  platform: Platform;
  postAuthor: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
  postId: string;
  postContent?: string;
  read: boolean;
}

export interface Mention {
  id: string;
  platform: Platform;
  mentioner: string;
  mentionerAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'comment' | 'post';
  sourceId: string;
  read: boolean;
}

export interface Notification {
  id: string;
  platform: Platform;
  type: 'mention' | 'message' | 'comment';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export type AuthState = {
  [key in Platform]?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    connected: boolean;
  };
};

export interface PlatformData {
  messages: Message[];
  comments: Comment[];
  mentions: Mention[];
}
