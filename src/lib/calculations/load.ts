import type { LoadData, BasePlateData, LoadClassification, CalcResult, PressureDistCheck } from '@/types';

export function calculateEccentricityAndKern(
  loadData: LoadData,
  basePlateData: BasePlateData
): { classification: LoadClassification; calcResult: CalcResult } {
  const P = loadData.axial_load_kn ?? 0;
  const Mx = loadData.moment_major_knm ?? 0;
  const My = loadData.moment_minor_knm ?? 0;
  const N = basePlateData.plate_length_N_mm ?? 300;
  const B = basePlateData.plate_width_B_mm ?? 300;

  const ex = P !== 0 ? (Math.abs(Mx) * 1000) / Math.abs(P) : 0; // mm
  const ey = P !== 0 ? (Math.abs(My) * 1000) / Math.abs(P) : 0; // mm
  const kern_x = N / 6;
  const kern_y = B / 6;

  const biaxial = Math.abs(My) > 0.5;
  const biaxial_ratio = kern_x > 0 && kern_y > 0 ? ex / kern_x + ey / kern_y : 0;

  const within_kern = ex <= kern_x && ey <= kern_y;
  const biaxial_within_kern = biaxial ? biaxial_ratio <= 1.0 : within_kern;

  const pressure_condition = biaxial_within_kern && within_kern
    ? 'Full Compression (within kern — biaxial OK)'
    : 'Partial Compression / Potential Uplift';

  const anchor_tension_required = !within_kern || !biaxial_within_kern || loadData.axial_load_type === 'uplift';

  const calcResult: CalcResult = {
    calculation_name: biaxial ? 'Eccentricity, Kern & Biaxial Moment Check' : 'Eccentricity and Kern Check',
    design_code: 'AISC Design Guide 1 / IS 800:2007',
    formula: biaxial
      ? 'e_x = Mx/P  |  e_y = My/P  |  kern: e_x/kern_x + e_y/kern_y ≤ 1.0  (biaxial interaction)'
      : 'e = M / P  |  kern = N/6 (or B/6)',
    variables: {
      P: 'Axial Load (kN)',
      Mx: 'Moment about major axis (kNm)',
      My: 'Moment about minor axis (kNm)',
      N: 'Base plate length (mm)',
      B: 'Base plate width (mm)',
      e_x: 'Eccentricity in x-direction (mm)',
      e_y: 'Eccentricity in y-direction (mm)',
      kern_x: 'Kern limit in x-direction = N/6 (mm)',
      kern_y: 'Kern limit in y-direction = B/6 (mm)',
    },
    inputs: { P_kN: P, Mx_kNm: Mx, My_kNm: My, N_mm: N, B_mm: B },
    unit_conversions: {
      'Mx → Nmm': `${Mx} kNm × 1,000,000 = ${(Mx * 1e6).toFixed(0)} N·mm`,
      'My → Nmm': `${My} kNm × 1,000,000 = ${(My * 1e6).toFixed(0)} N·mm`,
    },
    substitutions: [
      `e_x = |${Mx}| × 1000 / |${P}| = ${ex.toFixed(1)} mm`,
      `e_y = |${My}| × 1000 / |${P}| = ${ey.toFixed(1)} mm`,
      `kern_x = ${N} / 6 = ${kern_x.toFixed(1)} mm`,
      `kern_y = ${B} / 6 = ${kern_y.toFixed(1)} mm`,
      ...(biaxial ? [`Biaxial ratio = ${ex.toFixed(1)}/${kern_x.toFixed(1)} + ${ey.toFixed(1)}/${kern_y.toFixed(1)} = ${biaxial_ratio.toFixed(3)} ${biaxial_ratio <= 1.0 ? '≤ 1.0 ✓' : '> 1.0 ✗'}`] : []),
    ],
    intermediate_steps: [
      `Eccentricity check (x): e_x = ${ex.toFixed(1)} mm ${ex <= kern_x ? '≤' : '>'} kern_x = ${kern_x.toFixed(1)} mm`,
      `Eccentricity check (y): e_y = ${ey.toFixed(1)} mm ${ey <= kern_y ? '≤' : '>'} kern_y = ${kern_y.toFixed(1)} mm`,
      ...(biaxial ? [`Biaxial kern interaction = ${biaxial_ratio.toFixed(3)} — ${biaxial_ratio <= 1.0 ? 'Full compression under biaxial moment' : 'Uplift zone exists'}`] : []),
    ],
    result: {
      eccentricity_x_mm: parseFloat(ex.toFixed(2)),
      eccentricity_y_mm: parseFloat(ey.toFixed(2)),
      kern_limit_x_mm: parseFloat(kern_x.toFixed(2)),
      kern_limit_y_mm: parseFloat(kern_y.toFixed(2)),
      biaxial_interaction_ratio: biaxial ? parseFloat(biaxial_ratio.toFixed(3)) : 'N/A (uniaxial)',
      pressure_condition,
    },
    utilization_ratio: biaxial
      ? parseFloat(biaxial_ratio.toFixed(3))
      : kern_x > 0 ? parseFloat((Math.max(ex / kern_x, ey / kern_y)).toFixed(3)) : null,
    status: anchor_tension_required ? 'WARNING' : 'SAFE',
    remarks: anchor_tension_required
      ? 'Load eccentricity exceeds kern — partial bearing occurs. Anchor tension may be required.'
      : 'Load eccentricity within kern limits — full compression bearing assumed.',
    timestamp: new Date().toISOString(),
  };

  return {
    classification: {
      eccentricity_x_mm: parseFloat(ex.toFixed(2)),
      eccentricity_y_mm: parseFloat(ey.toFixed(2)),
      kern_limit_x_mm: parseFloat(kern_x.toFixed(2)),
      kern_limit_y_mm: parseFloat(kern_y.toFixed(2)),
      pressure_condition,
      anchor_tension_required,
    },
    calcResult,
  };
}

