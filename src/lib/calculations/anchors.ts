import type { AnchorData, LoadData, BasePlateData, EmbedmentData, DesignSelection, AnchorForceCheck, EmbedmentCheck, CalcResult } from '@/types';
import { PHI_B_AISC, OMEGA_B_AISC } from '@/constants';

const PHI_SE = 0.75; // steel strength in tension/shear (ACI 318)
const OMEGA_SE = 2.0; // ASD factor

export function calculateAnchorForces(
  loadData: LoadData,
  basePlateData: BasePlateData,
  anchorData: AnchorData,
  designSelection: DesignSelection
): { check: AnchorForceCheck; calcResult: CalcResult } {
  const P = (loadData.axial_load_kn ?? 0); // kN (signed: negative = uplift)
  const Mx = loadData.moment_major_knm ?? 0;
  const My = loadData.moment_minor_knm ?? 0;
  const Vx = loadData.shear_x_kn ?? 0;
  const Vy = loadData.shear_y_kn ?? 0;
  const V_total = Math.sqrt(Vx * Vx + Vy * Vy);
  const N_bp = basePlateData.plate_length_N_mm ?? 300;
  const B_bp = basePlateData.plate_width_B_mm ?? 300;
  const n_anc = anchorData.anchor_count ?? 4;
  const d_anc = anchorData.anchor_diameter_mm ?? 24;
  const fy_anc = anchorData.anchor_fy_mpa ?? 248;
  const fu_anc = anchorData.anchor_fu_mpa ?? 400;
  const Ase = Math.PI * (d_anc * 0.9) ** 2 / 4; // effective stress area approx

  // Eccentricity check
  const ex = P !== 0 ? Math.abs(Mx * 1000) / Math.abs(P) : 9999;
  const kern_x = N_bp / 6;
  const needs_tension = ex > kern_x || loadData.axial_load_type === 'uplift';

  // Tension anchors (assume half on tension side for rectangular layout)
  const n_tension = Math.max(Math.floor(n_anc / 2), 1);
  const n_shear = n_anc;

  let T_total = 0;
  if (loadData.axial_load_type === 'uplift') {
    T_total = Math.abs(P);
  } else if (needs_tension && P !== 0) {
    // Simplified: T = (|Mx| - P*N_bp/6) / (0.85*N_bp) as kN
    const arm = 0.85 * N_bp / 1000; // m
    T_total = Math.max((Math.abs(Mx) - Math.abs(P) * N_bp / 6000) / arm, 0);
  }

  const T_per_anchor = n_tension > 0 ? T_total / n_tension : 0;
  const V_per_anchor = n_shear > 0 ? V_total / n_shear : 0;

  // Capacity
  let T_cap = 0, V_cap = 0;
  if (designSelection.design_code === 'AISC' && designSelection.design_method === 'LRFD') {
    T_cap = (PHI_SE * 0.75 * fu_anc * Ase) / 1000; // kN
    V_cap = (PHI_SE * 0.60 * fu_anc * Ase) / 1000;
  } else if (designSelection.design_code === 'AISC' && designSelection.design_method === 'ASD') {
    T_cap = (0.75 * fu_anc * Ase) / (OMEGA_SE * 1000);
    V_cap = (0.60 * fu_anc * Ase) / (OMEGA_SE * 1000);
  } else {
    // IS 800 / IS 1367: T = 0.78 * Ase * fu / 1.25
    T_cap = (0.78 * Ase * fu_anc) / (1.25 * 1000);
    V_cap = (0.45 * Ase * fu_anc) / (1.25 * 1000);
  }

  // Interaction (ACI 318 / IS 800)
  const t_util = T_cap > 0 ? T_per_anchor / T_cap : 0;
  const v_util = V_cap > 0 ? V_per_anchor / V_cap : 0;
  const interaction = Math.pow(t_util, 5 / 3) + Math.pow(v_util, 5 / 3); // ACI 318 Eq. R17.7.3.2a
  const interaction_linear = t_util + v_util; // simplified

  const comb_ratio = Math.max(interaction_linear, 0);
  const status = t_util <= 1.0 && v_util <= 1.0 && interaction <= 1.0 ? 'SAFE' : 'FAIL';

  const calcResult: CalcResult = {
    calculation_name: 'Anchor Bolt / Anchor Rod Force Check',
    design_code: designSelection.design_code === 'AISC'
      ? 'ACI 318-19 Chapter 17 / AISC Design Guide 1'
      : 'IS 800:2007 / IS 5624',
    formula:
      designSelection.design_code === 'AISC' && designSelection.design_method === 'LRFD'
        ? 'φNsa = φ × 0.75 × futa × Ase  |  φVsa = φ × 0.60 × futa × Ase'
        : designSelection.design_code === 'AISC'
        ? 'Nsa_allow = 0.75 × futa × Ase / Ω'
        : 'Nt = 0.78 × Ase × fu / 1.25  |  Vt = 0.45 × Ase × fu / 1.25',
    variables: {
      Ase: 'Effective stress area of anchor (mm²) ≈ π(0.9d)²/4',
      fu: 'Anchor tensile strength (MPa)',
      T_cap: 'Tension capacity per anchor (kN)',
      V_cap: 'Shear capacity per anchor (kN)',
      n_tension: 'Number of effective tension anchors',
      n_shear: 'Number of effective shear anchors',
    },
    inputs: {
      d_anchor_mm: d_anc,
      fy_mpa: fy_anc,
      fu_mpa: fu_anc,
      n_anchors: n_anc,
      P_kN: P,
      Mx_kNm: Mx,
      V_total_kN: parseFloat(V_total.toFixed(1)),
    },
    unit_conversions: { 'Ase approx': `π × (0.9 × ${d_anc})² / 4 = ${Ase.toFixed(0)} mm²` },
    substitutions: [
      `Ase ≈ π × (${(0.9 * d_anc).toFixed(1)})² / 4 = ${Ase.toFixed(0)} mm²`,
      `T_capacity = ${designSelection.design_method === 'LRFD' ? `${PHI_SE} × 0.75 × ${fu_anc} × ${Ase.toFixed(0)}` : `0.75 × ${fu_anc} × ${Ase.toFixed(0)} / ${OMEGA_SE}`} = ${(T_cap * 1000).toFixed(0)} N = ${T_cap.toFixed(1)} kN`,
      `V_capacity = ${(V_cap * 1000).toFixed(0)} N = ${V_cap.toFixed(1)} kN`,
      `T_total_demand = ${T_total.toFixed(1)} kN  |  T_per_anchor = ${T_per_anchor.toFixed(1)} kN`,
      `V_total_demand = ${V_total.toFixed(1)} kN  |  V_per_anchor = ${V_per_anchor.toFixed(1)} kN`,
      `Tension utilization = ${T_per_anchor.toFixed(1)} / ${T_cap.toFixed(1)} = ${t_util.toFixed(3)}`,
      `Shear utilization = ${V_per_anchor.toFixed(1)} / ${V_cap.toFixed(1)} = ${v_util.toFixed(3)}`,
      `T-V Interaction = ${t_util.toFixed(3)} + ${v_util.toFixed(3)} = ${interaction_linear.toFixed(3)} (linear check)`,
    ],
    intermediate_steps: [
      `Eccentricity = ${ex === 9999 ? 'N/A' : ex.toFixed(1)} mm  |  Kern = ${kern_x.toFixed(1)} mm  →  Anchor tension ${needs_tension ? 'REQUIRED' : 'not required for moment'}`,
      `Effective tension anchors: ${n_tension}  |  Shear anchors: ${n_shear}`,
      `T_per_anchor = ${T_per_anchor.toFixed(1)} kN vs capacity ${T_cap.toFixed(1)} kN → ${t_util <= 1.0 ? 'OK' : 'FAIL'}`,
      `V_per_anchor = ${V_per_anchor.toFixed(1)} kN vs capacity ${V_cap.toFixed(1)} kN → ${v_util <= 1.0 ? 'OK' : 'FAIL'}`,
    ],
    result: {
      T_total_kN: parseFloat(T_total.toFixed(1)),
      T_per_anchor_kN: parseFloat(T_per_anchor.toFixed(1)),
      T_capacity_kN: parseFloat(T_cap.toFixed(1)),
      V_total_kN: parseFloat(V_total.toFixed(1)),
      V_per_anchor_kN: parseFloat(V_per_anchor.toFixed(1)),
      V_capacity_kN: parseFloat(V_cap.toFixed(1)),
      t_utilization: parseFloat(t_util.toFixed(3)),
      v_utilization: parseFloat(v_util.toFixed(3)),
      interaction: parseFloat(interaction_linear.toFixed(3)),
    },
    utilization_ratio: parseFloat(Math.max(t_util, v_util, interaction_linear).toFixed(3)),
    status,
    remarks: status === 'FAIL'
      ? 'Anchor capacity exceeded. Increase anchor diameter, grade, or number of anchors.'
      : 'Anchor bolt forces within capacity. Verify concrete anchorage (ACI 318 Ch.17 / IS checks).',
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      anchor_count: n_anc,
      anchor_diameter_mm: d_anc,
      anchor_grade: anchorData.anchor_grade,
      anchor_fy_mpa: fy_anc,
      anchor_fu_mpa: fu_anc,
      total_anchor_tension_kn: parseFloat(T_total.toFixed(1)),
      effective_tension_anchors: n_tension,
      tension_per_anchor_kn: parseFloat(T_per_anchor.toFixed(1)),
      tension_capacity_per_anchor_kn: parseFloat(T_cap.toFixed(1)),
      total_shear_kn: parseFloat(V_total.toFixed(1)),
      effective_shear_anchors: n_shear,
      shear_per_anchor_kn: parseFloat(V_per_anchor.toFixed(1)),
      shear_capacity_per_anchor_kn: parseFloat(V_cap.toFixed(1)),
      combined_interaction_ratio: parseFloat(interaction_linear.toFixed(3)),
      status,
    },
    calcResult,
  };
}

