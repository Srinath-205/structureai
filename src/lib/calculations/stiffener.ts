import type { PlateThicknessCheck, AnchorForceCheck, StiffenerCheck, CalcResult } from '@/types';

export function checkStiffenerRequirement(
  plateCheck: PlateThicknessCheck,
  anchorCheck: AnchorForceCheck
): { check: StiffenerCheck; calcResult: CalcResult } {
  const tp_req = plateCheck.required_thickness_mm ?? 0;
  const tp_prov = plateCheck.provided_thickness_mm ?? 0;
  const d_anc = anchorCheck.anchor_diameter_mm ?? 0;
  const T_per = anchorCheck.tension_per_anchor_kn ?? 0;

  const reasons: string[] = [];
  let required = false;

  if (tp_req > 40) { required = true; reasons.push(`Required plate thickness (${tp_req.toFixed(0)} mm) > 40 mm`); }
  if (d_anc > tp_prov && T_per > 20) { required = true; reasons.push(`High anchor tension with d_anchor > t_plate`); }
  if ((plateCheck.utilization_ratio ?? 0) > 0.9 && tp_prov < 25) {
    required = true; reasons.push('Plate utilization high with thin plate');
  }

  const stp = required ? Math.max(10, Math.ceil(tp_prov * 0.8)) : null;
  const sth = required ? Math.max(100, Math.ceil((plateCheck.critical_projection_l_mm ?? 100) * 1.5)) : null;
  const stl = required ? Math.max(150, Math.ceil((plateCheck.m_mm ?? 75) * 2)) : null;

  const status = required ? 'WARNING' : 'SAFE';

  const calcResult: CalcResult = {
    calculation_name: 'Stiffener Plate Requirement',
    design_code: 'AISC Design Guide 1 – Engineering Judgment',
    formula: 'Trigger: t_req > 40mm OR d_anchor > t_plate with high tension',
    variables: {
      tp_req: 'Required plate thickness (mm)',
      d_anchor: 'Anchor rod diameter (mm)',
      T_anchor: 'Tension per anchor (kN)',
    },
    inputs: { tp_req_mm: tp_req, tp_prov_mm: tp_prov, d_anchor_mm: d_anc, T_per_anchor_kN: T_per },
    unit_conversions: {},
    substitutions: [],
    intermediate_steps: reasons.length > 0
      ? reasons
      : ['No stiffener triggers found.'],
    result: {
      stiffener_required: required,
      reasons: reasons.join('; ') || 'None',
      recommended_thickness_mm: stp,
      recommended_height_mm: sth,
      recommended_length_mm: stl,
    },
    utilization_ratio: null,
    status,
    remarks: required
      ? `Stiffener plates recommended. Suggested: ${stp}mm thick × ${sth}mm high × ${stl}mm long. Weld to column flange and base plate.`
      : 'Stiffener plates not required based on current design parameters.',
    timestamp: new Date().toISOString(),
  };

  return {
    check: {
      stiffener_required: required,
      reason: reasons.join('; ') || 'Not required',
      recommended_stiffener_thickness_mm: stp,
      recommended_stiffener_height_mm: sth,
      recommended_stiffener_length_mm: stl,
      weld_to_stiffener_required: required,
      status,
    },
    calcResult,
  };
}
