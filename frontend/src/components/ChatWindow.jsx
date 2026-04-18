import { useEffect, useRef } from 'react'
import { PanelLeftOpen, Trash2, Sparkles } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

function WelcomeScreen() {
  const { sendMessage } = useChat()
  const suggestions = [
    { icon: '💡', text: 'Explain quantum computing simply' },
    { icon: '🐍', text: 'Write a Python web scraper' },
    { icon: '⚛️',  text: 'Help me debug my React component' },
    { icon: '✉️',  text: 'Draft a professional email' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mx-auto shadow-glow-azure">
          <Sparkles size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">
            How can I help you?
          </h1>
          <p className="text-ink-secondary text-sm mt-2 max-w-sm mx-auto">
            Ask me anything — coding, writing, research, or just a conversation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {suggestions.map(s => (
          <button
            key={s.text}
            onClick={() => sendMessage(s.text)}
            className="
              flex items-center gap-3 px-4 py-3.5 rounded-xl text-left
              bg-surface-raised border border-rim
              hover:bg-surface-overlay hover:border-azure-500/30
              text-ink-secondary hover:text-ink-primary
              transition-all duration-150 group
            "
          >
            <span className="text-lg shrink-0">{s.icon}</span>
            <span className="text-sm">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatWindow() {
  const { activeChat, isStreaming, sidebarOpen, setSidebarOpen, clearChat } = useChat()
  const bottomRef = useRef(null)
  const containerRef = useRef(null)
  const messages = activeChat?.messages || []

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isStreaming])

  // Scroll on streaming content changes
  useEffect(() => {
    if (!isStreaming) return
    const container = containerRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isStreaming])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">

      {/* Top header bar */}
      <header className="
        flex items-center gap-3 px-4 py-3
        border-b border-rim
        bg-surface-base/80 backdrop-blur-sm
        shrink-0 z-10
      ">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-surface-raised transition-colors"
            title="Open sidebar"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {sidebarOpen && (
            <div className="w-5 h-5 rounded-md bg-gradient-accent flex items-center justify-center shrink-0">
              <Sparkles size={11} className="text-white" />
            </div>
          )}
          <span className="font-medium text-sm text-ink-primary truncate">
            {activeChat?.title || 'New Chat'}
          </span>
        </div>

        {!isEmpty && (
          <button
            onClick={() => clearChat(activeChat.id)}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
              text-ink-tertiary hover:text-red-400
              hover:bg-red-500/10 border border-transparent
              hover:border-red-900/30 transition-all duration-150
            "
            title="Clear this conversation"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </header>

      {/* Message list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      >
        {isEmpty ? (
          <WelcomeScreen />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={idx === messages.length - 1}
                isStreaming={isStreaming && idx === messages.length - 1}
              />
            ))}

            {/* Typing indicator when streaming hasn't started yet */}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <TypingIndicator />
            )}

            <div ref={bottomRef} className="h-1" />
          </div>
        )}
      </div>
    </div>
  )
}
