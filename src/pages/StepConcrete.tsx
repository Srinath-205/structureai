import { useDesignStore } from '@/stores/designStore';
import { CONCRETE_GRADES_ACI, CONCRETE_GRADES_IS } from '@/constants';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function NumInput({ label, unit, value, onChange, placeholder }: {
  label: string; unit?: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <input type="number" className="input-field w-full px-3 py-2 text-sm pr-12"
          placeholder={placeholder ?? '—'} value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))} />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{unit}</span>}
      </div>
    </div>
  );
}

export function StepConcrete() {
  const { inputs, updateConcreteData, setCurrentStep } = useDesignStore();
  const cnd = inputs.concrete_data;
  const isIS = inputs.design_selection.design_code === 'IS';
  const grades = isIS ? CONCRETE_GRADES_IS : CONCRETE_GRADES_ACI;

  // Confinement preview
  const N = inputs.base_plate_data.plate_length_N_mm ?? 0;
  const B = inputs.base_plate_data.plate_width_B_mm ?? 0;
  const A1 = N * B;
  const pL = cnd.pedestal_length_mm ?? 0;
  const pW = cnd.pedestal_width_mm ?? 0;
  const A2 = pL * pW;
  const confinement = A1 > 0 && A2 > 0 ? Math.min(Math.sqrt(A2 / A1), 2.0) : null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Concrete / Pedestal Data</h2>
        <p className="text-sm text-muted-foreground">Define concrete strength and supporting element geometry.</p>
      </div>

      {/* Concrete grade */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-3">
        <p className="section-heading">Concrete Grade</p>
        <div className="grid grid-cols-2 gap-2">
          {grades.map((g) => {
            const isGrade = isIS
              ? cnd.fck_mpa === (g as { fck_mpa: number }).fck_mpa
              : cnd.fc_prime_mpa === (g as { fc_prime_mpa: number }).fc_prime_mpa;
            return (
              <button key={g.grade} type="button"
                onClick={() => isIS
                  ? updateConcreteData({ concrete_grade: g.grade, fck_mpa: (g as { fck_mpa: number }).fck_mpa })
                  : updateConcreteData({ concrete_grade: g.grade, fc_prime_mpa: (g as { fc_prime_mpa: number }).fc_prime_mpa })}
                className={cn('p-2.5 rounded border text-left transition-all',
                  isGrade
                    ? 'bg-[hsl(190,90%,50%,0.1)] border-[hsl(190,90%,50%,0.5)]'
                    : 'border-[hsl(220,20%,20%)] hover:border-[hsl(220,20%,30%)]'
                )}
              >
                <p className="text-sm font-semibold text-foreground">{g.grade}</p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {isIS ? `fck = ${(g as { fck_mpa: number }).fck_mpa} MPa` : `f'c = ${(g as { fc_prime_mpa: number }).fc_prime_mpa} MPa`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pedestal geometry */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="section-heading">Pedestal / Support Geometry</p>
          <div className="flex gap-2">
            {(['pedestal', 'slab'] as const).map((t) => (
              <button key={t} type="button"
                onClick={() => updateConcreteData({ slab_or_pedestal: t })}
                className={cn('px-2.5 py-1 text-xs rounded border transition-all capitalize',
                  cnd.slab_or_pedestal === t
                    ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                    : 'border-[hsl(220,20%,22%)] text-muted-foreground'
                )}>{t}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <NumInput label={`${cnd.slab_or_pedestal === 'slab' ? 'Slab' : 'Pedestal'} Length`} unit="mm" value={cnd.pedestal_length_mm} onChange={(v) => updateConcreteData({ pedestal_length_mm: v })} placeholder="e.g. 600" />
          <NumInput label={`${cnd.slab_or_pedestal === 'slab' ? 'Slab' : 'Pedestal'} Width`} unit="mm" value={cnd.pedestal_width_mm} onChange={(v) => updateConcreteData({ pedestal_width_mm: v })} placeholder="e.g. 600" />
          <NumInput label="Depth / Thickness" unit="mm" value={cnd.pedestal_depth_mm} onChange={(v) => updateConcreteData({ pedestal_depth_mm: v })} placeholder="e.g. 800" />
        </div>

        {/* Confinement preview */}
        {confinement !== null && (
          <div className="bg-[hsl(220,30%,6%)] rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">Live Confinement Check</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">A1 (Plate)</p>
                <p className="font-mono text-xs text-foreground">{A1.toLocaleString()} mm²</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">A2 (Pedestal)</p>
                <p className="font-mono text-xs text-foreground">{A2.toLocaleString()} mm²</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">√(A2/A1) ≤ 2.0</p>
                <p className={cn('font-mono text-sm font-bold', confinement >= 1.5 ? 'text-[hsl(145,65%,42%)]' : 'text-[hsl(38,92%,50%)]')}>
                  {confinement.toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button type="button" onClick={() => setCurrentStep('anchors')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors">
        Continue to Anchors & Welds
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
