import type { DesignInputs, DesignResults } from '@/types';

interface PDFSection {
  title: string;
  content: string;
}

function hr() { return '─'.repeat(72); }
function hd(t: string) { return `\n${'═'.repeat(72)}\n  ${t}\n${'═'.repeat(72)}\n`; }
function sub(t: string) { return `\n── ${t} ${'─'.repeat(Math.max(0, 68 - t.length))}\n`; }
function row(label: string, value: string, status?: string) {
  const pad = 40;
  const l = `  ${label}`.padEnd(pad, '.');
  const s = status ? `  [${status}]` : '';
  return `${l} ${value}${s}\n`;
}

export function generateTextReport(inputs: DesignInputs, results: DesignResults): string {
  const i = inputs;
  const r = results;
  const ds = i.design_selection;
  const pi = i.project_info;
  const ld = i.load_data;
  const cd = i.column_data;
  const bpd = i.base_plate_data;
  const cnd = i.concrete_data;
  const ad = i.anchor_data;
  const wd = i.weld_data;

  const lines: string[] = [];

  // ── Cover Page ──────────────────────────────────────────────────────────
  lines.push(hd('STRUCTAI BASEPLATE DESIGN REPORT'));
  lines.push('  AISC & IS Code Steel Column Base Plate Design Assistant\n');
  lines.push(hr());
  lines.push(row('Project Name', pi.project_name || '—'));
  lines.push(row('Project Number', pi.project_number || '—'));
  lines.push(row('Designer', pi.designer || '—'));
  lines.push(row('Checker', pi.checker || '—'));
  lines.push(row('Date', pi.date));
  lines.push(row('Revision', pi.revision));
  lines.push(hr());

  // ── 1. Design Basis ──────────────────────────────────────────────────────
  lines.push(hd('1. DESIGN BASIS'));
  lines.push(row('Design Code', ds.design_code === 'AISC' ? 'AISC 360' : 'IS 800:2007'));
  lines.push(row('Design Method', ds.design_method));
  lines.push(row('Steel Code', ds.steel_code));
  lines.push(row('Concrete Code', ds.concrete_code));
  lines.push(row('Anchor Code', ds.anchor_code));
  lines.push(row('Units', 'Metric (kN, mm, MPa)'));

  // ── 2. Load Data ─────────────────────────────────────────────────────────
  lines.push(hd('2. APPLIED LOADS'));
  lines.push(row('Load Type', ld.load_type));
  lines.push(row('Load Combination', ld.load_combination || '—'));
  lines.push(row('Axial Load P', `${ld.axial_load_kn ?? '—'} kN (${ld.axial_load_type})`));
  lines.push(row('Major Axis Moment Mx', `${ld.moment_major_knm ?? '—'} kNm`));
  lines.push(row('Minor Axis Moment My', `${ld.moment_minor_knm ?? '—'} kNm`));
  lines.push(row('Base Shear Vx', `${ld.shear_x_kn ?? '—'} kN`));
  lines.push(row('Base Shear Vy', `${ld.shear_y_kn ?? '—'} kN`));
  const Vr = Math.sqrt(Math.pow(ld.shear_x_kn ?? 0, 2) + Math.pow(ld.shear_y_kn ?? 0, 2));
  lines.push(row('Shear Resultant V', `${Vr.toFixed(1)} kN`));

  // ── 3. Column Data ───────────────────────────────────────────────────────
  lines.push(hd('3. COLUMN SECTION DATA'));
  lines.push(row('Column Type', cd.column_type));
  lines.push(row('Section Designation', cd.section_name || '—'));
  if (cd.depth_mm) {
    lines.push(row('Overall Depth d', `${cd.depth_mm} mm`));
    lines.push(row('Flange Width bf', `${cd.flange_width_mm ?? '—'} mm`));
    lines.push(row('Flange Thickness tf', `${cd.flange_thickness_mm ?? '—'} mm`));
    lines.push(row('Web Thickness tw', `${cd.web_thickness_mm ?? '—'} mm`));
  }
  if (cd.pipe_outer_diameter_mm) {
    lines.push(row('Outer Diameter D', `${cd.pipe_outer_diameter_mm} mm`));
    lines.push(row('Wall Thickness t', `${cd.pipe_wall_thickness_mm ?? '—'} mm`));
  }
  lines.push(row('Steel Grade', cd.steel_grade));
  lines.push(row('Yield Strength Fy', `${cd.fy_mpa ?? '—'} MPa`));
  lines.push(row('Ultimate Strength Fu', `${cd.fu_mpa ?? '—'} MPa`));

  // ── 4. Base Plate Geometry ───────────────────────────────────────────────
  lines.push(hd('4. BASE PLATE GEOMETRY'));
  lines.push(row('Plate Size N × B', `${bpd.plate_length_N_mm ?? '—'} × ${bpd.plate_width_B_mm ?? '—'} mm`));
  lines.push(row('Plate Area A1', `${((bpd.plate_length_N_mm ?? 0) * (bpd.plate_width_B_mm ?? 0)).toLocaleString()} mm²`));
  lines.push(row('Provided Thickness tp', `${bpd.provided_thickness_tp_mm ?? '—'} mm`));
  lines.push(row('Plate Steel Grade', bpd.plate_steel_grade));
  lines.push(row('Plate Fy', `${bpd.plate_fy_mpa ?? '—'} MPa`));
  lines.push(row('Grout Thickness', `${bpd.grout_thickness_mm ?? 25} mm`));
  lines.push(sub('Size Status'));
  lines.push(row('Provided vs Required', r.base_plate_geometry.size_status || '—', r.base_plate_geometry.size_status === 'ADEQUATE' ? 'SAFE' : 'CHECK'));
  lines.push(row('Pedestal Length', `${cnd.pedestal_length_mm ?? '—'} mm`));
  lines.push(row('Pedestal Width', `${cnd.pedestal_width_mm ?? '—'} mm`));
  lines.push(row('Pedestal Depth', `${cnd.pedestal_depth_mm ?? '—'} mm`));
  lines.push(row('Confinement √(A2/A1)', `${r.concrete_bearing.limited_confinement_factor ?? '—'} (limit 2.0)`));

  // ── 5. Load Classification & Eccentricity ───────────────────────────────
  lines.push(hd('5. LOAD CLASSIFICATION & ECCENTRICITY'));
  lines.push(row('Eccentricity ex', `${r.load_classification.eccentricity_x_mm ?? '—'} mm`));
  lines.push(row('Eccentricity ey', `${r.load_classification.eccentricity_y_mm ?? '—'} mm`));
  lines.push(row('Kern Limit (x)', `${r.load_classification.kern_limit_x_mm ?? '—'} mm`));
  lines.push(row('Kern Limit (y)', `${r.load_classification.kern_limit_y_mm ?? '—'} mm`));
  lines.push(row('Pressure Condition', r.load_classification.pressure_condition));
  lines.push(row('Anchor Tension Required', r.load_classification.anchor_tension_required ? 'YES' : 'NO'));

  // ── 6. Pressure Distribution ─────────────────────────────────────────────
  lines.push(hd('6. PRESSURE DISTRIBUTION CHECK'));
  lines.push(row('Average Pressure fp_avg', `${r.pressure_distribution.average_pressure_mpa ?? '—'} MPa`));
  lines.push(row('Maximum Pressure fp_max', `${r.pressure_distribution.maximum_pressure_mpa ?? '—'} MPa`));
  lines.push(row('Minimum Pressure fp_min', `${r.pressure_distribution.minimum_pressure_mpa ?? '—'} MPa`));
  lines.push(row('Pressure Type', r.pressure_distribution.pressure_type));
  lines.push(row('Uplift Present', r.pressure_distribution.uplift_present ? 'YES' : 'NO', r.pressure_distribution.status));

  // ── 7. Concrete Bearing Check ────────────────────────────────────────────
  lines.push(hd('7. CONCRETE BEARING CHECK'));
  lines.push(row('Concrete Grade', `${cnd.concrete_grade} (${ds.design_code === 'IS' ? `fck = ${cnd.fck_mpa}` : `f'c = ${cnd.fc_prime_mpa}`} MPa)`));
  lines.push(row('Plate Area A1', `${r.concrete_bearing.A1_mm2?.toLocaleString() ?? '—'} mm²`));
  lines.push(row('Support Area A2', `${r.concrete_bearing.A2_mm2?.toLocaleString() ?? '—'} mm²`));
  lines.push(row('√(A2/A1)', `${r.concrete_bearing.sqrt_A2_A1 ?? '—'} (limited to ${r.concrete_bearing.limited_confinement_factor ?? '—'})`));
  lines.push(row('Actual Bearing fp', `${r.concrete_bearing.actual_bearing_pressure_mpa ?? '—'} MPa`));
  lines.push(row('Design/Allow. Bearing', `${r.concrete_bearing.allowable_or_design_bearing_pressure_mpa ?? '—'} MPa`));
  lines.push(row('Utilization Ratio', `${r.concrete_bearing.bearing_utilization_ratio ? (r.concrete_bearing.bearing_utilization_ratio * 100).toFixed(1) + '%' : '—'}`, r.concrete_bearing.status));

  // ── 8. Base Plate Thickness ──────────────────────────────────────────────
  lines.push(hd('8. BASE PLATE THICKNESS CHECK'));
  const pt = r.plate_thickness;
  lines.push(row('Projection m', `${pt.m_mm ?? '—'} mm`));
  lines.push(row('Projection n', `${pt.n_mm ?? '—'} mm`));
  lines.push(row('n\' (yield line)', `${pt.n_prime_mm ?? '—'} mm`));
  lines.push(row('Critical Projection ℓ', `${pt.critical_projection_l_mm ?? '—'} mm`));
  lines.push(row('Bearing Pressure fp', `${pt.bearing_pressure_mpa ?? '—'} MPa`));
  lines.push(row('Required Thickness tp,req', `${pt.required_thickness_mm ?? '—'} mm`));
  lines.push(row('Provided Thickness tp', `${pt.provided_thickness_mm ?? '—'} mm`));
  lines.push(row('Utilization', `${pt.utilization_ratio ? (pt.utilization_ratio * 100).toFixed(1) + '%' : '—'}`, pt.status));

  // ── 9. Anchor Bolt / Rod Design ──────────────────────────────────────────
  lines.push(hd('9. ANCHOR BOLT / ANCHOR ROD DESIGN'));
  const af = r.anchor_force;
  lines.push(row('Anchor Configuration', `${ad.anchor_count ?? '—'} × ⌀${ad.anchor_diameter_mm ?? '—'} mm`));
  lines.push(row('Anchor Grade', ad.anchor_grade));
  lines.push(row('Anchor Fy / Fu', `${ad.anchor_fy_mpa ?? '—'} / ${ad.anchor_fu_mpa ?? '—'} MPa`));
  lines.push(row('Total Anchor Tension', `${af.total_anchor_tension_kn ?? '—'} kN`));
  lines.push(row('Effective Tension Anchors', `${af.effective_tension_anchors ?? '—'}`));
  lines.push(row('Tension per Anchor', `${af.tension_per_anchor_kn ?? '—'} kN`));
  lines.push(row('Tension Capacity/Anchor', `${af.tension_capacity_per_anchor_kn ?? '—'} kN`));
  lines.push(row('Total Shear V', `${af.total_shear_kn ?? '—'} kN`));
  lines.push(row('Shear per Anchor', `${af.shear_per_anchor_kn ?? '—'} kN`));
  lines.push(row('Shear Capacity/Anchor', `${af.shear_capacity_per_anchor_kn ?? '—'} kN`));
  lines.push(row('T-V Interaction Ratio', `${af.combined_interaction_ratio ?? '—'}`, af.status));

  // ── 10. Embedment ────────────────────────────────────────────────────────
  lines.push(hd('10. ANCHOR EMBEDMENT LENGTH'));
  const em = r.embedment;
  lines.push(row('Anchor Type', i.embedment_data.anchor_type));
  lines.push(row('Anchor Shape', i.embedment_data.anchor_shape));
  lines.push(row('Concrete Condition', i.embedment_data.concrete_condition));
  lines.push(row('Initial Embedment (12d)', `${em.initial_embedment_mm ?? '—'} mm`));
  lines.push(row('Provided hef', `${em.provided_embedment_mm ?? '—'} mm`));
  lines.push(row('Minimum hef', `${em.minimum_required_embedment_mm ?? '—'} mm`));
  lines.push(row('Embedment Ratio hef/d', `${em.embedment_ratio_d ?? '—'}`));
  lines.push(row('Steel Tension', em.steel_tension_status || '—'));
  lines.push(row('Concrete Breakout (Tension)', em.concrete_breakout_tension_status || '—'));
  lines.push(row('Pullout Strength', em.pullout_status || '—'));
  lines.push(row('Pryout Strength', em.pryout_status || '—'));
  lines.push(row('Overall Embedment Status', '', em.overall_status));

  // ── 11. Weld Check ───────────────────────────────────────────────────────
  lines.push(hd('11. WELD CHECK'));
  const wc = r.weld;
  lines.push(row('Weld Type', wd.weld_type));
  lines.push(row('Electrode', wd.weld_electrode));
  lines.push(row('Required Weld Size', `${wc.required_weld_size_mm ?? '—'} mm`));
  lines.push(row('Provided Weld Size', `${wc.provided_weld_size_mm ?? '—'} mm`));
  lines.push(row('Weld Demand', `${wc.weld_demand_kn ?? '—'} kN`));
  lines.push(row('Weld Capacity', `${wc.weld_capacity_kn ?? '—'} kN`));
  lines.push(row('Utilization', `${wc.utilization_ratio ? (wc.utilization_ratio * 100).toFixed(1) + '%' : '—'}`, wc.status));

  // ── 12. Stiffener & Shear Key ─────────────────────────────────────────────
  lines.push(hd('12. STIFFENER PLATE & SHEAR KEY REQUIREMENT'));
  const sf = r.stiffener;
  const sk = r.shear_key;
  lines.push(sub('Stiffener Plate'));
  lines.push(row('Required', sf.stiffener_required ? 'YES — RECOMMENDED' : 'NOT REQUIRED', sf.status));
  if (sf.stiffener_required) {
    lines.push(row('Reason', sf.reason));
    lines.push(row('Suggested Size', `${sf.recommended_stiffener_thickness_mm ?? '—'} t × ${sf.recommended_stiffener_height_mm ?? '—'} h × ${sf.recommended_stiffener_length_mm ?? '—'} L mm`));
  }
  lines.push(sub('Shear Key / Shear Lug'));
  lines.push(row('Required', sk.shear_key_required ? 'YES — REQUIRED' : 'NOT REQUIRED', sk.status));
  if (sk.shear_key_required) {
    lines.push(row('Reason', sk.reason));
    lines.push(row('Suggested Depth', `${sk.recommended_shear_key_depth_mm ?? '—'} mm`));
    lines.push(row('Suggested Thickness', `${sk.recommended_shear_key_thickness_mm ?? '—'} mm`));
  }

  // ── 13. Final Summary ────────────────────────────────────────────────────
  lines.push(hd('13. FINAL DESIGN SUMMARY'));
  lines.push(row('Design Code / Method', `${ds.design_code} — ${ds.design_method}`));
  lines.push(row('Base Plate Size', `${bpd.plate_length_N_mm ?? '—'} × ${bpd.plate_width_B_mm ?? '—'} mm`));
  lines.push(row('Plate Thickness (req/prov)', `${pt.required_thickness_mm ?? '—'} / ${pt.provided_thickness_mm ?? '—'} mm`));
  lines.push(row('Anchors', `${ad.anchor_count ?? '—'} × ⌀${ad.anchor_diameter_mm ?? '—'} mm (${ad.anchor_grade})`));
  lines.push(row('Embedment hef', `${em.provided_embedment_mm ?? '—'} mm`));
  lines.push(row('Weld Size', `${wc.provided_weld_size_mm ?? '—'} mm fillet`));
  lines.push(row('Concrete Bearing', `${r.concrete_bearing.bearing_utilization_ratio ? (r.concrete_bearing.bearing_utilization_ratio * 100).toFixed(1) + '%' : '—'}`, r.concrete_bearing.status));
  lines.push(row('Plate Thickness Check', `${pt.utilization_ratio ? (pt.utilization_ratio * 100).toFixed(1) + '%' : '—'}`, pt.status));
  lines.push(row('Anchor Tension Check', `${af.tension_per_anchor_kn ?? '—'} kN`, af.status));
  lines.push(row('Stiffener Required', sf.stiffener_required ? 'YES' : 'NO'));
  lines.push(row('Shear Key Required', sk.shear_key_required ? 'YES' : 'NO'));
  lines.push('\n' + hr());
  lines.push(`\n  ██  OVERALL DESIGN STATUS: ${r.overall_status}  ██\n`);
  lines.push(hr() + '\n');

  // ── 14. Warnings & Recommendations ───────────────────────────────────────
  if (r.warnings.length > 0 || r.recommendations.length > 0 || r.critical_issues.length > 0) {
    lines.push(hd('14. ENGINEERING NOTES & RECOMMENDATIONS'));
    if (r.critical_issues.length > 0) {
      lines.push(sub('Critical Issues'));
      r.critical_issues.forEach((c) => lines.push(`  ⚠  ${c}\n`));
    }
    if (r.warnings.length > 0) {
      lines.push(sub('Warnings'));
      r.warnings.forEach((w) => lines.push(`  ▲  ${w}\n`));
    }
    if (r.recommendations.length > 0) {
      lines.push(sub('Recommendations'));
      r.recommendations.forEach((rec) => lines.push(`  →  ${rec}\n`));
    }
  }

  // ── Disclaimer ────────────────────────────────────────────────────────────
  lines.push(hd('DISCLAIMER'));
  lines.push(`  This report is generated for preliminary engineering assistance only.\n`);
  lines.push(`  All deterministic calculations are performed using published formulae per:\n`);
  lines.push(`    ${ds.steel_code}  |  ${ds.concrete_code}  |  ${ds.anchor_code}\n`);
  lines.push(`\n  Final design shall be independently reviewed, verified, and approved by a\n`);
  lines.push(`  qualified licensed structural engineer before construction or fabrication.\n`);
  lines.push('\n' + hr());
  lines.push('\n  Generated by StructAI BasePlate  ·  ' + new Date().toLocaleString());
  lines.push('\n' + hr() + '\n');

  return lines.join('');
}

export function downloadTextReport(inputs: DesignInputs, results: DesignResults) {
  const text = generateTextReport(inputs, results);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const proj = inputs.project_info.project_name?.replace(/\s+/g, '_') || 'BasePlate';
  a.download = `StructAI_${proj}_${inputs.design_selection.design_method}_Report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSONReport(inputs: DesignInputs, results: DesignResults) {
  const payload = {
    generated: new Date().toISOString(),
    software: 'StructAI BasePlate',
    inputs,
    results,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const proj = inputs.project_info.project_name?.replace(/\s+/g, '_') || 'BasePlate';
  a.download = `StructAI_${proj}_Results.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateHTMLReport(inputs: DesignInputs, results: DesignResults): string {
  const i = inputs;
  const r = results;
  const statusColor = r.overall_status === 'SAFE' ? '#22c55e' : r.overall_status === 'FAIL' ? '#ef4444' : '#f59e0b';

  const rowHTML = (label: string, value: string, status?: string) => {
    const sc = status === 'SAFE' ? '#22c55e' : status === 'FAIL' ? '#ef4444' : status === 'WARNING' ? '#f59e0b' : '#6b7280';
    return `<tr>
      <td style="padding:6px 10px;color:#9ca3af;font-size:12px;border-bottom:1px solid #1f2937;">${label}</td>
      <td style="padding:6px 10px;color:#f9fafb;font-size:12px;font-family:monospace;border-bottom:1px solid #1f2937;">${value}</td>
      ${status ? `<td style="padding:6px 10px;text-align:center;border-bottom:1px solid #1f2937;"><span style="color:${sc};font-size:11px;font-weight:700;">${status}</span></td>` : '<td></td>'}
    </tr>`;
  };

  const sectionHTML = (title: string, rows: string) => `
    <div style="margin-bottom:24px;background:#111827;border:1px solid #1f2937;border-radius:8px;overflow:hidden;">
      <div style="background:#0f172a;padding:10px 16px;border-bottom:1px solid #1f2937;">
        <h3 style="margin:0;color:#06b6d4;font-size:13px;font-family:monospace;letter-spacing:0.05em;">${title}</h3>
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>StructAI BasePlate Report — ${i.project_info.project_name || 'Untitled'}</title>
<style>
  @media print {
    body { background: white !important; color: black !important; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #030712; color: #f9fafb; margin: 0; padding: 32px; }
  h1, h2, h3, h4 { margin: 0; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>
<div style="max-width:900px;margin:0 auto;">

  <!-- Cover -->
  <div style="text-align:center;padding:48px 0;margin-bottom:32px;border-bottom:2px solid #06b6d4;">
    <div style="color:#06b6d4;font-size:11px;font-family:monospace;letter-spacing:0.2em;margin-bottom:8px;">STRUCTURAL ENGINEERING CALCULATION REPORT</div>
    <h1 style="font-size:28px;font-weight:700;color:#f9fafb;margin-bottom:4px;">StructAI BasePlate</h1>
    <div style="color:#9ca3af;font-size:14px;margin-bottom:24px;">Steel Column Base Plate Design — ${i.design_selection.design_method}</div>
    <div style="display:inline-block;background:${statusColor}22;border:2px solid ${statusColor};border-radius:8px;padding:12px 32px;">
      <div style="color:${statusColor};font-size:20px;font-weight:800;font-family:monospace;">OVERALL: ${r.overall_status}</div>
    </div>
  </div>

  <!-- Project Info -->
  ${sectionHTML('PROJECT INFORMATION',
    rowHTML('Project Name', i.project_info.project_name || '—') +
    rowHTML('Project Number', i.project_info.project_number || '—') +
    rowHTML('Designer', i.project_info.designer || '—') +
    rowHTML('Date', i.project_info.date) +
    rowHTML('Design Method', `${i.design_selection.design_code} — ${i.design_selection.design_method}`) +
    rowHTML('Steel Code', i.design_selection.steel_code) +
    rowHTML('Concrete Code', i.design_selection.concrete_code)
  )}

  <!-- Loads -->
  ${sectionHTML('APPLIED LOADS',
    rowHTML('Axial Load P', `${i.load_data.axial_load_kn ?? '—'} kN (${i.load_data.axial_load_type})`) +
    rowHTML('Major Moment Mx', `${i.load_data.moment_major_knm ?? '—'} kNm`) +
    rowHTML('Minor Moment My', `${i.load_data.moment_minor_knm ?? '—'} kNm`) +
    rowHTML('Base Shear V', `${Math.sqrt(Math.pow(i.load_data.shear_x_kn ?? 0, 2) + Math.pow(i.load_data.shear_y_kn ?? 0, 2)).toFixed(1)} kN`)
  )}

  <!-- Base Plate -->
  ${sectionHTML('BASE PLATE GEOMETRY',
    rowHTML('Plate Size N × B', `${i.base_plate_data.plate_length_N_mm ?? '—'} × ${i.base_plate_data.plate_width_B_mm ?? '—'} mm`, r.base_plate_geometry.size_status || '') +
    rowHTML('Plate Thickness tp (req / prov)', `${r.plate_thickness.required_thickness_mm ?? '—'} / ${r.plate_thickness.provided_thickness_mm ?? '—'} mm`, r.plate_thickness.status) +
    rowHTML('Critical Projection ℓ', `${r.plate_thickness.critical_projection_l_mm ?? '—'} mm`) +
    rowHTML('Thickness Utilization', `${r.plate_thickness.utilization_ratio ? (r.plate_thickness.utilization_ratio * 100).toFixed(1) + '%' : '—'}`, r.plate_thickness.status)
  )}

  <!-- Concrete Bearing -->
  ${sectionHTML('CONCRETE BEARING CHECK',
    rowHTML('Actual Bearing fp', `${r.concrete_bearing.actual_bearing_pressure_mpa ?? '—'} MPa`) +
    rowHTML('Design/Allowable fp', `${r.concrete_bearing.allowable_or_design_bearing_pressure_mpa ?? '—'} MPa`) +
    rowHTML('Confinement Factor', `${r.concrete_bearing.limited_confinement_factor ?? '—'}`) +
    rowHTML('Utilization', `${r.concrete_bearing.bearing_utilization_ratio ? (r.concrete_bearing.bearing_utilization_ratio * 100).toFixed(1) + '%' : '—'}`, r.concrete_bearing.status)
  )}

  <!-- Anchors -->
  ${sectionHTML('ANCHOR BOLT / ROD DESIGN',
    rowHTML('Configuration', `${i.anchor_data.anchor_count ?? '—'} × ⌀${i.anchor_data.anchor_diameter_mm ?? '—'} mm`) +
    rowHTML('Grade', i.anchor_data.anchor_grade) +
    rowHTML('Tension/Anchor (demand / capacity)', `${r.anchor_force.tension_per_anchor_kn ?? '—'} / ${r.anchor_force.tension_capacity_per_anchor_kn ?? '—'} kN`, r.anchor_force.status) +
    rowHTML('Shear/Anchor (demand / capacity)', `${r.anchor_force.shear_per_anchor_kn ?? '—'} / ${r.anchor_force.shear_capacity_per_anchor_kn ?? '—'} kN`) +
    rowHTML('T-V Interaction Ratio', `${r.anchor_force.combined_interaction_ratio ?? '—'}`, r.anchor_force.status) +
    rowHTML('Embedment hef (prov / min)', `${r.embedment.provided_embedment_mm ?? '—'} / ${r.embedment.minimum_required_embedment_mm ?? '—'} mm`, r.embedment.overall_status)
  )}

  <!-- Weld / Stiffener / Shear Key -->
  ${sectionHTML('WELD, STIFFENER & SHEAR KEY',
    rowHTML('Weld Size (req / prov)', `${r.weld.required_weld_size_mm ?? '—'} / ${r.weld.provided_weld_size_mm ?? '—'} mm`, r.weld.status) +
    rowHTML('Stiffener Plate', r.stiffener.stiffener_required ? 'RECOMMENDED' : 'Not Required', r.stiffener.status) +
    rowHTML('Shear Key / Lug', r.shear_key.shear_key_required ? 'REQUIRED' : 'Not Required', r.shear_key.status)
  )}

  ${r.warnings.length > 0 || r.critical_issues.length > 0 ? `
  <!-- Warnings -->
  <div style="margin-bottom:24px;background:#7c2d1222;border:1px solid #7c2d12;border-radius:8px;padding:16px;">
    <h3 style="color:#f59e0b;font-size:12px;font-family:monospace;margin-bottom:12px;">ENGINEERING NOTES & WARNINGS</h3>
    ${r.critical_issues.map((c) => `<p style="color:#ef4444;font-size:12px;margin:4px 0;">⚠ ${c}</p>`).join('')}
    ${r.warnings.map((w) => `<p style="color:#f59e0b;font-size:12px;margin:4px 0;">▲ ${w}</p>`).join('')}
    ${r.recommendations.map((rec) => `<p style="color:#60a5fa;font-size:12px;margin:4px 0;">→ ${rec}</p>`).join('')}
  </div>` : ''}

  <!-- Disclaimer -->
  <div style="background:#0f172a;border:1px solid #1f2937;border-radius:8px;padding:16px;margin-top:32px;">
    <p style="color:#6b7280;font-size:10px;font-family:monospace;line-height:1.8;margin:0;">
      DISCLAIMER: This report is generated for preliminary engineering assistance only. All calculations use deterministic algorithms per published design standards (${i.design_selection.steel_code} · ${i.design_selection.concrete_code} · ${i.design_selection.anchor_code}). Final design shall be independently reviewed, verified, and approved by a qualified licensed structural engineer before construction or fabrication. StructAI BasePlate — Generated ${new Date().toLocaleString()}
    </p>
  </div>

</div>
</body>
</html>`;
  return html;
}

export function downloadHTMLReport(inputs: DesignInputs, results: DesignResults) {
  const html = generateHTMLReport(inputs, results);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const proj = inputs.project_info.project_name?.replace(/\s+/g, '_') || 'BasePlate';
  a.download = `StructAI_${proj}_Report.html`;
  a.click();
  URL.revokeObjectURL(url);
}