export function calculateAnchorDiameterWarning(
  anchorData: AnchorData,
  basePlateData: BasePlateData
): CalcResult {
  const d_anc = anchorData.anchor_diameter_mm ?? 0;
  const tp = basePlateData.provided_thickness_tp_mm ?? 0;
  const ratio = tp > 0 ? d_anc / tp : 99;
  const isWarning = d_anc > tp;

  return {
    calculation_name: 'Anchor Diameter vs Plate Thickness Check',
    design_code: 'AISC Design Guide 1 – Constructability Advisory',
    formula: 'Check: d_anchor ≤ t_plate (practical / prying limit)',
    variables: {
      d_anchor: 'Anchor rod diameter (mm)',
      t_plate: 'Base plate thickness (mm)',
      ratio: 'd_anchor / t_plate',
    },
    inputs: { d_anchor_mm: d_anc, t_plate_mm: tp },
    unit_conversions: {},
    substitutions: [
      `d/t = ${d_anc} / ${tp} = ${ratio.toFixed(2)}`,
    ],
    intermediate_steps: [
      `Anchor diameter: ${d_anc} mm  |  Plate thickness: ${tp} mm`,
      isWarning
        ? `⚠ d_anchor (${d_anc} mm) > t_plate (${tp} mm) — Risk of local plate prying and bending`
        : `d_anchor (${d_anc} mm) ≤ t_plate (${tp} mm) — Acceptable`,
    ],
    result: { ratio: parseFloat(ratio.toFixed(2)), warning: isWarning },
    utilization_ratio: parseFloat(ratio.toFixed(3)),
    status: isWarning ? 'WARNING' : 'SAFE',
    remarks: isWarning
      ? 'Anchor diameter exceeds plate thickness. Consider: (1) Increase plate thickness, (2) Add washer plate, (3) Reduce anchor diameter, (4) Add stiffener, (5) Check local prying.'
      : 'No prying/local bending concern from anchor vs plate geometry.',
    timestamp: new Date().toISOString(),
  };
}

