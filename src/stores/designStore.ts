import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DesignInputs, DesignResults, WorkflowStep, HistoryEntry, CalcResult
} from '@/types';
import { DESIGN_CODES } from '@/constants';

const defaultInputs: DesignInputs = {
  project_info: {
    project_name: '',
    project_number: '',
    designer: '',
    checker: '',
    date: new Date().toISOString().split('T')[0],
    revision: 'R0',
    notes: '',
  },
  design_selection: {
    design_code: 'AISC',
    design_method: 'LRFD',
    country_standard: 'American',
    steel_code: 'AISC 360-22',
    concrete_code: 'ACI 318-19',
    anchor_code: 'ACI 318-19 Chapter 17',
  },
  load_data: {
    axial_load_kn: null,
    axial_load_type: 'compression',
    moment_major_knm: null,
    moment_minor_knm: null,
    shear_x_kn: null,
    shear_y_kn: null,
    load_type: 'factored',
    load_combination: 'LC1: 1.2D + 1.6L',
  },
  column_data: {
    column_type: 'W',
    section_name: '',
    depth_mm: null,
    flange_width_mm: null,
    flange_thickness_mm: null,
    web_thickness_mm: null,
    hss_depth_mm: null,
    hss_width_mm: null,
    hss_wall_thickness_mm: null,
    pipe_outer_diameter_mm: null,
    pipe_wall_thickness_mm: null,
    steel_grade: 'A992',
    fy_mpa: 345,
    fu_mpa: 448,
  },
  base_plate_data: {
    plate_length_N_mm: null,
    plate_width_B_mm: null,
    provided_thickness_tp_mm: null,
    plate_steel_grade: 'A36',
    plate_fy_mpa: 248,
    plate_fu_mpa: 400,
    grout_thickness_mm: 25,
  },
  concrete_data: {
    concrete_grade: 'fc\' = 28 MPa',
    fck_mpa: null,
    fc_prime_mpa: 28,
    pedestal_length_mm: null,
    pedestal_width_mm: null,
    pedestal_depth_mm: null,
    slab_or_pedestal: 'pedestal',
  },
  anchor_data: {
    anchor_count: 4,
    anchor_diameter_mm: null,
    anchor_grade: 'ASTM F1554 Gr.36',
    anchor_material_type: 'carbon_steel',
    anchor_fy_mpa: 248,
    anchor_fu_mpa: 400,
    anchor_layout: 'rectangular',
    edge_distance_x_mm: null,
    edge_distance_y_mm: null,
    spacing_x_mm: null,
    spacing_y_mm: null,
    washer_plate_required: false,
  },
  embedment_data: {
    anchor_type: 'cast_in',
    anchor_shape: 'headed',
    effective_embedment_hef_mm: null,
    pedestal_depth_mm: null,
    concrete_condition: 'cracked',
    edge_distance_min_mm: null,
    spacing_min_mm: null,
  },
  weld_data: {
    weld_type: 'fillet',
    provided_weld_size_mm: 8,
    weld_electrode: 'E70XX / E7018',
    weld_fu_mpa: 482,
    effective_weld_length_mm: null,
  },
};

interface DesignStore {
  inputs: DesignInputs;
  results: DesignResults | null;
  currentStep: WorkflowStep;
  history: HistoryEntry[];
  isCalculating: boolean;
  hasResults: boolean;

  setInputs: (inputs: Partial<DesignInputs>) => void;
  updateProjectInfo: (data: Partial<DesignInputs['project_info']>) => void;
  updateDesignSelection: (data: Partial<DesignInputs['design_selection']>) => void;
  updateLoadData: (data: Partial<DesignInputs['load_data']>) => void;
  updateColumnData: (data: Partial<DesignInputs['column_data']>) => void;
  updateBasePlateData: (data: Partial<DesignInputs['base_plate_data']>) => void;
  updateConcreteData: (data: Partial<DesignInputs['concrete_data']>) => void;
  updateAnchorData: (data: Partial<DesignInputs['anchor_data']>) => void;
  updateEmbedmentData: (data: Partial<DesignInputs['embedment_data']>) => void;
  updateWeldData: (data: Partial<DesignInputs['weld_data']>) => void;

