import { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { runAllCalculations } from '@/lib/calculations';
import { CalculationCard } from '@/components/features/CalculationCard';
import { StatusBadge } from '@/components/features/StatusBadge';
import { Calculator, ChevronRight, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepCalculate() {
  const { inputs, results, setResults, setCurrentStep, setIsCalculating, isCalculating } = useDesignStore();
  const [expandAll, setExpandAll] = useState(false);

  const runCalc = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const res = runAllCalculations(inputs);
      setResults(res);
      setIsCalculating(false);
    }, 600);
  };

  const readyChecks = [
    { label: 'Design code selected', ok: !!inputs.design_selection.design_code },
    { label: 'Axial load entered', ok: inputs.load_data.axial_load_kn !== null },
    { label: 'Column dimensions', ok: inputs.column_data.depth_mm !== null || inputs.column_data.pipe_outer_diameter_mm !== null },
    { label: 'Base plate size', ok: inputs.base_plate_data.plate_length_N_mm !== null },
    { label: 'Concrete grade', ok: inputs.concrete_data.fc_prime_mpa !== null || inputs.concrete_data.fck_mpa !== null },
    { label: 'Anchor diameter', ok: inputs.anchor_data.anchor_diameter_mm !== null },
  ];
  const allReady = readyChecks.every((c) => c.ok);

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator size={20} className="text-[hsl(190,90%,50%)]" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Calculation Workspace</h2>
            <p className="text-xs text-muted-foreground">
              Deterministic engineering checks — {inputs.design_selection.design_code} {inputs.design_selection.design_method}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {results && (
            <button type="button" onClick={() => setExpandAll(!expandAll)}
              className="text-xs px-3 py-1.5 rounded border border-[hsl(220,20%,22%)] text-muted-foreground hover:text-foreground transition-colors">
              {expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          )}
          <button type="button" onClick={runCalc} disabled={isCalculating}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              allReady
                ? 'bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)]'
                : 'bg-[hsl(220,20%,18%)] text-muted-foreground cursor-not-allowed'
            )}>
            {isCalculating ? <RefreshCw size={14} className="animate-spin" /> : <Calculator size={14} />}
            {isCalculating ? 'Calculating...' : results ? 'Recalculate' : 'Run Calculations'}
          </button>
        </div>
      </div>

      {/* Readiness checks */}
      {!results && (
        <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
          <p className="section-heading mb-3">Input Readiness Check</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {readyChecks.map((c) => (
              <div key={c.label} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                c.ok
                  ? 'bg-[hsl(145,65%,42%,0.08)] border-[hsl(145,65%,42%,0.3)] text-[hsl(145,65%,50%)]'
                  : 'bg-[hsl(38,92%,50%,0.08)] border-[hsl(38,92%,50%,0.3)] text-[hsl(38,92%,55%)]'
              )}>
                {c.ok ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                {c.label}
              </div>
            ))}
          </div>
          {!allReady && (
            <p className="text-xs text-[hsl(38,92%,50%)] mt-3">
              Complete all required inputs before running calculations.
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Overall status banner */}
          <div className={cn(
            'rounded-xl border p-4 flex items-center justify-between',
            results.overall_status === 'SAFE'
              ? 'bg-[hsl(145,65%,42%,0.08)] border-[hsl(145,65%,42%,0.3)]'
              : results.overall_status === 'FAIL'
              ? 'bg-[hsl(0,72%,55%,0.08)] border-[hsl(0,72%,55%,0.3)]'
              : 'bg-[hsl(38,92%,50%,0.08)] border-[hsl(38,92%,50%,0.3)]'
          )}>
            <div className="flex items-center gap-3">
              {results.overall_status === 'SAFE' ? <CheckCircle size={24} className="text-[hsl(145,65%,42%)]" />
                : results.overall_status === 'FAIL' ? <XCircle size={24} className="text-[hsl(0,72%,55%)]" />
                : <AlertTriangle size={24} className="text-[hsl(38,92%,50%)]" />}
              <div>
                <p className="font-bold text-foreground">
                  Overall Design Status: <StatusBadge status={results.overall_status} size="lg" />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {results.calc_results.length} checks performed · {results.critical_issues.length} critical · {results.warnings.length} warnings
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setCurrentStep('results')}
              className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(190,90%,50%)] hover:text-[hsl(190,90%,60%)] transition-colors">
              View Summary <ChevronRight size={16} />
            </button>
          </div>

          {/* Issues and warnings */}
          {(results.critical_issues.length > 0 || results.warnings.length > 0) && (
            <div className="grid md:grid-cols-2 gap-3">
              {results.critical_issues.length > 0 && (
                <div className="bg-[hsl(0,72%,55%,0.06)] border border-[hsl(0,72%,55%,0.25)] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[hsl(0,72%,60%)] mb-2 flex items-center gap-1.5">
                    <XCircle size={12} /> Critical Issues ({results.critical_issues.length})
                  </p>
                  {results.critical_issues.map((issue, i) => (
                    <p key={i} className="text-xs text-muted-foreground mt-1">• {issue}</p>
                  ))}
                </div>
              )}
              {results.warnings.length > 0 && (
                <div className="bg-[hsl(38,92%,50%,0.06)] border border-[hsl(38,92%,50%,0.25)] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[hsl(38,92%,55%)] mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Warnings ({results.warnings.length})
                  </p>
                  {results.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-muted-foreground mt-1">• {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calculation cards */}
          <div className="space-y-2">
            <p className="section-heading">Engineering Calculation Cards</p>
            {results.calc_results.map((cr, i) => (
              <CalculationCard key={i} result={cr} defaultExpanded={expandAll} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