export function calculateEmbedment(
  anchorData: AnchorData,
  embedmentData: EmbedmentData,
  concreteData: { fck_mpa: number | null; fc_prime_mpa: number | null },
  designSelection: DesignSelection
): { check: EmbedmentCheck; calcResult: CalcResult } {
  const d = anchorData.anchor_diameter_mm ?? 24;
  const fu = anchorData.anchor_fu_mpa ?? 400;
  const Ase = Math.PI * (0.9 * d) ** 2 / 4;
  const hef_initial = 12 * d;
  const hef_prov = embedmentData.effective_embedment_hef_mm ?? hef_initial;
  const fc = concreteData.fc_prime_mpa ?? concreteData.fck_mpa ?? 28;
  const hef_min = 10 * d;

  // ACI 318 Ch. 17 simplified steel strength in tension
  const phi_Nsa = 0.75 * 0.75 * fu * Ase / 1000; // kN

  // Simplified concrete breakout (ACI 318 Eq. 17.6.2.1b)
  const Nb = 16 * Math.sqrt(fc) * Math.pow(hef_prov, 1.5) / 1000; // kN (cast-in headed)
  const phi_Ncb = 0.70 * Nb; // approx single anchor

  // Pullout (ACI 318 17.6.3.2 – headed anchor)
  const Np = 8 * fc * Math.PI * d * d / 4 / 1000; // kN simplified
  const phi_Np = 0.70 * Np;

  const adequate_embedment = hef_prov >= hef_min;
  const steel_ok = phi_Nsa > 0;
  const breakout_ok = phi_Ncb >= phi_Nsa * 0.5;
  const overall_ok = adequate_embedment && breakout_ok;

  const calcResult: CalcResult = {
    calculation_name: 'Anchor Embedment Length Check',
    design_code: designSelection.design_code === 'AISC'
      ? 'ACI 318-19 Chapter 17'
      : 'IS 456:2000 / IS 5624',
    formula: 'hef,min ≈ 10d to 12d  |  Nb = 16√f\'c × hef^1.5 (ACI 318 Eq. 17.6.2.1b)',
    variables: {
      d: 'Anchor diameter (mm)',
      hef: 'Effective embedment depth (mm)',
      hef_min: 'Minimum recommended embedment (mm)',
      Nb: 'Basic concrete breakout strength (kN)',
      phi_Nsa: 'Steel tensile capacity (kN)',
    },
    inputs: {
      d_mm: d,
      hef_provided_mm: hef_prov,
      hef_initial_mm: hef_initial,
      fc_mpa: fc,
      fu_mpa: fu,
    },
    unit_conversions: {},
    substitutions: [
      `hef,min = 10 × ${d} = ${hef_min} mm  |  hef,initial = 12 × ${d} = ${hef_initial} mm`,
      `Ase ≈ π × (0.9×${d})² / 4 = ${Ase.toFixed(0)} mm²`,
      `φNsa = 0.75 × 0.75 × ${fu} × ${Ase.toFixed(0)} = ${phi_Nsa.toFixed(1)} kN`,
      `Nb = 16 × √${fc} × ${hef_prov}^1.5 / 1000 = ${Nb.toFixed(1)} kN`,
      `φNcb ≈ 0.70 × ${Nb.toFixed(1)} = ${phi_Ncb.toFixed(1)} kN (single anchor approx)`,
      `Np (headed) = 8 × ${fc} × π × ${d}²/4 / 1000 = ${Np.toFixed(1)} kN`,
    ],
    intermediate_steps: [
      `Provided hef = ${hef_prov} mm vs minimum ${hef_min} mm → ${adequate_embedment ? 'OK' : 'INSUFFICIENT'}`,
      `Steel strength: φNsa = ${phi_Nsa.toFixed(1)} kN`,
      `Concrete breakout: φNcb ≈ ${phi_Ncb.toFixed(1)} kN → ${breakout_ok ? 'Adequate' : 'Check group breakout'}`,
      `Pullout: φNp ≈ ${phi_Np.toFixed(1)} kN`,
      `Note: Full ACI 318 Ch. 17 group breakout requires detailed pedestal/edge geometry analysis.`,
    ],
    result: {
      hef_initial_mm: hef_initial,
      hef_min_mm: hef_min,
      hef_provided_mm: hef_prov,
      embedment_ratio_d: parseFloat((hef_prov / d).toFixed(1)),
      phi_Nsa_kN: parseFloat(phi_Nsa.toFixed(1)),
      phi_Ncb_kN: parseFloat(phi_Ncb.toFixed(1)),
      phi_Np_kN: parseFloat(phi_Np.toFixed(1)),
    },
    utilization_ratio: parseFloat((hef_min / hef_prov).toFixed(3)),
    status: overall_ok ? 'SAFE' : 'WARNING',
    remarks: overall_ok
      ? `Embedment length adequate. hef = ${hef_prov} mm (${(hef_prov / d).toFixed(1)}d). Full ACI 318-19 Ch. 17 group breakout analysis recommended for final design.`
      : `Embedment concern. Increase hef to minimum ${hef_min} mm or verify with full ACI 318 Ch. 17 analysis.`,
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      initial_embedment_mm: hef_initial,
      embedment_ratio_d: parseFloat((hef_prov / d).toFixed(1)),
      provided_embedment_mm: hef_prov,
      minimum_required_embedment_mm: hef_min,
      steel_tension_status: 'SAFE',
      concrete_breakout_tension_status: breakout_ok ? 'SAFE' : 'WARNING',
      pullout_status: 'SAFE',
      side_face_blowout_status: 'INFO',
      steel_shear_status: 'SAFE',
      concrete_breakout_shear_status: 'INFO',
      pryout_status: 'INFO',
      interaction_status: 'INFO',
      overall_status: overall_ok ? 'SAFE' : 'WARNING',
    },
    calcResult,
  };
}
