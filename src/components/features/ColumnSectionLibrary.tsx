import { useState, useMemo } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { ALL_SECTIONS, type SteelSection } from '@/lib/sections/aisc-sections';
import { Search, ChevronRight, BookOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTION_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'W', label: 'W (AISC)' },
  { id: 'I', label: 'I/ISMB (IS)' },
];

export function ColumnSectionLibrary({ onClose }: { onClose?: () => void }) {
  const { inputs, updateColumnData } = useDesignStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'W' | 'I'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ALL_SECTIONS.filter((s) => {
      const matchType = typeFilter === 'all' || s.type === typeFilter;
      const matchSearch = search === '' || s.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [search, typeFilter]);

  const handleSelect = (sec: SteelSection) => {
    setSelected(sec.name);
    updateColumnData({
      section_name: sec.name,
      column_type: sec.type as 'W' | 'I',
      depth_mm: sec.d_mm,
      flange_width_mm: sec.bf_mm,
      flange_thickness_mm: sec.tf_mm,
      web_thickness_mm: sec.tw_mm,
    });
    if (sec.standard === 'IS') {
      updateColumnData({ steel_grade: 'E250 (Fe 410)', fy_mpa: 250, fu_mpa: 410 });
    } else {
      updateColumnData({ steel_grade: 'A992', fy_mpa: 345, fu_mpa: 448 });
    }
    setTimeout(() => { if (onClose) onClose(); }, 600);
  };

  const currentSection = inputs.column_data.section_name;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 border-b border-[hsl(220,20%,14%)] space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            className="input-field w-full pl-8 pr-3 py-2 text-sm"
            placeholder="Search section... e.g. W12 or ISMB 300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-1.5">
          {SECTION_TYPES.map(({ id, label }) => (
            <button key={id} type="button"
              onClick={() => setTypeFilter(id as typeof typeFilter)}
              className={cn('px-2.5 py-1 text-xs rounded border transition-all',
                typeFilter === id
                  ? 'bg-[hsl(190,90%,50%,0.15)] border-[hsl(190,90%,50%,0.5)] text-[hsl(190,90%,60%)]'
                  : 'border-[hsl(220,20%,22%)] text-muted-foreground hover:border-[hsl(220,20%,30%)]'
              )}>
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} sections</span>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-6 gap-1 px-3 py-2 border-b border-[hsl(220,20%,14%)] bg-[hsl(220,28%,7%)]">
        {['Section', 'd (mm)', 'bf (mm)', 'tf (mm)', 'tw (mm)', 'kg/m'].map((h) => (
          <p key={h} className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</p>
        ))}
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((sec) => {
          const isActive = currentSection === sec.name || selected === sec.name;
          return (
            <button key={sec.name} type="button"
              onClick={() => handleSelect(sec)}
              className={cn(
                'w-full grid grid-cols-6 gap-1 px-3 py-2.5 text-left transition-all border-b border-[hsl(220,20%,10%)] hover:bg-[hsl(220,28%,12%)]',
                isActive ? 'bg-[hsl(190,90%,50%,0.08)] border-l-2 border-l-[hsl(190,90%,50%)]' : ''
              )}>
              <div className="flex items-center gap-1.5">
                {isActive && <Check size={10} className="text-[hsl(190,90%,50%)] shrink-0" />}
                <span className={cn('text-xs font-semibold font-mono', isActive ? 'text-[hsl(190,90%,60%)]' : 'text-foreground')}>
                  {sec.name}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{sec.d_mm}</span>
              <span className="text-xs font-mono text-muted-foreground">{sec.bf_mm}</span>
              <span className="text-xs font-mono text-muted-foreground">{sec.tf_mm}</span>
              <span className="text-xs font-mono text-muted-foreground">{sec.tw_mm}</span>
              <span className="text-xs font-mono text-muted-foreground">{sec.weight_kgm?.toFixed(1) ?? '—'}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen size={32} className="text-muted-foreground opacity-30 mb-2" />
            <p className="text-sm text-muted-foreground">No sections match "{search}"</p>
          </div>
        )}
      </div>

      {/* Selected preview */}
      {currentSection && (
        <div className="p-3 border-t border-[hsl(220,20%,14%)] bg-[hsl(220,28%,7%)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Selected</p>
              <p className="font-mono text-sm font-bold text-[hsl(190,90%,60%)]">{currentSection}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                d={inputs.column_data.depth_mm}mm · bf={inputs.column_data.flange_width_mm}mm
              </p>
            </div>
            {onClose && (
              <button type="button" onClick={onClose}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[hsl(190,90%,50%)] text-[hsl(220,30%,7%)] font-semibold rounded-lg">
                Confirm <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
