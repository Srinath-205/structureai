import type { BasePlateData, ConcreteData, LoadData, DesignSelection, ConcreteBearingCheck, PressureDistCheck, CalcResult } from '@/types';
import { PHI_C_AISC, OMEGA_C_AISC } from '@/constants';

export function calculateConcreteBearing(
  loadData: LoadData,
  basePlateData: BasePlateData,
  concreteData: ConcreteData,
  designSelection: DesignSelection
): { check: ConcreteBearingCheck; calcResult: CalcResult } {
  const P = Math.abs(loadData.axial_load_kn ?? 0) * 1000; // N
  const N = basePlateData.plate_length_N_mm ?? 300;
  const B = basePlateData.plate_width_B_mm ?? 300;
  const A1 = N * B;
  const pL = concreteData.pedestal_length_mm ?? N + 100;
  const pW = concreteData.pedestal_width_mm ?? B + 100;
  const A2 = pL * pW;

  const ratio = A2 / A1;
  const confinement = Math.min(Math.sqrt(ratio), 2.0);

  // Use biaxial pressure (max corner) when My is present
  const Mx = (loadData.moment_major_knm ?? 0) * 1e6;
  const My = (loadData.moment_minor_knm ?? 0) * 1e6;
  const Zx = (B * N * N) / 6;
  const Zy = (N * B * B) / 6;
  const fp_biaxial = P / A1 + Math.abs(Mx) / Zx + (Zy > 0 ? Math.abs(My) / Zy : 0);
  const fp_actual = fp_biaxial; // MPa (always uses max pressure for conservative bearing check)

  let fp_design = 0;
  let formula = '';
  let code_ref = '';

  if (designSelection.design_code === 'AISC' && designSelection.design_method === 'LRFD') {
    // φcPp = φc × 0.85 × f'c × A1 × sqrt(A2/A1) ≤ φc × 1.7 × f'c × A1
    const fc = concreteData.fc_prime_mpa ?? 28;
    const Pp = 0.85 * fc * A1 * confinement;
    fp_design = (PHI_C_AISC * Pp) / A1;
    formula = 'φcPp = φc × 0.85 × f\'c × A1 × √(A2/A1)  →  fp_design = φcPp / A1';
    code_ref = 'AISC DG1 / ACI 318-19 §22.8';
  } else if (designSelection.design_code === 'AISC' && designSelection.design_method === 'ASD') {
    const fc = concreteData.fc_prime_mpa ?? 28;
    const Pp = 0.85 * fc * A1 * confinement;
    fp_design = Pp / (OMEGA_C_AISC * A1);
    formula = 'P_allow = 0.85 × f\'c × A1 × √(A2/A1) / Ωc  →  fp_allow = P_allow / A1';
    code_ref = 'AISC DG1 ASD / ACI 318-19 §22.8';
  } else {
    // IS 456:2000
    const fck = concreteData.fck_mpa ?? 30;
    fp_design = 0.45 * fck * confinement;
    formula = 'fp_allow = 0.45 × fck × √(A2/A1)';
    code_ref = 'IS 456:2000 Cl. 34.4';
  }

  const utilization = fp_design > 0 ? parseFloat((fp_actual / fp_design).toFixed(3)) : null;
  const status = utilization !== null ? (utilization <= 1.0 ? 'SAFE' : 'FAIL') : 'INFO';

  const calcResult: CalcResult = {
    calculation_name: 'Concrete Bearing Check',
    design_code: code_ref,
    formula,
    variables: {
      P: 'Factored axial load (N)',
      A1: 'Base plate area = N × B (mm²)',
      A2: 'Pedestal / supporting area = pL × pW (mm²)',
      fp_actual: 'Actual bearing pressure = P / A1 (MPa)',
      fp_design: designSelection.design_code === 'AISC' ? 'Design bearing capacity (MPa)' : 'Allowable bearing pressure (MPa)',
      confinement: 'Confinement factor = min[√(A2/A1), 2.0]',
    },
    inputs: {
      P_N: P,
      N_mm: N,
      B_mm: B,
      pL_mm: pL,
      pW_mm: pW,
      'f\'c or fck_MPa': concreteData.fc_prime_mpa ?? concreteData.fck_mpa ?? 28,
      Mx_kNm: loadData.moment_major_knm ?? 0,
      My_kNm: loadData.moment_minor_knm ?? 0,
    },
    unit_conversions: { 'P kN → N': `${(P / 1000).toFixed(1)} kN × 1000 = ${P.toFixed(0)} N` },
    substitutions: [
      `A1 = ${N} × ${B} = ${A1.toLocaleString()} mm²`,
      `A2 = ${pL} × ${pW} = ${A2.toLocaleString()} mm²`,
      `√(A2/A1) = √(${ratio.toFixed(3)}) = ${Math.sqrt(ratio).toFixed(3)} → limited to ${confinement.toFixed(3)}`,
      Math.abs(loadData.moment_minor_knm ?? 0) > 0.5
        ? `fp_actual (biaxial max) = P/A + Mx/Zx + My/Zy = ${fp_actual.toFixed(2)} MPa`
        : `fp_actual = ${P.toFixed(0)} / ${A1.toLocaleString()} = ${fp_actual.toFixed(2)} MPa`,
      `fp_design/allow = ${fp_design.toFixed(2)} MPa`,
    ],
    intermediate_steps: [
      `Confinement factor: √(A2/A1) = ${Math.sqrt(ratio).toFixed(3)}, limited to 2.0 → ${confinement.toFixed(3)}`,
      `Actual bearing pressure: fp = ${fp_actual.toFixed(2)} MPa`,
      `Design/Allowable bearing: ${fp_design.toFixed(2)} MPa`,
      `Utilization = ${fp_actual.toFixed(2)} / ${fp_design.toFixed(2)} = ${utilization}`,
    ],
    result: {
      A1_mm2: A1,
      A2_mm2: A2,
      sqrt_A2_A1: parseFloat(Math.sqrt(ratio).toFixed(3)),
      confinement_factor: parseFloat(confinement.toFixed(3)),
      fp_actual_mpa: parseFloat(fp_actual.toFixed(2)),
      fp_design_mpa: parseFloat(fp_design.toFixed(2)),
      utilization_ratio: utilization,
    },
    utilization_ratio: utilization,
    status,
    remarks:
      utilization !== null && utilization > 1.0
        ? 'Concrete bearing FAILS. Increase base plate size, increase pedestal size, or upgrade concrete grade.'
        : 'Concrete bearing pressure within allowable limits.',
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      A1_mm2: A1,
      A2_mm2: A2,
      sqrt_A2_A1: parseFloat(Math.sqrt(ratio).toFixed(3)),
      limited_confinement_factor: parseFloat(confinement.toFixed(3)),
      actual_bearing_pressure_mpa: parseFloat(fp_actual.toFixed(2)),
      allowable_or_design_bearing_pressure_mpa: parseFloat(fp_design.toFixed(2)),
      bearing_utilization_ratio: utilization,
      status,
    },
    calcResult,
  };
}

