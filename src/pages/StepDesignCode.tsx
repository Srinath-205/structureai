import { useDesignStore } from '@/stores/designStore';
import { DESIGN_CODES } from '@/constants';
import { BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CODES = [
  {
    key: 'AISC_LRFD' as const,
    title: 'AISC LRFD',
    subtitle: 'Load and Resistance Factor Design',
    tags: ['AISC 360-22', 'AISC DG1', 'ACI 318-19 Ch.17'],
    desc: 'American standard. Factored loads. Resistance reduced by φ factors. Most common for US practice.',
    phi_b: 'φb = 0.90',
    phi_c: 'φc = 0.65',
  },
  {
    key: 'AISC_ASD' as const,
    title: 'AISC ASD',
    subtitle: 'Allowable Stress Design',
    tags: ['AISC 360-22', 'AISC DG1', 'ACI 318-19 Ch.17'],
    desc: 'American standard. Service loads. Capacity divided by safety factor Ω. Used in specific project specs.',
    phi_b: 'Ωb = 1.67',
    phi_c: 'Ωc = 2.31',
  },
  {
    key: 'IS_LSM' as const,
    title: 'IS 800 Limit State',
    subtitle: 'Limit State Method',
    tags: ['IS 800:2007', 'IS 456:2000', 'IS 5624'],
    desc: 'Indian standard. Limit state method with partial safety factors γm0 and γm1. Metric units.',
    phi_b: 'γm0 = 1.10',
    phi_c: 'γm1 = 1.25',
  },
];

export function StepDesignCode() {
  const { inputs, applyDesignCode, setCurrentStep } = useDesignStore();
  const currentMethod = inputs.design_selection.design_method;

  const isActive = (key: keyof typeof DESIGN_CODES) => {
    const code = DESIGN_CODES[key];
    return code.design_method === currentMethod && code.design_code === inputs.design_selection.design_code;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={18} className="text-[hsl(190,90%,50%)]" />
          <h2 className="text-lg font-bold text-foreground">Design Code Selection</h2>
        </div>
        <p className="text-sm text-muted-foreground">Select the design standard that governs this project.</p>
      </div>

      <div className="space-y-3">
        {CODES.map((code) => {
          const active = isActive(code.key);
          return (
            <button
              key={code.key}
              type="button"
              onClick={() => applyDesignCode(code.key)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                active
                  ? 'bg-[hsl(190,90%,50%,0.08)] border-[hsl(190,90%,50%,0.5)] glow-cyan'
                  : 'bg-[hsl(220,28%,9%)] border-[hsl(220,20%,18%)] hover:border-[hsl(220,20%,28%)]'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-base font-bold', active ? 'text-[hsl(190,90%,60%)]' : 'text-foreground')}>
                      {code.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{code.subtitle}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {code.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[hsl(220,20%,14%)] border border-[hsl(220,20%,22%)] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{code.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    active ? 'border-[hsl(190,90%,50%)] bg-[hsl(190,90%,50%)]' : 'border-[hsl(220,20%,30%)]'
                  )}>
                    {active && <CheckCircle size={14} className="text-[hsl(220,30%,7%)]" />}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <p className="font-mono text-[10px] text-muted-foreground">{code.phi_b}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{code.phi_c}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Code reference summary */}
      <div className="bg-[hsl(220,28%,9%)] rounded-lg border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading mb-3">Active Code References</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Steel Code', value: inputs.design_selection.steel_code },
            { label: 'Concrete Code', value: inputs.design_selection.concrete_code },
            { label: 'Anchor Code', value: inputs.design_selection.anchor_code },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[hsl(220,30%,6%)] rounded px-3 py-2">
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="text-xs font-mono text-[hsl(190,90%,60%)] mt-0.5 leading-tight">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCurrentStep('nlp')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(220,20%,16%)] hover:bg-[hsl(220,20%,20%)] text-muted-foreground hover:text-foreground border border-[hsl(220,20%,22%)] font-semibold text-sm rounded-lg transition-colors mb-3"
      >
        ✨ Use Natural Language Input
      </button>
      <button
        type="button"
        onClick={() => setCurrentStep('loads')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors"
      >
        Continue to Load Data
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
