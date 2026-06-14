import { useDesignStore } from '@/stores/designStore';
import { StatusBadge, UtilizationBar } from '@/components/features/StatusBadge';
import { BasePlateDiagram } from '@/components/features/BasePlateDiagram';
import { FileText, CheckCircle, XCircle, AlertTriangle, Download, ChevronLeft, FileJson, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalcStatus } from '@/types';
import { downloadTextReport, downloadHTMLReport, downloadJSONReport } from '@/lib/report/generator';
import { useState } from 'react';

interface SummaryRowProps {
  label: string;
  value: string | number | null;
  status?: CalcStatus | '';
  unit?: string;
  utilization?: number | null;
}

function SummaryRow({ label, value, status, unit, utilization }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[hsl(220,20%,14%)] last:border-0 gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        {utilization !== undefined && utilization !== null && (
          <div className="w-24">
            <UtilizationBar ratio={utilization} />
          </div>
        )}
        <span className="font-mono text-sm font-semibold text-foreground">
          {value !== null ? `${value}${unit ? ' ' + unit : ''}` : '—'}
        </span>
        {status && <StatusBadge status={status} size="sm" />}
      </div>
    </div>
  );
}

export function StepResults() {
  const { inputs, results, setCurrentStep } = useDesignStore();
  const [exportMenu, setExportMenu] = useState(false);

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8">
        <FileText size={40} className="text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Results Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Run calculations first to view the design summary.</p>
        <button type="button" onClick={() => setCurrentStep('calculate')}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(190,90%,50%)] text-[hsl(220,30%,7%)] font-semibold text-sm rounded-lg">
          <ChevronLeft size={14} /> Go to Calculate
        </button>
      </div>
    );
  }

  const r = results;

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-[hsl(190,90%,50%)]" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Design Results Summary</h2>
            <p className="text-xs text-muted-foreground">{inputs.project_info.project_name || 'Untitled'} · {inputs.design_selection.design_method}</p>
          </div>
        </div>
        <div className="flex gap-2 relative">
          <button type="button" onClick={() => setCurrentStep('calculate')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[hsl(220,20%,22%)] text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={12} /> Calculations
          </button>
          {/* Export dropdown */}
          <div className="relative">
            <button type="button" onClick={() => setExportMenu(!exportMenu)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[hsl(190,90%,50%,0.4)] text-[hsl(190,90%,60%)] hover:bg-[hsl(190,90%,50%,0.1)] transition-colors">
              <Download size={12} /> Export Report ▾
            </button>
            {exportMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[hsl(220,28%,10%)] border border-[hsl(220,20%,20%)] rounded-lg shadow-xl z-20 overflow-hidden">
                <button type="button"
                  onClick={() => { downloadHTMLReport(inputs, results); setExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs hover:bg-[hsl(220,20%,15%)] transition-colors text-foreground">
                  <FileText size={12} className="text-[hsl(190,90%,50%)]" />
                  HTML Report (Formatted)
                </button>
                <button type="button"
                  onClick={() => { downloadTextReport(inputs, results); setExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs hover:bg-[hsl(220,20%,15%)] transition-colors text-foreground border-t border-[hsl(220,20%,16%)]">
                  <Printer size={12} className="text-[hsl(38,92%,50%)]" />
                  Text Report (.txt)
                </button>
                <button type="button"
                  onClick={() => { downloadJSONReport(inputs, results); setExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs hover:bg-[hsl(220,20%,15%)] transition-colors text-foreground border-t border-[hsl(220,20%,16%)]">
                  <FileJson size={12} className="text-[hsl(145,65%,42%)]" />
                  Raw JSON Results
                </button>
                <button type="button"
                  onClick={() => { window.print(); setExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs hover:bg-[hsl(220,20%,15%)] transition-colors text-muted-foreground border-t border-[hsl(220,20%,16%)]">
                  <Printer size={12} /> Print Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall status */}
      <div className={cn(
        'rounded-xl border p-5',
        r.overall_status === 'SAFE'
          ? 'bg-[hsl(145,65%,42%,0.06)] border-[hsl(145,65%,42%,0.3)]'
          : r.overall_status === 'FAIL'
          ? 'bg-[hsl(0,72%,55%,0.06)] border-[hsl(0,72%,55%,0.3)]'
          : 'bg-[hsl(38,92%,50%,0.06)] border-[hsl(38,92%,50%,0.3)]'
      )}>
        <div className="flex items-center gap-3 mb-3">
          {r.overall_status === 'SAFE' ? <CheckCircle size={28} className="text-[hsl(145,65%,42%)]" />
            : r.overall_status === 'FAIL' ? <XCircle size={28} className="text-[hsl(0,72%,55%)]" />
            : <AlertTriangle size={28} className="text-[hsl(38,92%,50%)]" />}
          <div>
            <h3 className="font-bold text-foreground text-lg">Overall: <StatusBadge status={r.overall_status} size="lg" /></h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Design per {inputs.design_selection.steel_code} · {inputs.design_selection.design_method}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Checks Run', value: r.calc_results.length, color: 'text-[hsl(190,90%,60%)]' },
            { label: 'SAFE', value: r.calc_results.filter(c => c.status === 'SAFE').length, color: 'text-[hsl(145,65%,42%)]' },
            { label: 'WARNINGS', value: r.warnings.length, color: 'text-[hsl(38,92%,50%)]' },
            { label: 'CRITICAL', value: r.critical_issues.length, color: 'text-[hsl(0,72%,55%)]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[hsl(220,30%,7%,0.6)] rounded-lg p-3 text-center">
              <p className={cn('text-2xl font-bold font-mono', color)}>{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Engineering Diagram */}
      <BasePlateDiagram inputs={inputs} results={results} />

      {/* Project header */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading mb-3">Project Information</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Project', value: inputs.project_info.project_name || '—' },
            { label: 'Designer', value: inputs.project_info.designer || '—' },
            { label: 'Date', value: inputs.project_info.date },
            { label: 'Revision', value: inputs.project_info.revision },
            { label: 'Design Method', value: inputs.design_selection.design_method },
            { label: 'Steel Code', value: inputs.design_selection.steel_code },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Load summary */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading mb-2">Applied Loads</p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: 'Axial P', value: `${inputs.load_data.axial_load_kn ?? '—'} kN` },
            { label: 'Moment Mx', value: `${inputs.load_data.moment_major_knm ?? '—'} kNm` },
            { label: 'Moment My', value: `${inputs.load_data.moment_minor_knm ?? '—'} kNm` },
            { label: 'Shear Vx', value: `${inputs.load_data.shear_x_kn ?? '—'} kN` },
            { label: 'Shear V (res)', value: `${Math.sqrt(Math.pow(inputs.load_data.shear_x_kn ?? 0, 2) + Math.pow(inputs.load_data.shear_y_kn ?? 0, 2)).toFixed(1)} kN` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[hsl(220,30%,6%)] rounded px-3 py-2">
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="font-mono text-sm font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
        {/* Biaxial moment indicator */}
        {(inputs.load_data.moment_minor_knm ?? 0) !== 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[hsl(38,92%,55%)]">
            <AlertTriangle size={12} />
            Biaxial moment detected — 4-corner pressure distribution applied
          </div>
        )}
      </div>

      {/* Base plate summary */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading">Base Plate Geometry</p>
        <SummaryRow label="Plate Size (N × B)" value={`${inputs.base_plate_data.plate_length_N_mm ?? '—'} × ${inputs.base_plate_data.plate_width_B_mm ?? '—'}`} unit="mm" status={r.base_plate_geometry.size_status === 'ADEQUATE' ? 'SAFE' : 'WARNING'} />
        <SummaryRow label="Plate Area A1" value={r.concrete_bearing.A1_mm2?.toLocaleString() ?? '—'} unit="mm²" />
        <SummaryRow label="Pedestal Area A2" value={r.concrete_bearing.A2_mm2?.toLocaleString() ?? '—'} unit="mm²" />
        <SummaryRow label="Confinement Factor √(A2/A1)" value={r.concrete_bearing.limited_confinement_factor} />
      </div>

      {/* Pressure distribution */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading">Pressure Distribution</p>
        <SummaryRow label="Pressure Type" value={r.pressure_distribution.pressure_type} status={r.pressure_distribution.status} />
        <SummaryRow label="Max Pressure fp_max" value={r.pressure_distribution.maximum_pressure_mpa} unit="MPa" />
        <SummaryRow label="Min Pressure fp_min" value={r.pressure_distribution.minimum_pressure_mpa} unit="MPa" />
        <SummaryRow label="Uplift Present" value={r.pressure_distribution.uplift_present ? 'YES' : 'NO'} status={r.pressure_distribution.uplift_present ? 'WARNING' : 'SAFE'} />
      </div>

      {/* Concrete bearing */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading">Concrete Bearing Check</p>
        <SummaryRow label="Actual Bearing Pressure fp" value={r.concrete_bearing.actual_bearing_pressure_mpa} unit="MPa" />
        <SummaryRow label="Allowable / Design Bearing" value={r.concrete_bearing.allowable_or_design_bearing_pressure_mpa} unit="MPa" />
        <SummaryRow label="Bearing Utilization" value={(r.concrete_bearing.bearing_utilization_ratio ?? 0) * 100 | 0} unit="%" status={r.concrete_bearing.status} utilization={r.concrete_bearing.bearing_utilization_ratio} />
      </div>

      {/* Plate thickness */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading">Base Plate Thickness</p>
        <SummaryRow label="Projection m" value={r.plate_thickness.m_mm} unit="mm" />
        <SummaryRow label="Projection n" value={r.plate_thickness.n_mm} unit="mm" />
        <SummaryRow label="Critical Projection ℓ = max(m, n)" value={r.plate_thickness.critical_projection_l_mm} unit="mm" />
        <SummaryRow label="Bearing Pressure fp" value={r.plate_thickness.bearing_pressure_mpa} unit="MPa" />
        <SummaryRow label="Required Thickness tp,req" value={r.plate_thickness.required_thickness_mm} unit="mm" />
        <SummaryRow label="Provided Thickness tp" value={r.plate_thickness.provided_thickness_mm} unit="mm" status={r.plate_thickness.status} utilization={r.plate_thickness.utilization_ratio} />
      </div>

      {/* Anchor bolt summary */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading">Anchor Bolt / Anchor Rod Design</p>
        <SummaryRow label="Anchors" value={`${r.anchor_force.anchor_count} × ⌀${r.anchor_force.anchor_diameter_mm}`} unit="mm" />
        <SummaryRow label="Grade" value={r.anchor_force.anchor_grade} />
        <SummaryRow label="Tension per Anchor" value={r.anchor_force.tension_per_anchor_kn} unit="kN" />
        <SummaryRow label="Tension Capacity per Anchor" value={r.anchor_force.tension_capacity_per_anchor_kn} unit="kN" />
        <SummaryRow label="Shear per Anchor" value={r.anchor_force.shear_per_anchor_kn} unit="kN" />
        <SummaryRow label="Shear Capacity per Anchor" value={r.anchor_force.shear_capacity_per_anchor_kn} unit="kN" />
        <SummaryRow label="T-V Interaction" value={r.anchor_force.combined_interaction_ratio} status={r.anchor_force.status} utilization={r.anchor_force.combined_interaction_ratio} />
      </div>

      {/* Embedment */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading">Embedment Length</p>
        <SummaryRow label="Provided hef" value={r.embedment.provided_embedment_mm} unit="mm" />
        <SummaryRow label="Minimum hef" value={r.embedment.minimum_required_embedment_mm} unit="mm" />
        <SummaryRow label="hef / d ratio" value={r.embedment.embedment_ratio_d} status={r.embedment.overall_status} />
      </div>

      {/* Weld */}
      <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="section-heading">Weld Check</p>
        <SummaryRow label="Required Weld Size" value={r.weld.required_weld_size_mm} unit="mm" />
        <SummaryRow label="Provided Weld Size" value={r.weld.provided_weld_size_mm} unit="mm" />
        <SummaryRow label="Weld Demand" value={r.weld.weld_demand_kn} unit="kN" />
        <SummaryRow label="Weld Capacity" value={r.weld.weld_capacity_kn} unit="kN" status={r.weld.status} utilization={r.weld.utilization_ratio} />
      </div>

      {/* Stiffener & Shear key */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
          <p className="section-heading">Stiffener Plate</p>
          <div className={cn('flex items-center gap-2 py-2', r.stiffener.stiffener_required ? 'text-[hsl(38,92%,50%)]' : 'text-[hsl(145,65%,42%)]')}>
            {r.stiffener.stiffener_required ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span className="text-sm font-semibold">{r.stiffener.stiffener_required ? 'Stiffener RECOMMENDED' : 'Not Required'}</span>
          </div>
          {r.stiffener.stiffener_required && (
            <p className="text-xs text-muted-foreground mt-1">
              {r.stiffener.recommended_stiffener_thickness_mm}×{r.stiffener.recommended_stiffener_height_mm}×{r.stiffener.recommended_stiffener_length_mm} mm
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.stiffener.reason}</p>
        </div>
        <div className="bg-[hsl(220,28%,9%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
          <p className="section-heading">Shear Key / Shear Lug</p>
          <div className={cn('flex items-center gap-2 py-2', r.shear_key.shear_key_required ? 'text-[hsl(38,92%,50%)]' : 'text-[hsl(145,65%,42%)]')}>
            {r.shear_key.shear_key_required ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span className="text-sm font-semibold">{r.shear_key.shear_key_required ? 'Shear Key REQUIRED' : 'Not Required'}</span>
          </div>
          {r.shear_key.shear_key_required && (
            <p className="text-xs text-muted-foreground mt-1">
              Depth: {r.shear_key.recommended_shear_key_depth_mm} mm · t: {r.shear_key.recommended_shear_key_thickness_mm} mm
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.shear_key.reason}</p>
        </div>
      </div>

      {/* Recommendations */}
      {r.recommendations.length > 0 && (
        <div className="bg-[hsl(210,90%,60%,0.06)] border border-[hsl(210,90%,60%,0.25)] rounded-xl p-4">
          <p className="section-heading text-[hsl(210,90%,60%)] mb-2">Engineering Recommendations</p>
          {r.recommendations.map((rec, i) => (
            <p key={i} className="text-sm text-muted-foreground mt-1">• {rec}</p>
          ))}
        </div>
      )}

      {/* Export banner */}
      <div className="bg-[hsl(190,90%,50%,0.05)] border border-[hsl(190,90%,50%,0.2)] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[hsl(190,90%,60%)]">Export Engineering Report</p>
          <p className="text-xs text-muted-foreground mt-0.5">HTML (formatted) · Text (.txt) · JSON results</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => downloadHTMLReport(inputs, results)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[hsl(190,90%,50%)] text-[hsl(220,30%,7%)] font-semibold rounded-lg hover:bg-[hsl(190,90%,45%)] transition-colors">
            <Download size={12} /> HTML Report
          </button>
          <button type="button" onClick={() => downloadTextReport(inputs, results)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded border border-[hsl(190,90%,50%,0.4)] text-[hsl(190,90%,60%)] hover:bg-[hsl(190,90%,50%,0.1)] transition-colors">
            <FileText size={12} /> Text
          </button>
          <button type="button" onClick={() => downloadJSONReport(inputs, results)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded border border-[hsl(220,20%,22%)] text-muted-foreground hover:text-foreground transition-colors">
            <FileJson size={12} /> JSON
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[hsl(220,20%,11%)] rounded-xl border border-[hsl(220,20%,18%)] p-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed font-mono italic">
          DISCLAIMER: This report is generated for preliminary engineering assistance only. All calculations use deterministic algorithms per published design standards. Final design shall be independently reviewed, verified, and approved by a qualified licensed structural engineer before construction or fabrication.
        </p>
        <p className="text-[10px] text-muted-foreground mt-2 font-mono">
          Standards: {inputs.design_selection.steel_code} · {inputs.design_selection.concrete_code} · {inputs.design_selection.anchor_code}
        </p>
      </div>
    </div>
  );
}
