import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Search, Trash2, Pencil, Check, X,
  Code2, Sun, Moon, Monitor, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { Conversation } from '../../types/conversation';
import { Avatar } from '../ui/Avatar';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { groupConversationsByDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  conversations,
  isLoading,
  searchQuery,
  onSearchChange,
  onNewChat,
  onRename,
  onDelete,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { id: activeId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const confirmRename = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    onDelete(deleteId);
    if (activeId === deleteId) navigate('/chat');
    setDeleteId(null);
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  const groups = groupConversationsByDate(conversations);

  if (collapsed) {
    return (
      <div className="flex flex-col h-full w-14 bg-gray-50 dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 items-center py-3 gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mb-2">
          <Code2 size={16} className="text-white" />
        </div>
        <button onClick={onNewChat} title="New Chat"
          className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
          <Plus size={18} />
        </button>
        <div className="flex-1" />
        <button onClick={onToggleCollapse}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full w-64 bg-gray-50 dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800">
        {/* Header */}
        <div className="p-3 flex items-center gap-2.5 border-b border-gray-200 dark:border-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Code2 size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">CodeAssist</span>
          <button onClick={onToggleCollapse}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 text-xs bg-transparent text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {isLoading ? (
            <div className="space-y-1 p-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 rounded-lg bg-gray-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-6 px-4">
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </p>
          ) : (
            Object.entries(groups).map(([label, items]) =>
              items.length === 0 ? null : (
                <div key={label} className="mb-3">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-2 py-1.5">{label}</p>
                  {items.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeId}
                      isEditing={editingId === conv.id}
                      editTitle={editTitle}
                      onEditTitleChange={setEditTitle}
                      onNavigate={() => navigate(`/chat/${conv.id}`)}
                      onStartRename={() => startRename(conv)}
                      onConfirmRename={confirmRename}
                      onCancelRename={() => setEditingId(null)}
                      onDeleteClick={() => setDeleteId(conv.id)}
                    />
                  ))}
                </div>
              )
            )
          )}
        </div>

        {/* Footer — user profile + settings */}
        <div className="p-3 border-t border-gray-200 dark:border-neutral-800 space-y-2">
          {/* Theme toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 rounded-xl p-1 border border-gray-200 dark:border-neutral-700">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={cn(
                  'flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-colors',
                  theme === value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'
                )}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>

          {/* User row */}
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name ?? 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              title="Sign out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete conversation">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          This conversation and all its messages will be permanently deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} className="bg-red-500 text-white hover:bg-red-600">Delete</Button>
        </div>
      </Dialog>

      {/* Sign-out confirmation dialog */}
      <Dialog open={showSignOutConfirm} onClose={() => setShowSignOutConfirm(false)} title="Sign out">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Are you sure you want to sign out? You'll need to log in again to access your conversations.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowSignOutConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={logout} className="bg-red-500 text-white hover:bg-red-600">Sign out</Button>
        </div>
      </Dialog>
    </>
  );
}

/* Individual conversation list item */
interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (v: string) => void;
  onNavigate: () => void;
  onStartRename: () => void;
  onConfirmRename: () => void;
  onCancelRename: () => void;
  onDeleteClick: () => void;
}

function ConversationItem({
  conv, isActive, isEditing, editTitle, onEditTitleChange,
  onNavigate, onStartRename, onConfirmRename, onCancelRename, onDeleteClick,
}: ConversationItemProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onConfirmRename(); if (e.key === 'Escape') onCancelRename(); }}
          className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-blue-400 focus:outline-none text-gray-900 dark:text-gray-100"
        />
        <button onClick={onConfirmRename} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check size={13} /></button>
        <button onClick={onCancelRename} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"><X size={13} /></button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-1 px-2 py-2 rounded-xl cursor-pointer transition-colors',
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
          : 'hover:bg-white dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
      )}
      onClick={onNavigate}
    >
      <span className="flex-1 text-xs truncate">{conv.title}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onStartRename(); }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
          title="Rename"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400"
          title="Delete"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
