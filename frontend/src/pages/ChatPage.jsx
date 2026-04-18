import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import InputBox from '../components/InputBox'
import { useChat } from '../context/ChatContext'

export default function ChatPage() {
  const { sidebarOpen, setSidebarOpen } = useChat()

  return (
    <div className="flex h-full w-full overflow-hidden bg-surface-base">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-30 h-full
          sidebar-transition
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}
          md:${sidebarOpen ? 'w-72' : 'w-0'}
        `}
        style={{ width: sidebarOpen ? '288px' : '0' }}
      >
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <ChatWindow />
        <InputBox />
      </div>
    </div>
  )
}
