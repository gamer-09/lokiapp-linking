import { Platform } from '@/types';

// OAuth configuration types
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface TelegramConfig {
  botToken: string;
}

const DEFAULT_REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

const DEFAULT_SCOPES = {
  linkedin: ['r_liteprofile', 'r_emailaddress', 'w_member_social', 'r_member_social'],
  gmail: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
  twitter: ['tweet.read', 'tweet.write', 'users.read', 'dm.read', 'dm.write'],
  whatsapp: ['whatsapp_business_messaging', 'whatsapp_business_management'],
  tiktok: ['user.info.basic', 'video.list', 'comment.read', 'comment.write', 'message.read', 'message.write'],
  instagram: ['instagram_basic', 'instagram_manage_comments', 'instagram_manage_messages'],
};

// Create OAuth config from user credentials
const envConfig: Record<Platform, Record<string, string>> = {
  linkedin: {
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || process.env.LINKEDIN_REDIRECT_URI || `${DEFAULT_REDIRECT_URI}/linkedin`,
  },
  gmail: {
    clientId: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID || process.env.GMAIL_CLIENT_ID || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || process.env.NEXT_PUBLIC_GMAIL_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_GMAIL_REDIRECT_URI || process.env.GMAIL_REDIRECT_URI || `${DEFAULT_REDIRECT_URI}/gmail`,
  },
  twitter: {
    clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || process.env.NEXT_PUBLIC_TWITTER_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI || process.env.TWITTER_REDIRECT_URI || `${DEFAULT_REDIRECT_URI}/twitter`,
  },
  whatsapp: {
    clientId: process.env.NEXT_PUBLIC_WHATSAPP_CLIENT_ID || process.env.WHATSAPP_CLIENT_ID || '',
    clientSecret: process.env.WHATSAPP_CLIENT_SECRET || process.env.NEXT_PUBLIC_WHATSAPP_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_WHATSAPP_REDIRECT_URI || process.env.WHATSAPP_REDIRECT_URI || `${DEFAULT_REDIRECT_URI}/whatsapp`,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '',
  },
  tiktok: {
    clientId: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID || process.env.TIKTOK_CLIENT_ID || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || process.env.NEXT_PUBLIC_TIKTOK_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI || process.env.TIKTOK_REDIRECT_URI || `${DEFAULT_REDIRECT_URI}/tiktok`,
  },
  instagram: {
    clientId: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || process.env.INSTAGRAM_REDIRECT_URI || `${DEFAULT_REDIRECT_URI}/instagram`,
  },
};

export function createOAuthConfig(platform: Platform, userCredentials: Record<string, string>): OAuthConfig | TelegramConfig {
  const redirectUri = userCredentials.redirectUri || envConfig[platform].redirectUri || `${DEFAULT_REDIRECT_URI}/${platform}`;
  const clientId = userCredentials.clientId || envConfig[platform].clientId || '';
  const clientSecret = userCredentials.clientSecret || envConfig[platform].clientSecret || '';

  switch (platform) {
    case 'linkedin':
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: DEFAULT_SCOPES.linkedin,
      };
    case 'gmail':
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: DEFAULT_SCOPES.gmail,
      };
    case 'twitter':
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: DEFAULT_SCOPES.twitter,
      };
    case 'whatsapp':
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: DEFAULT_SCOPES.whatsapp,
      };
    case 'telegram':
      return {
        botToken: userCredentials.botToken || envConfig.telegram.botToken || '',
      };
    case 'tiktok':
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: DEFAULT_SCOPES.tiktok,
      };
    case 'instagram':
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: DEFAULT_SCOPES.instagram,
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export function hasAuthConfig(platform: Platform, userCredentials: Record<string, string>): boolean {
  if (userCredentials.authLink) {
    return true;
  }

  if (platform === 'telegram') {
    const botToken = userCredentials.botToken || envConfig.telegram.botToken;
    return Boolean(botToken);
  }

  const clientId = userCredentials.clientId || envConfig[platform].clientId;
  const redirectUri = userCredentials.redirectUri || envConfig[platform].redirectUri;
  
  // Log missing config to help debugging
  if (!clientId || !redirectUri) {
    console.warn(`Missing OAuth config for ${platform}: clientId=${!!clientId}, redirectUri=${!!redirectUri}`);
  }
  
  return Boolean(clientId && redirectUri);
}

