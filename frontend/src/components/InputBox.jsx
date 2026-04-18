import { useRef, useEffect, useState, useCallback } from 'react'
import { Send, AlertCircle, Paperclip, Mic } from 'lucide-react'
import { useChat } from '../context/ChatContext'

export default function InputBox() {
  const { sendMessage, isStreaming, error, setError } = useChat()
  const [text, setText]         = useState('')
  const textareaRef             = useRef(null)
  const canSend                 = text.trim().length > 0 && !isStreaming

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const newHeight = Math.min(ta.scrollHeight, 200)
    ta.style.height = newHeight + 'px'
  }, [text])

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    sendMessage(trimmed)
    setText('')
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [text, isStreaming, sendMessage])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const charCount = text.length
  const showCharCount = charCount > 500

  return (
    <div className="shrink-0 bg-surface-base border-t border-rim">
      <div className="max-w-3xl mx-auto px-4 pb-5 pt-3">

        {/* Error banner */}
        {error && (
          <div className="
            flex items-center gap-2 mb-2.5 px-3.5 py-2.5
            rounded-xl bg-red-950/40 border border-red-900/40
            text-red-400 text-sm animate-slide-up
          ">
            <AlertCircle size={14} className="shrink-0" />
            <span className="flex-1 min-w-0 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-300 transition-colors shrink-0 ml-2 text-base leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Main input container */}
        <div className={`
          relative flex flex-col rounded-2xl border transition-all duration-200
          bg-surface-raised
          ${isStreaming
            ? 'border-azure-500/30 shadow-glow-azure'
            : 'border-rim hover:border-rim-strong focus-within:border-azure-500/40 focus-within:shadow-glow-azure'
          }
        `}>

          {/* Textarea */}
          <div className="flex items-end gap-2 px-4 pt-3.5 pb-3">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={1}
              placeholder={
                isStreaming
                  ? 'Lumina is thinking…'
                  : 'Message Lumina… (Enter to send, Shift+Enter for new line)'
              }
              className="
                flex-1 min-w-0 min-h-[24px] max-h-[200px]
                bg-transparent outline-none resize-none
                text-sm text-ink-primary placeholder:text-ink-disabled
                disabled:opacity-60 disabled:cursor-not-allowed
                no-scrollbar
              "
              style={{ lineHeight: '1.65' }}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            {/* Left: char count */}
            <div className="flex items-center gap-2">
              {showCharCount && (
                <span className={`text-[11px] transition-colors ${charCount > 3000 ? 'text-red-400' : 'text-ink-disabled'}`}>
                  {charCount.toLocaleString()} chars
                </span>
              )}
            </div>

            {/* Right: send button */}
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={`
                w-8 h-8 rounded-xl flex items-center justify-center
                transition-all duration-150
                ${canSend
                  ? 'bg-gradient-accent text-white shadow-glow-azure hover:opacity-90 hover:scale-105 active:scale-95'
                  : 'bg-surface-subtle text-ink-disabled cursor-not-allowed'
                }
              `}
              title={canSend ? 'Send message (Enter)' : 'Type a message to send'}
            >
              <Send size={14} className={canSend ? '' : 'opacity-40'} />
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-ink-disabled mt-2.5 select-none">
          Lumina can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  )
}
