/**
 * NLP Parameter Extraction Engine
 * Deterministic regex-based extraction — no LLM inference in calculations
 */

import type { DesignInputs } from '@/types';
import { ALL_SECTIONS } from '@/lib/sections/aisc-sections';

export interface ExtractionResult {
  extracted: Partial<DesignInputs>;
  matched: Record<string, { value: string | number; source: string }>;
  missing: string[];
  confidence: number;
  suggestions: string[];
}

function extractNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m && m[1]) return parseFloat(m[1]);
  }
  return null;
}

function extractSection(text: string): { name: string; d_mm: number; bf_mm: number; tf_mm: number; tw_mm: number } | null {
  const upper = text.toUpperCase();
  // Try to match known section names
  for (const sec of ALL_SECTIONS) {
    if (upper.includes(sec.name.toUpperCase())) {
      return { name: sec.name, d_mm: sec.d_mm, bf_mm: sec.bf_mm, tf_mm: sec.tf_mm, tw_mm: sec.tw_mm };
    }
  }
  // Try W-section pattern: W12×96, W12x96, W12 96
  const wMatch = upper.match(/W(\d+)[×X×\s×](\d+)/);
  if (wMatch) {
    const name = `W${wMatch[1]}×${wMatch[2]}`;
    const found = ALL_SECTIONS.find(s => s.name.replace('×', 'x').toUpperCase() === name.replace('×', 'x'));
    if (found) return { name: found.name, d_mm: found.d_mm, bf_mm: found.bf_mm, tf_mm: found.tf_mm, tw_mm: found.tw_mm };
  }
  return null;
}

function detectDesignCode(text: string): { code: 'AISC' | 'IS'; method: 'LRFD' | 'ASD' | 'Limit State' } {
  const upper = text.toUpperCase();
  if (upper.includes('ASD')) return { code: 'AISC', method: 'ASD' };
  if (upper.includes('IS 800') || upper.includes('IS800') || upper.includes('LIMIT STATE') || upper.includes('LSM')) return { code: 'IS', method: 'Limit State' };
  if (upper.includes('LRFD') || upper.includes('AISC')) return { code: 'AISC', method: 'LRFD' };
  return { code: 'AISC', method: 'LRFD' };
}

