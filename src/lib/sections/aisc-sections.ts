// AISC W-Section Database (selected common sections, all values in mm and MPa)
export interface SteelSection {
  name: string;
  type: 'W' | 'I' | 'HSS_Rect' | 'HSS_Square' | 'HSS_Circ' | 'Pipe';
  standard: 'AISC' | 'IS';
  d_mm: number;          // Overall depth
  bf_mm: number;         // Flange width
  tf_mm: number;         // Flange thickness
  tw_mm: number;         // Web thickness
  area_cm2?: number;     // Cross-sectional area
  Ix_cm4?: number;       // Moment of inertia
  Zx_cm3?: number;       // Plastic section modulus
  weight_kgm?: number;   // Weight per meter
}

export const AISC_W_SECTIONS: SteelSection[] = [
  // W4 series
  { name: 'W4×13', type: 'W', standard: 'AISC', d_mm: 106, bf_mm: 103, tf_mm: 8.8, tw_mm: 7.1, weight_kgm: 19.3 },
  // W5 series
  { name: 'W5×16', type: 'W', standard: 'AISC', d_mm: 127, bf_mm: 127, tf_mm: 9.7, tw_mm: 6.4, weight_kgm: 23.8 },
  { name: 'W5×19', type: 'W', standard: 'AISC', d_mm: 131, bf_mm: 128, tf_mm: 11.2, tw_mm: 7.9, weight_kgm: 28.3 },
  // W6 series
  { name: 'W6×9', type: 'W', standard: 'AISC', d_mm: 152, bf_mm: 100, tf_mm: 6.4, tw_mm: 5.8, weight_kgm: 13.4 },
  { name: 'W6×12', type: 'W', standard: 'AISC', d_mm: 153, bf_mm: 101, tf_mm: 7.6, tw_mm: 6.9, weight_kgm: 17.9 },
  { name: 'W6×15', type: 'W', standard: 'AISC', d_mm: 152, bf_mm: 152, tf_mm: 9.7, tw_mm: 5.8, weight_kgm: 22.3 },
  { name: 'W6×20', type: 'W', standard: 'AISC', d_mm: 157, bf_mm: 152, tf_mm: 13.2, tw_mm: 6.6, weight_kgm: 29.8 },
  { name: 'W6×25', type: 'W', standard: 'AISC', d_mm: 162, bf_mm: 154, tf_mm: 16.0, tw_mm: 8.1, weight_kgm: 37.2 },
  // W8 series
  { name: 'W8×18', type: 'W', standard: 'AISC', d_mm: 207, bf_mm: 133, tf_mm: 11.0, tw_mm: 7.5, weight_kgm: 26.8 },
  { name: 'W8×24', type: 'W', standard: 'AISC', d_mm: 206, bf_mm: 165, tf_mm: 10.2, tw_mm: 6.2, weight_kgm: 35.7 },
  { name: 'W8×31', type: 'W', standard: 'AISC', d_mm: 203, bf_mm: 203, tf_mm: 11.0, tw_mm: 7.2, weight_kgm: 46.2 },
  { name: 'W8×40', type: 'W', standard: 'AISC', d_mm: 210, bf_mm: 205, tf_mm: 14.2, tw_mm: 9.1, weight_kgm: 59.5 },
  { name: 'W8×48', type: 'W', standard: 'AISC', d_mm: 216, bf_mm: 206, tf_mm: 17.4, tw_mm: 10.2, weight_kgm: 71.4 },
  { name: 'W8×67', type: 'W', standard: 'AISC', d_mm: 222, bf_mm: 210, tf_mm: 23.6, tw_mm: 14.5, weight_kgm: 99.7 },
  // W10 series
  { name: 'W10×22', type: 'W', standard: 'AISC', d_mm: 259, bf_mm: 147, tf_mm: 11.0, tw_mm: 8.0, weight_kgm: 32.7 },
  { name: 'W10×30', type: 'W', standard: 'AISC', d_mm: 267, bf_mm: 148, tf_mm: 14.6, tw_mm: 9.1, weight_kgm: 44.6 },
  { name: 'W10×45', type: 'W', standard: 'AISC', d_mm: 257, bf_mm: 204, tf_mm: 16.0, tw_mm: 10.0, weight_kgm: 67.0 },
  { name: 'W10×60', type: 'W', standard: 'AISC', d_mm: 269, bf_mm: 205, tf_mm: 21.4, tw_mm: 13.0, weight_kgm: 89.3 },
  { name: 'W10×100', type: 'W', standard: 'AISC', d_mm: 282, bf_mm: 260, tf_mm: 25.4, tw_mm: 14.9, weight_kgm: 148.8 },
  // W12 series
  { name: 'W12×26', type: 'W', standard: 'AISC', d_mm: 310, bf_mm: 165, tf_mm: 9.7, tw_mm: 5.8, weight_kgm: 38.7 },
  { name: 'W12×40', type: 'W', standard: 'AISC', d_mm: 303, bf_mm: 165, tf_mm: 14.0, tw_mm: 9.1, weight_kgm: 59.5 },
  { name: 'W12×50', type: 'W', standard: 'AISC', d_mm: 309, bf_mm: 205, tf_mm: 16.3, tw_mm: 9.4, weight_kgm: 74.4 },
  { name: 'W12×65', type: 'W', standard: 'AISC', d_mm: 310, bf_mm: 305, tf_mm: 15.4, tw_mm: 9.1, weight_kgm: 96.7 },
  { name: 'W12×96', type: 'W', standard: 'AISC', d_mm: 323, bf_mm: 307, tf_mm: 22.9, tw_mm: 13.0, weight_kgm: 142.9 },
  { name: 'W12×120', type: 'W', standard: 'AISC', d_mm: 333, bf_mm: 309, tf_mm: 28.7, tw_mm: 15.9, weight_kgm: 178.6 },
  { name: 'W12×152', type: 'W', standard: 'AISC', d_mm: 348, bf_mm: 312, tf_mm: 36.1, tw_mm: 19.3, weight_kgm: 226.2 },
  { name: 'W12×210', type: 'W', standard: 'AISC', d_mm: 368, bf_mm: 330, tf_mm: 49.8, tw_mm: 26.9, weight_kgm: 312.5 },
  // W14 series
  { name: 'W14×22', type: 'W', standard: 'AISC', d_mm: 349, bf_mm: 127, tf_mm: 8.5, tw_mm: 5.8, weight_kgm: 32.7 },
  { name: 'W14×43', type: 'W', standard: 'AISC', d_mm: 348, bf_mm: 203, tf_mm: 13.5, tw_mm: 7.7, weight_kgm: 64.0 },
  { name: 'W14×53', type: 'W', standard: 'AISC', d_mm: 349, bf_mm: 213, tf_mm: 16.7, tw_mm: 9.4, weight_kgm: 78.9 },
  { name: 'W14×68', type: 'W', standard: 'AISC', d_mm: 355, bf_mm: 256, tf_mm: 19.1, tw_mm: 10.9, weight_kgm: 101.2 },
  { name: 'W14×82', type: 'W', standard: 'AISC', d_mm: 360, bf_mm: 257, tf_mm: 22.5, tw_mm: 13.0, weight_kgm: 122.1 },
  { name: 'W14×90', type: 'W', standard: 'AISC', d_mm: 360, bf_mm: 370, tf_mm: 17.7, tw_mm: 11.2, weight_kgm: 133.9 },
  { name: 'W14×120', type: 'W', standard: 'AISC', d_mm: 367, bf_mm: 373, tf_mm: 23.9, tw_mm: 14.9, weight_kgm: 178.6 },
  { name: 'W14×159', type: 'W', standard: 'AISC', d_mm: 380, bf_mm: 377, tf_mm: 31.8, tw_mm: 18.9, weight_kgm: 236.6 },
  { name: 'W14×193', type: 'W', standard: 'AISC', d_mm: 393, bf_mm: 399, tf_mm: 37.6, tw_mm: 22.6, weight_kgm: 287.2 },
  { name: 'W14×257', type: 'W', standard: 'AISC', d_mm: 414, bf_mm: 406, tf_mm: 49.3, tw_mm: 29.8, weight_kgm: 382.4 },
  { name: 'W14×370', type: 'W', standard: 'AISC', d_mm: 445, bf_mm: 418, tf_mm: 68.1, tw_mm: 41.9, weight_kgm: 550.9 },
  // W16 series
  { name: 'W16×31', type: 'W', standard: 'AISC', d_mm: 403, bf_mm: 140, tf_mm: 11.2, tw_mm: 7.1, weight_kgm: 46.2 },
  { name: 'W16×40', type: 'W', standard: 'AISC', d_mm: 407, bf_mm: 178, tf_mm: 12.8, tw_mm: 7.7, weight_kgm: 59.5 },
  { name: 'W16×57', type: 'W', standard: 'AISC', d_mm: 417, bf_mm: 180, tf_mm: 18.0, tw_mm: 10.9, weight_kgm: 84.8 },
  // W18 series
  { name: 'W18×35', type: 'W', standard: 'AISC', d_mm: 450, bf_mm: 152, tf_mm: 10.8, tw_mm: 7.6, weight_kgm: 52.1 },
  { name: 'W18×50', type: 'W', standard: 'AISC', d_mm: 457, bf_mm: 190, tf_mm: 14.5, tw_mm: 9.1, weight_kgm: 74.4 },
  { name: 'W18×76', type: 'W', standard: 'AISC', d_mm: 463, bf_mm: 279, tf_mm: 17.0, tw_mm: 10.9, weight_kgm: 113.1 },
  // W21 series
  { name: 'W21×44', type: 'W', standard: 'AISC', d_mm: 525, bf_mm: 165, tf_mm: 11.4, tw_mm: 8.9, weight_kgm: 65.5 },
  { name: 'W21×68', type: 'W', standard: 'AISC', d_mm: 536, bf_mm: 210, tf_mm: 17.4, tw_mm: 10.2, weight_kgm: 101.2 },
  // W24 series
  { name: 'W24×55', type: 'W', standard: 'AISC', d_mm: 599, bf_mm: 178, tf_mm: 12.8, tw_mm: 9.7, weight_kgm: 81.9 },
  { name: 'W24×84', type: 'W', standard: 'AISC', d_mm: 612, bf_mm: 229, tf_mm: 19.6, tw_mm: 11.9, weight_kgm: 125.0 },
  { name: 'W24×131', type: 'W', standard: 'AISC', d_mm: 622, bf_mm: 324, tf_mm: 22.0, tw_mm: 13.1, weight_kgm: 194.9 },
];

