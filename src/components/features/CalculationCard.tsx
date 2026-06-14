import { useState } from 'react';
import type { CalcResult } from '@/types';
import { StatusBadge, UtilizationBar } from './StatusBadge';
import { ChevronDown, ChevronRight, BookOpen, Hash, ArrowRight, CheckCircle2, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDesignStore } from '@/stores/designStore';

interface CalculationCardProps {
  result: CalcResult;
  defaultExpanded?: boolean;
  className?: string;
}

export function CalculationCard({ result, defaultExpanded = false, className }: CalculationCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState('');
  const addToHistory = useDesignStore((s) => s.addToHistory);

  const statusColor = result.status === 'SAFE'
    ? 'border-l-[hsl(145,65%,42%)]'
    : result.status === 'FAIL'
    ? 'border-l-[hsl(0,72%,55%)]'
    : result.status === 'WARNING'
    ? 'border-l-[hsl(38,92%,50%)]'
    : 'border-l-[hsl(210,90%,60%)]';

  return (
    <div className={cn('calc-card border-l-2', statusColor, className)}>
      {/* Header */}
      <button
        className="calc-card-header w-full text-left"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[hsl(190,90%,50%)]">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
          <span className="font-semibold text-sm text-foreground truncate">{result.calculation_name}</span>
          <span className="text-xs text-muted-foreground hidden md:block font-mono">{result.design_code}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {result.utilization_ratio !== null && (
            <span className={cn(
              'font-mono text-xs px-2 py-0.5 rounded',
              result.utilization_ratio > 1 ? 'text-[hsl(0,72%,55%)]' : 'text-[hsl(145,65%,42%)]'
            )}>
              {(result.utilization_ratio * 100).toFixed(1)}%
            </span>
          )}
          <StatusBadge status={result.status} size="sm" />
        </div>
      </button>

      {/* Collapsed summary */}
      {!expanded && (
        <div className="px-4 py-2 border-t border-[hsl(220,20%,14%)]">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground truncate">{result.remarks}</p>
            {result.utilization_ratio !== null && (
              <UtilizationBar ratio={result.utilization_ratio} className="w-32 shrink-0" />
            )}
          </div>
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="divide-y divide-[hsl(220,20%,14%)]">
          {/* Design Code Reference */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={12} className="text-[hsl(190,90%,50%)]" />
              <span className="section-heading text-[10px]">Design Code Reference</span>
            </div>
            <p className="font-mono text-xs text-[hsl(190,90%,60%)]">{result.design_code}</p>
          </div>

          {/* Formula */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={12} className="text-[hsl(190,90%,50%)]" />
              <span className="section-heading text-[10px]">Formula</span>
            </div>
            <div className="formula-block">
              <code className="text-[hsl(190,90%,65%)] text-sm">{result.formula}</code>
            </div>
          </div>

          {/* Variables */}
          {Object.keys(result.variables).length > 0 && (
            <div className="px-4 py-3">
              <p className="section-heading text-[10px] mb-2">Variable Definitions</p>
              <div className="space-y-0.5">
                {Object.entries(result.variables).map(([k, v]) => (
                  <div key={k} className="var-row">
                    <code className="text-[hsl(210,90%,65%)] text-xs font-mono">{k}</code>
                    <span className="text-muted-foreground text-xs ml-4 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inputs */}
          {Object.keys(result.inputs).length > 0 && (
            <div className="px-4 py-3">
              <p className="section-heading text-[10px] mb-2">Input Values</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(result.inputs).map(([k, v]) => (
                  <div key={k} className="bg-[hsl(220,30%,5%)] rounded px-2 py-1.5">
                    <p className="text-muted-foreground text-[10px] leading-none mb-0.5">{k}</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{v ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unit conversions */}
          {Object.keys(result.unit_conversions).length > 0 && (
            <div className="px-4 py-3">
              <p className="section-heading text-[10px] mb-2">Unit Conversions</p>
              <div className="space-y-1">
                {Object.entries(result.unit_conversions).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <code className="text-muted-foreground font-mono">{k}:</code>
                    <code className="text-[hsl(38,92%,60%)] font-mono">{v}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Substitutions */}
          {result.substitutions.length > 0 && (
            <div className="px-4 py-3">
              <p className="section-heading text-[10px] mb-2">Numerical Substitution</p>
              <div className="space-y-1.5">
                {result.substitutions.map((sub, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight size={10} className="text-[hsl(190,90%,50%)] mt-1 shrink-0" />
                    <code className="font-mono text-xs text-[hsl(210,20%,80%)]">{sub}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intermediate steps */}
          {result.intermediate_steps.length > 0 && (
            <div className="px-4 py-3">
              <p className="section-heading text-[10px] mb-2">Intermediate Calculations</p>
              <div className="space-y-1.5">
                {result.intermediate_steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={10} className="text-[hsl(145,65%,42%)] mt-1 shrink-0" />
                    <code className="font-mono text-xs text-muted-foreground">{step}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="px-4 py-3">
            <p className="section-heading text-[10px] mb-2">Final Result</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(result.result).map(([k, v]) => (
                <div key={k} className="bg-[hsl(220,30%,5%)] border border-[hsl(220,20%,18%)] rounded px-2 py-1.5">
                  <p className="text-muted-foreground text-[10px] leading-none mb-0.5">{k}</p>
                  <p className={cn('font-mono text-sm font-semibold', typeof v === 'boolean'
                    ? v ? 'text-[hsl(38,92%,50%)]' : 'text-[hsl(145,65%,42%)]'
                    : 'text-foreground')}>
                    {v === null ? '—' : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Utilization */}
          {result.utilization_ratio !== null && (
            <div className="px-4 py-3">
              <UtilizationBar ratio={result.utilization_ratio} label="Design Utilization Ratio" />
            </div>
          )}

          {/* Status and remarks */}
          <div className="px-4 py-3 bg-[hsl(220,28%,8%)]">
            <div className="flex items-start gap-3">
              <StatusBadge status={result.status} size="md" />
              <p className="text-xs text-muted-foreground leading-relaxed">{result.remarks}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="px-4 py-2 flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[hsl(190,90%,50%)] transition-colors"
              onClick={() => setShowNotes(!showNotes)}
            >
              <StickyNote size={12} />
              Add Engineering Note
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-[hsl(190,90%,50%)] transition-colors ml-auto"
              onClick={() => addToHistory(result)}
            >
              Save to History
            </button>
          </div>
          {showNotes && (
            <div className="px-4 py-2">
              <textarea
                className="input-field w-full text-xs font-mono p-2 rounded resize-none"
                rows={3}
                placeholder="Enter engineering notes for this calculation..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
