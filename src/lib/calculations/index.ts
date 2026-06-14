import type { DesignInputs, DesignResults, CalcStatus } from '@/types';
import { calculateEccentricityAndKern, calculateBiaxialPressureDistribution } from './load';
import { calculateConcreteBearing, calculatePressureDistribution } from './bearing';
import { calculateBasePlateGeometry, calculatePlateThickness } from './baseplate';
import {
  calculateAnchorForces,
  calculateAnchorDiameterWarning,
  calculateEmbedment,
} from './anchors';
import { calculateWeld } from './weld';
import { checkStiffenerRequirement } from './stiffener';
import { checkShearKey } from './shearkey';

export function runAllCalculations(inputs: DesignInputs): DesignResults {
  const calc_results = [];
  const warnings: string[] = [];
  const critical_issues: string[] = [];
  const recommendations: string[] = [];
  const engineering_notes: string[] = [];

  // 1. Eccentricity and kern
  const { classification, calcResult: cr1 } = calculateEccentricityAndKern(
    inputs.load_data,
    inputs.base_plate_data
  );
  calc_results.push(cr1);

  // 2. Pressure distribution (biaxial if My is present)
  const hasBiaxialMoment = Math.abs(inputs.load_data.moment_minor_knm ?? 0) > 0.5;
  const { check: pressureDist, calcResult: cr2 } = hasBiaxialMoment
    ? calculateBiaxialPressureDistribution(inputs.load_data, inputs.base_plate_data)
    : calculatePressureDistribution(inputs.load_data, inputs.base_plate_data);
  calc_results.push(cr2);
  if (pressureDist.uplift_present) warnings.push('Partial bearing detected. Anchor tension design required.');

  // 3. Base plate geometry
  const { geometry, calcResult: cr3 } = calculateBasePlateGeometry(
    inputs.column_data,
    inputs.base_plate_data,
    inputs.concrete_data
  );
  calc_results.push(cr3);
  if (geometry.size_status !== 'ADEQUATE') warnings.push(`Base plate may be undersized. Min recommended: ${geometry.minimum_length_required_mm}×${geometry.minimum_width_required_mm} mm`);

  // 4. Concrete bearing
  const { check: bearing, calcResult: cr4 } = calculateConcreteBearing(
    inputs.load_data,
    inputs.base_plate_data,
    inputs.concrete_data,
    inputs.design_selection
  );
  calc_results.push(cr4);
  if (bearing.status === 'FAIL') critical_issues.push('Concrete bearing FAILS. Redesign required.');

  // 5. Plate thickness
  const { check: plateTck, calcResult: cr5 } = calculatePlateThickness(
    inputs.load_data,
    inputs.column_data,
    inputs.base_plate_data,
    inputs.design_selection
  );
  calc_results.push(cr5);
  if (plateTck.status === 'FAIL') critical_issues.push(`Plate thickness insufficient. Required: ${plateTck.required_thickness_mm} mm`);

  // 6. Anchor forces
  const { check: anchorForce, calcResult: cr6 } = calculateAnchorForces(
    inputs.load_data,
    inputs.base_plate_data,
    inputs.anchor_data,
    inputs.design_selection
  );
  calc_results.push(cr6);
  if (anchorForce.status === 'FAIL') critical_issues.push('Anchor bolt capacity exceeded.');

  // 7. Anchor diameter vs plate thickness
  const cr7 = calculateAnchorDiameterWarning(inputs.anchor_data, inputs.base_plate_data);
  calc_results.push(cr7);
  if (cr7.status === 'WARNING') warnings.push(cr7.remarks);

  // 8. Embedment
  const { check: embedment, calcResult: cr8 } = calculateEmbedment(
    inputs.anchor_data,
    inputs.embedment_data,
    inputs.concrete_data,
    inputs.design_selection
  );
  calc_results.push(cr8);
  if (embedment.overall_status === 'WARNING') warnings.push('Anchor embedment requires detailed ACI 318 Ch.17 verification.');

  // 9. Weld
  const { check: weld, calcResult: cr9 } = calculateWeld(
    inputs.load_data,
    inputs.column_data,
    inputs.weld_data,
    inputs.design_selection
  );
  calc_results.push(cr9);
  if (weld.status === 'FAIL') critical_issues.push(`Weld capacity exceeded. Increase weld size to ${weld.required_weld_size_mm} mm.`);

  // 10. Stiffener
  const { check: stiffener, calcResult: cr10 } = checkStiffenerRequirement(plateTck, anchorForce);
  calc_results.push(cr10);
  if (stiffener.stiffener_required) recommendations.push('Consider stiffener plates to improve load distribution.');

  // 11. Shear key
  const { check: shearKey, calcResult: cr11 } = checkShearKey(inputs.load_data, anchorForce);
  calc_results.push(cr11);
  if (shearKey.shear_key_required) recommendations.push('Shear key or shear lug recommended.');

  engineering_notes.push(
    'All calculations performed using deterministic algorithms per applicable design standards.',
    'Preliminary embedment values require full ACI 318-19 Chapter 17 or IS 456 detailed checks.',
    'Weld effective length estimated from column geometry — verify with fabrication drawings.',
    'This output is for engineering assessment only. Final design requires QA review by licensed engineer.'
  );

  // Overall status
  const overall_status: CalcStatus = critical_issues.length > 0
    ? 'FAIL'
    : warnings.length > 0
    ? 'WARNING'
    : 'SAFE';

  return {
    load_classification: classification,
    base_plate_geometry: geometry,
    pressure_distribution: pressureDist,
    concrete_bearing: bearing,
    plate_thickness: plateTck,
    anchor_force: anchorForce,
    embedment,
    weld,
    stiffener,
    shear_key: shearKey,
    calc_results,
    overall_status,
    warnings,
    critical_issues,
    recommendations,
    engineering_notes,
  };
}

export { calculateEccentricityAndKern, calculateBiaxialPressureDistribution } from './load';
export { calculateConcreteBearing, calculatePressureDistribution } from './bearing';
export { calculateBasePlateGeometry, calculatePlateThickness } from './baseplate';
export { calculateAnchorForces, calculateAnchorDiameterWarning, calculateEmbedment } from './anchors';
export { calculateWeld } from './weld';
export { checkStiffenerRequirement } from './stiffener';
export { checkShearKey } from './shearkey';
