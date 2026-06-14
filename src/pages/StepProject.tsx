import { useDesignStore } from '@/stores/designStore';
import { FolderOpen, User, Hash, Calendar, FileEdit, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepProject() {
  const { inputs, updateProjectInfo, setCurrentStep } = useDesignStore();
  const info = inputs.project_info;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Hero */}
      <div className="rounded-xl overflow-hidden border border-[hsl(220,20%,18%)]">
        <div className="bg-gradient-to-r from-[hsl(220,30%,8%)] to-[hsl(220,28%,10%)] px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(190,90%,50%,0.15)] border border-[hsl(190,90%,50%,0.4)] flex items-center justify-center">
              <FolderOpen size={20} className="text-[hsl(190,90%,50%)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">StructAI BasePlate</h1>
              <p className="text-xs text-[hsl(190,90%,50%)]">AISC & IS Code Steel Base Plate Design</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            Deterministic engineering calculations per AISC LRFD, AISC ASD, and IS 800:2007.
            Full bearing, thickness, anchor, weld, and embedment checks with transparent formulas.
          </p>
        </div>
      </div>

      {/* Project info */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-6 space-y-4">
        <p className="section-heading">Project Information</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Project Name *</label>
            <input
              type="text"
              className="input-field w-full px-3 py-2 text-sm"
              placeholder="e.g. Industrial Plant Column Base Plates"
              value={info.project_name}
              onChange={(e) => updateProjectInfo({ project_name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Project Number</label>
            <input
              type="text"
              className="input-field w-full px-3 py-2 text-sm"
              placeholder="e.g. P-2024-001"
              value={info.project_number}
              onChange={(e) => updateProjectInfo({ project_number: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Revision</label>
            <input
              type="text"
              className="input-field w-full px-3 py-2 text-sm"
              placeholder="R0"
              value={info.revision}
              onChange={(e) => updateProjectInfo({ revision: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Designer</label>
            <input
              type="text"
              className="input-field w-full px-3 py-2 text-sm"
              placeholder="Engineer name"
              value={info.designer}
              onChange={(e) => updateProjectInfo({ designer: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Checker</label>
            <input
              type="text"
              className="input-field w-full px-3 py-2 text-sm"
              placeholder="Reviewer name"
              value={info.checker}
              onChange={(e) => updateProjectInfo({ checker: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date</label>
            <input
              type="date"
              className="input-field w-full px-3 py-2 text-sm"
              value={info.date}
              onChange={(e) => updateProjectInfo({ date: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <textarea
              className="input-field w-full px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Optional engineering notes..."
              value={info.notes}
              onChange={(e) => updateProjectInfo({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCurrentStep('design_code')}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(190,90%,50%)] hover:bg-[hsl(190,90%,45%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg transition-colors"
      >
        Continue to Design Code Selection
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