// IS ISMB sections
export const IS_ISMB_SECTIONS: SteelSection[] = [
  { name: 'ISMB 100', type: 'I', standard: 'IS', d_mm: 100, bf_mm: 75,  tf_mm: 7.2, tw_mm: 4.7, weight_kgm: 11.5 },
  { name: 'ISMB 125', type: 'I', standard: 'IS', d_mm: 125, bf_mm: 75,  tf_mm: 7.6, tw_mm: 5.0, weight_kgm: 13.2 },
  { name: 'ISMB 150', type: 'I', standard: 'IS', d_mm: 150, bf_mm: 80,  tf_mm: 7.6, tw_mm: 5.4, weight_kgm: 15.0 },
  { name: 'ISMB 175', type: 'I', standard: 'IS', d_mm: 175, bf_mm: 90,  tf_mm: 8.6, tw_mm: 5.5, weight_kgm: 19.4 },
  { name: 'ISMB 200', type: 'I', standard: 'IS', d_mm: 200, bf_mm: 100, tf_mm: 10.8, tw_mm: 5.7, weight_kgm: 25.4 },
  { name: 'ISMB 225', type: 'I', standard: 'IS', d_mm: 225, bf_mm: 110, tf_mm: 11.8, tw_mm: 6.5, weight_kgm: 31.1 },
  { name: 'ISMB 250', type: 'I', standard: 'IS', d_mm: 250, bf_mm: 125, tf_mm: 12.5, tw_mm: 6.9, weight_kgm: 37.3 },
  { name: 'ISMB 300', type: 'I', standard: 'IS', d_mm: 300, bf_mm: 140, tf_mm: 13.1, tw_mm: 7.5, weight_kgm: 46.1 },
  { name: 'ISMB 350', type: 'I', standard: 'IS', d_mm: 350, bf_mm: 140, tf_mm: 14.2, tw_mm: 8.1, weight_kgm: 52.4 },
  { name: 'ISMB 400', type: 'I', standard: 'IS', d_mm: 400, bf_mm: 140, tf_mm: 16.0, tw_mm: 8.9, weight_kgm: 61.3 },
  { name: 'ISMB 450', type: 'I', standard: 'IS', d_mm: 450, bf_mm: 150, tf_mm: 17.4, tw_mm: 9.4, weight_kgm: 72.4 },
  { name: 'ISMB 500', type: 'I', standard: 'IS', d_mm: 500, bf_mm: 180, tf_mm: 17.2, tw_mm: 10.2, weight_kgm: 86.9 },
  { name: 'ISMB 550', type: 'I', standard: 'IS', d_mm: 550, bf_mm: 190, tf_mm: 19.3, tw_mm: 11.2, weight_kgm: 103.7 },
  { name: 'ISMB 600', type: 'I', standard: 'IS', d_mm: 600, bf_mm: 210, tf_mm: 20.8, tw_mm: 12.0, weight_kgm: 122.6 },
];