export function resolveCredentialsFromAuthLink(
  platform: Platform,
  userCredentials: Record<string, string>
): Record<string, string> {
  const authLink = userCredentials.authLink;
  if (!authLink) {
    return userCredentials;
  }

  try {
    const parsedUrl = new URL(authLink);
    const resolvedCredentials: Record<string, string> = { ...userCredentials };

    const paramMappings: Record<string, string[]> = {
      linkedin: ['client_id', 'clientId', 'client_secret', 'clientSecret', 'redirect_uri', 'redirectUri'],
      gmail: ['client_id', 'clientId', 'client_secret', 'clientSecret', 'redirect_uri', 'redirectUri'],
      twitter: ['client_id', 'clientId', 'client_secret', 'clientSecret', 'redirect_uri', 'redirectUri'],
      whatsapp: ['client_id', 'clientId', 'client_secret', 'clientSecret', 'redirect_uri', 'redirectUri'],
      telegram: ['bot_token', 'botToken', 'chat_id', 'chatId'],
      tiktok: ['client_key', 'clientKey', 'client_secret', 'clientSecret', 'redirect_uri', 'redirectUri'],
      instagram: ['client_id', 'clientId', 'client_secret', 'clientSecret', 'redirect_uri', 'redirectUri'],
    };

    for (const key of paramMappings[platform] || []) {
      const value = parsedUrl.searchParams.get(key);
      if (value) {
        resolvedCredentials[key] = value;
      }
    }

    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
    for (const key of paramMappings[platform] || []) {
      const value = hashParams.get(key);
      if (value) {
        resolvedCredentials[key] = value;
      }
    }

    return resolvedCredentials;
  } catch {
    return userCredentials;
  }
}

