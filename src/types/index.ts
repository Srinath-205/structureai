export type DesignCode = 'AISC' | 'IS';
export type DesignMethod = 'LRFD' | 'ASD' | 'Limit State';
export type ColumnType = 'W' | 'I' | 'HSS_Rect' | 'HSS_Square' | 'HSS_Circ' | 'Pipe' | 'BuiltUp';
export type AxialType = 'compression' | 'uplift';
export type LoadType = 'factored' | 'service';
export type CalcStatus = 'SAFE' | 'FAIL' | 'WARNING' | 'INFO' | 'PENDING';
export type AnchorShape = 'headed' | 'hooked' | 'straight';
export type AnchorInstallType = 'cast_in' | 'post_installed';
export type ConcreteCondition = 'cracked' | 'uncracked';
export type WeldType = 'fillet' | 'groove' | 'partial_pen';

export interface ProjectInfo {
  project_name: string;
  project_number: string;
  designer: string;
  checker: string;
  date: string;
  revision: string;
  notes: string;
}

export interface DesignSelection {
  design_code: DesignCode;
  design_method: DesignMethod;
  country_standard: string;
  steel_code: string;
  concrete_code: string;
  anchor_code: string;
}

export interface LoadData {
  axial_load_kn: number | null;
  axial_load_type: AxialType;
  moment_major_knm: number | null;
  moment_minor_knm: number | null;
  shear_x_kn: number | null;
  shear_y_kn: number | null;
  load_type: LoadType;
  load_combination: string;
}

export interface ColumnData {
  column_type: ColumnType;
  section_name: string;
  depth_mm: number | null;
  flange_width_mm: number | null;
  flange_thickness_mm: number | null;
  web_thickness_mm: number | null;
  hss_depth_mm: number | null;
  hss_width_mm: number | null;
  hss_wall_thickness_mm: number | null;
  pipe_outer_diameter_mm: number | null;
  pipe_wall_thickness_mm: number | null;
  steel_grade: string;
  fy_mpa: number | null;
  fu_mpa: number | null;
}

export interface BasePlateData {
  plate_length_N_mm: number | null;
  plate_width_B_mm: number | null;
  provided_thickness_tp_mm: number | null;
  plate_steel_grade: string;
  plate_fy_mpa: number | null;
  plate_fu_mpa: number | null;
  grout_thickness_mm: number | null;
}

export interface ConcreteData {
  concrete_grade: string;
  fck_mpa: number | null;
  fc_prime_mpa: number | null;
  pedestal_length_mm: number | null;
  pedestal_width_mm: number | null;
  pedestal_depth_mm: number | null;
  slab_or_pedestal: 'pedestal' | 'slab';
}

export interface AnchorData {
  anchor_count: number | null;
  anchor_diameter_mm: number | null;
  anchor_grade: string;
  anchor_material_type: 'carbon_steel' | 'stainless_steel' | 'alloy_steel';
  anchor_fy_mpa: number | null;
  anchor_fu_mpa: number | null;
  anchor_layout: 'rectangular' | 'circular';
  edge_distance_x_mm: number | null;
  edge_distance_y_mm: number | null;
  spacing_x_mm: number | null;
  spacing_y_mm: number | null;
  washer_plate_required: boolean;
}

export interface EmbedmentData {
  anchor_type: AnchorInstallType;
  anchor_shape: AnchorShape;
  effective_embedment_hef_mm: number | null;
  pedestal_depth_mm: number | null;
  concrete_condition: ConcreteCondition;
  edge_distance_min_mm: number | null;
  spacing_min_mm: number | null;
}

export interface WeldData {
  weld_type: WeldType;
  provided_weld_size_mm: number | null;
  weld_electrode: string;
  weld_fu_mpa: number | null;
  effective_weld_length_mm: number | null;
}

export interface DesignInputs {
  project_info: ProjectInfo;
  design_selection: DesignSelection;
  load_data: LoadData;
  column_data: ColumnData;
  base_plate_data: BasePlateData;
  concrete_data: ConcreteData;
  anchor_data: AnchorData;
  embedment_data: EmbedmentData;
  weld_data: WeldData;
}

export interface CalcResult {
  calculation_name: string;
  design_code: string;
  formula: string;
  variables: Record<string, string>;
  inputs: Record<string, number | string | null>;
  unit_conversions: Record<string, string>;
  substitutions: string[];
  intermediate_steps: string[];
  result: Record<string, number | string | null>;
  utilization_ratio: number | null;
  status: CalcStatus;
  remarks: string;
  timestamp?: string;
}

export interface LoadClassification {
  eccentricity_x_mm: number | null;
  eccentricity_y_mm: number | null;
  kern_limit_x_mm: number | null;
  kern_limit_y_mm: number | null;
  pressure_condition: string;
  anchor_tension_required: boolean;
}