export function calculateBiaxialPressureDistribution(
  loadData: LoadData,
  basePlateData: BasePlateData
): { check: PressureDistCheck; calcResult: CalcResult } {
  const P = Math.abs(loadData.axial_load_kn ?? 0) * 1000; // N
  const Mx = (loadData.moment_major_knm ?? 0) * 1e6;       // N·mm (about major/x axis)
  const My = (loadData.moment_minor_knm ?? 0) * 1e6;       // N·mm (about minor/y axis)
  const N = basePlateData.plate_length_N_mm ?? 300;
  const B = basePlateData.plate_width_B_mm ?? 300;
  const A = N * B;

  // Section moduli
  const Zx = (B * N * N) / 6;  // resist Mx (major axis bending → stress about x)
  const Zy = (N * B * B) / 6;  // resist My (minor axis bending → stress about y)

  const fp_avg = P / A;
  const delta_x = Math.abs(Mx) / Zx;
  const delta_y = Math.abs(My) / Zy;

  // Four corner pressures (biaxial)
  const fp_NE = P / A + delta_x + delta_y;   // max corner
  const fp_NW = P / A + delta_x - delta_y;
  const fp_SE = P / A - delta_x + delta_y;
  const fp_SW = P / A - delta_x - delta_y;   // min corner

  const fp_max = Math.max(fp_NE, fp_NW, fp_SE, fp_SW);
  const fp_min = Math.min(fp_NE, fp_NW, fp_SE, fp_SW);

  const uplift_present = fp_min < 0;
  const anchor_tension_required = uplift_present || loadData.axial_load_type === 'uplift';
  const biaxial = Math.abs(My * 1e-6) > 0.5;
  const pressure_type = biaxial
    ? (uplift_present ? 'Biaxial — Partial Compression (Uplift)' : 'Biaxial — Full Compression')
    : (uplift_present ? 'Uniaxial — Partial Compression (Uplift)' : 'Uniaxial — Full Compression');

  const calcResult: CalcResult = {
    calculation_name: biaxial ? 'Biaxial Pressure Distribution (4-Corner Analysis)' : 'Uniaxial Pressure Distribution',
    design_code: 'AISC Design Guide 1 / IS 800:2007',
    formula: biaxial
      ? 'fp = P/A ± Mx/Zx ± My/Zy  (4-corner analysis)'
      : 'fp_max = P/A + M/Z  |  fp_min = P/A − M/Z  |  Z = B × N² / 6',
    variables: {
      P: 'Axial load (N)',
      Mx: 'Major axis moment (N·mm)',
      My: 'Minor axis moment (N·mm)',
      A: 'Plate area = N × B (mm²)',
      Zx: 'Section modulus about x = B×N²/6 (mm³)',
      Zy: 'Section modulus about y = N×B²/6 (mm³)',
    },
    inputs: {
      P_N: P,
      Mx_Nmm: parseFloat(Mx.toFixed(0)),
      My_Nmm: parseFloat(My.toFixed(0)),
      N_mm: N, B_mm: B,
    },
    unit_conversions: {
      'Mx kNm→Nmm': `${(Mx / 1e6).toFixed(2)} × 10⁶ = ${Mx.toFixed(0)} N·mm`,
      'My kNm→Nmm': `${(My / 1e6).toFixed(2)} × 10⁶ = ${My.toFixed(0)} N·mm`,
    },
    substitutions: [
      `A = ${N} × ${B} = ${A.toLocaleString()} mm²`,
      `Zx = ${B} × ${N}² / 6 = ${Zx.toLocaleString(undefined, { maximumFractionDigits: 0 })} mm³`,
      biaxial ? `Zy = ${N} × ${B}² / 6 = ${Zy.toLocaleString(undefined, { maximumFractionDigits: 0 })} mm³` : '',
      `fp_avg = ${P.toFixed(0)} / ${A.toLocaleString()} = ${fp_avg.toFixed(2)} MPa`,
      `Δ_x (from Mx) = ${Math.abs(Mx).toFixed(0)} / ${Zx.toLocaleString(undefined, { maximumFractionDigits: 0 })} = ${delta_x.toFixed(3)} MPa`,
      biaxial ? `Δ_y (from My) = ${Math.abs(My).toFixed(0)} / ${Zy.toLocaleString(undefined, { maximumFractionDigits: 0 })} = ${delta_y.toFixed(3)} MPa` : '',
    ].filter(Boolean) as string[],
    intermediate_steps: biaxial ? [
      `Corner NE (max): ${fp_avg.toFixed(2)} + ${delta_x.toFixed(3)} + ${delta_y.toFixed(3)} = ${fp_NE.toFixed(2)} MPa`,
      `Corner NW: ${fp_avg.toFixed(2)} + ${delta_x.toFixed(3)} − ${delta_y.toFixed(3)} = ${fp_NW.toFixed(2)} MPa`,
      `Corner SE: ${fp_avg.toFixed(2)} − ${delta_x.toFixed(3)} + ${delta_y.toFixed(3)} = ${fp_SE.toFixed(2)} MPa`,
      `Corner SW (min): ${fp_avg.toFixed(2)} − ${delta_x.toFixed(3)} − ${delta_y.toFixed(3)} = ${fp_SW.toFixed(2)} MPa`,
      `Pressure type: ${pressure_type}`,
      fp_min < 0 ? `fp_min = ${fp_min.toFixed(2)} MPa < 0 → Uplift on tension side. Anchor tension required.` : 'All corners in compression — no anchor tension from moment.',
    ] : [
      `fp_max = ${fp_avg.toFixed(2)} + ${delta_x.toFixed(3)} = ${fp_max.toFixed(2)} MPa`,
      `fp_min = ${fp_avg.toFixed(2)} − ${delta_x.toFixed(3)} = ${fp_min.toFixed(2)} MPa`,
      fp_min < 0 ? `fp_min < 0 → Uplift exists. Anchor tension required.` : 'Full compression. No anchor tension from moment.',
    ],
    result: biaxial ? {
      fp_avg_mpa: parseFloat(fp_avg.toFixed(2)),
      fp_NE_mpa: parseFloat(fp_NE.toFixed(2)),
      fp_NW_mpa: parseFloat(fp_NW.toFixed(2)),
      fp_SE_mpa: parseFloat(fp_SE.toFixed(2)),
      fp_SW_mpa: parseFloat(fp_SW.toFixed(2)),
      fp_max_mpa: parseFloat(fp_max.toFixed(2)),
      fp_min_mpa: parseFloat(fp_min.toFixed(2)),
      pressure_type,
    } : {
      fp_average_mpa: parseFloat(fp_avg.toFixed(2)),
      fp_max_mpa: parseFloat(fp_max.toFixed(2)),
      fp_min_mpa: parseFloat(fp_min.toFixed(2)),
      pressure_type,
    },
    utilization_ratio: null,
    status: uplift_present ? 'WARNING' : 'SAFE',
    remarks: uplift_present
      ? `${biaxial ? 'Biaxial' : 'Uniaxial'} partial bearing. Anchor rods must resist tension. Verify pressure block design.`
      : `${biaxial ? 'Biaxial' : 'Uniaxial'} full compression. No anchor tension from moment.`,
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
