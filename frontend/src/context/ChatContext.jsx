import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const ChatContext = createContext(null)

const STORAGE_KEY = 'lumina_chats_v1'

const createNewChat = () => ({
  id: uuidv4(),
  title: 'New Chat',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

function loadChatsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveChatsToStorage(chats, activeChatId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeChatId }))
  } catch (e) {
    console.warn('localStorage save failed:', e)
  }
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(() => {
    const saved = loadChatsFromStorage()
    if (saved?.chats?.length) return saved.chats
    const initial = createNewChat()
    return [initial]
  })

  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = loadChatsFromStorage()
    if (saved?.activeChatId) return saved.activeChatId
    return chats[0]?.id
  })

  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError]           = useState(null)

  // Persist on change
  useEffect(() => {
    saveChatsToStorage(chats, activeChatId)
  }, [chats, activeChatId])

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0]

  // ── Chat CRUD ──────────────────────────────────────────────────

  const createChat = useCallback(() => {
    const newChat = createNewChat()
    setChats(prev => [newChat, ...prev])
    setActiveChatId(newChat.id)
    return newChat.id
  }, [])

  const deleteChat = useCallback((chatId) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId)
      if (filtered.length === 0) {
        const newChat = createNewChat()
        setActiveChatId(newChat.id)
        return [newChat]
      }
      if (chatId === activeChatId) {
        setActiveChatId(filtered[0].id)
      }
      return filtered
    })
  }, [activeChatId])

  const renameChat = useCallback((chatId, newTitle) => {
    setChats(prev =>
      prev.map(c => c.id === chatId ? { ...c, title: newTitle.trim() || 'Untitled' } : c)
    )
  }, [])

  const clearChat = useCallback((chatId) => {
    setChats(prev =>
      prev.map(c => c.id === chatId
        ? { ...c, messages: [], title: 'New Chat', updatedAt: Date.now() }
        : c
      )
    )
  }, [])

  // ── Messaging ──────────────────────────────────────────────────

  const addMessage = useCallback((chatId, message) => {
    const msg = {
      id: uuidv4(),
      role: message.role,
      content: message.content,
      timestamp: Date.now(),
      isError: message.isError || false,
    }
    setChats(prev =>
      prev.map(c => {
        if (c.id !== chatId) return c
        const messages = [...c.messages, msg]
        // Auto-title from first user message
        const title = c.messages.length === 0 && message.role === 'user'
          ? message.content.slice(0, 48) + (message.content.length > 48 ? '…' : '')
          : c.title
        return { ...c, messages, title, updatedAt: Date.now() }
      })
    )
    return msg.id
  }, [])

  const updateLastAssistantMessage = useCallback((chatId, contentAppend, replace = false) => {
    setChats(prev =>
      prev.map(c => {
        if (c.id !== chatId) return c
        const messages = [...c.messages]
        const lastIdx = messages.length - 1
        if (lastIdx < 0 || messages[lastIdx].role !== 'assistant') return c
        messages[lastIdx] = {
          ...messages[lastIdx],
          content: replace ? contentAppend : messages[lastIdx].content + contentAppend,
        }
        return { ...c, messages }
      })
    )
  }, [])

  // ── Send message (streaming) ───────────────────────────────────

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isStreaming) return
    const chatId = activeChatId
    setError(null)

    // Add user message
    addMessage(chatId, { role: 'user', content: userText })

    // Build history BEFORE the new message (exclude empty placeholders)
    const historyForApi = (activeChat?.messages || []).map(m => ({
      role: m.role,
      content: m.content,
    }))

    // Add placeholder assistant message
    addMessage(chatId, { role: 'assistant', content: '' })
    setIsStreaming(true)

    try {
      const resp = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: historyForApi }),
      })

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({ error: 'Server error' }))
        throw new Error(errJson.error || `HTTP ${resp.status}`)
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const parsed = JSON.parse(raw)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.chunk) updateLastAssistantMessage(chatId, parsed.chunk)
            if (parsed.done) break
          } catch (parseErr) {
            // Non-JSON data line, skip
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to get response')
      updateLastAssistantMessage(
        chatId,
        `⚠️ Error: ${err.message || 'Failed to get response. Please check your API key and try again.'}`,
        true
      )
    } finally {
      setIsStreaming(false)
    }
  }, [activeChatId, activeChat, isStreaming, addMessage, updateLastAssistantMessage])

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      activeChatId,
      setActiveChatId,
      isStreaming,
      error,
      setError,
      sidebarOpen,
      setSidebarOpen,
      createChat,
      deleteChat,
      renameChat,
      clearChat,
      sendMessage,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
