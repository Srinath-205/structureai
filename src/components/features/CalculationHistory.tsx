import { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { StatusBadge } from './StatusBadge';
import { CalculationCard } from './CalculationCard';
import { History, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CalculationHistory() {
  const history = useDesignStore((s) => s.history);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = history.find((h) => h.id === selectedId);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <History size={32} className="text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">No calculation history yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Run calculations and save results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {history.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
          className={cn(
            'w-full text-left px-3 py-2.5 rounded-lg border transition-all',
            selectedId === entry.id
              ? 'bg-[hsl(220,28%,12%)] border-[hsl(190,90%,50%,0.3)]'
              : 'bg-[hsl(220,30%,7%)] border-[hsl(220,20%,16%)] hover:border-[hsl(220,20%,25%)]'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{entry.calc_result.calculation_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {entry.project_name} · {entry.design_method} · {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {entry.calc_result.utilization_ratio !== null && (
                <span className={cn(
                  'font-mono text-xs',
                  entry.calc_result.utilization_ratio > 1 ? 'text-[hsl(0,72%,55%)]' : 'text-[hsl(145,65%,42%)]'
                )}>
                  {(entry.calc_result.utilization_ratio * 100).toFixed(0)}%
                </span>
              )}
              <StatusBadge status={entry.calc_result.status} size="sm" showIcon={false} />
              {selectedId === entry.id ? <X size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
            </div>
          </div>

          {entry.engineer_notes && (
            <p className="text-xs text-[hsl(38,92%,50%)] mt-1 italic truncate">"{entry.engineer_notes}"</p>
          )}
        </button>
      ))}

      {selected && (
        <div className="mt-3">
          <CalculationCard result={selected.calc_result} defaultExpanded={true} />
        </div>
      )}
    </div>
  );
}
