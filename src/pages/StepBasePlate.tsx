import { useDesignStore } from '@/stores/designStore';
import { STEEL_GRADES_AISC, STEEL_GRADES_IS } from '@/constants';
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

export function StepBasePlate() {
  const { inputs, updateBasePlateData, setCurrentStep } = useDesignStore();
  const bpd = inputs.base_plate_data;
  const isIS = inputs.design_selection.design_code === 'IS';
  const grades = isIS ? STEEL_GRADES_IS : STEEL_GRADES_AISC;

  // Auto-size hints
  const cd = inputs.column_data;
  const projection = 75;
  let hint_N = 0, hint_B = 0;
  if (cd.depth_mm) { hint_N = cd.depth_mm + 2 * projection; hint_B = (cd.flange_width_mm ?? cd.depth_mm) + 2 * projection; }
  else if (cd.hss_depth_mm) { hint_N = cd.hss_depth_mm + 2 * projection; hint_B = (cd.hss_width_mm ?? cd.hss_depth_mm) + 2 * projection; }
  else if (cd.pipe_outer_diameter_mm) { hint_N = cd.pipe_outer_diameter_mm + 2 * projection; hint_B = hint_N; }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Base Plate Geometry</h2>
        <p className="text-sm text-muted-foreground">Define plate size, thickness, and material.</p>
      </div>

      {hint_N > 0 && (
        <div className="bg-[hsl(210,90%,60%,0.08)] border border-[hsl(210,90%,60%,0.3)] rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[hsl(210,90%,65%)] font-semibold">Auto-Size Suggestion</p>
            <p className="text-xs text-muted-foreground mt-0.5">Minimum: N ≥ {hint_N} mm, B ≥ {hint_B} mm (column + 75mm each side)</p>
          </div>
          <button type="button"
            onClick={() => updateBasePlateData({ plate_length_N_mm: hint_N, plate_width_B_mm: hint_B })}
            className="text-xs text-[hsl(210,90%,60%)] border border-[hsl(210,90%,60%,0.4)] px-3 py-1.5 rounded hover:bg-[hsl(210,90%,60%,0.1)] transition-colors">
            Apply
          </button>
        </div>
      )}

      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Plate Dimensions</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="Plate Length N (parallel to depth)" unit="mm" value={bpd.plate_length_N_mm} onChange={(v) => updateBasePlateData({ plate_length_N_mm: v })} placeholder="e.g. 450" />
          <NumInput label="Plate Width B (parallel to flange)" unit="mm" value={bpd.plate_width_B_mm} onChange={(v) => updateBasePlateData({ plate_width_B_mm: v })} placeholder="e.g. 350" />
          <NumInput label="Plate Thickness tp" unit="mm" value={bpd.provided_thickness_tp_mm} onChange={(v) => updateBasePlateData({ provided_thickness_tp_mm: v })} placeholder="e.g. 32" />
          <NumInput label="Grout Thickness" unit="mm" value={bpd.grout_thickness_mm} onChange={(v) => updateBasePlateData({ grout_thickness_mm: v })} placeholder="25" />
        </div>

        {/* Live area */}
        {bpd.plate_length_N_mm && bpd.plate_width_B_mm && (
          <div className="bg-[hsl(220,30%,6%)] rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">Plate Area Preview</p>
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground">A1 = N × B</p>
                <p className="font-mono text-sm text-[hsl(190,90%,60%)]">
                  {(bpd.plate_length_N_mm * bpd.plate_width_B_mm / 1e6).toFixed(4)} m² ({(bpd.plate_length_N_mm * bpd.plate_width_B_mm).toLocaleString()} mm²)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plate steel grade */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-3">
        <p className="section-heading">Plate Steel Grade</p>
        <div className="grid grid-cols-2 gap-2">
          {grades.map((g) => (
            <button key={g.grade} type="button"
              onClick={() => updateBasePlateData({ plate_steel_grade: g.grade, plate_fy_mpa: g.fy_mpa, plate_fu_mpa: g.fu_mpa })}
              className={cn('p-2 rounded border text-left transition-all text-xs',
                bpd.plate_steel_grade === g.grade
                  ? 'bg-[hsl(190,90%,50%,0.1)] border-[hsl(190,90%,50%,0.5)]'
                  : 'border-[hsl(220,20%,20%)] hover:border-[hsl(220,20%,30%)]'
              )}
            >
              <p className="font-semibold text-foreground">{g.grade}</p>
              <p className="font-mono text-muted-foreground text-[10px]">Fy={g.fy_mpa} Fu={g.fu_mpa} MPa</p>
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={() => setCurrentStep('concrete')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors">
        Continue to Concrete / Pedestal
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
