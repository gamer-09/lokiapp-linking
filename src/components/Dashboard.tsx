'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, MessageCircle, AtSign, Bell, X, SendHorizonal } from 'lucide-react';
import { linkedinApi, gmailApi, twitterApi } from '@/lib/platform-api';

export default function Dashboard() {
  const { activePlatform, platformData, notifications, markNotificationRead, clearNotifications, addMessageReply, authState } = useStore();
  const data = platformData[activePlatform];
  const unreadNotifications = notifications.filter(n => !n.read);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

    const handleReply = async (messageId: string) => {
      const content = (replyDrafts[messageId] || '').trim();
      if (!content) {
        return;
      }

      try {
        const token = authState[activePlatform]?.accessToken;
        if (!token) {
          alert('Please connect your account first');
          return;
        }

        // Call the corresponding API based on the platform
        switch (activePlatform) {
          case 'linkedin':
            await linkedinApi.sendMessage(token, messageId, content);
            break;
          case 'gmail':
            // For Gmail, messageId is used as the thread/message reference in replyToMessage
            await gmailApi.replyToMessage(token, messageId, content);
            break;
          case 'twitter':
            // Twitter API implementation for sending messages would go here
            console.log('Twitter reply not yet implemented in platform-api.ts');
            break;
          default:
            console.log(`${activePlatform} reply not yet implemented`);
        }

        addMessageReply(activePlatform, messageId, {
          id: `${messageId}-${Date.now()}`,
          author: 'You',
          content,
          timestamp: new Date(),
        });

        setReplyDrafts((prev) => ({ ...prev, [messageId]: '' }));
      } catch (error) {
        console.error('Reply failed:', error);
        alert('Failed to send reply. Please try again.');
      }
    };

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white capitalize">{activePlatform}</h2>
          <p className="text-gray-400 text-sm">
            {data.messages.length} messages • {data.comments.length} comments • {data.mentions.length} mentions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-400" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {unreadNotifications.length > 0 && (
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">New Notifications</h3>
            <button
              onClick={clearNotifications}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {unreadNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-800 rounded-lg p-3 flex items-start gap-3"
              >
                <div className="p-2 bg-blue-600 rounded-lg">
                  <AtSign className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{notification.title}</p>
                  <p className="text-gray-400 text-xs">{notification.content}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={() => markNotificationRead(notification.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Messages Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Messages</h3>
            </div>
            {data.messages.length === 0 ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`bg-gray-900 rounded-lg p-4 ${!message.read ? 'border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {message.sender.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{message.sender}</p>
                          <p className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!message.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-gray-300 ml-13">{message.content}</p>
                    <div className="mt-4 ml-13 rounded-lg border border-gray-800 bg-gray-950/70 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-white">Replies</p>
                        <span className="text-xs text-gray-500">{(message.replies || []).length} reply{(message.replies || []).length === 1 ? '' : 's'}</span>
                      </div>
                      {(message.replies || []).length > 0 ? (
                        <div className="space-y-2">
                          {message.replies?.map((reply) => (
                            <div key={reply.id} className="rounded-lg bg-gray-900/80 p-2">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{reply.author}</span>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No replies yet.</p>
                      )}
                      <div className="mt-3 flex flex-col gap-2">
                        <textarea
                          value={replyDrafts[message.id] || ''}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [message.id]: e.target.value }))}
                          placeholder="Write a reply..."
                          className="min-h-[72px] w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleReply(message.id)}
                          className="flex items-center justify-center gap-2 self-end rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          <SendHorizonal className="h-4 w-4" />
                          Send reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Comments</h3>
            </div>
            {data.comments.length === 0 ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`bg-gray-900 rounded-lg p-4 ${!comment.read ? 'border-l-4 border-green-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {comment.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{comment.author}</p>
                          <p className="text-gray-500 text-xs">
                            commented on {comment.postAuthor}'s post •{' '}
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!comment.read && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-gray-300 ml-13">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mentions Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AtSign className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Mentions</h3>
            </div>
            {data.mentions.length === 0 ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <AtSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No mentions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.mentions.map((mention) => (
                  <div
                    key={mention.id}
                    className={`bg-gray-900 rounded-lg p-4 ${!mention.read ? 'border-l-4 border-purple-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {mention.mentioner.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{mention.mentioner}</p>
                          <p className="text-gray-500 text-xs">
                            mentioned you in a {mention.type} •{' '}
                            {formatDistanceToNow(new Date(mention.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!mention.read && (
                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-gray-300 ml-13">{mention.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
