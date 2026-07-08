'use client';

import { useState } from 'react';
import { Platform } from '@/types';
import { useStore } from '@/store/useStore';
import { fetchPlatformData } from '@/lib/platform-api';
import { X, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  platform: Platform;
  onClose: () => void;
}

export default function AuthModal({ platform, onClose }: AuthModalProps) {
  const { setAuthState, setPlatformData, setUserCredentials, userCredentials } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [authLinkInput, setAuthLinkInput] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);

    const authLink = authLinkInput.trim();
    const state = btoa(JSON.stringify(userCredentials[platform] || {}));
    let authUrl: string;

    if (authLink) {
      try {
        const url = new URL(authLink);
        url.searchParams.set('state', state);
        authUrl = url.toString();
        setUserCredentials(platform, { authLink });
      } catch (error) {
        setIsLoading(false);
        alert('Invalid alternative login link. Please paste a valid URL or leave the field empty to use the app configuration.');
        return;
      }
    } else {
      try {
        const response = await fetch(`/api/auth/url/${platform}`);
        const data = await response.json();
        if (!response.ok || !data.authUrl) {
          throw new Error('OAuth is not configured for this platform.');
        }

        const url = new URL(data.authUrl);
        url.searchParams.set('state', state);
        authUrl = url.toString();
      } catch (error) {
        setIsLoading(false);
        alert('OAuth is not configured for this platform. Please set up the app environment or contact the administrator.');
        return;
      }
    }
    
    // Open OAuth window
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      `auth-${platform}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for the callback
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'AUTH_SUCCESS') {
        const { accessToken, refreshToken, expiresIn } = event.data;
        
        setAuthState(platform, {
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000),
        });

        // Fetch platform data after successful authentication
        try {
          const data = await fetchPlatformData(platform, accessToken);
          setPlatformData(platform, data);
        } catch (error) {
          console.error(`Failed to fetch ${platform} data:`, error);
        }
        
        setIsLoading(false);
        onClose();
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setIsLoading(false);
      alert('Popup was blocked. Please allow popups for this site.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white capitalize">Connect {platform}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-blue-700/40 bg-blue-950/20 p-4">
            <p className="text-sm font-medium text-white">
              Sign in with {platform} to continue.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              This opens the official {platform} sign-in flow and links your account to the app.
            </p>
          </div>

          <div className="rounded-lg border border-dashed border-gray-700 bg-gray-950/80 p-4">
            <label className="mb-2 block text-sm font-medium text-white">
              Alternative login link (optional)
            </label>
            <input
              type="text"
              value={authLinkInput}
              onChange={(e) => setAuthLinkInput(e.target.value)}
              placeholder="Paste a ready-made sign-in URL"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
            <p className="mt-2 text-xs text-gray-400">
              Leave this blank to use the app's built-in OAuth configuration. Only provide a link if you already have a complete authorization URL.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              To connect your {platform} account, you'll need to authorize Loki_12 to access:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Your messages and direct messages
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Comments on your posts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Mentions and notifications
              </li>
            </ul>
          </div>

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Connect Account
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your credentials are stored locally and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
