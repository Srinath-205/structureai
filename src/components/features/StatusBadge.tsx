import type { CalcStatus } from '@/types';
import { CheckCircle, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CalcStatus | '';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  SAFE: { label: 'SAFE', icon: CheckCircle, color: 'text-[hsl(145,65%,42%)] bg-[hsl(145,65%,42%,0.12)] border-[hsl(145,65%,42%,0.35)]' },
  FAIL: { label: 'FAIL', icon: XCircle, color: 'text-[hsl(0,72%,55%)] bg-[hsl(0,72%,55%,0.12)] border-[hsl(0,72%,55%,0.35)]' },
  WARNING: { label: 'WARN', icon: AlertTriangle, color: 'text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%,0.12)] border-[hsl(38,92%,50%,0.35)]' },
  INFO: { label: 'INFO', icon: Info, color: 'text-[hsl(210,90%,60%)] bg-[hsl(210,90%,60%,0.12)] border-[hsl(210,90%,60%,0.35)]' },
  PENDING: { label: 'PENDING', icon: Clock, color: 'text-[hsl(215,15%,50%)] bg-[hsl(215,15%,50%,0.12)] border-[hsl(215,15%,50%,0.35)]' },
};

export function StatusBadge({ status, size = 'md', showIcon = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status || 'PENDING'] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5 gap-1' : size === 'lg' ? 'text-sm px-3 py-1.5 gap-2' : 'text-xs px-2 py-1 gap-1.5';
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12;

  return (
    <span className={cn('inline-flex items-center font-mono font-semibold rounded border', config.color, sizeClass, className)}>
      {showIcon && <Icon size={iconSize} />}
      {config.label}
    </span>
  );
}

interface UtilizationBarProps {
  ratio: number | null;
  label?: string;
  className?: string;
}

export function UtilizationBar({ ratio, label, className }: UtilizationBarProps) {
  if (ratio === null) return null;
  const pct = Math.min(ratio * 100, 100);
  const color = ratio > 1 ? 'bg-[hsl(0,72%,55%)]' : ratio > 0.85 ? 'bg-[hsl(38,92%,50%)]' : 'bg-[hsl(145,65%,42%)]';

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{label || 'Utilization'}</span>
        <span className={cn('font-mono font-semibold', ratio > 1 ? 'text-[hsl(0,72%,55%)]' : ratio > 0.85 ? 'text-[hsl(38,92%,50%)]' : 'text-[hsl(145,65%,42%)]')}>
          {(ratio * 100).toFixed(1)}%
        </span>
      </div>
      <div className="utilization-bar">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
