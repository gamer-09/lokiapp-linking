'use client';

import { useEffect } from 'react';
import { Bell, KeyRound, MessageSquare, ShieldCheck, Sparkles, X } from 'lucide-react';

type HelpModalProps = {
  onClose: () => void;
};

export default function HelpModal({ onClose }: HelpModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-800 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-blue-400">Need a hand?</p>
            <h2 className="text-xl font-semibold text-white">Loki help center</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            aria-label="Close help"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5 text-sm text-gray-300">
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h3 className="font-semibold">Quick start</h3>
            </div>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Select a platform from the sidebar to view its activity.</li>
              <li>Use the credentials button to save platform details before connecting.</li>
              <li>Connect your account to start receiving updates and notifications.</li>
            </ol>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-white">
                <KeyRound className="h-4 w-4 text-green-400" />
                <h3 className="font-semibold">Credentials</h3>
              </div>
              <p>Store your login details safely for the selected platform so the app can connect without repeating setup.</p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-white">
                <Bell className="h-4 w-4 text-yellow-400" />
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <p>New updates appear in the bell area above your activity feed, where you can clear or dismiss them.</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-white">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <h3 className="font-semibold">What you can see</h3>
            </div>
            <p>The dashboard groups messages, comments, and mentions for each platform so you can quickly spot what needs attention.</p>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-white">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <h3 className="font-semibold">Tips</h3>
            </div>
            <p>If a platform is not connecting, recheck the saved credentials and ensure the account is available in the active workspace.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
