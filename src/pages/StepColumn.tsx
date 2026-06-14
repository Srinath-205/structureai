import { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import type { ColumnType } from '@/types';
import { STEEL_GRADES_AISC, STEEL_GRADES_IS } from '@/constants';
import { ChevronRight, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColumnSectionLibrary } from '@/components/features/ColumnSectionLibrary';

function NumInput({ label, unit, value, onChange, placeholder }: {
  label: string; unit?: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          className="input-field w-full px-3 py-2 text-sm pr-12"
          placeholder={placeholder ?? '—'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{unit}</span>}
      </div>
    </div>
  );
}

const COLUMN_TYPES: { type: ColumnType; label: string; desc: string }[] = [
  { type: 'W', label: 'W-Section', desc: 'Wide flange' },
  { type: 'I', label: 'I-Section', desc: 'I-beam / ISMB' },
  { type: 'HSS_Rect', label: 'HSS Rect', desc: 'Rectangular tube' },
  { type: 'HSS_Square', label: 'HSS Square', desc: 'Square tube' },
  { type: 'HSS_Circ', label: 'HSS Circ', desc: 'CHS tube' },
  { type: 'Pipe', label: 'Pipe', desc: 'Circular pipe' },
];

export function StepColumn() {
  const { inputs, updateColumnData, setCurrentStep } = useDesignStore();
  const cd = inputs.column_data;
  const isIS = inputs.design_selection.design_code === 'IS';
  const grades = isIS ? STEEL_GRADES_IS : STEEL_GRADES_AISC;
  const [showLibrary, setShowLibrary] = useState(false);

  const isWI = cd.column_type === 'W' || cd.column_type === 'I';
  const isHSSRect = cd.column_type === 'HSS_Rect' || cd.column_type === 'HSS_Square';
  const isCirc = cd.column_type === 'HSS_Circ' || cd.column_type === 'Pipe';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Column Section Data</h2>
        <p className="text-sm text-muted-foreground">Select column type and enter cross-section dimensions.</p>
      </div>

      {/* Column type */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-heading">Column Type</p>
          <button type="button" onClick={() => setShowLibrary(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[hsl(190,90%,50%,0.4)] text-[hsl(190,90%,60%)] hover:bg-[hsl(190,90%,50%,0.1)] transition-colors">
            <BookOpen size={12} />
            Section Library
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {COLUMN_TYPES.map(({ type, label, desc }) => (
            <button key={type} type="button"
              onClick={() => updateColumnData({ column_type: type })}
              className={cn('p-3 rounded-lg border text-left transition-all',
                cd.column_type === type
                  ? 'bg-[hsl(190,90%,50%,0.1)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                  : 'border-[hsl(220,20%,20%)] text-muted-foreground hover:border-[hsl(220,20%,30%)]'
              )}
            >
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Section name with library button */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Section Designation</label>
          <div className="relative">
            <input
              type="text"
              className="input-field w-full px-3 py-2 text-sm pr-32"
              placeholder={isIS ? 'e.g. ISMB 300, ISSC 200' : 'e.g. W12×96, HSS 8×8×1/2'}
              value={cd.section_name}
              onChange={(e) => updateColumnData({ section_name: e.target.value })}
            />
            <button type="button" onClick={() => setShowLibrary(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[hsl(190,90%,60%)] border border-[hsl(190,90%,50%,0.4)] px-2 py-1 rounded hover:bg-[hsl(190,90%,50%,0.1)] transition-colors">
              Browse
            </button>
          </div>
        </div>

        {/* Show selected section summary */}
        {cd.depth_mm && (
          <div className="bg-[hsl(190,90%,50%,0.06)] border border-[hsl(190,90%,50%,0.2)] rounded-lg p-3 grid grid-cols-4 gap-3">
            <div><p className="text-[9px] text-muted-foreground">d</p><p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">{cd.depth_mm} mm</p></div>
            <div><p className="text-[9px] text-muted-foreground">bf</p><p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">{cd.flange_width_mm ?? '—'} mm</p></div>
            <div><p className="text-[9px] text-muted-foreground">tf</p><p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">{cd.flange_thickness_mm ?? '—'} mm</p></div>
            <div><p className="text-[9px] text-muted-foreground">tw</p><p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">{cd.web_thickness_mm ?? '—'} mm</p></div>
          </div>
        )}
      </div>

      {/* Dimensions — manual override */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-4">
        <p className="section-heading">Section Dimensions <span className="text-[10px] text-muted-foreground font-normal">(auto-filled from library or enter manually)</span></p>
        <div className="grid grid-cols-2 gap-4">
          {isWI && (<>
            <NumInput label="Overall Depth d" unit="mm" value={cd.depth_mm} onChange={(v) => updateColumnData({ depth_mm: v })} placeholder="e.g. 300" />
            <NumInput label="Flange Width bf" unit="mm" value={cd.flange_width_mm} onChange={(v) => updateColumnData({ flange_width_mm: v })} placeholder="e.g. 150" />
            <NumInput label="Flange Thickness tf" unit="mm" value={cd.flange_thickness_mm} onChange={(v) => updateColumnData({ flange_thickness_mm: v })} placeholder="e.g. 10.9" />
            <NumInput label="Web Thickness tw" unit="mm" value={cd.web_thickness_mm} onChange={(v) => updateColumnData({ web_thickness_mm: v })} placeholder="e.g. 7.5" />
          </>)}
          {isHSSRect && (<>
            <NumInput label="HSS Depth H" unit="mm" value={cd.hss_depth_mm} onChange={(v) => updateColumnData({ hss_depth_mm: v })} placeholder="e.g. 200" />
            <NumInput label="HSS Width B" unit="mm" value={cd.hss_width_mm} onChange={(v) => updateColumnData({ hss_width_mm: v })} placeholder="e.g. 200" />
            <NumInput label="Wall Thickness t" unit="mm" value={cd.hss_wall_thickness_mm} onChange={(v) => updateColumnData({ hss_wall_thickness_mm: v })} placeholder="e.g. 9.5" />
          </>)}
          {isCirc && (<>
            <NumInput label="Outer Diameter D" unit="mm" value={cd.pipe_outer_diameter_mm} onChange={(v) => updateColumnData({ pipe_outer_diameter_mm: v })} placeholder="e.g. 219.1" />
            <NumInput label="Wall Thickness t" unit="mm" value={cd.pipe_wall_thickness_mm} onChange={(v) => updateColumnData({ pipe_wall_thickness_mm: v })} placeholder="e.g. 8" />
          </>)}
        </div>
      </div>

      {/* Steel grade */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4 space-y-3">
        <p className="section-heading">Column Steel Grade</p>
        <div className="grid grid-cols-2 gap-2">
          {grades.map((g) => (
            <button key={g.grade} type="button"
              onClick={() => updateColumnData({ steel_grade: g.grade, fy_mpa: g.fy_mpa, fu_mpa: g.fu_mpa })}
              className={cn('p-2 rounded border text-left transition-all text-xs',
                cd.steel_grade === g.grade
                  ? 'bg-[hsl(190,90%,50%,0.1)] border-[hsl(190,90%,50%,0.5)]'
                  : 'border-[hsl(220,20%,20%)] hover:border-[hsl(220,20%,30%)]'
              )}
            >
              <p className="font-semibold text-foreground">{g.grade}</p>
              <p className="font-mono text-muted-foreground text-[10px]">Fy={g.fy_mpa} Fu={g.fu_mpa} MPa</p>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <NumInput label="Fy (override)" unit="MPa" value={cd.fy_mpa} onChange={(v) => updateColumnData({ fy_mpa: v })} />
          <NumInput label="Fu (override)" unit="MPa" value={cd.fu_mpa} onChange={(v) => updateColumnData({ fu_mpa: v })} />
        </div>
      </div>

      <button type="button" onClick={() => setCurrentStep('baseplate')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors">
        Continue to Base Plate
        <ChevronRight size={16} />
      </button>

      {/* Section Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-[hsl(220,28%,9%)] rounded-2xl border border-[hsl(220,20%,22%)] w-full max-w-xl h-[580px] flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-[hsl(220,20%,14%)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[hsl(190,90%,50%)]" />
                <h3 className="text-sm font-semibold text-foreground">Section Library</h3>
                <span className="text-xs text-muted-foreground">AISC W-Sections & IS ISMB/ISSC</span>
              </div>
              <button type="button" onClick={() => setShowLibrary(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ColumnSectionLibrary onClose={() => setShowLibrary(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
