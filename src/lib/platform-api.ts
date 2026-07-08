import { Platform, Message, Comment, Mention } from '@/types';

// Base API configuration
const API_CONFIG = {
  linkedin: {
    baseUrl: 'https://api.linkedin.com/v2',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  },
  gmail: {
    baseUrl: 'https://gmail.googleapis.com/gmail/v1',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  twitter: {
    baseUrl: 'https://api.twitter.com/2',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  },
  whatsapp: {
    baseUrl: 'https://graph.facebook.com/v18.0',
    authUrl: 'https://developers.facebook.com/docs/authentication',
    tokenUrl: 'https://graph.facebook.com/oauth/access_token',
  },
  telegram: {
    baseUrl: 'https://api.telegram.org/bot',
    authUrl: 'https://core.telegram.org/bots#how-do-i-create-a-bot',
    tokenUrl: 'N/A',
  },
  tiktok: {
    baseUrl: 'https://open.tiktokapis.com/v2',
    authUrl: 'https://www.tiktok.com/v2/oauth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
  },
  instagram: {
    baseUrl: 'https://graph.instagram.com',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
  },
};

// LinkedIn API
export const linkedinApi = {
  async getMessages(accessToken: string): Promise<Message[]> {
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/messaging/conversations?fields=messages,participants',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`);
      }

      const data = await response.json();
      const conversations = data.elements || [];

      const messages: Message[] = [];

      for (const conversation of conversations) {
        const conversationMessages = conversation.messages?.elements || [];
        const participants = conversation.participants?.elements || [];
        
        for (const msg of conversationMessages.slice(0, 5)) {
          const senderId = msg.from;
          const senderData = participants.find((p: any) => p['*actor'] === senderId);
          
          messages.push({
            id: msg.id,
            platform: 'linkedin' as const,
            sender: senderData?.['*actor']?.['firstName']?.localized?.en_US || 'Unknown',
            content: msg.message?.content || '',
            timestamp: new Date(msg.created?.time || Date.now()),
            read: false,
          });
        }
      }

      return messages;
    } catch (error) {
      console.error('LinkedIn API error:', error);
      return [];
    }
  },

  async getComments(accessToken: string): Promise<Comment[]> {
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/socialActions?fields=actor,object,createdTime',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`);
      }

      const data = await response.json();
      const actions = data.elements || [];

      return actions
        .filter((action: any) => action['$*type'] === 'com.linkedin.social.SocialActionComment')
        .map((action: any) => ({
          id: action.id,
          platform: 'linkedin' as const,
          postAuthor: 'Post Author',
          author: action.actor?.firstName?.localized?.en_US || 'Unknown',
          content: action.object?.comment || '',
          timestamp: new Date(action.createdTime || Date.now()),
          postId: action.object?.object || 'unknown',
          read: false,
        }));
    } catch (error) {
      console.error('LinkedIn comments error:', error);
      return [];
    }
  },

  async getMentions(accessToken: string): Promise<Mention[]> {
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/socialActions?fields=actor,object,createdTime',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`);
      }

      const data = await response.json();
      const actions = data.elements || [];

      return actions
        .filter((action: any) => action.object?.comment?.includes('@'))
        .map((action: any) => ({
          id: action.id,
          platform: 'linkedin' as const,
          mentioner: action.actor?.firstName?.localized?.en_US || 'Unknown',
          content: action.object?.comment || '',
          timestamp: new Date(action.createdTime || Date.now()),
          type: 'comment' as const,
          sourceId: action.object?.object || 'unknown',
          read: false,
        }));
    } catch (error) {
      console.error('LinkedIn mentions error:', error);
      return [];
    }
  },

  async sendMessage(accessToken: string, recipient: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/messages',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [recipient],
            message: {
              content: {
                text: content,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send LinkedIn message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('LinkedIn send error:', error);
      throw error;
    }
  },

  async replyToComment(accessToken: string, commentId: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        `https://api.linkedin.com/v2/socialActions/${commentId}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reply to LinkedIn comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('LinkedIn reply error:', error);
      throw error;
    }
  },
};

// Gmail API
export const gmailApi = {
  async getMessages(accessToken: string): Promise<Message[]> {
    try {
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.statusText}`);
      }

      const data = await response.json();
      const messages = data.messages || [];

      const messageDetails = await Promise.all(
        messages.slice(0, 10).map(async (msg: any) => {
          const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const detailData = await detailResponse.json();
          
          const headers = detailData.payload?.headers || [];
          const fromHeader = headers.find((h: any) => h.name === 'From');
          const subjectHeader = headers.find((h: any) => h.name === 'Subject');
          const dateHeader = headers.find((h: any) => h.name === 'Date');

          return {
            id: msg.id,
            platform: 'gmail' as const,
            sender: fromHeader?.value || 'Unknown',
            content: subjectHeader?.value || '(No subject)',
            timestamp: dateHeader?.value ? new Date(dateHeader.value) : new Date(),
            read: !detailData.labelIds?.includes('UNREAD'),
          };
        })
      );

      return messageDetails;
    } catch (error) {
      console.error('Gmail API error:', error);
      return [];
    }
  },

  async getMentions(accessToken: string): Promise<Mention[]> {
    try {
      // Search for emails that might contain mentions
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=mention',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.statusText}`);
      }

      const data = await response.json();
      const messages = data.messages || [];

      const mentions = await Promise.all(
        messages.map(async (msg: any) => {
          const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const detailData = await detailResponse.json();
          
          const headers = detailData.payload?.headers || [];
          const fromHeader = headers.find((h: any) => h.name === 'From');
          const subjectHeader = headers.find((h: any) => h.name === 'Subject');

          return {
            id: msg.id,
            platform: 'gmail' as const,
            mentioner: fromHeader?.value || 'Unknown',
            content: subjectHeader?.value || 'Mentioned in email',
            timestamp: new Date(detailData.internalDate || Date.now()),
            type: 'message' as const,
            sourceId: msg.id,
            read: !detailData.labelIds?.includes('UNREAD'),
          };
        })
      );

      return mentions;
    } catch (error) {
      console.error('Gmail mentions error:', error);
      return [];
    }
  },

  async sendMessage(accessToken: string, to: string, subject: string, content: string): Promise<void> {
    try {
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        content,
      ].join('\r\n');

      const encodedEmail = Buffer.from(emailContent).toString('base64');

      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedEmail,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Gmail send error:', error);
      throw error;
    }
  },

  async replyToMessage(accessToken: string, messageId: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const originalMessage = await response.json();
      const headers = originalMessage.payload?.headers || [];
      const fromHeader = headers.find((h: any) => h.name === 'From');
      const subjectHeader = headers.find((h: any) => h.name === 'Subject');
      const to = fromHeader?.value || '';
      const subject = subjectHeader?.value || '';

      await this.sendMessage(accessToken, to, `Re: ${subject}`, content);
    } catch (error) {
      console.error('Gmail reply error:', error);
      throw error;
    }
  },
};

