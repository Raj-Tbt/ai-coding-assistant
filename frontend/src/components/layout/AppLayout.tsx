import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import type { Conversation } from '../../types/conversation';

interface AppLayoutProps {
  children: React.ReactNode;
  conversations: Conversation[];
  isLoadingConversations: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function AppLayout({
  children,
  conversations,
  isLoadingConversations,
  searchQuery,
  onSearchChange,
  onNewChat,
  onRename,
  onDelete,
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarProps = {
    conversations,
    isLoading: isLoadingConversations,
    searchQuery,
    onSearchChange,
    onNewChat: () => { onNewChat(); setMobileSidebarOpen(false); },
    onRename,
    onDelete,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-neutral-950">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 z-40 md:hidden transition-transform duration-200 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          {...sidebarProps}
          collapsed={false}
          onToggleCollapse={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
