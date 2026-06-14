import { Sidebar } from './Sidebar';
import { useDesignStore } from '@/stores/designStore';
import type { WorkflowStep } from '@/types';
import { RotateCcw, History } from 'lucide-react';
import { useState } from 'react';
import { CalculationHistory } from '@/components/features/CalculationHistory';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { resetAll, history } = useDesignStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-10 bg-[hsl(220,28%,8%)] border-b border-[hsl(220,20%,14%)] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">StructAI BasePlate</span>
            <span className="text-[hsl(220,20%,25%)]">·</span>
            <span className="text-xs text-[hsl(190,90%,50%)]">AISC & IS Code Steel Base Plate Design Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors border',
                showHistory
                  ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.4)] text-[hsl(190,90%,60%)]'
                  : 'border-[hsl(220,20%,20%)] text-muted-foreground hover:text-foreground hover:border-[hsl(220,20%,30%)]'
              )}
            >
              <History size={12} />
              History
              {history.length > 0 && (
                <span className="bg-[hsl(190,90%,50%)] text-[hsl(220,30%,7%)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { if (confirm('Reset all inputs? This cannot be undone.')) resetAll(); }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-[hsl(220,20%,20%)] text-muted-foreground hover:text-[hsl(0,72%,55%)] hover:border-[hsl(0,72%,55%,0.4)] transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex">
          <main className={cn('flex-1 overflow-y-auto', showHistory ? 'pr-0' : '')}>
            {children}
          </main>

          {/* History panel */}
          {showHistory && (
            <aside className="w-80 border-l border-[hsl(220,20%,14%)] bg-[hsl(220,30%,7%)] overflow-y-auto">
              <div className="px-4 py-3 border-b border-[hsl(220,20%,14%)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-[hsl(190,90%,50%)]" />
                  <h3 className="text-sm font-semibold text-foreground">Calculation History</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                >
                  Close
                </button>
              </div>
              <div className="p-3">
                <CalculationHistory />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