// Twitter/X API
export const twitterApi = {
  async getMessages(accessToken: string): Promise<Message[]> {
    try {
      const response = await fetch(
        'https://api.twitter.com/2/dm_events?dm_event_fields=created_at,message_create&expansions=sender_id&user.fields=name,username',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const events = data.data || [];

      return events.map((event: any) => {
        const messageCreate = event.message_create;
        const senderId = messageCreate.sender_id;
        const senderData = data.includes?.users?.find((u: any) => u.id === senderId);
        
        return {
          id: event.id,
          platform: 'twitter' as const,
          sender: senderData?.username || `@${senderId}`,
          content: messageCreate.message_data?.text || '',
          timestamp: new Date(event.created_at),
          read: false,
        };
      });
    } catch (error) {
      console.error('Twitter API error:', error);
      return [];
    }
  },

  async getComments(accessToken: string): Promise<Comment[]> {
    try {
      // Twitter doesn't have a direct "comments" endpoint - comments are replies to tweets
      // We'll fetch recent mentions which often include replies
      const response = await fetch(
        'https://api.twitter.com/2/users/me/mentions?tweet.fields=created_at,author_id,in_reply_to_user_id&expansions=author_id&user.fields=username,name',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const tweets = data.data || [];

      return tweets.map((tweet: any) => {
        const authorId = tweet.author_id;
        const authorData = data.includes?.users?.find((u: any) => u.id === authorId);
        
        return {
          id: tweet.id,
          platform: 'twitter' as const,
          postAuthor: 'Your post',
          author: authorData?.username || `@${authorId}`,
          content: tweet.text || '',
          timestamp: new Date(tweet.created_at),
          postId: tweet.in_reply_to_user_id || tweet.id,
          read: false,
        };
      });
    } catch (error) {
      console.error('Twitter comments error:', error);
      return [];
    }
  },

  async getMentions(accessToken: string): Promise<Mention[]> {
    try {
      const response = await fetch(
        'https://api.twitter.com/2/users/me/mentions?tweet.fields=created_at,author_id&expansions=author_id&user.fields=username,name',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const tweets = data.data || [];

      return tweets.map((tweet: any) => {
        const authorId = tweet.author_id;
        const authorData = data.includes?.users?.find((u: any) => u.id === authorId);
        
        return {
          id: tweet.id,
          platform: 'twitter' as const,
          mentioner: authorData?.username || `@${authorId}`,
          content: tweet.text || '',
          timestamp: new Date(tweet.created_at),
          type: 'post' as const,
          sourceId: tweet.id,
          read: false,
        };
      });
    } catch (error) {
      console.error('Twitter mentions error:', error);
      return [];
    }
  },

  async sendMessage(accessToken: string, recipient: string, content: string): Promise<void> {
    try {
      const response = await fetch('https://api.twitter.com/2/dm_conversations/with/' + recipient + '/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            type: 'message_create',
            message_create: {
              target: {
                recipient_id: recipient,
              },
              message_data: {
                text: content,
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send Twitter DM: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Twitter send error:', error);
      throw error;
    }
  },

  async replyToComment(accessToken: string, tweetId: string, content: string): Promise<void> {
    try {
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          reply: {
            in_reply_to_tweet_id: tweetId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reply to tweet: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Twitter reply error:', error);
      throw error;
    }
  },

  async postTweet(accessToken: string, content: string): Promise<void> {
    try {
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to post tweet: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Twitter post error:', error);
      throw error;
    }
  },
};

// WhatsApp API (via Meta)
export const whatsappApi = {
  async getMessages(accessToken: string, phoneNumberId: string): Promise<Message[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages?fields=from,to,direction,message`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const data = await response.json();
      const messages = data.data || [];

      return messages.map((msg: any) => {
        const isFromUser = msg.direction === 'inbound';
        const sender = isFromUser ? msg.from?.phone_number || 'Unknown' : 'You';
        
        return {
          id: msg.id,
          platform: 'whatsapp' as const,
          sender: sender,
          content: msg.message?.text?.body || '',
          timestamp: new Date(msg.created_time || Date.now()),
          read: true,
        };
      });
    } catch (error) {
      console.error('WhatsApp API error:', error);
      return [];
    }
  },

  async getMentions(accessToken: string): Promise<Mention[]> {
    try {
      // WhatsApp mentions are typically in group messages
      // This would require webhooks to properly implement
      return [];
    } catch (error) {
      console.error('WhatsApp mentions error:', error);
      return [];
    }
  },

  async sendMessage(accessToken: string, to: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
              body: content,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  },
};

// Telegram API
export const telegramApi = {
  async getMessages(botToken: string, chatId?: string): Promise<Message[]> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const data = await response.json();
      const updates = data.result || [];

      return updates
        .filter((update: any) => update.message && (chatId ? update.message.chat.id === parseInt(chatId) : true))
        .map((update: any) => {
          const message = update.message;
          const from = message.from;
          
          return {
            id: update.update_id.toString(),
            platform: 'telegram' as const,
            sender: from?.username || from?.first_name || 'Unknown',
            content: message.text || '',
            timestamp: new Date(message.date * 1000),
            read: false,
          };
        });
    } catch (error) {
      console.error('Telegram API error:', error);
      return [];
    }
  },

  async getMentions(botToken: string, chatId?: string): Promise<Mention[]> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const data = await response.json();
      const updates = data.result || [];

      return updates
        .filter((update: any) => {
          const message = update.message;
          const text = message?.text || '';
          return text.includes('@') && (chatId ? message.chat.id === parseInt(chatId) : true);
        })
        .map((update: any) => {
          const message = update.message;
          const from = message.from;
          
          return {
            id: update.update_id.toString(),
            platform: 'telegram' as const,
            mentioner: from?.username || from?.first_name || 'Unknown',
            content: message.text || '',
            timestamp: new Date(message.date * 1000),
            type: 'message' as const,
            sourceId: update.update_id.toString(),
            read: false,
          };
        });
    } catch (error) {
      console.error('Telegram mentions error:', error);
      return [];
    }
  },

  async sendMessage(botToken: string, chatId: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send Telegram message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Telegram send error:', error);
      throw error;
    }
  },
};

// TikTok API
export const tiktokApi = {
  async getMessages(accessToken: string): Promise<Message[]> {
    try {
      const response = await fetch(
        'https://open.tiktokapis.com/v2/message/inbox/read?fields=from_user_id,message_id,text,timestamp',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const data = await response.json();
      const messages = data.data?.messages || [];

      return messages.map((msg: any) => ({
        id: msg.message_id,
        platform: 'tiktok' as const,
        sender: msg.from_user_id || 'Unknown',
        content: msg.text || '',
        timestamp: new Date(msg.timestamp || Date.now()),
        read: false,
      }));
    } catch (error) {
      console.error('TikTok API error:', error);
      return [];
    }
  },

  async getComments(accessToken: string): Promise<Comment[]> {
    try {
      const response = await fetch(
        'https://open.tiktokapis.com/v2/video/comment/list?fields=id,text,video_id,create_time,reply_to_comment_id',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const data = await response.json();
      const comments = data.data?.comments || [];

      return comments.map((comment: any) => ({
        id: comment.id,
        platform: 'tiktok' as const,
        postAuthor: 'Video Creator',
        author: comment.username || 'Unknown',
        content: comment.text || '',
        timestamp: new Date(comment.create_time || Date.now()),
        postId: comment.video_id || 'unknown',
        read: false,
      }));
    } catch (error) {
      console.error('TikTok comments error:', error);
      return [];
    }
  },

  async getMentions(accessToken: string): Promise<Mention[]> {
    try {
      // TikTok mentions would require searching through comments and videos
      // This is a simplified implementation
      const response = await fetch(
        'https://open.tiktokapis.com/v2/video/comment/list?fields=id,text,video_id,create_time',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const data = await response.json();
      const comments = data.data?.comments || [];

      return comments
        .filter((comment: any) => comment.text?.includes('@'))
        .map((comment: any) => ({
          id: comment.id,
          platform: 'tiktok' as const,
          mentioner: comment.username || 'Unknown',
          content: comment.text || '',
          timestamp: new Date(comment.create_time || Date.now()),
          type: 'comment' as const,
          sourceId: comment.video_id || 'unknown',
          read: false,
        }));
    } catch (error) {
      console.error('TikTok mentions error:', error);
      return [];
    }
  },

  async sendMessage(accessToken: string, recipient: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        'https://open.tiktokapis.com/v2/message/send/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to_user_id: recipient,
            text: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send TikTok message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('TikTok send error:', error);
      throw error;
    }
  },

  async replyToComment(accessToken: string, commentId: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        'https://open.tiktokapis.com/v2/video/comment/reply/',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment_id: commentId,
            text: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reply to TikTok comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('TikTok reply error:', error);
      throw error;
    }
  },
};

// Instagram API
export const instagramApi = {
  async getMessages(accessToken: string): Promise<Message[]> {
    try {
      const response = await fetch(
        'https://graph.instagram.com/me/conversations?fields=participants,last_message&access_token=' + accessToken,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      const conversations = data.data || [];

      const messages: Message[] = [];
      
      for (const conversation of conversations) {
        const participants = conversation.participants?.data || [];
        const otherUser = participants.find((p: any) => p.id !== 'me');
        
        if (conversation.last_message) {
          messages.push({
            id: conversation.id,
            platform: 'instagram' as const,
            sender: otherUser?.username || 'Unknown',
            content: conversation.last_message || '',
            timestamp: new Date(),
            read: false,
          });
        }
      }

      return messages;
    } catch (error) {
      console.error('Instagram API error:', error);
      return [];
    }
  },

  async getComments(accessToken: string): Promise<Comment[]> {
    try {
      const response = await fetch(
        'https://graph.instagram.com/me/media?fields=id,caption,comments{from,text,timestamp}&access_token=' + accessToken,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      const media = data.data || [];

      const comments: Comment[] = [];

      for (const item of media) {
        const itemComments = item.comments?.data || [];
        for (const comment of itemComments) {
          comments.push({
            id: comment.id,
            platform: 'instagram' as const,
            postAuthor: 'You',
            author: comment.from?.username || 'Unknown',
            content: comment.text || '',
            timestamp: new Date(comment.timestamp || Date.now()),
            postId: item.id,
            read: false,
          });
        }
      }

      return comments;
    } catch (error) {
      console.error('Instagram comments error:', error);
      return [];
    }
  },

  async getMentions(accessToken: string): Promise<Mention[]> {
    try {
      // Instagram mentions would require searching through comments and tagged media
      // This is a simplified implementation
      const response = await fetch(
        'https://graph.instagram.com/me/media?fields=id,caption,comments{from,text,timestamp}&access_token=' + accessToken,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      const media = data.data || [];

      const mentions: Mention[] = [];

      for (const item of media) {
        const caption = item.caption || '';
        if (caption.includes('@')) {
          mentions.push({
            id: item.id,
            platform: 'instagram' as const,
            mentioner: 'Unknown',
            content: caption,
            timestamp: new Date(),
            type: 'post' as const,
            sourceId: item.id,
            read: false,
          });
        }

        const itemComments = item.comments?.data || [];
        for (const comment of itemComments) {
          if (comment.text?.includes('@')) {
            mentions.push({
              id: comment.id,
              platform: 'instagram' as const,
              mentioner: comment.from?.username || 'Unknown',
              content: comment.text || '',
              timestamp: new Date(comment.timestamp || Date.now()),
              type: 'comment' as const,
              sourceId: item.id,
              read: false,
            });
          }
        }
      }

      return mentions;
    } catch (error) {
      console.error('Instagram mentions error:', error);
      return [];
    }
  },

  async sendMessage(accessToken: string, recipient: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/messages?recipient=${recipient}&message=${encodeURIComponent(content)}&access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send Instagram message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Instagram send error:', error);
      throw error;
    }
  },

  async replyToComment(accessToken: string, commentId: string, content: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/${commentId}/replies?message=${encodeURIComponent(content)}&access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reply to Instagram comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Instagram reply error:', error);
      throw error;
    }
  },
};

// Platform API router
export const platformApi = {
  linkedin: linkedinApi,
  gmail: gmailApi,
  twitter: twitterApi,
  whatsapp: whatsappApi,
  telegram: telegramApi,
  tiktok: tiktokApi,
  instagram: instagramApi,
};

export async function fetchPlatformData(platform: Platform, accessToken: string, additionalParams?: any) {
  const api = platformApi[platform];
  
  try {
    let messages: Message[] = [];
    let comments: Comment[] = [];
    let mentions: Mention[] = [];

    if (platform === 'whatsapp' && additionalParams?.phoneNumberId) {
      messages = await (api as any).getMessages(accessToken, additionalParams.phoneNumberId);
    } else if (platform === 'telegram') {
      messages = await (api as any).getMessages(accessToken, additionalParams?.chatId);
    } else {
      messages = await (api as any).getMessages(accessToken);
    }

    if ('getComments' in api) {
      comments = await (api as any).getComments(accessToken);
    }

    if (platform === 'telegram') {
      mentions = await (api as any).getMentions(accessToken, additionalParams?.chatId);
    } else {
      mentions = await (api as any).getMentions(accessToken);
    }

    return { messages, comments, mentions };
  } catch (error) {
    console.error(`Error fetching ${platform} data:`, error);
    return { messages: [], comments: [], mentions: [] };
  }
}
