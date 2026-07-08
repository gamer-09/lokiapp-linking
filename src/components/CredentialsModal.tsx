'use client';

import { useState } from 'react';
import { Platform } from '@/types';
import { useStore } from '@/store/useStore';
import { X, Key, Eye, EyeOff } from 'lucide-react';

interface CredentialsModalProps {
  platform: Platform;
  onClose: () => void;
  onSave?: (credentials: Record<string, string>) => void;
}

export default function CredentialsModal({ platform, onClose, onSave }: CredentialsModalProps) {
  const { setUserCredentials, userCredentials } = useStore();
  const [credentials, setCredentials] = useState<Record<string, string>>(userCredentials[platform] || {});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const fields = {
    linkedin: [
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    ],
    gmail: [
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    ],
    twitter: [
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    ],
    whatsapp: [
      { key: 'clientId', label: 'App ID', type: 'text' },
      { key: 'clientSecret', label: 'App Secret', type: 'password' },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text' },
    ],
    telegram: [
      { key: 'botToken', label: 'Bot Token', type: 'password' },
      { key: 'chatId', label: 'Chat ID (optional)', type: 'text' },
    ],
    tiktok: [
      { key: 'clientId', label: 'Client Key', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    ],
    instagram: [
      { key: 'clientId', label: 'App ID', type: 'text' },
      { key: 'clientSecret', label: 'App Secret', type: 'password' },
    ],
  };

  const platformFields = fields[platform] || [];

  const handleSave = () => {
    // Validate required fields
    const requiredFields = platformFields.filter(f => !f.label.includes('optional'));
    const missingFields = requiredFields.filter(f => !credentials[f.key]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setUserCredentials(platform, credentials);
    if (onSave) {
      onSave(credentials);
    }
    onClose();
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white capitalize">{platform} Credentials</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-gray-300 text-sm">
              Enter your {platform} OAuth credentials. You can get these from the {platform} developer portal.
            </p>
          </div>

          {platformFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                  value={credentials[field.key] || ''}
                  onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showSecrets[field.key] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6"
          >
            <Key className="w-4 h-4" />
            Save Credentials
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your credentials are stored locally in your browser and never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
