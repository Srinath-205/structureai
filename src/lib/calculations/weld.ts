import type { WeldData, ColumnData, LoadData, DesignSelection, WeldCheck, CalcResult } from '@/types';

export function calculateWeld(
  loadData: LoadData,
  columnData: ColumnData,
  weldData: WeldData,
  designSelection: DesignSelection
): { check: WeldCheck; calcResult: CalcResult } {
  const P = Math.abs(loadData.axial_load_kn ?? 0); // kN
  const V = Math.sqrt(
    Math.pow(loadData.shear_x_kn ?? 0, 2) +
    Math.pow(loadData.shear_y_kn ?? 0, 2)
  );
  const fu_weld = weldData.weld_fu_mpa ?? 482; // E70XX default
  const weld_size = weldData.provided_weld_size_mm ?? 8;

  // Effective weld length from column geometry
  let L_eff = weldData.effective_weld_length_mm ?? 0;
  if (L_eff === 0) {
    if (columnData.column_type === 'W' || columnData.column_type === 'I') {
      const d = columnData.depth_mm ?? 300;
      const bf = columnData.flange_width_mm ?? 150;
      const tf = columnData.flange_thickness_mm ?? 10;
      const tw = columnData.web_thickness_mm ?? 8;
      // Two flanges (top/bottom) + web both sides
      L_eff = 2 * (2 * bf) + 2 * (d - 2 * tf);
    } else if (columnData.column_type === 'HSS_Rect' || columnData.column_type === 'HSS_Square') {
      const h = columnData.hss_depth_mm ?? 200;
      const w = columnData.hss_width_mm ?? 200;
      L_eff = 2 * (h + w);
    } else if (columnData.column_type === 'HSS_Circ' || columnData.column_type === 'Pipe') {
      const D = columnData.pipe_outer_diameter_mm ?? 200;
      L_eff = Math.PI * D;
    } else {
      L_eff = 1000;
    }
  }

  // Fillet weld shear capacity per unit length
  // AISC: φRnw = φ × 0.6 × Fu_weld × Aw
  // Aw = 0.707 × weld_size
  const Aw = 0.707 * weld_size; // mm² per mm length
  let capacity_per_mm = 0;
  let formula = '';
  let code_ref = '';

  if (designSelection.design_code === 'AISC' && designSelection.design_method === 'LRFD') {
    capacity_per_mm = 0.75 * 0.6 * fu_weld * Aw; // N/mm
    formula = 'φRn = φ × 0.6 × FEXX × Aw  |  Aw = 0.707 × weld_size  [AISC 360 J2.4]';
    code_ref = 'AISC 360-22 Section J2.4 – LRFD';
  } else if (designSelection.design_code === 'AISC' && designSelection.design_method === 'ASD') {
    capacity_per_mm = 0.6 * fu_weld * Aw / 2.0; // N/mm
    formula = 'Rn/Ω = 0.6 × FEXX × Aw / Ω  [AISC 360 J2.4 ASD]';
    code_ref = 'AISC 360-22 Section J2.4 – ASD';
  } else {
    // IS 800:2007 fwd = fu / (√3 × γmw)
    const fwd = fu_weld / (Math.sqrt(3) * 1.25);
    capacity_per_mm = fwd * Aw;
    formula = 'fwd = fu_weld / (√3 × γmw)  |  Capacity = fwd × Aw  [IS 800:2007 Cl. 10.5.7]';
    code_ref = 'IS 800:2007 Cl. 10.5.7';
  }

  const W_capacity = capacity_per_mm * L_eff / 1000; // kN total
  const demand = Math.sqrt(P * P + V * V); // resultant demand kN
  const utilization = W_capacity > 0 ? parseFloat((demand / W_capacity).toFixed(3)) : null;

  // Required weld size
  const required_size = demand > 0 && L_eff > 0
    ? (demand * 1000) / (0.707 * 0.75 * 0.6 * fu_weld * L_eff)
    : 0;

  const status: 'SAFE' | 'FAIL' | 'INFO' = utilization !== null
    ? (utilization <= 1.0 ? 'SAFE' : 'FAIL')
    : 'INFO';

  const calcResult: CalcResult = {
    calculation_name: 'Column-to-Base-Plate Weld Check',
    design_code: code_ref,
    formula,
    variables: {
      Aw: 'Effective throat area per unit length = 0.707 × weld_size (mm²/mm)',
      L_eff: 'Effective weld length (mm)',
      FEXX: 'Weld electrode tensile strength (MPa)',
      Capacity: 'Total weld capacity (kN)',
      Demand: 'Resultant load = √(P² + V²) (kN)',
    },
    inputs: {
      weld_size_mm: weld_size,
      fu_weld_mpa: fu_weld,
      L_eff_mm: parseFloat(L_eff.toFixed(0)),
      P_kN: P,
      V_kN: parseFloat(V.toFixed(1)),
    },
    unit_conversions: {},
    substitutions: [
      `Aw = 0.707 × ${weld_size} = ${Aw.toFixed(2)} mm²/mm`,
      `capacity_per_mm = ${capacity_per_mm.toFixed(2)} N/mm`,
      `W_capacity = ${capacity_per_mm.toFixed(2)} × ${L_eff.toFixed(0)} = ${(capacity_per_mm * L_eff).toFixed(0)} N = ${W_capacity.toFixed(1)} kN`,
      `Demand = √(${P.toFixed(1)}² + ${V.toFixed(1)}²) = ${demand.toFixed(1)} kN`,
      `Utilization = ${demand.toFixed(1)} / ${W_capacity.toFixed(1)} = ${utilization}`,
    ],
    intermediate_steps: [
      `Effective weld length (estimated) = ${L_eff.toFixed(0)} mm`,
      `Required weld size (min) ≈ ${required_size.toFixed(1)} mm  |  Provided = ${weld_size} mm`,
    ],
    result: {
      required_weld_size_mm: parseFloat(required_size.toFixed(1)),
      provided_weld_size_mm: weld_size,
      weld_demand_kN: parseFloat(demand.toFixed(1)),
      weld_capacity_kN: parseFloat(W_capacity.toFixed(1)),
      utilization_ratio: utilization,
    },
    utilization_ratio: utilization,
    status,
    remarks: status === 'FAIL'
      ? `Weld capacity exceeded. Increase weld size or use full-penetration weld. Required ≈ ${required_size.toFixed(1)} mm.`
      : `Weld adequate. ${weld_size} mm fillet weld provides ${W_capacity.toFixed(1)} kN capacity vs ${demand.toFixed(1)} kN demand.`,
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      required_weld_size_mm: parseFloat(required_size.toFixed(1)),
      provided_weld_size_mm: weld_size,
      weld_demand_kn: parseFloat(demand.toFixed(1)),
      weld_capacity_kn: parseFloat(W_capacity.toFixed(1)),
      utilization_ratio: utilization,
      status,
    },
    calcResult,
  };
}
