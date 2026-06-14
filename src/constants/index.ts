export const DESIGN_CODES = {
  AISC_LRFD: {
    label: 'AISC LRFD',
    design_code: 'AISC' as const,
    design_method: 'LRFD' as const,
    country_standard: 'American',
    steel_code: 'AISC 360-22',
    concrete_code: 'ACI 318-19',
    anchor_code: 'ACI 318-19 Chapter 17',
    base_plate_guide: 'AISC Design Guide 1',
  },
  AISC_ASD: {
    label: 'AISC ASD',
    design_code: 'AISC' as const,
    design_method: 'ASD' as const,
    country_standard: 'American',
    steel_code: 'AISC 360-22',
    concrete_code: 'ACI 318-19',
    anchor_code: 'ACI 318-19 Chapter 17',
    base_plate_guide: 'AISC Design Guide 1',
  },
  IS_LSM: {
    label: 'IS 800 Limit State',
    design_code: 'IS' as const,
    design_method: 'Limit State' as const,
    country_standard: 'Indian',
    steel_code: 'IS 800:2007',
    concrete_code: 'IS 456:2000',
    anchor_code: 'IS 456:2000 / IS 5624',
    base_plate_guide: 'IS 800:2007 Section 7',
  },
};

export const STEEL_GRADES_AISC = [
  { grade: 'A36', fy_mpa: 248, fu_mpa: 400 },
  { grade: 'A572 Gr 50', fy_mpa: 345, fu_mpa: 448 },
  { grade: 'A572 Gr 60', fy_mpa: 414, fu_mpa: 517 },
  { grade: 'A992', fy_mpa: 345, fu_mpa: 448 },
];

export const STEEL_GRADES_IS = [
  { grade: 'E250 (Fe 410)', fy_mpa: 250, fu_mpa: 410 },
  { grade: 'E275 (Fe 430)', fy_mpa: 275, fu_mpa: 430 },
  { grade: 'E300 (Fe 440)', fy_mpa: 300, fu_mpa: 440 },
  { grade: 'E350 (Fe 490)', fy_mpa: 350, fu_mpa: 490 },
  { grade: 'E410 (Fe 540)', fy_mpa: 410, fu_mpa: 540 },
];

export const ANCHOR_GRADES = [
  { grade: 'ASTM F1554 Gr.36', fy_mpa: 248, fu_mpa: 400, type: 'carbon_steel' },
  { grade: 'ASTM F1554 Gr.55', fy_mpa: 380, fu_mpa: 517, type: 'carbon_steel' },
  { grade: 'ASTM F1554 Gr.105', fy_mpa: 724, fu_mpa: 862, type: 'alloy_steel' },
  { grade: 'ASTM A307', fy_mpa: 248, fu_mpa: 414, type: 'carbon_steel' },
  { grade: 'ASTM A325', fy_mpa: 635, fu_mpa: 827, type: 'carbon_steel' },
  { grade: 'ASTM A490', fy_mpa: 896, fu_mpa: 1034, type: 'alloy_steel' },
  { grade: 'IS 1367 Gr. 8.8', fy_mpa: 640, fu_mpa: 800, type: 'carbon_steel' },
  { grade: 'IS 1367 Gr. 4.6', fy_mpa: 240, fu_mpa: 400, type: 'carbon_steel' },
];

export const CONCRETE_GRADES_ACI = [
  { grade: 'fc\' = 21 MPa (3000 psi)', fc_prime_mpa: 21 },
  { grade: 'fc\' = 28 MPa (4000 psi)', fc_prime_mpa: 28 },
  { grade: 'fc\' = 35 MPa (5000 psi)', fc_prime_mpa: 35 },
  { grade: 'fc\' = 42 MPa (6000 psi)', fc_prime_mpa: 42 },
];

export const CONCRETE_GRADES_IS = [
  { grade: 'M20', fck_mpa: 20 },
  { grade: 'M25', fck_mpa: 25 },
  { grade: 'M30', fck_mpa: 30 },
  { grade: 'M35', fck_mpa: 35 },
  { grade: 'M40', fck_mpa: 40 },
];

export const WELD_ELECTRODES = [
  { electrode: 'E60XX / E6011 / E6013', fu_mpa: 413 },
  { electrode: 'E70XX / E7018', fu_mpa: 482 },
  { electrode: 'E80XX', fu_mpa: 551 },
  { electrode: 'E90XX', fu_mpa: 620 },
  { electrode: 'IS E4123 (E41)', fu_mpa: 410 },
  { electrode: 'IS E4815 (E48)', fu_mpa: 480 },
];

export const WORKFLOW_STEPS = [
  { id: 'project', label: 'Project Setup', icon: 'FolderOpen' },
  { id: 'design_code', label: 'Design Code', icon: 'BookOpen' },
  { id: 'nlp', label: 'NLP Input', icon: 'Sparkles' },
  { id: 'loads', label: 'Load Data', icon: 'ArrowDown' },
  { id: 'column', label: 'Column Data', icon: 'Columns3' },
  { id: 'baseplate', label: 'Base Plate', icon: 'Square' },
  { id: 'concrete', label: 'Concrete / Pedestal', icon: 'Box' },
  { id: 'anchors', label: 'Anchors & Welds', icon: 'Anchor' },
  { id: 'calculate', label: 'Calculate', icon: 'Calculator' },
  { id: 'results', label: 'Results & Report', icon: 'FileText' },
] as const;

// AISC phi factors
export const PHI_B_AISC = 0.9;   // bearing/bending
export const PHI_C_AISC = 0.65;  // concrete
export const OMEGA_B_AISC = 1.67; // ASD bending
export const OMEGA_C_AISC = 2.31; // ASD concrete

// IS partial factors
export const GAMMA_M0_IS = 1.10;
export const GAMMA_M1_IS = 1.25;
