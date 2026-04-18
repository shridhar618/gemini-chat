import { Sparkles } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start animate-fade-in">
      {/* Bot avatar */}
      <div className="w-8 h-8 rounded-xl bg-surface-subtle border border-rim-strong flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={14} className="text-azure-400" />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-ink-disabled px-1">Lumina</span>
        <div className="bg-surface-raised border border-rim rounded-2xl rounded-tl-sm px-5 py-4 shadow-message">
          <div className="dot-pulse">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  )
}
