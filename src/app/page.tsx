'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import PlatformSidebar from '@/components/PlatformSidebar';
import Dashboard from '@/components/Dashboard';
import AuthModal from '@/components/AuthModal';
import { Menu, Plus, CircleHelp } from 'lucide-react';
import HelpModal from '@/components/HelpModal';

export default function Home() {
  const { activePlatform, authState, setSidebarOpen, sidebarOpen } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const isConnected = authState[activePlatform]?.connected;

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={`lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <PlatformSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white capitalize">{activePlatform}</h1>
            {!isConnected && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Sign in with {activePlatform}
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <CircleHelp className="h-4 w-4" />
              Help
            </button>
            {!isConnected && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign in with {activePlatform}
              </button>
            )}
            {isConnected && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard />
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          platform={activePlatform}
          onClose={() => setShowAuthModal(false)}
        />
      )}


      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
}
