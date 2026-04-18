import { useState, useRef, useEffect } from 'react'
import {
  Plus, Trash2, Pencil, Check, X,
  MessageSquare, ChevronLeft, Sparkles
} from 'lucide-react'
import { useChat } from '../context/ChatContext'

function ChatItem({ chat, isActive, onSelect, onDelete, onRename }) {
  const [editing, setEditing]   = useState(false)
  const [title, setTitle]       = useState(chat.title)
  const [hovering, setHovering] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTitle(chat.title)
  }, [chat.title])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commitRename() {
    if (title.trim()) onRename(chat.id, title)
    else setTitle(chat.title)
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') { setTitle(chat.title); setEditing(false) }
  }

  return (
    <div
      className={`
        group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5
        cursor-pointer transition-all duration-150 select-none
        ${isActive
          ? 'bg-surface-subtle border border-rim-strong text-ink-primary'
          : 'text-ink-secondary hover:bg-surface-raised hover:text-ink-primary border border-transparent'
        }
      `}
      onClick={() => !editing && onSelect(chat.id)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Icon */}
      <MessageSquare
        size={14}
        className={`shrink-0 ${isActive ? 'text-azure-400' : 'text-ink-tertiary'}`}
      />

      {/* Title / edit input */}
      {editing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitRename}
          onClick={e => e.stopPropagation()}
          className="flex-1 min-w-0 bg-transparent text-sm text-ink-primary outline-none border-none"
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm truncate">{chat.title}</span>
      )}

      {/* Actions */}
      {!editing && (hovering || isActive) && (
        <div
          className="flex items-center gap-1 ml-auto shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded-md text-ink-tertiary hover:text-ink-primary hover:bg-surface-overlay transition-colors"
            title="Rename"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(chat.id)}
            className="p-1 rounded-md text-ink-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {editing && (
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <button
            onClick={commitRename}
            className="p-1 rounded-md text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <Check size={12} />
          </button>
          <button
            onClick={() => { setTitle(chat.title); setEditing(false) }}
            className="p-1 rounded-md text-ink-tertiary hover:bg-surface-overlay transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const {
    chats, activeChatId, setActiveChatId,
    createChat, deleteChat, renameChat, setSidebarOpen,
  } = useChat()

  // Group chats by time
  const now = Date.now()
  const DAY = 86_400_000
  const groups = {
    'Today':     chats.filter(c => now - c.updatedAt < DAY),
    'Yesterday': chats.filter(c => now - c.updatedAt >= DAY && now - c.updatedAt < 2 * DAY),
    'Older':     chats.filter(c => now - c.updatedAt >= 2 * DAY),
  }

  return (
    <aside className="flex flex-col h-full w-72 bg-surface-base border-r border-rim overflow-hidden shadow-sidebar">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow-azure">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-semibold text-ink-primary tracking-tight">Lumina</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-surface-raised transition-colors"
          title="Close sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3 shrink-0">
        <button
          onClick={createChat}
          className="
            w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
            bg-surface-raised border border-rim hover:border-azure-500/40
            hover:bg-surface-overlay text-ink-secondary hover:text-ink-primary
            transition-all duration-150 text-sm font-medium group
          "
        >
          <Plus size={15} className="group-hover:rotate-90 transition-transform duration-200" />
          New Chat
        </button>
      </div>

      <div className="w-full h-px bg-rim shrink-0" />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {Object.entries(groups).map(([label, groupChats]) => {
          if (!groupChats.length) return null
          return (
            <div key={label}>
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-disabled">
                {label}
              </p>
              <div className="space-y-0.5">
                {groupChats.map(chat => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSelect={setActiveChatId}
                    onDelete={deleteChat}
                    onRename={renameChat}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-rim shrink-0">
        <p className="text-[11px] text-ink-disabled text-center">
          Powered by Google Gemini
        </p>
      </div>
    </aside>
  )
}
