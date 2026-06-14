import type { LoadData, AnchorForceCheck, ShearKeyCheck, CalcResult } from '@/types';

export function checkShearKey(
  loadData: LoadData,
  anchorCheck: AnchorForceCheck
): { check: ShearKeyCheck; calcResult: CalcResult } {
  const Vx = loadData.shear_x_kn ?? 0;
  const Vy = loadData.shear_y_kn ?? 0;
  const V_total = Math.sqrt(Vx * Vx + Vy * Vy);
  const anchor_shear_cap = (anchorCheck.shear_capacity_per_anchor_kn ?? 0) * (anchorCheck.effective_shear_anchors ?? 4);

  const reasons: string[] = [];
  let required = false;

  if (V_total > anchor_shear_cap) {
    required = true;
    reasons.push(`Base shear (${V_total.toFixed(1)} kN) > Anchor shear capacity (${anchor_shear_cap.toFixed(1)} kN)`);
  }
  if ((anchorCheck.combined_interaction_ratio ?? 0) > 1.0) {
    required = true;
    reasons.push('Tension-shear interaction exceeds limit');
  }

  // Shear lug sizing (simplified: Vu / (φ × 0.85 × fc × bearing_width))
  const fc = 28; // default MPa
  const phi = 0.65;
  const lug_depth_mm = required ? Math.max(50, Math.ceil(V_total * 1000 / (phi * 0.85 * fc * 150))) : null;
  const lug_thickness_mm = required ? Math.max(16, Math.ceil(lug_depth_mm! * 0.3)) : null;
  const lug_width_mm = required ? 150 : null;

  const status = required ? 'WARNING' : 'SAFE';

  const calcResult: CalcResult = {
    calculation_name: 'Shear Key / Shear Lug Requirement',
    design_code: 'AISC Design Guide 1 / ACI 318-19',
    formula: 'Check: Vu_base > ΣφVsa_anchor  →  Shear key required',
    variables: {
      V_total: 'Total base shear = √(Vx² + Vy²) (kN)',
      anchor_shear_cap: 'Total anchor shear capacity (kN)',
      lug_depth: 'Shear lug bearing depth into concrete (mm)',
    },
    inputs: {
      Vx_kN: Vx,
      Vy_kN: Vy,
      V_total_kN: parseFloat(V_total.toFixed(1)),
      anchor_shear_capacity_kN: parseFloat(anchor_shear_cap.toFixed(1)),
    },
    unit_conversions: {},
    substitutions: [
      `V_total = √(${Vx}² + ${Vy}²) = ${V_total.toFixed(1)} kN`,
      `Anchor shear cap = ${anchorCheck.shear_capacity_per_anchor_kn?.toFixed(1)} × ${anchorCheck.effective_shear_anchors} = ${anchor_shear_cap.toFixed(1)} kN`,
    ],
    intermediate_steps: reasons.length > 0
      ? reasons
      : [`Anchor shear capacity (${anchor_shear_cap.toFixed(1)} kN) sufficient for base shear (${V_total.toFixed(1)} kN)`],
    result: {
      shear_key_required: required,
      reason: reasons.join('; ') || 'Not required',
      lug_depth_mm,
      lug_thickness_mm,
      lug_width_mm,
    },
    utilization_ratio: anchor_shear_cap > 0 ? parseFloat((V_total / anchor_shear_cap).toFixed(3)) : null,
    status,
    remarks: required
      ? `Shear key recommended. Suggested lug: ${lug_thickness_mm}mm thick × ${lug_depth_mm}mm deep × ${lug_width_mm}mm wide. Groove into concrete pedestal.`
      : 'Base shear can be transferred through anchor rods. Shear key not required.',
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      shear_key_required: required,
      reason: reasons.join('; ') || 'Not required',
      base_shear_kn: parseFloat(V_total.toFixed(1)),
      anchor_shear_capacity_kn: parseFloat(anchor_shear_cap.toFixed(1)),
      recommended_shear_key_depth_mm: lug_depth_mm,
      recommended_shear_key_thickness_mm: lug_thickness_mm,
      recommended_shear_key_width_mm: lug_width_mm,
      status,
    },
    calcResult,
  };
}
