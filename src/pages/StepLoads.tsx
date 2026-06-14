import { useDesignStore } from '@/stores/designStore';
import { ArrowDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function NumInput({ label, unit, value, onChange, placeholder }: {
  label: string; unit: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          className="input-field w-full px-3 py-2 text-sm pr-12"
          placeholder={placeholder ?? '0'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{unit}</span>
      </div>
    </div>
  );
}

export function StepLoads() {
  const { inputs, updateLoadData, setCurrentStep } = useDesignStore();
  const ld = inputs.load_data;
  const isIS = inputs.design_selection.design_code === 'IS';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ArrowDown size={18} className="text-[hsl(190,90%,50%)]" />
          <h2 className="text-lg font-bold text-foreground">Load Data</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter {ld.load_type === 'factored' ? 'factored (LRFD/LSM)' : 'service (ASD)'} loads at column base.
        </p>
      </div>

      {/* Load type toggles */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Load Classification</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Load Type</p>
            <div className="flex gap-2">
              {(['factored', 'service'] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => updateLoadData({ load_type: t })}
                  className={cn('flex-1 py-1.5 text-xs rounded border transition-all capitalize',
                    ld.load_type === t
                      ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                      : 'border-[hsl(220,20%,22%)] text-muted-foreground hover:border-[hsl(220,20%,30%)]'
                  )}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Axial Direction</p>
            <div className="flex gap-2">
              {(['compression', 'uplift'] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => updateLoadData({ axial_load_type: t })}
                  className={cn('flex-1 py-1.5 text-xs rounded border transition-all capitalize',
                    ld.axial_load_type === t
                      ? t === 'uplift'
                        ? 'bg-[hsl(0,72%,55%,0.15)] border-[hsl(0,72%,55%,0.5)] text-[hsl(0,72%,65%)]'
                        : 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                      : 'border-[hsl(220,20%,22%)] text-muted-foreground hover:border-[hsl(220,20%,30%)]'
                  )}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Load Combination</label>
          <input
            type="text"
            className="input-field w-full px-3 py-2 text-sm"
            placeholder={isIS ? 'e.g. 1.5(DL+LL)' : 'e.g. 1.2D + 1.6L'}
            value={ld.load_combination}
            onChange={(e) => updateLoadData({ load_combination: e.target.value })}
          />
        </div>
      </div>

      {/* Load values */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Applied Loads</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput
            label="Axial Load P"
            unit="kN"
            value={ld.axial_load_kn}
            onChange={(v) => updateLoadData({ axial_load_kn: v })}
            placeholder="e.g. 850"
          />
          <NumInput
            label="Major Axis Moment Mx"
            unit="kNm"
            value={ld.moment_major_knm}
            onChange={(v) => updateLoadData({ moment_major_knm: v })}
            placeholder="e.g. 60"
          />
          <NumInput
            label="Minor Axis Moment My"
            unit="kNm"
            value={ld.moment_minor_knm}
            onChange={(v) => updateLoadData({ moment_minor_knm: v })}
            placeholder="e.g. 0"
          />
          <NumInput
            label="Base Shear Vx"
            unit="kN"
            value={ld.shear_x_kn}
            onChange={(v) => updateLoadData({ shear_x_kn: v })}
            placeholder="e.g. 40"
          />
          <NumInput
            label="Base Shear Vy"
            unit="kN"
            value={ld.shear_y_kn}
            onChange={(v) => updateLoadData({ shear_y_kn: v })}
            placeholder="e.g. 0"
          />
        </div>

        {/* Live eccentricity preview */}
        {ld.axial_load_kn && ld.moment_major_knm && (
          <div className="bg-[hsl(220,30%,6%)] rounded-lg border border-[hsl(220,20%,18%)] p-3">
            <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">Live Preview</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Eccentricity ex</p>
                <p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">
                  {((Math.abs(ld.moment_major_knm) * 1000) / Math.abs(ld.axial_load_kn)).toFixed(1)} mm
                </p>
              </div>
              {ld.moment_minor_knm !== null && ld.moment_minor_knm !== 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground">Eccentricity ey</p>
                  <p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">
                    {((Math.abs(ld.moment_minor_knm) * 1000) / Math.abs(ld.axial_load_kn)).toFixed(1)} mm
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground">Shear Resultant</p>
                <p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">
                  {Math.sqrt(Math.pow(ld.shear_x_kn ?? 0, 2) + Math.pow(ld.shear_y_kn ?? 0, 2)).toFixed(1)} kN
                </p>
              </div>
            </div>
            {/* Biaxial warning */}
            {ld.moment_minor_knm !== null && Math.abs(ld.moment_minor_knm) > 0.5 && (
              <div className="mt-2 pt-2 border-t border-[hsl(220,20%,18%)] flex items-center gap-2">
                <span className="text-[hsl(38,92%,55%)] text-[10px] font-semibold">⚡ BIAXIAL MOMENT DETECTED</span>
                <span className="text-muted-foreground text-[10px]">— 4-corner pressure analysis will be applied</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setCurrentStep('column')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors"
      >
        Continue to Column Data
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
