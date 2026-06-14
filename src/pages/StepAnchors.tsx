import { useDesignStore } from '@/stores/designStore';
import { ANCHOR_GRADES, WELD_ELECTRODES } from '@/constants';
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

export function StepAnchors() {
  const { inputs, updateAnchorData, updateEmbedmentData, updateWeldData, setCurrentStep } = useDesignStore();
  const ad = inputs.anchor_data;
  const ed = inputs.embedment_data;
  const wd = inputs.weld_data;
  const isIS = inputs.design_selection.design_code === 'IS';
  const d_anc = ad.anchor_diameter_mm ?? 0;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Anchors, Embedment & Welds</h2>
        <p className="text-sm text-muted-foreground">Define anchor rod, embedment, and weld parameters.</p>
      </div>

      {/* Anchor Grade */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Anchor Rod / Bolt Grade</p>
        <div className="grid grid-cols-2 gap-2">
          {ANCHOR_GRADES.filter(g => isIS ? !g.grade.startsWith('ASTM') : !g.grade.startsWith('IS')).map((g) => (
            <button key={g.grade} type="button"
              onClick={() => updateAnchorData({ anchor_grade: g.grade, anchor_fy_mpa: g.fy_mpa, anchor_fu_mpa: g.fu_mpa })}
              className={cn('p-2 rounded border text-left text-xs transition-all',
                ad.anchor_grade === g.grade
                  ? 'bg-[hsl(190,90%,50%,0.1)] border-[hsl(190,90%,50%,0.5)]'
                  : 'border-[hsl(220,20%,20%)] hover:border-[hsl(220,20%,30%)]'
              )}>
              <p className="font-semibold text-foreground">{g.grade}</p>
              <p className="font-mono text-[10px] text-muted-foreground">Fy={g.fy_mpa} Fu={g.fu_mpa} MPa</p>
            </button>
          ))}
        </div>
      </div>

      {/* Anchor layout */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Anchor Layout</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Number of Anchors</p>
            <div className="flex gap-2">
              {[4, 6, 8, 12].map((n) => (
                <button key={n} type="button"
                  onClick={() => updateAnchorData({ anchor_count: n })}
                  className={cn('flex-1 py-1.5 text-xs font-mono rounded border transition-all',
                    ad.anchor_count === n
                      ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                      : 'border-[hsl(220,20%,22%)] text-muted-foreground'
                  )}>{n}</button>
              ))}
            </div>
          </div>
          <NumInput label="Anchor Diameter" unit="mm" value={ad.anchor_diameter_mm} onChange={(v) => updateAnchorData({ anchor_diameter_mm: v })} placeholder="e.g. 24" />
          <NumInput label="Edge Distance X" unit="mm" value={ad.edge_distance_x_mm} onChange={(v) => updateAnchorData({ edge_distance_x_mm: v })} placeholder="e.g. 75" />
          <NumInput label="Edge Distance Y" unit="mm" value={ad.edge_distance_y_mm} onChange={(v) => updateAnchorData({ edge_distance_y_mm: v })} placeholder="e.g. 75" />
          <NumInput label="Spacing X" unit="mm" value={ad.spacing_x_mm} onChange={(v) => updateAnchorData({ spacing_x_mm: v })} placeholder="e.g. 200" />
          <NumInput label="Spacing Y" unit="mm" value={ad.spacing_y_mm} onChange={(v) => updateAnchorData({ spacing_y_mm: v })} placeholder="e.g. 150" />
        </div>

        {/* Washer plate */}
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => updateAnchorData({ washer_plate_required: !ad.washer_plate_required })}
            className={cn('w-9 h-5 rounded-full border transition-all relative',
              ad.washer_plate_required ? 'bg-[hsl(190,90%,50%)] border-[hsl(190,90%,50%)]' : 'bg-transparent border-[hsl(220,20%,30%)]'
            )}>
            <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
              ad.washer_plate_required ? 'left-4' : 'left-0.5'
            )} />
          </button>
          <span className="text-xs text-muted-foreground">Washer plate required</span>
        </div>
      </div>

      {/* Embedment */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Embedment Data</p>
        {d_anc > 0 && (
          <div className="bg-[hsl(210,90%,60%,0.08)] border border-[hsl(210,90%,60%,0.25)] rounded px-3 py-2 text-xs text-[hsl(210,90%,65%)]">
            Preliminary: hef = 12×d = {12 * d_anc} mm | Min recommended: {10 * d_anc} mm
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Anchor Type</p>
            <div className="flex gap-2">
              {(['cast_in', 'post_installed'] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => updateEmbedmentData({ anchor_type: t })}
                  className={cn('flex-1 py-1.5 text-xs rounded border transition-all',
                    ed.anchor_type === t
                      ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                      : 'border-[hsl(220,20%,22%)] text-muted-foreground'
                  )}>{t === 'cast_in' ? 'Cast-in' : 'Post-Installed'}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Head Type</p>
            <div className="flex gap-2">
              {(['headed', 'hooked', 'straight'] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => updateEmbedmentData({ anchor_shape: t })}
                  className={cn('flex-1 py-1.5 text-[10px] rounded border transition-all capitalize',
                    ed.anchor_shape === t
                      ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                      : 'border-[hsl(220,20%,22%)] text-muted-foreground'
                  )}>{t}</button>
              ))}
            </div>
          </div>
          <NumInput label="Effective Embedment hef" unit="mm" value={ed.effective_embedment_hef_mm}
            onChange={(v) => updateEmbedmentData({ effective_embedment_hef_mm: v })}
            placeholder={d_anc > 0 ? `e.g. ${12 * d_anc}` : 'e.g. 300'} />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Concrete Condition</p>
            <div className="flex gap-2">
              {(['cracked', 'uncracked'] as const).map((t) => (
                <button key={t} type="button"
                  onClick={() => updateEmbedmentData({ concrete_condition: t })}
                  className={cn('flex-1 py-1.5 text-xs rounded border transition-all capitalize',
                    ed.concrete_condition === t
                      ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                      : 'border-[hsl(220,20%,22%)] text-muted-foreground'
                  )}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weld */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Weld Data (Column to Base Plate)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Weld Electrode</p>
            <select className="input-field w-full px-3 py-2 text-sm"
              value={wd.weld_electrode}
              onChange={(e) => {
                const el = WELD_ELECTRODES.find(x => x.electrode === e.target.value);
                updateWeldData({ weld_electrode: e.target.value, weld_fu_mpa: el?.fu_mpa ?? 482 });
              }}>
              {WELD_ELECTRODES.map(e => (
                <option key={e.electrode} value={e.electrode}>{e.electrode}</option>
              ))}
            </select>
          </div>
          <NumInput label="Weld Size (fillet leg)" unit="mm" value={wd.provided_weld_size_mm}
            onChange={(v) => updateWeldData({ provided_weld_size_mm: v })} placeholder="e.g. 8" />
        </div>
      </div>

      <button type="button" onClick={() => setCurrentStep('calculate')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors">
        Continue to Calculate
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
