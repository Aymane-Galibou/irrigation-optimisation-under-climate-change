import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden">
      
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-zinc-900 text-white shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link href="/" className="font-bold text-lg flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            AgriPulse <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">Console</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="pb-2 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Analytique</div>
          
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors text-sm font-medium">
            📡 IoT Streamed data
          </Link>

          <Link href="/dashboard/manual" className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors text-sm font-medium">
            🎛️ Manual Simulation
          </Link>

          <Link href="/dashboard/history" className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors text-sm font-medium">
            💽 History 
          </Link>

        </nav>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
          <span className="text-sm font-semibold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-md">Cluster ID: Tadla 02</span>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">Retour au site</Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-zinc-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}