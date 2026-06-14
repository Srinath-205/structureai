import type { BasePlateData, ColumnData, LoadData, DesignSelection, PlateThicknessCheck, BasePlateGeometry, CalcResult } from '@/types';
import { PHI_B_AISC, OMEGA_B_AISC, GAMMA_M0_IS } from '@/constants';

export function calculateBasePlateGeometry(
  columnData: ColumnData,
  basePlateData: BasePlateData,
  concreteData: { pedestal_length_mm: number | null; pedestal_width_mm: number | null }
): { geometry: BasePlateGeometry; calcResult: CalcResult } {
  const N = basePlateData.plate_length_N_mm ?? 0;
  const B = basePlateData.plate_width_B_mm ?? 0;
  const pL = concreteData.pedestal_length_mm ?? (N + 100);
  const pW = concreteData.pedestal_width_mm ?? (B + 100);
  const A1 = N * B;
  const A2 = pL * pW;
  const ratio = A2 / A1;
  const confinement = Math.min(Math.sqrt(ratio), 2.0);

  let min_N = N;
  let min_B = B;
  const projection = 75; // mm default projection

  if (columnData.column_type === 'W' || columnData.column_type === 'I') {
    const d = columnData.depth_mm ?? 0;
    const bf = columnData.flange_width_mm ?? 0;
    min_N = d + 2 * projection;
    min_B = bf + 2 * projection;
  } else if (columnData.column_type === 'HSS_Rect' || columnData.column_type === 'HSS_Square') {
    const h = columnData.hss_depth_mm ?? 0;
    const w = columnData.hss_width_mm ?? 0;
    min_N = h + 2 * projection;
    min_B = w + 2 * projection;
  } else if (columnData.column_type === 'HSS_Circ' || columnData.column_type === 'Pipe') {
    const D = columnData.pipe_outer_diameter_mm ?? 0;
    min_N = D + 2 * projection;
    min_B = D + 2 * projection;
  }

  const size_ok = N >= min_N && B >= min_B;

  const calcResult: CalcResult = {
    calculation_name: 'Base Plate Geometry & Area Check',
    design_code: 'AISC Design Guide 1 / IS 800:2007 Section 7',
    formula: 'A1 = N × B  |  A2 = pL × pW  |  Min N ≥ d + 2×proj',
    variables: {
      N: 'Base plate length (mm)',
      B: 'Base plate width (mm)',
      A1: 'Base plate bearing area (mm²)',
      A2: 'Supporting pedestal/concrete area (mm²)',
      confinement: 'Confinement factor = min[√(A2/A1), 2.0]',
    },
    inputs: { N_mm: N, B_mm: B, pL_mm: pL, pW_mm: pW },
    unit_conversions: {},
    substitutions: [
      `A1 = ${N} × ${B} = ${A1.toLocaleString()} mm²`,
      `A2 = ${pL} × ${pW} = ${A2.toLocaleString()} mm²`,
      `A2/A1 = ${ratio.toFixed(3)}  →  √(A2/A1) = ${Math.sqrt(ratio).toFixed(3)}  →  limited = ${confinement.toFixed(3)}`,
      `Min required N = ${min_N} mm  |  Provided = ${N} mm → ${N >= min_N ? 'OK' : 'INSUFFICIENT'}`,
      `Min required B = ${min_B} mm  |  Provided = ${B} mm → ${B >= min_B ? 'OK' : 'INSUFFICIENT'}`,
    ],
    intermediate_steps: [
      `Plate size ${N} × ${B} mm, Area A1 = ${A1.toLocaleString()} mm²`,
      `Pedestal ${pL} × ${pW} mm, Area A2 = ${A2.toLocaleString()} mm²`,
    ],
    result: { A1_mm2: A1, A2_mm2: A2, ratio, confinement, min_N_mm: min_N, min_B_mm: min_B },
    utilization_ratio: null,
    status: size_ok ? 'SAFE' : 'WARNING',
    remarks: size_ok
      ? 'Base plate size adequate for column profile.'
      : `Base plate may be undersized. Minimum recommended: ${min_N} × ${min_B} mm`,
    timestamp: new Date().toISOString(),
  };

  return {
    geometry: {
      area_A1_mm2: A1,
      support_area_A2_mm2: A2,
      A2_A1_ratio: parseFloat(ratio.toFixed(3)),
      confinement_factor: parseFloat(confinement.toFixed(3)),
      minimum_length_required_mm: min_N,
      minimum_width_required_mm: min_B,
      provided_length_mm: N,
      provided_width_mm: B,
      size_status: size_ok ? 'ADEQUATE' : 'UNDERSIZED',
    },
    calcResult,
  };
}