// IS ISSC (Star sections) — approximate values
export const IS_ISSC_SECTIONS: SteelSection[] = [
  { name: 'ISSC 100', type: 'I', standard: 'IS', d_mm: 100, bf_mm: 100, tf_mm: 8.0, tw_mm: 6.0, weight_kgm: 14.9 },
  { name: 'ISSC 125', type: 'I', standard: 'IS', d_mm: 125, bf_mm: 125, tf_mm: 8.5, tw_mm: 6.5, weight_kgm: 19.6 },
  { name: 'ISSC 150', type: 'I', standard: 'IS', d_mm: 150, bf_mm: 150, tf_mm: 9.0, tw_mm: 7.0, weight_kgm: 24.8 },
  { name: 'ISSC 200', type: 'I', standard: 'IS', d_mm: 200, bf_mm: 200, tf_mm: 10.5, tw_mm: 7.5, weight_kgm: 37.3 },
  { name: 'ISSC 250', type: 'I', standard: 'IS', d_mm: 250, bf_mm: 250, tf_mm: 12.0, tw_mm: 8.0, weight_kgm: 55.4 },
];

export const ALL_SECTIONS: SteelSection[] = [
  ...AISC_W_SECTIONS,
  ...IS_ISMB_SECTIONS,
  ...IS_ISSC_SECTIONS,
];