export function calculatePressureDistribution(
  loadData: LoadData,
  basePlateData: BasePlateData
): { check: PressureDistCheck; calcResult: CalcResult } {
  const P = Math.abs(loadData.axial_load_kn ?? 0) * 1000; // N
  const Mx = (loadData.moment_major_knm ?? 0) * 1e6; // Nmm
  const N = basePlateData.plate_length_N_mm ?? 300;
  const B = basePlateData.plate_width_B_mm ?? 300;
  const A = N * B;
  const Z = (B * N * N) / 6;

  const fp_avg = P / A;
  const fp_max = P / A + Math.abs(Mx) / Z;
  const fp_min = P / A - Math.abs(Mx) / Z;

  const uplift_present = fp_min < 0;
  const anchor_tension_required = uplift_present || loadData.axial_load_type === 'uplift';
  const pressure_type = uplift_present ? 'Partial Compression (Uplift on tension side)' : 'Full Compression';

  const calcResult: CalcResult = {
    calculation_name: 'Pressure Distribution Check',
    design_code: 'AISC Design Guide 1 / IS 800:2007',
    formula: 'fp_max = P/A + M/Z  |  fp_min = P/A − M/Z  |  Z = B × N² / 6',
    variables: {
      P: 'Axial load (N)',
      Mx: 'Major axis moment (N·mm)',
      A: 'Base plate area (mm²)',
      Z: 'Section modulus of base plate (mm³)',
    },
    inputs: { P_N: P, Mx_Nmm: parseFloat(Mx.toFixed(0)), N_mm: N, B_mm: B },
    unit_conversions: { 'Mx kNm → Nmm': `${(Mx / 1e6).toFixed(2)} kNm × 10⁶ = ${Mx.toFixed(0)} N·mm` },
    substitutions: [
      `A = ${N} × ${B} = ${A.toLocaleString()} mm²`,
      `Z = ${B} × ${N}² / 6 = ${Z.toLocaleString(undefined, { maximumFractionDigits: 0 })} mm³`,
      `fp_avg = ${P.toFixed(0)} / ${A.toLocaleString()} = ${fp_avg.toFixed(2)} MPa`,
      `fp_max = ${fp_avg.toFixed(2)} + ${(Math.abs(Mx) / Z).toFixed(2)} = ${fp_max.toFixed(2)} MPa`,
      `fp_min = ${fp_avg.toFixed(2)} − ${(Math.abs(Mx) / Z).toFixed(2)} = ${fp_min.toFixed(2)} MPa`,
    ],
    intermediate_steps: [
      `Section modulus Z = ${Z.toLocaleString(undefined, { maximumFractionDigits: 0 })} mm³`,
      `Pressure type: ${pressure_type}`,
      fp_min < 0 ? `fp_min = ${fp_min.toFixed(2)} MPa → Uplift exists on tension side` : `fp_min = ${fp_min.toFixed(2)} MPa ≥ 0 → Full compression`,
    ],
    result: {
      fp_average_mpa: parseFloat(fp_avg.toFixed(2)),
      fp_max_mpa: parseFloat(fp_max.toFixed(2)),
      fp_min_mpa: parseFloat(fp_min.toFixed(2)),
      pressure_type,
    },
    utilization_ratio: null,
    status: uplift_present ? 'WARNING' : 'SAFE',
    remarks: uplift_present
      ? 'Partial bearing condition. Anchor rods must resist tension. Verify triangular or trapezoidal pressure block design.'
      : 'Full compression under base plate. No anchor tension due to moment.',
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      average_pressure_mpa: parseFloat(fp_avg.toFixed(2)),
      maximum_pressure_mpa: parseFloat(fp_max.toFixed(2)),
      minimum_pressure_mpa: parseFloat(fp_min.toFixed(2)),
      pressure_type,
      uplift_present,
      anchor_tension_required,
      status: uplift_present ? 'WARNING' : 'SAFE',
    },
    calcResult,
  };
}
