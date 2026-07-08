'use client';

import { Platform } from '@/types';
import { useStore } from '@/store/useStore';
import { Building, Mail, MessageSquare, MessageCircle, Send, Music, Camera } from 'lucide-react';

const PLATFORM_CONFIG = {
  linkedin: { name: 'LinkedIn', icon: Building, color: 'bg-blue-600' },
  gmail: { name: 'Gmail', icon: Mail, color: 'bg-red-500' },
  twitter: { name: 'X/Twitter', icon: MessageSquare, color: 'bg-black' },
  whatsapp: { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
  telegram: { name: 'Telegram', icon: Send, color: 'bg-blue-400' },
  tiktok: { name: 'TikTok', icon: Music, color: 'bg-pink-500' },
  instagram: { name: 'Instagram', icon: Camera, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
};

export default function PlatformSidebar() {
  const { activePlatform, setActivePlatform, authState, sidebarOpen } = useStore();

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Loki_12</h1>
        <p className="text-gray-400 text-sm">Social Media Hub</p>
      </div>

      <nav className="flex-1 space-y-2">
        {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((platform) => {
          const config = PLATFORM_CONFIG[platform];
          const Icon = config.icon;
          const isConnected = authState[platform]?.connected;

          return (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${activePlatform === platform ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
            >
              <div className={`p-2 rounded-lg ${config.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{config.name}</div>
                <div className="text-xs mt-0.5">
                  {isConnected ? (
                    <span className="text-green-400">Connected</span>
                  ) : (
                    <span className="text-gray-500">Not connected</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Connect your accounts to get started
        </div>
      </div>
    </div>
  );
}