  setResults: (results: DesignResults) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setIsCalculating: (v: boolean) => void;
  addToHistory: (calcResult: CalcResult) => void;
  updateHistoryNote: (id: string, note: string) => void;
  clearResults: () => void;
  resetAll: () => void;
  applyDesignCode: (codeKey: keyof typeof DESIGN_CODES) => void;
}

export const useDesignStore = create<DesignStore>()(
  persist(
    (set, get) => ({
      inputs: defaultInputs,
      results: null,
      currentStep: 'project' as WorkflowStep,
      history: [],
      isCalculating: false,
      hasResults: false,

      setInputs: (inputs) => set((s) => ({ inputs: { ...s.inputs, ...inputs } })),
      updateProjectInfo: (data) =>
        set((s) => ({ inputs: { ...s.inputs, project_info: { ...s.inputs.project_info, ...data } } })),
      updateDesignSelection: (data) =>
        set((s) => ({ inputs: { ...s.inputs, design_selection: { ...s.inputs.design_selection, ...data } } })),
      updateLoadData: (data) =>
        set((s) => ({ inputs: { ...s.inputs, load_data: { ...s.inputs.load_data, ...data } } })),
      updateColumnData: (data) =>
        set((s) => ({ inputs: { ...s.inputs, column_data: { ...s.inputs.column_data, ...data } } })),
      updateBasePlateData: (data) =>
        set((s) => ({ inputs: { ...s.inputs, base_plate_data: { ...s.inputs.base_plate_data, ...data } } })),
      updateConcreteData: (data) =>
        set((s) => ({ inputs: { ...s.inputs, concrete_data: { ...s.inputs.concrete_data, ...data } } })),
      updateAnchorData: (data) =>
        set((s) => ({ inputs: { ...s.inputs, anchor_data: { ...s.inputs.anchor_data, ...data } } })),
      updateEmbedmentData: (data) =>
        set((s) => ({ inputs: { ...s.inputs, embedment_data: { ...s.inputs.embedment_data, ...data } } })),
      updateWeldData: (data) =>
        set((s) => ({ inputs: { ...s.inputs, weld_data: { ...s.inputs.weld_data, ...data } } })),

      setResults: (results) => set({ results, hasResults: true }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setIsCalculating: (v) => set({ isCalculating: v }),

      addToHistory: (calcResult) => {
        const { inputs } = get();
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: new Date().toISOString(),
          project_name: inputs.project_info.project_name || 'Untitled',
          design_method: inputs.design_selection.design_method,
          calc_result: calcResult,
          engineer_notes: '',
        };
        set((s) => ({ history: [entry, ...s.history].slice(0, 100) }));
      },

      updateHistoryNote: (id, note) =>
        set((s) => ({
          history: s.history.map((h) => (h.id === id ? { ...h, engineer_notes: note } : h)),
        })),

      clearResults: () => set({ results: null, hasResults: false }),

      resetAll: () => set({ inputs: defaultInputs, results: null, hasResults: false, currentStep: 'project' }),

      applyDesignCode: (codeKey) => {
        const code = DESIGN_CODES[codeKey];
        set((s) => ({
          inputs: {
            ...s.inputs,
            design_selection: {
              design_code: code.design_code,
              design_method: code.design_method,
              country_standard: code.country_standard,
              steel_code: code.steel_code,
              concrete_code: code.concrete_code,
              anchor_code: code.anchor_code,
            },
          },
        }));
      },
    }),
    {
      name: 'structai-baseplate-store',
      partialize: (state) => ({
        inputs: state.inputs,
        history: state.history,
      }),
    }
  )
);