export interface BasePlateGeometry {
  area_A1_mm2: number | null;
  support_area_A2_mm2: number | null;
  A2_A1_ratio: number | null;
  confinement_factor: number | null;
  minimum_length_required_mm: number | null;
  minimum_width_required_mm: number | null;
  provided_length_mm: number | null;
  provided_width_mm: number | null;
  size_status: string;
}

export interface PressureDistCheck {
  average_pressure_mpa: number | null;
  maximum_pressure_mpa: number | null;
  minimum_pressure_mpa: number | null;
  pressure_type: string;
  uplift_present: boolean;
  anchor_tension_required: boolean;
  status: CalcStatus;
}

export interface ConcreteBearingCheck {
  A1_mm2: number | null;
  A2_mm2: number | null;
  sqrt_A2_A1: number | null;
  limited_confinement_factor: number | null;
  actual_bearing_pressure_mpa: number | null;
  allowable_or_design_bearing_pressure_mpa: number | null;
  bearing_utilization_ratio: number | null;
  status: CalcStatus;
}

export interface PlateThicknessCheck {
  m_mm: number | null;
  n_mm: number | null;
  n_prime_mm: number | null;
  critical_projection_l_mm: number | null;
  bearing_pressure_mpa: number | null;
  required_thickness_mm: number | null;
  provided_thickness_mm: number | null;
  utilization_ratio: number | null;
  status: CalcStatus;
}

export interface AnchorForceCheck {
  anchor_count: number | null;
  anchor_diameter_mm: number | null;
  anchor_grade: string;
  anchor_fy_mpa: number | null;
  anchor_fu_mpa: number | null;
  total_anchor_tension_kn: number | null;
  effective_tension_anchors: number | null;
  tension_per_anchor_kn: number | null;
  tension_capacity_per_anchor_kn: number | null;
  total_shear_kn: number | null;
  effective_shear_anchors: number | null;
  shear_per_anchor_kn: number | null;
  shear_capacity_per_anchor_kn: number | null;
  combined_interaction_ratio: number | null;
  status: CalcStatus;
}

export interface EmbedmentCheck {
  initial_embedment_mm: number | null;
  embedment_ratio_d: number | null;
  provided_embedment_mm: number | null;
  minimum_required_embedment_mm: number | null;
  steel_tension_status: CalcStatus | '';
  concrete_breakout_tension_status: CalcStatus | '';
  pullout_status: CalcStatus | '';
  side_face_blowout_status: CalcStatus | '';
  steel_shear_status: CalcStatus | '';
  concrete_breakout_shear_status: CalcStatus | '';
  pryout_status: CalcStatus | '';
  interaction_status: CalcStatus | '';
  overall_status: CalcStatus;
}

export interface WeldCheck {
  required_weld_size_mm: number | null;
  provided_weld_size_mm: number | null;
  weld_demand_kn: number | null;
  weld_capacity_kn: number | null;
  utilization_ratio: number | null;
  status: CalcStatus;
}

export interface StiffenerCheck {
  stiffener_required: boolean;
  reason: string;
  recommended_stiffener_thickness_mm: number | null;
  recommended_stiffener_height_mm: number | null;
  recommended_stiffener_length_mm: number | null;
  weld_to_stiffener_required: boolean;
  status: CalcStatus;
}

export interface ShearKeyCheck {
  shear_key_required: boolean;
  reason: string;
  base_shear_kn: number | null;
  anchor_shear_capacity_kn: number | null;
  recommended_shear_key_depth_mm: number | null;
  recommended_shear_key_thickness_mm: number | null;
  recommended_shear_key_width_mm: number | null;
  status: CalcStatus;
}

export interface DesignResults {
  load_classification: LoadClassification;
  base_plate_geometry: BasePlateGeometry;
  pressure_distribution: PressureDistCheck;
  concrete_bearing: ConcreteBearingCheck;
  plate_thickness: PlateThicknessCheck;
  anchor_force: AnchorForceCheck;
  embedment: EmbedmentCheck;
  weld: WeldCheck;
  stiffener: StiffenerCheck;
  shear_key: ShearKeyCheck;
  calc_results: CalcResult[];
  overall_status: CalcStatus;
  warnings: string[];
  critical_issues: string[];
  recommendations: string[];
  engineering_notes: string[];
}

export type WorkflowStep =
  | 'project'
  | 'design_code'
  | 'nlp'
  | 'loads'
  | 'column'
  | 'baseplate'
  | 'concrete'
  | 'anchors'
  | 'calculate'
  | 'results';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  project_name: string;
  design_method: string;
  calc_result: CalcResult;
  engineer_notes: string;
}
