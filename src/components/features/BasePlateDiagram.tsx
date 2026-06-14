import type { DesignInputs, DesignResults } from '@/types';

interface DiagramProps {
  inputs: DesignInputs;
  results: DesignResults | null;
  className?: string;
}

function fmt(v: number | null, digits = 0) {
  if (v === null) return '—';
  return v.toFixed(digits);
}

export function BasePlateDiagram({ inputs, results, className = '' }: DiagramProps) {
  const { base_plate_data: bpd, column_data: cd, concrete_data: cnd, anchor_data: ad } = inputs;

  // Canvas dimensions
  const W = 540;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2 + 20;

  // Scale
  const maxDim = Math.max(
    bpd.plate_length_N_mm ?? 400,
    bpd.plate_width_B_mm ?? 350,
    cnd.pedestal_length_mm ?? 500,
    cnd.pedestal_width_mm ?? 500,
  );
  const scale = Math.min(120 / maxDim, 0.35);

  const N = (bpd.plate_length_N_mm ?? 400) * scale;
  const B = (bpd.plate_width_B_mm ?? 350) * scale;
  const pL = (cnd.pedestal_length_mm ?? (bpd.plate_length_N_mm ?? 400) + 100) * scale;
  const pW = (cnd.pedestal_width_mm ?? (bpd.plate_width_B_mm ?? 350) + 100) * scale;

  // Column footprint
  const colD = ((cd.depth_mm ?? cd.hss_depth_mm ?? cd.pipe_outer_diameter_mm ?? 200) * scale);
  const colB = ((cd.flange_width_mm ?? cd.hss_width_mm ?? cd.pipe_outer_diameter_mm ?? 150) * scale);

  // Anchor positions (rectangular layout)
  const nAnchors = ad.anchor_count ?? 4;
  const edgeX = ad.edge_distance_x_mm ? ad.edge_distance_x_mm * scale : N * 0.15;
  const edgeY = ad.edge_distance_y_mm ? ad.edge_distance_y_mm * scale : B * 0.15;
  const anchorR = Math.min(3.5, (ad.anchor_diameter_mm ?? 24) * scale * 0.7);

  const anchors: { x: number; y: number }[] = [];
  if (nAnchors === 4) {
    anchors.push(
      { x: cx - N / 2 + edgeX, y: cy - B / 2 + edgeY },
      { x: cx + N / 2 - edgeX, y: cy - B / 2 + edgeY },
      { x: cx - N / 2 + edgeX, y: cy + B / 2 - edgeY },
      { x: cx + N / 2 - edgeX, y: cy + B / 2 - edgeY },
    );
  } else if (nAnchors === 6) {
    anchors.push(
      { x: cx - N / 2 + edgeX, y: cy - B / 2 + edgeY },
      { x: cx, y: cy - B / 2 + edgeY },
      { x: cx + N / 2 - edgeX, y: cy - B / 2 + edgeY },
      { x: cx - N / 2 + edgeX, y: cy + B / 2 - edgeY },
      { x: cx, y: cy + B / 2 - edgeY },
      { x: cx + N / 2 - edgeX, y: cy + B / 2 - edgeY },
    );
  } else if (nAnchors === 8) {
    anchors.push(
      { x: cx - N / 2 + edgeX, y: cy - B / 2 + edgeY },
      { x: cx - N / 6, y: cy - B / 2 + edgeY },
      { x: cx + N / 6, y: cy - B / 2 + edgeY },
      { x: cx + N / 2 - edgeX, y: cy - B / 2 + edgeY },
      { x: cx - N / 2 + edgeX, y: cy + B / 2 - edgeY },
      { x: cx - N / 6, y: cy + B / 2 - edgeY },
      { x: cx + N / 6, y: cy + B / 2 - edgeY },
      { x: cx + N / 2 - edgeX, y: cy + B / 2 - edgeY },
    );
  } else {
    // Default 4
    anchors.push(
      { x: cx - N / 2 + edgeX, y: cy - B / 2 + edgeY },
      { x: cx + N / 2 - edgeX, y: cy - B / 2 + edgeY },
      { x: cx - N / 2 + edgeX, y: cy + B / 2 - edgeY },
      { x: cx + N / 2 - edgeX, y: cy + B / 2 - edgeY },
    );
  }

  const isCirc = cd.column_type === 'Pipe' || cd.column_type === 'HSS_Circ';

  // Status color
  const overall = results?.overall_status ?? 'INFO';
  const statusColor = overall === 'SAFE' ? '#22c55e' : overall === 'FAIL' ? '#ef4444' : '#f59e0b';

  // Pressure distribution gradient
  const fp_max = results?.pressure_distribution?.maximum_pressure_mpa ?? 0;
  const fp_min = results?.pressure_distribution?.minimum_pressure_mpa ?? fp_max;
  const hasUplift = fp_min < 0;

  return (
    <div className={`bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[hsl(220,20%,14%)] flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Base Plate Plan View — Engineering Sketch</p>
        <span className="text-xs font-mono text-muted-foreground">
          Scale ≈ 1:{Math.round(1 / scale)}
        </span>
      </div>

      {/* SVG Diagram */}
      <div className="p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 360, background: 'hsl(220,30%,5%)' }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(220,20%,15%)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="pressureGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={hasUplift ? '#ef4444' : '#0ea5e9'} stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.5" />
            </linearGradient>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="hsl(190,90%,50%)" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid */}
          <rect width={W} height={H} fill="url(#grid)" />

          {/* Centerlines */}
          <line x1={cx} y1={20} x2={cx} y2={H - 20} stroke="hsl(190,90%,50%)" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.4" />
          <line x1={20} y1={cy} x2={W - 20} y2={cy} stroke="hsl(190,90%,50%)" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.4" />

          {/* Pedestal */}
          <rect
            x={cx - pL / 2} y={cy - pW / 2} width={pL} height={pW}
            fill="hsl(220,20%,14%)" stroke="hsl(220,20%,35%)" strokeWidth="1.5" strokeDasharray="6 3"
          />
          {/* Pedestal label */}
          <text x={cx - pL / 2 + 4} y={cy - pW / 2 + 10} fontSize="7" fill="hsl(220,20%,50%)" fontFamily="monospace">
            Pedestal {fmt(cnd.pedestal_length_mm)}×{fmt(cnd.pedestal_width_mm)} mm
          </text>

          {/* Pressure gradient fill on base plate */}
          {results && (
            <rect
              x={cx - N / 2} y={cy - B / 2} width={N} height={B}
              fill="url(#pressureGrad)" opacity="0.3"
            />
          )}

          {/* Base plate */}
          <rect
            x={cx - N / 2} y={cy - B / 2} width={N} height={B}
            fill="none" stroke="hsl(190,90%,50%)" strokeWidth="2"
            filter="url(#glow)"
          />
          {/* Plate hatch lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1={cx - N / 2 + (i * N) / 8} y1={cy - B / 2}
              x2={cx - N / 2 + (i * N) / 8} y2={cy + B / 2}
              stroke="hsl(190,90%,50%)" strokeWidth="0.3" opacity="0.15"
            />
          ))}

          {/* Column footprint */}
          {isCirc ? (
            <circle
              cx={cx} cy={cy} r={colD / 2}
              fill="hsl(220,20%,18%)" stroke="hsl(38,92%,50%)" strokeWidth="2"
            />
          ) : (
            <>
              {/* W/I column — flanges and web */}
              {/* Top flange */}
              <rect x={cx - colB / 2} y={cy - colD / 2} width={colB} height={Math.max(2, cd.flange_thickness_mm ? cd.flange_thickness_mm * scale : 3)}
                fill="hsl(38,92%,50%)" stroke="hsl(38,92%,55%)" strokeWidth="1" opacity="0.9" />
              {/* Bottom flange */}
              <rect x={cx - colB / 2} y={cy + colD / 2 - Math.max(2, cd.flange_thickness_mm ? cd.flange_thickness_mm * scale : 3)} width={colB} height={Math.max(2, cd.flange_thickness_mm ? cd.flange_thickness_mm * scale : 3)}
                fill="hsl(38,92%,50%)" stroke="hsl(38,92%,55%)" strokeWidth="1" opacity="0.9" />
              {/* Web */}
              <rect
                x={cx - Math.max(1.5, cd.web_thickness_mm ? cd.web_thickness_mm * scale / 2 : 2)}
                y={cy - colD / 2}
                width={Math.max(3, cd.web_thickness_mm ? cd.web_thickness_mm * scale : 4)}
                height={colD}
                fill="hsl(38,92%,60%)" stroke="hsl(38,92%,55%)" strokeWidth="0.5" opacity="0.9"
              />
            </>
          )}

          {/* Column label */}
          <text x={cx + colB / 2 + 6} y={cy - 2} fontSize="7.5" fill="hsl(38,92%,60%)" fontFamily="monospace" fontWeight="bold">
            {cd.section_name || (cd.column_type + ' Column')}
          </text>

          {/* Anchor rods */}
          {anchors.map((a, i) => (
            <g key={i}>
              {/* Cross hair */}
              <line x1={a.x - anchorR * 2} y1={a.y} x2={a.x + anchorR * 2} y2={a.y} stroke="hsl(0,72%,55%)" strokeWidth="0.8" opacity="0.7" />
              <line x1={a.x} y1={a.y - anchorR * 2} x2={a.x} y2={a.y + anchorR * 2} stroke="hsl(0,72%,55%)" strokeWidth="0.8" opacity="0.7" />
              {/* Anchor circle */}
              <circle cx={a.x} cy={a.y} r={anchorR}
                fill="hsl(220,30%,5%)" stroke="hsl(0,72%,55%)" strokeWidth="1.5" />
              <circle cx={a.x} cy={a.y} r={anchorR * 0.4} fill="hsl(0,72%,55%)" opacity="0.8" />
            </g>
          ))}

          {/* Dimension arrows — N (horizontal) */}
          <g>
            <line x1={cx - N / 2} y1={cy + B / 2 + 18} x2={cx + N / 2} y2={cy + B / 2 + 18}
              stroke="hsl(190,90%,50%)" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x={cx} y={cy + B / 2 + 28} textAnchor="middle" fontSize="8" fill="hsl(190,90%,60%)" fontFamily="monospace">
              N = {fmt(bpd.plate_length_N_mm)} mm
            </text>
          </g>

          {/* Dimension arrows — B (vertical) */}
          <g>
            <line x1={cx + N / 2 + 18} y1={cy - B / 2} x2={cx + N / 2 + 18} y2={cy + B / 2}
              stroke="hsl(190,90%,50%)" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x={cx + N / 2 + 30} y={cy + 3} textAnchor="middle" fontSize="8" fill="hsl(190,90%,60%)" fontFamily="monospace"
              transform={`rotate(-90, ${cx + N / 2 + 30}, ${cy + 3})`}>
              B = {fmt(bpd.plate_width_B_mm)} mm
            </text>
          </g>

          {/* Edge distance callout */}
          {anchors.length >= 2 && (
            <g>
              <line x1={cx - N / 2} y1={anchors[0].y} x2={anchors[0].x} y2={anchors[0].y}
                stroke="hsl(210,90%,60%)" strokeWidth="0.7" strokeDasharray="3 2" opacity="0.7" />
              <text x={cx - N / 2 + (anchors[0].x - (cx - N / 2)) / 2} y={anchors[0].y - 5}
                textAnchor="middle" fontSize="6.5" fill="hsl(210,90%,60%)" fontFamily="monospace">
                ex={fmt(ad.edge_distance_x_mm)}mm
              </text>
            </g>
          )}

          {/* Pressure bar at bottom */}
          {results && (
            <g>
              <text x={cx - N / 2} y={cy + B / 2 + 50} fontSize="7" fill="hsl(220,20%,50%)" fontFamily="monospace">
                fp_min={fmt(fp_min, 2)} MPa
              </text>
              <text x={cx + N / 2} y={cy + B / 2 + 50} textAnchor="end" fontSize="7" fill="hsl(145,65%,42%)" fontFamily="monospace">
                fp_max={fmt(fp_max, 2)} MPa
              </text>
            </g>
          )}

          {/* Status indicator */}
          <g>
            <circle cx={W - 30} cy={22} r={8} fill={statusColor} opacity="0.85" filter="url(#glow)" />
            <text x={W - 30} y={26} textAnchor="middle" fontSize="7" fill="white" fontFamily="monospace" fontWeight="bold">
              {overall.charAt(0)}
            </text>
          </g>

          {/* Title block */}
          <rect x={10} y={H - 40} width={180} height={32} fill="hsl(220,28%,8%)" stroke="hsl(220,20%,20%)" strokeWidth="0.5" />
          <text x={16} y={H - 27} fontSize="7" fill="hsl(190,90%,50%)" fontFamily="monospace" fontWeight="bold">
            StructAI BasePlate — Plan View
          </text>
          <text x={16} y={H - 16} fontSize="6.5" fill="hsl(220,20%,50%)" fontFamily="monospace">
            {inputs.design_selection.design_method} | {inputs.design_selection.design_code} | {new Date().toLocaleDateString()}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 grid grid-cols-4 gap-2">
        {[
          { color: 'hsl(190,90%,50%)', label: 'Base Plate' },
          { color: 'hsl(38,92%,50%)', label: 'Column Section' },
          { color: 'hsl(0,72%,55%)', label: 'Anchor Rods' },
          { color: 'hsl(220,20%,35%)', label: 'Pedestal' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Key dimensions table */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Plate N × B', value: `${bpd.plate_length_N_mm ?? '—'} × ${bpd.plate_width_B_mm ?? '—'} mm` },
            { label: 'Plate tp', value: `${bpd.provided_thickness_tp_mm ?? '—'} mm` },
            { label: 'Column', value: cd.section_name || `${cd.column_type} (${cd.depth_mm ?? '—'}mm)` },
            { label: 'Pedestal', value: `${cnd.pedestal_length_mm ?? '—'} × ${cnd.pedestal_width_mm ?? '—'} mm` },
            { label: 'Anchors', value: `${ad.anchor_count ?? '—'} × ⌀${ad.anchor_diameter_mm ?? '—'} mm` },
            { label: 'Grout', value: `${bpd.grout_thickness_mm ?? 25} mm` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[hsl(220,30%,6%)] rounded px-2 py-1.5">
              <p className="text-[9px] text-muted-foreground">{label}</p>
              <p className="text-xs font-mono font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
