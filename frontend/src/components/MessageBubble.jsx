import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Copy, Check, User, Sparkles, AlertTriangle } from 'lucide-react'

// ── Custom dark theme for syntax highlighting ───────────────────
const luminaCodeTheme = {
  'code[class*="language-"]': { color: '#cdd6f4', background: 'none', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.875em', textAlign: 'left', whiteSpace: 'pre', wordSpacing: 'normal', wordBreak: 'normal', lineHeight: '1.7', tabSize: 2 },
  'pre[class*="language-"]': { color: '#cdd6f4', background: '#0c0e14', padding: '1.2em', margin: '0', overflow: 'auto', borderRadius: '0 0 10px 10px' },
  'comment':  { color: '#45475a', fontStyle: 'italic' },
  'prolog':   { color: '#45475a' },
  'doctype':  { color: '#45475a' },
  'cdata':    { color: '#45475a' },
  'punctuation': { color: '#cdd6f4' },
  'property': { color: '#89b4fa' },
  'tag':      { color: '#f38ba8' },
  'boolean':  { color: '#fab387' },
  'number':   { color: '#fab387' },
  'constant': { color: '#fab387' },
  'symbol':   { color: '#fab387' },
  'deleted':  { color: '#f38ba8' },
  'selector': { color: '#a6e3a1' },
  'attr-name':{ color: '#a6e3a1' },
  'string':   { color: '#a6e3a1' },
  'char':     { color: '#a6e3a1' },
  'builtin':  { color: '#a6e3a1' },
  'inserted': { color: '#a6e3a1' },
  'operator': { color: '#89dceb' },
  'entity':   { color: '#89dceb', cursor: 'help' },
  'url':      { color: '#89dceb' },
  'atrule':   { color: '#cba6f7' },
  'attr-value':{ color: '#cba6f7' },
  'keyword':  { color: '#cba6f7' },
  'function': { color: '#89b4fa' },
  'class-name':{ color: '#f9e2af' },
  'regex':    { color: '#f2cdcd' },
  'important':{ color: '#f2cdcd', fontWeight: 'bold' },
  'variable': { color: '#cdd6f4' },
  'bold':     { fontWeight: 'bold' },
  'italic':   { fontStyle: 'italic' },
}

// ── Copy Button ────────────────────────────────────────────────
function CopyBtn({ text, label = 'Copy', size = 12, className = '' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`code-copy-btn ${copied ? 'copied' : ''} ${className}`}
      title={copied ? 'Copied!' : label}
    >
      {copied
        ? <Check size={size} strokeWidth={2.5} />
        : <Copy size={size} />
      }
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  )
}

// ── Code block with header ─────────────────────────────────────
function CodeBlock({ language, value }) {
  const lang = (language || '').toLowerCase()
  const displayLang = lang || 'plaintext'
  const lineCount = value.split('\n').length

  return (
    <div className="code-block-wrapper my-3">
      <div className="code-block-header">
        <span className="code-lang-tag">{displayLang}</span>
        <CopyBtn text={value} label="Copy code" />
      </div>
      <SyntaxHighlighter
        language={lang || 'text'}
        style={luminaCodeTheme}
        showLineNumbers={lineCount > 4}
        lineNumberStyle={{ color: '#45475a', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none' }}
        wrapLongLines={false}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Markdown components map ────────────────────────────────────
const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match  = /language-(\w+)/.exec(className || '')
    const value  = String(children).replace(/\n$/, '')
    const isBlock = !inline && (match || value.includes('\n'))

    if (isBlock) return <CodeBlock language={match?.[1] || ''} value={value} />
    return (
      <code
        className="bg-azure-500/10 text-azure-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-azure-500/20"
        {...props}
      >
        {children}
      </code>
    )
  },

  pre({ children }) {
    // Already handled by `code` above — just render children
    return <>{children}</>
  },

  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-azure-400 underline underline-offset-2 decoration-azure-500/40 hover:decoration-azure-400 transition-colors"
      >
        {children}
      </a>
    )
  },

  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    )
  },

  th({ children }) {
    return (
      <th className="border border-rim bg-surface-overlay px-3 py-2 text-left font-semibold text-ink-primary">
        {children}
      </th>
    )
  },

  td({ children }) {
    return (
      <td className="border border-rim px-3 py-2 text-ink-secondary">{children}</td>
    )
  },

  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-azure-500 pl-4 my-2 text-ink-secondary italic">
        {children}
      </blockquote>
    )
  },

  hr() {
    return <hr className="border-rim my-4" />
  },
}

// ── Main MessageBubble ─────────────────────────────────────────
export default function MessageBubble({ message, isLast, isStreaming }) {
  const isUser   = message.role === 'user'
  const isError  = message.isError
  const isEmpty  = !message.content && isLast && isStreaming

  // Show cursor while the last assistant message is being streamed
  const showCursor = !isUser && isLast && isStreaming && message.content

  return (
    <div className={`flex gap-3 message-enter group ${isUser ? 'justify-end' : 'justify-start'}`}>

      {/* Bot avatar — left side */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-surface-subtle border border-rim-strong flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={14} className="text-azure-400" />
        </div>
      )}

      {/* Bubble + actions */}
      <div className={`flex flex-col gap-1.5 min-w-0 ${isUser ? 'items-end max-w-[75%]' : 'items-start max-w-[85%]'}`}>

        {/* Role label */}
        <span className="text-[11px] text-ink-disabled px-1">
          {isUser ? 'You' : 'Lumina'}
        </span>

        {/* Message bubble */}
        <div className={`
          relative rounded-2xl px-4 py-3 shadow-message text-sm leading-relaxed break-words w-full
          ${isUser
            ? 'bg-gradient-user text-white rounded-tr-sm'
            : isError
              ? 'bg-red-950/30 border border-red-900/40 text-red-300 rounded-tl-sm'
              : 'bg-surface-raised border border-rim text-ink-primary rounded-tl-sm'
          }
        `}>
          {/* Typing dots (waiting for first chunk) */}
          {isEmpty ? (
            <div className="dot-pulse py-1">
              <span /><span /><span />
            </div>
          ) : isUser ? (
            // User messages: plain pre-wrap text
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : isError ? (
            // Error state
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ) : (
            // Assistant: full markdown
            <div className={`markdown-body ${showCursor ? 'typing-cursor' : ''}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy action for assistant messages */}
        {!isUser && message.content && !isError && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1">
            <CopyBtn
              text={message.content}
              label="Copy response"
              size={11}
              className="text-[11px] py-1"
            />
          </div>
        )}
      </div>

      {/* User avatar — right side */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-azure-600 flex items-center justify-center shrink-0 mt-0.5 shadow-glow-azure">
          <User size={14} className="text-white" />
        </div>
      )}
    </div>
  )
}
