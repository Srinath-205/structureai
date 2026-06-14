import { useDesignStore } from '@/stores/designStore';
import { WORKFLOW_STEPS } from '@/constants';
import type { WorkflowStep } from '@/types';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_ICONS: Record<string, React.ReactNode> = {
  FolderOpen: '📁',
  BookOpen: '📐',
  Sparkles: '✨',
  ArrowDown: '⬇',
  Columns3: '🏗',
  Square: '⬜',
  Box: '🧱',
  Anchor: '⚓',
  Calculator: '🔢',
  FileText: '📄',
};

export function Sidebar() {
  const { currentStep, setCurrentStep, inputs, hasResults } = useDesignStore();

  const isStepComplete = (stepId: string): boolean => {
    switch (stepId) {
      case 'project': return !!inputs.project_info.project_name;
      case 'design_code': return !!inputs.design_selection.design_code;
      case 'nlp': return true; // optional step, always accessible
      case 'loads': return inputs.load_data.axial_load_kn !== null;
      case 'column': return inputs.column_data.depth_mm !== null || inputs.column_data.pipe_outer_diameter_mm !== null;
      case 'baseplate': return inputs.base_plate_data.plate_length_N_mm !== null;
      case 'concrete': return inputs.concrete_data.fc_prime_mpa !== null || inputs.concrete_data.fck_mpa !== null;
      case 'anchors': return inputs.anchor_data.anchor_diameter_mm !== null;
      case 'calculate': return hasResults;
      case 'results': return hasResults;
      default: return false;
    }
  };

  return (
    <aside className="w-56 bg-[hsl(220,32%,8%)] border-r border-[hsl(220,20%,14%)] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[hsl(220,20%,14%)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[hsl(190,90%,50%,0.15)] border border-[hsl(190,90%,50%,0.4)] flex items-center justify-center">
            <span className="text-[hsl(190,90%,50%)] text-xs font-bold">S</span>
          </div>
          <div>
            <p className="text-xs font-bold text-foreground leading-none">StructAI</p>
            <p className="text-[10px] text-[hsl(190,90%,50%)] leading-none mt-0.5">BasePlate</p>
          </div>
        </div>
      </div>

      {/* Design method badge */}
      <div className="px-4 py-2 border-b border-[hsl(220,20%,14%)]">
        <div className="bg-[hsl(190,90%,50%,0.08)] rounded px-2 py-1.5 border border-[hsl(190,90%,50%,0.2)]">
          <p className="text-[10px] text-muted-foreground">Active Code</p>
          <p className="text-xs font-semibold text-[hsl(190,90%,60%)] font-mono">
            {inputs.design_selection.steel_code} · {inputs.design_selection.design_method}
          </p>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Workflow</p>
        {WORKFLOW_STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isComplete = isStepComplete(step.id);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id as WorkflowStep)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group',
                isActive
                  ? 'bg-[hsl(190,90%,50%,0.1)] border-r-2 border-[hsl(190,90%,50%)]'
                  : 'hover:bg-[hsl(220,25%,12%)] border-r-2 border-transparent'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 transition-all',
                isActive
                  ? 'bg-[hsl(190,90%,50%)] text-[hsl(220,30%,7%)]'
                  : isComplete
                  ? 'bg-[hsl(145,65%,42%,0.2)] border border-[hsl(145,65%,42%,0.5)] text-[hsl(145,65%,42%)]'
                  : 'border border-[hsl(220,20%,25%)] text-muted-foreground'
              )}>
                {isComplete && !isActive ? <CheckCircle size={12} /> : idx + 1}
              </div>
              <span className={cn(
                'text-xs font-medium leading-tight',
                isActive ? 'text-[hsl(190,90%,60%)]' : isComplete ? 'text-[hsl(210,20%,75%)]' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
              {isActive && <ChevronRight size={12} className="ml-auto text-[hsl(190,90%,50%)]" />}
            </button>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="px-4 py-3 border-t border-[hsl(220,20%,14%)]">
        <p className="text-[10px] text-muted-foreground">
          Project: <span className="text-foreground">{inputs.project_info.project_name || 'Untitled'}</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Rev: <span className="font-mono">{inputs.project_info.revision}</span>
        </p>
      </div>
    </aside>
  );
}