export function parseNaturalLanguageInput(text: string): ExtractionResult {
  const lower = text.toLowerCase();
  const matched: Record<string, { value: string | number; source: string }> = {};
  const missing: string[] = [];
  const extracted: Partial<DesignInputs> = {
    project_info: { project_name: '', project_number: '', designer: '', checker: '', date: new Date().toISOString().split('T')[0], revision: 'R0', notes: '' },
    design_selection: { design_code: 'AISC', design_method: 'LRFD', country_standard: 'American', steel_code: 'AISC 360-22', concrete_code: 'ACI 318-19', anchor_code: 'ACI 318-19 Chapter 17' },
    load_data: { axial_load_kn: null, axial_load_type: 'compression', moment_major_knm: null, moment_minor_knm: null, shear_x_kn: null, shear_y_kn: null, load_type: 'factored', load_combination: '' },
    column_data: { column_type: 'W', section_name: '', depth_mm: null, flange_width_mm: null, flange_thickness_mm: null, web_thickness_mm: null, hss_depth_mm: null, hss_width_mm: null, hss_wall_thickness_mm: null, pipe_outer_diameter_mm: null, pipe_wall_thickness_mm: null, steel_grade: 'A992', fy_mpa: 345, fu_mpa: 448 },
    base_plate_data: { plate_length_N_mm: null, plate_width_B_mm: null, provided_thickness_tp_mm: null, plate_steel_grade: 'A36', plate_fy_mpa: 248, plate_fu_mpa: 400, grout_thickness_mm: 25 },
    concrete_data: { concrete_grade: '', fck_mpa: null, fc_prime_mpa: null, pedestal_length_mm: null, pedestal_width_mm: null, pedestal_depth_mm: null, slab_or_pedestal: 'pedestal' },
    anchor_data: { anchor_count: 4, anchor_diameter_mm: null, anchor_grade: 'ASTM F1554 Gr.36', anchor_material_type: 'carbon_steel', anchor_fy_mpa: 248, anchor_fu_mpa: 400, anchor_layout: 'rectangular', edge_distance_x_mm: null, edge_distance_y_mm: null, spacing_x_mm: null, spacing_y_mm: null, washer_plate_required: false },
    embedment_data: { anchor_type: 'cast_in', anchor_shape: 'headed', effective_embedment_hef_mm: null, pedestal_depth_mm: null, concrete_condition: 'cracked', edge_distance_min_mm: null, spacing_min_mm: null },
    weld_data: { weld_type: 'fillet', provided_weld_size_mm: 8, weld_electrode: 'E70XX / E7018', weld_fu_mpa: 482, effective_weld_length_mm: null },
  };

  // Design code detection
  const dc = detectDesignCode(text);
  extracted.design_selection!.design_code = dc.code;
  extracted.design_selection!.design_method = dc.method;
  if (dc.code === 'IS') {
    extracted.design_selection!.country_standard = 'Indian';
    extracted.design_selection!.steel_code = 'IS 800:2007';
    extracted.design_selection!.concrete_code = 'IS 456:2000';
    extracted.design_selection!.anchor_code = 'IS 456:2000 / IS 5624';
  }

  // Axial load
  const axialLoad = extractNumber(text, [
    /axial\s*(?:load|force|compression)?\s*[=:of]*\s*([0-9.]+)\s*kn/i,
    /p\s*[=:]\s*([0-9.]+)\s*kn/i,
    /([0-9.]+)\s*kn\s*(?:axial|compression|uplift)/i,
    /load\s*of\s*([0-9.]+)\s*kn/i,
  ]);
  if (axialLoad !== null) {
    extracted.load_data!.axial_load_kn = axialLoad;
    matched.axial_load = { value: axialLoad, source: 'Axial load pattern' };
  } else {
    missing.push('Axial load (P)');
  }

  // Uplift detection
  if (/uplift|tension\s+load|upward/i.test(text)) {
    extracted.load_data!.axial_load_type = 'uplift';
  }

  // Moment
  const moment = extractNumber(text, [
    /moment\s*(?:mx|m_x|major)?\s*[=:of]*\s*([0-9.]+)\s*kn[··\s-]?m/i,
    /mx\s*[=:]\s*([0-9.]+)\s*kn[·m]*/i,
    /([0-9.]+)\s*kn[·\s-]?m\s*(?:moment|bending)/i,
    /bending\s*moment\s*(?:of)?\s*([0-9.]+)\s*kn/i,
  ]);
  if (moment !== null) {
    extracted.load_data!.moment_major_knm = moment;
    matched.moment = { value: moment, source: 'Moment pattern' };
  }

  // Minor moment
  const momentMinor = extractNumber(text, [
    /(?:minor|my|m_y)\s*(?:moment|axis)?\s*[=:]*\s*([0-9.]+)\s*kn[·m]*/i,
  ]);
  if (momentMinor !== null) {
    extracted.load_data!.moment_minor_knm = momentMinor;
    matched.moment_minor = { value: momentMinor, source: 'Minor axis moment pattern' };
  }

  // Shear
  const shear = extractNumber(text, [
    /shear\s*(?:force|load|vx|v)?\s*[=:of]*\s*([0-9.]+)\s*kn/i,
    /vx?\s*[=:]\s*([0-9.]+)\s*kn/i,
    /([0-9.]+)\s*kn\s*shear/i,
    /horizontal\s*(?:load|force)\s*(?:of)?\s*([0-9.]+)\s*kn/i,
  ]);
  if (shear !== null) {
    extracted.load_data!.shear_x_kn = shear;
    matched.shear = { value: shear, source: 'Shear pattern' };
  }

  // ASD service loads
  if (/service\s+load|allowable\s+stress|asd/i.test(text)) {
    extracted.load_data!.load_type = 'service';
  }

  // Column section
  const section = extractSection(text);
  if (section) {
    extracted.column_data!.section_name = section.name;
    extracted.column_data!.depth_mm = section.d_mm;
    extracted.column_data!.flange_width_mm = section.bf_mm;
    extracted.column_data!.flange_thickness_mm = section.tf_mm;
    extracted.column_data!.web_thickness_mm = section.tw_mm;
    matched.column_section = { value: section.name, source: 'Section database lookup' };
    // Set column type
    if (section.name.startsWith('ISMB') || section.name.startsWith('ISSC')) {
      extracted.column_data!.column_type = 'I';
    }
  } else {
    missing.push('Column section name or dimensions');
  }

  // Column depth from text (fallback)
  if (!section) {
    const depth = extractNumber(text, [/depth\s*[=:of]*\s*([0-9.]+)\s*mm/i, /d\s*=\s*([0-9.]+)\s*mm/i]);
    if (depth) { extracted.column_data!.depth_mm = depth; matched.depth = { value: depth, source: 'Depth pattern' }; }
    const bf = extractNumber(text, [/flange\s*width\s*[=:of]*\s*([0-9.]+)\s*mm/i, /bf\s*=\s*([0-9.]+)\s*mm/i]);
    if (bf) { extracted.column_data!.flange_width_mm = bf; matched.bf = { value: bf, source: 'Flange width pattern' }; }
  }

  // HSS detection
  if (/hss|square\s+tube|rectangular\s+tube/i.test(text)) {
    extracted.column_data!.column_type = 'HSS_Square';
    const hssMatch = text.match(/hss\s*([0-9.]+)\s*[×x]\s*([0-9.]+)\s*[×x]\s*([0-9.]+)/i);
    if (hssMatch) {
      extracted.column_data!.hss_depth_mm = parseFloat(hssMatch[1]);
      extracted.column_data!.hss_width_mm = parseFloat(hssMatch[2]);
      extracted.column_data!.hss_wall_thickness_mm = parseFloat(hssMatch[3]);
      matched.hss = { value: `${hssMatch[1]}×${hssMatch[2]}×${hssMatch[3]}`, source: 'HSS dimension pattern' };
    }
  }

  // Pipe/CHS detection
  if (/pipe|chs|circular\s+hollow/i.test(text)) {
    extracted.column_data!.column_type = 'Pipe';
    const pipeMatch = text.match(/([0-9.]+)\s*(?:mm)?\s*(?:od|diameter|⌀|dia)/i);
    if (pipeMatch) { extracted.column_data!.pipe_outer_diameter_mm = parseFloat(pipeMatch[1]); }
  }

  // Column steel grade
  if (/e250|fe\s*410/i.test(text)) { extracted.column_data!.steel_grade = 'E250 (Fe 410)'; extracted.column_data!.fy_mpa = 250; extracted.column_data!.fu_mpa = 410; }
  else if (/e350|fe\s*490/i.test(text)) { extracted.column_data!.steel_grade = 'E350 (Fe 490)'; extracted.column_data!.fy_mpa = 350; extracted.column_data!.fu_mpa = 490; }
  else if (/a572\s*gr\s*50|grade\s*50/i.test(text)) { extracted.column_data!.steel_grade = 'A572 Gr 50'; extracted.column_data!.fy_mpa = 345; extracted.column_data!.fu_mpa = 448; }
  else if (/a36/i.test(text) && /column/i.test(text)) { extracted.column_data!.steel_grade = 'A36'; extracted.column_data!.fy_mpa = 248; extracted.column_data!.fu_mpa = 400; }

  // Base plate size
  const bpSize = text.match(/(?:base\s+plate|plate)\s*[=:]*\s*([0-9]+)\s*[×x×]\s*([0-9]+)/i);
  if (bpSize) {
    extracted.base_plate_data!.plate_length_N_mm = parseInt(bpSize[1]);
    extracted.base_plate_data!.plate_width_B_mm = parseInt(bpSize[2]);
    matched.plate_size = { value: `${bpSize[1]}×${bpSize[2]}`, source: 'Plate size pattern' };
  }
  const bpThick = extractNumber(text, [
    /plate\s*thickness\s*(?:tp)?\s*[=:of]*\s*([0-9.]+)\s*mm/i,
    /tp\s*[=:]\s*([0-9.]+)\s*mm/i,
    /([0-9.]+)\s*mm\s*thick\s*(?:plate|base)/i,
  ]);
  if (bpThick) { extracted.base_plate_data!.provided_thickness_tp_mm = bpThick; matched.plate_thickness = { value: bpThick, source: 'Plate thickness pattern' }; }

  // Plate grade
  if (/e250/i.test(text) && /plate/i.test(text)) { extracted.base_plate_data!.plate_steel_grade = 'E250 (Fe 410)'; extracted.base_plate_data!.plate_fy_mpa = 250; extracted.base_plate_data!.plate_fu_mpa = 410; }

  // Concrete grade - ACI
  const fcPrime = extractNumber(text, [
    /f['′c]\s*[=:]\s*([0-9.]+)\s*mpa/i,
    /([0-9.]+)\s*mpa\s*(?:concrete|f[c'])/i,
    /concrete\s*(?:grade|strength|f['c])?\s*[=:of]*\s*([0-9.]+)\s*mpa/i,
  ]);
  if (fcPrime) {
    extracted.concrete_data!.fc_prime_mpa = fcPrime;
    extracted.concrete_data!.concrete_grade = `fc' = ${fcPrime} MPa`;
    matched.concrete = { value: fcPrime, source: 'Concrete strength pattern' };
  }

  // IS Concrete grade M20/M25/M30 etc.
  const mGrade = text.match(/\bm\s*(20|25|30|35|40|45|50)\b/i);
  if (mGrade) {
    const fck = parseInt(mGrade[1]);
    extracted.concrete_data!.fck_mpa = fck;
    extracted.concrete_data!.concrete_grade = `M${fck}`;
    matched.concrete = { value: `M${fck}`, source: 'IS concrete grade pattern' };
  }

  if (!extracted.concrete_data!.fc_prime_mpa && !extracted.concrete_data!.fck_mpa) {
    missing.push('Concrete grade / strength');
  }

  // Pedestal size
  const pedestal = text.match(/pedestal\s*(?:size)?\s*[=:]*\s*([0-9]+)\s*[×x×]\s*([0-9]+)/i);
  if (pedestal) {
    extracted.concrete_data!.pedestal_length_mm = parseInt(pedestal[1]);
    extracted.concrete_data!.pedestal_width_mm = parseInt(pedestal[2]);
    matched.pedestal = { value: `${pedestal[1]}×${pedestal[2]}`, source: 'Pedestal size pattern' };
  }
  const pedDepth = extractNumber(text, [/pedestal\s*(?:depth|height)\s*[=:of]*\s*([0-9.]+)\s*mm/i]);
  if (pedDepth) extracted.concrete_data!.pedestal_depth_mm = pedDepth;

  // Anchor count and diameter
  const anchorMatch = text.match(/(\d+)\s*[×x×]?\s*(?:m|⌀|phi|dia|diameter)?\s*(\d+)\s*(?:mm)?\s*(?:anchor|bolt|rod|m\d)/i);
  if (anchorMatch) {
    const n = parseInt(anchorMatch[1]);
    const d = parseInt(anchorMatch[2]);
    if (n >= 2 && n <= 20 && d >= 12 && d <= 100) {
      extracted.anchor_data!.anchor_count = n;
      extracted.anchor_data!.anchor_diameter_mm = d;
      matched.anchors = { value: `${n}×M${d}`, source: 'Anchor count×diameter pattern' };
    } else if (d >= 2 && d <= 20 && n >= 12 && n <= 100) {
      // Reversed
      extracted.anchor_data!.anchor_count = d;
      extracted.anchor_data!.anchor_diameter_mm = n;
      matched.anchors = { value: `${d}×M${n}`, source: 'Anchor count×diameter (reversed) pattern' };
    }
  }
  // Standalone anchor diameter
  const anchorDia = extractNumber(text, [
    /(?:anchor|bolt|rod)\s*(?:diameter|dia|⌀)?\s*[=:of]*\s*([0-9.]+)\s*mm/i,
    /m([0-9]+)\s*(?:anchor|bolt|rod)/i,
    /([0-9]+)\s*mm\s*(?:anchor|bolt)/i,
  ]);
  if (anchorDia && !extracted.anchor_data!.anchor_diameter_mm) {
    extracted.anchor_data!.anchor_diameter_mm = anchorDia;
    matched.anchor_dia = { value: anchorDia, source: 'Anchor diameter pattern' };
  }

  // Anchor grade
  if (/f1554\s*gr\.?\s*55|grade\s*55/i.test(text)) { extracted.anchor_data!.anchor_grade = 'ASTM F1554 Gr.55'; extracted.anchor_data!.anchor_fy_mpa = 380; extracted.anchor_data!.anchor_fu_mpa = 517; }
  else if (/f1554\s*gr\.?\s*105|grade\s*105/i.test(text)) { extracted.anchor_data!.anchor_grade = 'ASTM F1554 Gr.105'; extracted.anchor_data!.anchor_fy_mpa = 724; extracted.anchor_data!.anchor_fu_mpa = 862; }
  else if (/is\s*1367\s*gr?\s*8\.8|8\.8/i.test(text)) { extracted.anchor_data!.anchor_grade = 'IS 1367 Gr. 8.8'; extracted.anchor_data!.anchor_fy_mpa = 640; extracted.anchor_data!.anchor_fu_mpa = 800; }

  // Embedment
  const hef = extractNumber(text, [/embedment\s*(?:length|depth|hef)?\s*[=:of]*\s*([0-9.]+)\s*mm/i, /hef\s*[=:]\s*([0-9.]+)\s*mm/i]);
  if (hef) { extracted.embedment_data!.effective_embedment_hef_mm = hef; matched.embedment = { value: hef, source: 'Embedment pattern' }; }

  // Weld size
  const weldSize = extractNumber(text, [/weld\s*(?:size|leg)?\s*[=:of]*\s*([0-9.]+)\s*mm/i, /([0-9.]+)\s*mm\s*(?:fillet\s*)?weld/i]);
  if (weldSize) { extracted.weld_data!.provided_weld_size_mm = weldSize; matched.weld = { value: weldSize, source: 'Weld size pattern' }; }

  // Project name from first sentence or quoted string
  const projName = text.match(/(?:project|design for|calculate)\s+(?:for\s+)?["']?([A-Za-z0-9\s\-_]+?)["']?\s*(?:building|tower|structure|column|axial|moment|$)/i);
  if (projName && projName[1].trim().length > 2) {
    extracted.project_info!.project_name = projName[1].trim();
  }

  // Confidence scoring
  const totalFields = 8;
  const filledFields = [
    extracted.load_data!.axial_load_kn,
    extracted.load_data!.moment_major_knm,
    extracted.load_data!.shear_x_kn,
    extracted.column_data!.depth_mm,
    extracted.base_plate_data!.plate_length_N_mm,
    extracted.concrete_data!.fc_prime_mpa || extracted.concrete_data!.fck_mpa,
    extracted.anchor_data!.anchor_diameter_mm,
    extracted.anchor_data!.anchor_count,
  ].filter(Boolean).length;
  const confidence = Math.round((filledFields / totalFields) * 100);

  // Suggestions for missing data
  const suggestions: string[] = [];
  if (!extracted.anchor_data!.anchor_diameter_mm) suggestions.push('Specify anchor diameter, e.g. "4×M24 anchors"');
  if (!extracted.base_plate_data!.plate_length_N_mm) suggestions.push('Specify base plate size, e.g. "450×350 mm plate"');
  if (!extracted.concrete_data!.fc_prime_mpa && !extracted.concrete_data!.fck_mpa) suggestions.push('Specify concrete grade, e.g. "fc\'=28 MPa" or "M30"');
  if (!extracted.column_data!.depth_mm) suggestions.push('Specify column section, e.g. "W12×96" or "ISMB 300"');

  return { extracted, matched, missing, confidence, suggestions };
}