// Generate OAuth authorization URL
export function getAuthUrl(platform: Platform, userCredentials: Record<string, string>): string {
  const config = createOAuthConfig(platform, userCredentials);

  switch (platform) {
    case 'linkedin':
      const linkedinConfig = config as OAuthConfig;
      const linkedinParams = new URLSearchParams({
        response_type: 'code',
        client_id: linkedinConfig.clientId,
        redirect_uri: linkedinConfig.redirectUri,
        scope: linkedinConfig.scopes.join(' '),
      });
      return `https://www.linkedin.com/oauth/v2/authorization?${linkedinParams.toString()}`;
    
    case 'gmail':
      const gmailConfig = config as OAuthConfig;
      const gmailParams = new URLSearchParams({
        response_type: 'code',
        client_id: gmailConfig.clientId,
        redirect_uri: gmailConfig.redirectUri,
        scope: gmailConfig.scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent',
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${gmailParams.toString()}`;
    
    case 'twitter':
      const twitterConfig = config as OAuthConfig;
      const twitterParams = new URLSearchParams({
        response_type: 'code',
        client_id: twitterConfig.clientId,
        redirect_uri: twitterConfig.redirectUri,
        scope: twitterConfig.scopes.join(' '),
        state: Math.random().toString(36).substring(7),
        code_challenge: 'challenge',
        code_challenge_method: 'plain',
      });
      return `https://twitter.com/i/oauth2/authorize?${twitterParams.toString()}`;
    
    case 'whatsapp':
      const whatsappConfig = config as OAuthConfig;
      const whatsappParams = new URLSearchParams({
        response_type: 'code',
        client_id: whatsappConfig.clientId,
        redirect_uri: whatsappConfig.redirectUri,
        scope: whatsappConfig.scopes.join(','),
      });
      return `https://www.facebook.com/v18.0/dialog/oauth?${whatsappParams.toString()}`;
    
    case 'telegram':
      const telegramConfig = config as TelegramConfig;
      return `https://t.me/${telegramConfig.botToken.replace(':', '_')}?start=auth`;
    
    case 'tiktok':
      const tiktokConfig = config as OAuthConfig;
      const tiktokParams = new URLSearchParams({
        client_key: tiktokConfig.clientId,
        scope: tiktokConfig.scopes.join(','),
        redirect_uri: tiktokConfig.redirectUri,
        response_type: 'code',
        state: Math.random().toString(36).substring(7),
      });
      return `https://www.tiktok.com/v2/auth/authorize?${tiktokParams.toString()}`;
    
    case 'instagram':
      const instagramConfig = config as OAuthConfig;
      const instagramParams = new URLSearchParams({
        client_id: instagramConfig.clientId,
        redirect_uri: instagramConfig.redirectUri,
        scope: instagramConfig.scopes.join(' '),
        response_type: 'code',
      });
      return `https://api.instagram.com/oauth/authorize?${instagramParams.toString()}`;
    
    default:
      return '';
  }
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(platform: Platform, code: string, userCredentials: Record<string, string>): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  const config = createOAuthConfig(platform, userCredentials);

  switch (platform) {
    case 'linkedin':
      const linkedinConfig = config as OAuthConfig;
      const linkedinResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: linkedinConfig.redirectUri,
          client_id: linkedinConfig.clientId,
          client_secret: linkedinConfig.clientSecret,
        }),
      });
      return linkedinResponse.json();
    
    case 'gmail':
      const gmailConfig = config as OAuthConfig;
      const gmailResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: gmailConfig.redirectUri,
          client_id: gmailConfig.clientId,
          client_secret: gmailConfig.clientSecret,
        }),
      });
      return gmailResponse.json();
    
    case 'twitter':
      const twitterConfig = config as OAuthConfig;
      const twitterResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${twitterConfig.clientId}:${twitterConfig.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: twitterConfig.redirectUri,
          code_verifier: 'challenge',
        }),
      });
      return twitterResponse.json();
    
    case 'whatsapp':
      const whatsappConfig = config as OAuthConfig;
      const whatsappResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: whatsappConfig.clientId,
          client_secret: whatsappConfig.clientSecret,
          code,
          redirect_uri: whatsappConfig.redirectUri,
        }),
      });
      return whatsappResponse.json();
    
    case 'tiktok':
      const tiktokConfig = config as OAuthConfig;
      const tiktokResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: tiktokConfig.clientId,
          client_secret: tiktokConfig.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: tiktokConfig.redirectUri,
        }),
      });
      return tiktokResponse.json();
    
    case 'instagram':
      const instagramConfig = config as OAuthConfig;
      const instagramResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: instagramConfig.clientId,
          client_secret: instagramConfig.clientSecret,
          code,
          redirect_uri: instagramConfig.redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      return instagramResponse.json();
    
    case 'telegram':
      const telegramConfig = config as TelegramConfig;
      return { access_token: telegramConfig.botToken };
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Refresh access token
export async function refreshAccessToken(platform: Platform, refreshToken: string, userCredentials: Record<string, string>): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  const config = createOAuthConfig(platform, userCredentials);

  switch (platform) {
    case 'linkedin':
      const linkedinConfig = config as OAuthConfig;
      const linkedinResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: linkedinConfig.clientId,
          client_secret: linkedinConfig.clientSecret,
        }),
      });
      return linkedinResponse.json();
    
    case 'gmail':
      const gmailConfig = config as OAuthConfig;
      const gmailResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: gmailConfig.clientId,
          client_secret: gmailConfig.clientSecret,
        }),
      });
      return gmailResponse.json();
    
    default:
      throw new Error(`Token refresh not implemented for ${platform}`);
  }
}
