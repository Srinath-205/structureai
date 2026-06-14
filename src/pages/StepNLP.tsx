import { useState, useRef } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { parseNaturalLanguageInput } from '@/lib/nlp/parser';
import type { ExtractionResult } from '@/lib/nlp/parser';
import { Sparkles, ChevronRight, Copy, Check, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const EXAMPLE_QUERIES = [
  "Design a base plate for ISMB 300 column. Axial load 800 kN, moment 60 kNm, shear 40 kN, M30 concrete, plate E250, pedestal 600×600 mm, use 4×M24 anchors.",
  "W14×90 column, P=1200 kN compression, Mx=120 kNm, Vx=80 kN, AISC LRFD, fc'=28 MPa, pedestal 700×700 mm, 4×M30 F1554 Gr.55 anchors, 450×450 A36 plate 38mm thick.",
  "Base plate design for W12×96, axial 950 kN, moment 45 kNm, shear 35 kN, concrete fc'=35 MPa, pedestal 650×650, 6×M24 anchors.",
  "ISMB 450, IS 800 limit state, 1200 kN axial, 80 kNm major moment, 50 kN shear, M25 concrete, pedestal 700×700mm, 4 M24 bolts, E250 plate.",
];

interface MatchedField {
  value: string | number;
  source: string;
}

function MatchBadge({ label, value, source }: { label: string; value: string | number; source: string }) {
  return (
    <div className="bg-[hsl(145,65%,42%,0.08)] border border-[hsl(145,65%,42%,0.25)] rounded-lg px-3 py-2">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className="font-mono text-sm font-bold text-[hsl(145,65%,55%)]">{String(value)}</p>
      <p className="text-[10px] text-[hsl(145,65%,42%)] mt-0.5 opacity-70">{source}</p>
    </div>
  );
}

export function StepNLP() {
  const { inputs, setInputs, setCurrentStep } = useDesignStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [applied, setApplied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parseQuery = () => {
    if (!query.trim()) return;
    setParsing(true);
    setApplied(false);
    setTimeout(() => {
      const r = parseNaturalLanguageInput(query);
      setResult(r);
      setParsing(false);
    }, 400);
  };

  const applyExtracted = () => {
    if (!result) return;
    const { extracted } = result;
    const merged: typeof inputs = {
      project_info: { ...inputs.project_info, ...extracted.project_info },
      design_selection: { ...inputs.design_selection, ...extracted.design_selection },
      load_data: { ...inputs.load_data, ...extracted.load_data },
      column_data: { ...inputs.column_data, ...extracted.column_data },
      base_plate_data: { ...inputs.base_plate_data, ...extracted.base_plate_data },
      concrete_data: { ...inputs.concrete_data, ...extracted.concrete_data },
      anchor_data: { ...inputs.anchor_data, ...extracted.anchor_data },
      embedment_data: { ...inputs.embedment_data, ...extracted.embedment_data },
      weld_data: { ...inputs.weld_data, ...extracted.weld_data },
    };
    setInputs(merged);
    setApplied(true);
  };

  const useExample = (ex: string) => {
    setQuery(ex);
    setResult(null);
    setApplied(false);
    textareaRef.current?.focus();
  };

  const confidence = result?.confidence ?? 0;
  const confColor = confidence >= 75 ? 'text-[hsl(145,65%,42%)]' : confidence >= 50 ? 'text-[hsl(38,92%,50%)]' : 'text-[hsl(0,72%,55%)]';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[hsl(190,90%,50%,0.15)] flex items-center justify-center">
          <Sparkles size={16} className="text-[hsl(190,90%,50%)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Natural Language Input Parser</h2>
          <p className="text-xs text-muted-foreground">Describe your design in plain text — parameters are extracted automatically.</p>
        </div>
      </div>

      {/* Examples */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <Copy size={10} /> Example queries (click to use)
        </p>
        <div className="space-y-1.5">
          {EXAMPLE_QUERIES.map((ex, i) => (
            <button key={i} type="button" onClick={() => useExample(ex)}
              className="w-full text-left text-xs text-muted-foreground hover:text-foreground bg-[hsl(220,28%,9%)] hover:bg-[hsl(220,28%,11%)] border border-[hsl(220,20%,18%)] rounded-lg px-3 py-2 transition-all leading-relaxed">
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Input textarea */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Your design description</label>
        <textarea
          ref={textareaRef}
          className="input-field w-full px-4 py-3 text-sm font-mono leading-relaxed resize-none rounded-xl"
          rows={5}
          placeholder="Describe your design... e.g. 'W14×90 column, P=1200 kN, Mx=80 kNm, shear 60 kN, AISC LRFD, fc'=28 MPa, pedestal 700×700 mm, 4×M30 anchors, 500×400 A36 plate 40mm thick'"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResult(null); setApplied(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) parseQuery(); }}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground">Ctrl+Enter to parse</p>
          <button type="button" onClick={parseQuery} disabled={!query.trim() || parsing}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50">
            {parsing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {parsing ? 'Parsing...' : 'Parse Input'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Confidence */}
          <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="section-heading">Extraction Confidence</p>
              <span className={cn('font-mono text-2xl font-bold', confColor)}>{confidence}%</span>
            </div>
            <div className="w-full bg-[hsl(220,20%,14%)] rounded-full h-2">
              <div className={cn('h-2 rounded-full transition-all',
                confidence >= 75 ? 'bg-[hsl(145,65%,42%)]' : confidence >= 50 ? 'bg-[hsl(38,92%,50%)]' : 'bg-[hsl(0,72%,55%)]'
              )} style={{ width: `${confidence}%` }} />
            </div>
          </div>

          {/* Matched parameters */}
          {Object.keys(result.matched).length > 0 && (
            <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
              <p className="section-heading mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[hsl(145,65%,42%)]" />
                Extracted Parameters ({Object.keys(result.matched).length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(result.matched).map(([key, { value, source }]: [string, MatchedField]) => (
                  <MatchBadge key={key} label={key.replace(/_/g, ' ')} value={value} source={source} />
                ))}
              </div>
            </div>
          )}

          {/* Missing parameters */}
          {result.missing.length > 0 && (
            <div className="bg-[hsl(38,92%,50%,0.06)] border border-[hsl(38,92%,50%,0.25)] rounded-xl p-4">
              <p className="text-xs font-semibold text-[hsl(38,92%,55%)] mb-2 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Missing Parameters ({result.missing.length})
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {result.missing.map((m) => (
                  <p key={m} className="text-xs text-muted-foreground">• {m}</p>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="bg-[hsl(210,90%,60%,0.06)] border border-[hsl(210,90%,60%,0.2)] rounded-xl p-4">
              <p className="text-xs font-semibold text-[hsl(210,90%,65%)] mb-2">Suggestions to improve extraction:</p>
              {result.suggestions.map((s) => (
                <p key={s} className="text-xs text-muted-foreground mt-1">→ {s}</p>
              ))}
            </div>
          )}

          {/* JSON preview */}
          <details className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)]">
            <summary className="px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              View Extracted JSON
            </summary>
            <div className="px-4 pb-4">
              <pre className="text-[10px] font-mono text-[hsl(145,65%,55%)] overflow-x-auto whitespace-pre-wrap max-h-64">
                {JSON.stringify(result.extracted, null, 2)}
              </pre>
            </div>
          </details>

          {/* Apply button */}
          <div className="flex gap-3">
            <button type="button" onClick={applyExtracted}
              className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all',
                applied
                  ? 'bg-[hsl(145,65%,42%,0.15)] border border-[hsl(145,65%,42%,0.4)] text-[hsl(145,65%,55%)]'
                  : 'bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)]'
              )}>
              {applied ? <Check size={14} /> : <Sparkles size={14} />}
              {applied ? 'Applied to Design Inputs' : 'Apply Extracted Parameters'}
            </button>
            {applied && (
              <button type="button" onClick={() => setCurrentStep('loads')}
                className="flex items-center gap-2 px-4 py-3 bg-[hsl(220,20%,18%)] hover:bg-[hsl(220,20%,22%)] text-foreground font-semibold text-sm rounded-lg transition-colors">
                Review Loads <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Skip */}
      <div className="text-center">
        <button type="button" onClick={() => setCurrentStep('loads')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Skip — enter parameters manually →
        </button>
      </div>
    </div>
  );
}