export function calculatePlateThickness(
  loadData: LoadData,
  columnData: ColumnData,
  basePlateData: BasePlateData,
  designSelection: DesignSelection
): { check: PlateThicknessCheck; calcResult: CalcResult } {
  const P = Math.abs(loadData.axial_load_kn ?? 0) * 1000; // N
  const N = basePlateData.plate_length_N_mm ?? 300;
  const B = basePlateData.plate_width_B_mm ?? 300;
  const tp_prov = basePlateData.provided_thickness_tp_mm ?? 0;
  const Fy = basePlateData.plate_fy_mpa ?? 250;
  const A1 = N * B;
  const fp = P / A1; // bearing pressure MPa

  let m = 0, n = 0, n_prime = 0;
  let crit_proj = 0;
  let formula = '';
  let code_ref = '';
  let tp_req = 0;

  if (columnData.column_type === 'W' || columnData.column_type === 'I') {
    const d = columnData.depth_mm ?? 0;
    const bf = columnData.flange_width_mm ?? 0;
    m = (N - 0.95 * d) / 2;
    n = (B - 0.80 * bf) / 2;
    n_prime = Math.sqrt(d * bf) / 4;
    crit_proj = Math.max(m, n);
  } else if (columnData.column_type === 'HSS_Rect' || columnData.column_type === 'HSS_Square') {
    const h = columnData.hss_depth_mm ?? 0;
    const w = columnData.hss_width_mm ?? 0;
    m = (N - 0.95 * h) / 2;
    n = (B - 0.95 * w) / 2;
    n_prime = 0;
    crit_proj = Math.max(m, n);
  } else {
    const D = columnData.pipe_outer_diameter_mm ?? 0;
    crit_proj = (N - 0.95 * D) / 2;
    m = crit_proj; n = crit_proj;
  }

  if (crit_proj < 0) crit_proj = 0;

  if (designSelection.design_code === 'AISC' && designSelection.design_method === 'LRFD') {
    // tp ≥ l × sqrt(2fp / (φb × Fy))
    tp_req = crit_proj * Math.sqrt((2 * fp) / (PHI_B_AISC * Fy));
    formula = 'tp ≥ ℓ × √(2·fp / (φb·Fy))   [AISC DG1 Eq. 3.3.5a]';
    code_ref = 'AISC Design Guide 1 – LRFD';
  } else if (designSelection.design_code === 'AISC' && designSelection.design_method === 'ASD') {
    tp_req = crit_proj * Math.sqrt((2 * fp * OMEGA_B_AISC) / Fy);
    formula = 'tp ≥ ℓ × √(2·fp·Ωb / Fy)   [AISC DG1 ASD]';
    code_ref = 'AISC Design Guide 1 – ASD';
  } else {
    // IS 800: tp = sqrt(6 × Md × γm0 / (b × Fy))
    // Md = fp × crit_proj² / 2 per unit width
    const Md = fp * crit_proj * crit_proj / 2; // N·mm/mm
    tp_req = Math.sqrt((6 * Md * GAMMA_M0_IS) / Fy);
    formula = 'tp ≥ √(6·Md·γm0 / (Fy))  where Md = fp × ℓ² / 2   [IS 800:2007 Cl. 7.4.3]';
    code_ref = 'IS 800:2007 Section 7';
  }

  const utilization = tp_prov > 0 ? parseFloat((tp_req / tp_prov).toFixed(3)) : null;
  const status: 'SAFE' | 'FAIL' | 'INFO' = utilization !== null
    ? (utilization <= 1.0 ? 'SAFE' : 'FAIL')
    : 'INFO';

  const calcResult: CalcResult = {
    calculation_name: 'Base Plate Thickness Check',
    design_code: code_ref,
    formula,
    variables: {
      ℓ: 'Critical cantilever projection = max(m, n) (mm)',
      m: 'm = (N − 0.95d) / 2 (mm)',
      n: 'n = (B − 0.80bf) / 2 (mm)',
      'n\'': 'n\' = √(d×bf) / 4 (mm)',
      fp: 'Bearing pressure = P / A1 (MPa)',
      Fy: 'Plate yield strength (MPa)',
      tp: 'Required plate thickness (mm)',
    },
    inputs: { P_N: P, N_mm: N, B_mm: B, Fy_mpa: Fy, A1_mm2: A1, tp_provided_mm: tp_prov },
    unit_conversions: {},
    substitutions: [
      `fp = ${P.toFixed(0)} / ${A1.toLocaleString()} = ${fp.toFixed(2)} MPa`,
      `m = (${N} − 0.95×${columnData.depth_mm ?? 'N/A'}) / 2 = ${m.toFixed(1)} mm`,
      `n = (${B} − 0.80×${columnData.flange_width_mm ?? 'N/A'}) / 2 = ${n.toFixed(1)} mm`,
      ...(n_prime > 0 ? [`n' = √(${columnData.depth_mm}×${columnData.flange_width_mm}) / 4 = ${n_prime.toFixed(1)} mm`] : []),
      `ℓ = max(m, n) = max(${m.toFixed(1)}, ${n.toFixed(1)}) = ${crit_proj.toFixed(1)} mm`,
      `tp_required = ${crit_proj.toFixed(1)} × √(2×${fp.toFixed(2)} / (${designSelection.design_method === 'LRFD' ? PHI_B_AISC + '×' : ''}${Fy})) = ${tp_req.toFixed(1)} mm`,
    ],
    intermediate_steps: [
      `Critical projection ℓ = ${crit_proj.toFixed(1)} mm`,
      `Bearing pressure fp = ${fp.toFixed(2)} MPa`,
      `Required tp = ${tp_req.toFixed(1)} mm  |  Provided tp = ${tp_prov} mm`,
      utilization !== null ? `Utilization = ${tp_req.toFixed(1)} / ${tp_prov} = ${utilization}` : 'No provided thickness to compare',
    ],
    result: {
      m_mm: parseFloat(m.toFixed(1)),
      n_mm: parseFloat(n.toFixed(1)),
      n_prime_mm: parseFloat(n_prime.toFixed(1)),
      critical_projection_mm: parseFloat(crit_proj.toFixed(1)),
      fp_mpa: parseFloat(fp.toFixed(2)),
      tp_required_mm: parseFloat(tp_req.toFixed(1)),
      tp_provided_mm: tp_prov,
      utilization_ratio: utilization,
    },
    utilization_ratio: utilization,
    status,
    remarks:
      status === 'FAIL'
        ? `Plate thickness insufficient. Required: ${tp_req.toFixed(0)} mm, Provided: ${tp_prov} mm. Increase plate thickness.`
        : `Plate thickness adequate. Required: ${tp_req.toFixed(0)} mm ≤ Provided: ${tp_prov} mm.`,
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      m_mm: parseFloat(m.toFixed(1)),
      n_mm: parseFloat(n.toFixed(1)),
      n_prime_mm: parseFloat(n_prime.toFixed(1)),
      critical_projection_l_mm: parseFloat(crit_proj.toFixed(1)),
      bearing_pressure_mpa: parseFloat(fp.toFixed(2)),
      required_thickness_mm: parseFloat(tp_req.toFixed(1)),
      provided_thickness_mm: tp_prov,
      utilization_ratio: utilization,
      status,
    },
    calcResult,
  };
}
