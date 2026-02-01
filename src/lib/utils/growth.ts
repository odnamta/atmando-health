/**
 * WHO Growth Standards Utilities
 * 
 * Implements WHO Child Growth Standards for calculating percentiles
 * using the LMS (Lambda-Mu-Sigma) method.
 * 
 * Reference: WHO Child Growth Standards (0-5 years)
 * https://www.who.int/tools/child-growth-standards
 */

// ============================================================================
// TYPES
// ============================================================================

export type Gender = 'male' | 'female'
export type GrowthMetricType = 'height' | 'weight' | 'bmi' | 'head_circumference'

export interface LMSParams {
  L: number // Box-Cox power (skewness)
  M: number // Median
  S: number // Coefficient of variation
}

export interface GrowthDataPoint {
  date: string
  ageMonths: number
  value: number
  percentile?: number
}

export interface PercentileBand {
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}

export interface GrowthChartData {
  ageMonths: number
  childValue?: number
  childPercentile?: number
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}


// ============================================================================
// WHO LMS DATA - Height-for-age (0-60 months)
// ============================================================================

// WHO Height-for-age LMS parameters (boys, 0-60 months)
const HEIGHT_FOR_AGE_BOYS: Record<number, LMSParams> = {
  0: { L: 1, M: 49.9, S: 0.03795 },
  1: { L: 1, M: 54.7, S: 0.03557 },
  2: { L: 1, M: 58.4, S: 0.03424 },
  3: { L: 1, M: 61.4, S: 0.03328 },
  4: { L: 1, M: 63.9, S: 0.03257 },
  5: { L: 1, M: 65.9, S: 0.03204 },
  6: { L: 1, M: 67.6, S: 0.03165 },
  7: { L: 1, M: 69.2, S: 0.03139 },
  8: { L: 1, M: 70.6, S: 0.03124 },
  9: { L: 1, M: 72.0, S: 0.03117 },
  10: { L: 1, M: 73.3, S: 0.03118 },
  11: { L: 1, M: 74.5, S: 0.03125 },
  12: { L: 1, M: 75.7, S: 0.03137 },
  15: { L: 1, M: 79.1, S: 0.03181 },
  18: { L: 1, M: 82.3, S: 0.03234 },
  21: { L: 1, M: 85.1, S: 0.03288 },
  24: { L: 1, M: 87.8, S: 0.03340 },
  27: { L: 1, M: 90.2, S: 0.03388 },
  30: { L: 1, M: 92.4, S: 0.03431 },
  33: { L: 1, M: 94.5, S: 0.03470 },
  36: { L: 1, M: 96.5, S: 0.03506 },
  39: { L: 1, M: 98.4, S: 0.03538 },
  42: { L: 1, M: 100.2, S: 0.03567 },
  45: { L: 1, M: 102.0, S: 0.03594 },
  48: { L: 1, M: 103.7, S: 0.03619 },
  51: { L: 1, M: 105.3, S: 0.03641 },
  54: { L: 1, M: 106.9, S: 0.03662 },
  57: { L: 1, M: 108.5, S: 0.03682 },
  60: { L: 1, M: 110.0, S: 0.03699 },
}

// WHO Height-for-age LMS parameters (girls, 0-60 months)
const HEIGHT_FOR_AGE_GIRLS: Record<number, LMSParams> = {
  0: { L: 1, M: 49.1, S: 0.03790 },
  1: { L: 1, M: 53.7, S: 0.03545 },
  2: { L: 1, M: 57.1, S: 0.03423 },
  3: { L: 1, M: 59.8, S: 0.03348 },
  4: { L: 1, M: 62.1, S: 0.03299 },
  5: { L: 1, M: 64.0, S: 0.03265 },
  6: { L: 1, M: 65.7, S: 0.03244 },
  7: { L: 1, M: 67.3, S: 0.03232 },
  8: { L: 1, M: 68.7, S: 0.03228 },
  9: { L: 1, M: 70.1, S: 0.03231 },
  10: { L: 1, M: 71.5, S: 0.03239 },
  11: { L: 1, M: 72.8, S: 0.03252 },
  12: { L: 1, M: 74.0, S: 0.03269 },
  15: { L: 1, M: 77.5, S: 0.03324 },
  18: { L: 1, M: 80.7, S: 0.03385 },
  21: { L: 1, M: 83.7, S: 0.03447 },
  24: { L: 1, M: 86.4, S: 0.03507 },
  27: { L: 1, M: 88.9, S: 0.03562 },
  30: { L: 1, M: 91.2, S: 0.03612 },
  33: { L: 1, M: 93.4, S: 0.03658 },
  36: { L: 1, M: 95.4, S: 0.03700 },
  39: { L: 1, M: 97.4, S: 0.03738 },
  42: { L: 1, M: 99.3, S: 0.03773 },
  45: { L: 1, M: 101.1, S: 0.03806 },
  48: { L: 1, M: 102.9, S: 0.03836 },
  51: { L: 1, M: 104.6, S: 0.03864 },
  54: { L: 1, M: 106.2, S: 0.03890 },
  57: { L: 1, M: 107.8, S: 0.03914 },
  60: { L: 1, M: 109.4, S: 0.03937 },
}


// ============================================================================
// WHO LMS DATA - Weight-for-age (0-60 months)
// ============================================================================

// WHO Weight-for-age LMS parameters (boys, 0-60 months)
const WEIGHT_FOR_AGE_BOYS: Record<number, LMSParams> = {
  0: { L: 0.3487, M: 3.3464, S: 0.14602 },
  1: { L: 0.2297, M: 4.4709, S: 0.13395 },
  2: { L: 0.1970, M: 5.5675, S: 0.12385 },
  3: { L: 0.1738, M: 6.3762, S: 0.11727 },
  4: { L: 0.1553, M: 7.0023, S: 0.11316 },
  5: { L: 0.1395, M: 7.5105, S: 0.11080 },
  6: { L: 0.1257, M: 7.9340, S: 0.10958 },
  7: { L: 0.1134, M: 8.2970, S: 0.10902 },
  8: { L: 0.1021, M: 8.6151, S: 0.10882 },
  9: { L: 0.0917, M: 8.9014, S: 0.10881 },
  10: { L: 0.0822, M: 9.1649, S: 0.10891 },
  11: { L: 0.0732, M: 9.4122, S: 0.10906 },
  12: { L: 0.0648, M: 9.6479, S: 0.10925 },
  15: { L: 0.0424, M: 10.3002, S: 0.10949 },
  18: { L: 0.0232, M: 10.9000, S: 0.10966 },
  21: { L: 0.0068, M: 11.4546, S: 0.10988 },
  24: { L: -0.0083, M: 11.9873, S: 0.11020 },
  27: { L: -0.0217, M: 12.4969, S: 0.11065 },
  30: { L: -0.0334, M: 12.9854, S: 0.11119 },
  33: { L: -0.0437, M: 13.4566, S: 0.11183 },
  36: { L: -0.0524, M: 13.9145, S: 0.11254 },
  39: { L: -0.0598, M: 14.3608, S: 0.11332 },
  42: { L: -0.0660, M: 14.7970, S: 0.11415 },
  45: { L: -0.0711, M: 15.2252, S: 0.11504 },
  48: { L: -0.0752, M: 15.6471, S: 0.11598 },
  51: { L: -0.0786, M: 16.0647, S: 0.11695 },
  54: { L: -0.0812, M: 16.4796, S: 0.11797 },
  57: { L: -0.0833, M: 16.8932, S: 0.11901 },
  60: { L: -0.0848, M: 17.3069, S: 0.12008 },
}

// WHO Weight-for-age LMS parameters (girls, 0-60 months)
const WEIGHT_FOR_AGE_GIRLS: Record<number, LMSParams> = {
  0: { L: 0.3809, M: 3.2322, S: 0.14171 },
  1: { L: 0.1714, M: 4.1873, S: 0.13724 },
  2: { L: 0.0962, M: 5.1282, S: 0.13000 },
  3: { L: 0.0402, M: 5.8458, S: 0.12619 },
  4: { L: -0.0050, M: 6.4237, S: 0.12402 },
  5: { L: -0.0430, M: 6.8985, S: 0.12274 },
  6: { L: -0.0756, M: 7.2970, S: 0.12204 },
  7: { L: -0.1039, M: 7.6422, S: 0.12178 },
  8: { L: -0.1288, M: 7.9487, S: 0.12181 },
  9: { L: -0.1507, M: 8.2254, S: 0.12199 },
  10: { L: -0.1700, M: 8.4800, S: 0.12223 },
  11: { L: -0.1872, M: 8.7192, S: 0.12247 },
  12: { L: -0.2024, M: 8.9481, S: 0.12268 },
  15: { L: -0.2378, M: 9.5246, S: 0.12316 },
  18: { L: -0.2630, M: 10.0569, S: 0.12369 },
  21: { L: -0.2821, M: 10.5435, S: 0.12431 },
  24: { L: -0.2966, M: 11.0051, S: 0.12505 },
  27: { L: -0.3073, M: 11.4514, S: 0.12590 },
  30: { L: -0.3150, M: 11.8879, S: 0.12687 },
  33: { L: -0.3203, M: 12.3181, S: 0.12793 },
  36: { L: -0.3238, M: 12.7450, S: 0.12908 },
  39: { L: -0.3258, M: 13.1706, S: 0.13030 },
  42: { L: -0.3267, M: 13.5960, S: 0.13159 },
  45: { L: -0.3267, M: 14.0227, S: 0.13294 },
  48: { L: -0.3261, M: 14.4519, S: 0.13434 },
  51: { L: -0.3249, M: 14.8847, S: 0.13580 },
  54: { L: -0.3233, M: 15.3222, S: 0.13730 },
  57: { L: -0.3214, M: 15.7654, S: 0.13884 },
  60: { L: -0.3194, M: 16.2154, S: 0.14042 },
}


// ============================================================================
// WHO LMS DATA - BMI-for-age (0-60 months)
// ============================================================================

// WHO BMI-for-age LMS parameters (boys, 0-60 months)
const BMI_FOR_AGE_BOYS: Record<number, LMSParams> = {
  0: { L: 0.0631, M: 13.4069, S: 0.09210 },
  1: { L: -0.0756, M: 14.9441, S: 0.08941 },
  2: { L: -0.1756, M: 16.3449, S: 0.08676 },
  3: { L: -0.2537, M: 16.9392, S: 0.08512 },
  4: { L: -0.3143, M: 17.2306, S: 0.08402 },
  5: { L: -0.3611, M: 17.3671, S: 0.08317 },
  6: { L: -0.3966, M: 17.4133, S: 0.08247 },
  7: { L: -0.4227, M: 17.4006, S: 0.08186 },
  8: { L: -0.4410, M: 17.3478, S: 0.08132 },
  9: { L: -0.4527, M: 17.2647, S: 0.08084 },
  10: { L: -0.4589, M: 17.1614, S: 0.08042 },
  11: { L: -0.4604, M: 17.0466, S: 0.08006 },
  12: { L: -0.4580, M: 16.9283, S: 0.07977 },
  15: { L: -0.4341, M: 16.5817, S: 0.07927 },
  18: { L: -0.3971, M: 16.2817, S: 0.07918 },
  21: { L: -0.3521, M: 16.0131, S: 0.07942 },
  24: { L: -0.3027, M: 15.7686, S: 0.07990 },
  27: { L: -0.2512, M: 15.5498, S: 0.08056 },
  30: { L: -0.1994, M: 15.3569, S: 0.08135 },
  33: { L: -0.1484, M: 15.1877, S: 0.08225 },
  36: { L: -0.0989, M: 15.0398, S: 0.08323 },
  39: { L: -0.0515, M: 14.9106, S: 0.08427 },
  42: { L: -0.0065, M: 14.7976, S: 0.08537 },
  45: { L: 0.0361, M: 14.6986, S: 0.08651 },
  48: { L: 0.0764, M: 14.6116, S: 0.08769 },
  51: { L: 0.1145, M: 14.5350, S: 0.08890 },
  54: { L: 0.1506, M: 14.4674, S: 0.09014 },
  57: { L: 0.1848, M: 14.4077, S: 0.09140 },
  60: { L: 0.2173, M: 14.3551, S: 0.09268 },
}

// WHO BMI-for-age LMS parameters (girls, 0-60 months)
const BMI_FOR_AGE_GIRLS: Record<number, LMSParams> = {
  0: { L: 0.0631, M: 13.3363, S: 0.09274 },
  1: { L: -0.1163, M: 14.5679, S: 0.09498 },
  2: { L: -0.2384, M: 15.7477, S: 0.09498 },
  3: { L: -0.3272, M: 16.3817, S: 0.09424 },
  4: { L: -0.3935, M: 16.6879, S: 0.09339 },
  5: { L: -0.4434, M: 16.8293, S: 0.09260 },
  6: { L: -0.4810, M: 16.8756, S: 0.09190 },
  7: { L: -0.5091, M: 16.8631, S: 0.09130 },
  8: { L: -0.5297, M: 16.8091, S: 0.09079 },
  9: { L: -0.5440, M: 16.7256, S: 0.09037 },
  10: { L: -0.5531, M: 16.6214, S: 0.09003 },
  11: { L: -0.5577, M: 16.5035, S: 0.08976 },
  12: { L: -0.5586, M: 16.3792, S: 0.08955 },
  15: { L: -0.5452, M: 16.0402, S: 0.08929 },
  18: { L: -0.5182, M: 15.7292, S: 0.08941 },
  21: { L: -0.4827, M: 15.4463, S: 0.08980 },
  24: { L: -0.4424, M: 15.1919, S: 0.09039 },
  27: { L: -0.3996, M: 14.9666, S: 0.09113 },
  30: { L: -0.3559, M: 14.7693, S: 0.09198 },
  33: { L: -0.3124, M: 14.5977, S: 0.09292 },
  36: { L: -0.2698, M: 14.4490, S: 0.09392 },
  39: { L: -0.2286, M: 14.3204, S: 0.09498 },
  42: { L: -0.1893, M: 14.2093, S: 0.09608 },
  45: { L: -0.1519, M: 14.1133, S: 0.09721 },
  48: { L: -0.1167, M: 14.0303, S: 0.09838 },
  51: { L: -0.0837, M: 13.9586, S: 0.09957 },
  54: { L: -0.0529, M: 13.8968, S: 0.10079 },
  57: { L: -0.0243, M: 13.8437, S: 0.10202 },
  60: { L: 0.0022, M: 13.7983, S: 0.10327 },
}


// ============================================================================
// WHO LMS DATA - Head circumference-for-age (0-60 months)
// ============================================================================

// WHO Head circumference-for-age LMS parameters (boys, 0-60 months)
const HEAD_CIRC_FOR_AGE_BOYS: Record<number, LMSParams> = {
  0: { L: 1, M: 34.5, S: 0.03686 },
  1: { L: 1, M: 37.3, S: 0.03133 },
  2: { L: 1, M: 39.1, S: 0.02997 },
  3: { L: 1, M: 40.5, S: 0.02918 },
  4: { L: 1, M: 41.6, S: 0.02868 },
  5: { L: 1, M: 42.6, S: 0.02837 },
  6: { L: 1, M: 43.3, S: 0.02817 },
  7: { L: 1, M: 44.0, S: 0.02804 },
  8: { L: 1, M: 44.5, S: 0.02796 },
  9: { L: 1, M: 45.0, S: 0.02792 },
  10: { L: 1, M: 45.4, S: 0.02790 },
  11: { L: 1, M: 45.8, S: 0.02789 },
  12: { L: 1, M: 46.1, S: 0.02789 },
  15: { L: 1, M: 46.8, S: 0.02791 },
  18: { L: 1, M: 47.4, S: 0.02795 },
  21: { L: 1, M: 47.8, S: 0.02800 },
  24: { L: 1, M: 48.2, S: 0.02806 },
  27: { L: 1, M: 48.5, S: 0.02812 },
  30: { L: 1, M: 48.8, S: 0.02819 },
  33: { L: 1, M: 49.0, S: 0.02826 },
  36: { L: 1, M: 49.2, S: 0.02833 },
  39: { L: 1, M: 49.4, S: 0.02840 },
  42: { L: 1, M: 49.5, S: 0.02847 },
  45: { L: 1, M: 49.7, S: 0.02854 },
  48: { L: 1, M: 49.8, S: 0.02861 },
  51: { L: 1, M: 49.9, S: 0.02868 },
  54: { L: 1, M: 50.0, S: 0.02875 },
  57: { L: 1, M: 50.1, S: 0.02882 },
  60: { L: 1, M: 50.2, S: 0.02889 },
}

// WHO Head circumference-for-age LMS parameters (girls, 0-60 months)
const HEAD_CIRC_FOR_AGE_GIRLS: Record<number, LMSParams> = {
  0: { L: 1, M: 33.9, S: 0.03496 },
  1: { L: 1, M: 36.5, S: 0.03099 },
  2: { L: 1, M: 38.3, S: 0.02997 },
  3: { L: 1, M: 39.5, S: 0.02941 },
  4: { L: 1, M: 40.6, S: 0.02907 },
  5: { L: 1, M: 41.5, S: 0.02884 },
  6: { L: 1, M: 42.2, S: 0.02869 },
  7: { L: 1, M: 42.8, S: 0.02858 },
  8: { L: 1, M: 43.4, S: 0.02851 },
  9: { L: 1, M: 43.8, S: 0.02846 },
  10: { L: 1, M: 44.2, S: 0.02843 },
  11: { L: 1, M: 44.6, S: 0.02841 },
  12: { L: 1, M: 44.9, S: 0.02840 },
  15: { L: 1, M: 45.6, S: 0.02839 },
  18: { L: 1, M: 46.2, S: 0.02841 },
  21: { L: 1, M: 46.7, S: 0.02844 },
  24: { L: 1, M: 47.1, S: 0.02848 },
  27: { L: 1, M: 47.4, S: 0.02853 },
  30: { L: 1, M: 47.7, S: 0.02858 },
  33: { L: 1, M: 47.9, S: 0.02864 },
  36: { L: 1, M: 48.1, S: 0.02870 },
  39: { L: 1, M: 48.3, S: 0.02876 },
  42: { L: 1, M: 48.5, S: 0.02882 },
  45: { L: 1, M: 48.6, S: 0.02888 },
  48: { L: 1, M: 48.8, S: 0.02894 },
  51: { L: 1, M: 48.9, S: 0.02900 },
  54: { L: 1, M: 49.0, S: 0.02906 },
  57: { L: 1, M: 49.1, S: 0.02912 },
  60: { L: 1, M: 49.2, S: 0.02918 },
}


// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Get LMS parameters for a given age, gender, and metric type
 * Uses linear interpolation for ages between data points
 */
function getLMSParams(
  ageMonths: number,
  gender: Gender,
  metricType: GrowthMetricType
): LMSParams | null {
  let data: Record<number, LMSParams>
  
  switch (metricType) {
    case 'height':
      data = gender === 'male' ? HEIGHT_FOR_AGE_BOYS : HEIGHT_FOR_AGE_GIRLS
      break
    case 'weight':
      data = gender === 'male' ? WEIGHT_FOR_AGE_BOYS : WEIGHT_FOR_AGE_GIRLS
      break
    case 'bmi':
      data = gender === 'male' ? BMI_FOR_AGE_BOYS : BMI_FOR_AGE_GIRLS
      break
    case 'head_circumference':
      data = gender === 'male' ? HEAD_CIRC_FOR_AGE_BOYS : HEAD_CIRC_FOR_AGE_GIRLS
      break
    default:
      return null
  }
  
  // Clamp age to valid range (0-60 months)
  const clampedAge = Math.max(0, Math.min(60, ageMonths))
  
  // Find surrounding data points for interpolation
  const ages = Object.keys(data).map(Number).sort((a, b) => a - b)
  
  // Exact match
  if (data[clampedAge]) {
    return data[clampedAge]
  }
  
  // Find lower and upper bounds
  let lowerAge = ages[0]
  let upperAge = ages[ages.length - 1]
  
  for (let i = 0; i < ages.length - 1; i++) {
    if (ages[i] <= clampedAge && ages[i + 1] >= clampedAge) {
      lowerAge = ages[i]
      upperAge = ages[i + 1]
      break
    }
  }
  
  // Linear interpolation
  const lowerParams = data[lowerAge]
  const upperParams = data[upperAge]
  const ratio = (clampedAge - lowerAge) / (upperAge - lowerAge)
  
  return {
    L: lowerParams.L + ratio * (upperParams.L - lowerParams.L),
    M: lowerParams.M + ratio * (upperParams.M - lowerParams.M),
    S: lowerParams.S + ratio * (upperParams.S - lowerParams.S),
  }
}

/**
 * Standard normal cumulative distribution function
 * Approximation using Abramowitz and Stegun formula
 */
function normalCDF(z: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = z < 0 ? -1 : 1
  z = Math.abs(z)
  
  const t = 1.0 / (1.0 + p * z)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z / 2)
  
  return 0.5 * (1.0 + sign * y)
}

/**
 * Calculate Z-score from measurement using LMS method
 */
function calculateZScore(value: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return Math.log(value / M) / S
  }
  return (Math.pow(value / M, L) - 1) / (L * S)
}

/**
 * Calculate value from Z-score using LMS method (inverse)
 */
function calculateValueFromZScore(z: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return M * Math.exp(S * z)
  }
  return M * Math.pow(1 + L * S * z, 1 / L)
}


// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Calculate percentile for a given measurement
 * @param value - The measurement value
 * @param ageMonths - Age in months
 * @param gender - 'male' or 'female'
 * @param metricType - Type of measurement
 * @returns Percentile (0-100) or null if calculation fails
 */
export function calculatePercentile(
  value: number,
  ageMonths: number,
  gender: Gender,
  metricType: GrowthMetricType
): number | null {
  const params = getLMSParams(ageMonths, gender, metricType)
  if (!params) return null
  
  const z = calculateZScore(value, params.L, params.M, params.S)
  const percentile = normalCDF(z) * 100
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(percentile)))
}

/**
 * Get percentile bands for a given age and gender
 * Returns values for 3rd, 15th, 50th, 85th, and 97th percentiles
 */
export function getPercentileBands(
  ageMonths: number,
  gender: Gender,
  metricType: GrowthMetricType
): PercentileBand | null {
  const params = getLMSParams(ageMonths, gender, metricType)
  if (!params) return null
  
  // Z-scores for standard percentiles
  const zScores = {
    p3: -1.88079,
    p15: -1.03643,
    p50: 0,
    p85: 1.03643,
    p97: 1.88079,
  }
  
  return {
    p3: calculateValueFromZScore(zScores.p3, params.L, params.M, params.S),
    p15: calculateValueFromZScore(zScores.p15, params.L, params.M, params.S),
    p50: calculateValueFromZScore(zScores.p50, params.L, params.M, params.S),
    p85: calculateValueFromZScore(zScores.p85, params.L, params.M, params.S),
    p97: calculateValueFromZScore(zScores.p97, params.L, params.M, params.S),
  }
}

/**
 * Generate chart data with WHO percentile bands
 * @param childData - Array of child's measurements
 * @param gender - Child's gender
 * @param metricType - Type of measurement
 * @param maxAgeMonths - Maximum age to show (default 60)
 * @returns Array of chart data points
 */
export function generateGrowthChartData(
  childData: GrowthDataPoint[],
  gender: Gender,
  metricType: GrowthMetricType,
  maxAgeMonths: number = 60
): GrowthChartData[] {
  const chartData: GrowthChartData[] = []
  
  // Create a map of child data by age for quick lookup
  const childDataMap = new Map<number, GrowthDataPoint>()
  childData.forEach(d => {
    childDataMap.set(Math.round(d.ageMonths), d)
  })
  
  // Generate data points for each month
  for (let age = 0; age <= maxAgeMonths; age++) {
    const bands = getPercentileBands(age, gender, metricType)
    if (!bands) continue
    
    const point: GrowthChartData = {
      ageMonths: age,
      p3: bands.p3,
      p15: bands.p15,
      p50: bands.p50,
      p85: bands.p85,
      p97: bands.p97,
    }
    
    // Add child's data if available for this age
    const childPoint = childDataMap.get(age)
    if (childPoint) {
      point.childValue = childPoint.value
      point.childPercentile = childPoint.percentile
    }
    
    chartData.push(point)
  }
  
  return chartData
}


/**
 * Get percentile status and label (Indonesian)
 */
export function getPercentileStatus(percentile: number): {
  status: 'danger' | 'warning' | 'normal'
  label: string
  description: string
} {
  if (percentile < 3) {
    return {
      status: 'danger',
      label: 'Sangat Rendah',
      description: 'Di bawah persentil ke-3',
    }
  }
  if (percentile < 15) {
    return {
      status: 'warning',
      label: 'Rendah',
      description: 'Persentil ke-3 hingga ke-15',
    }
  }
  if (percentile <= 85) {
    return {
      status: 'normal',
      label: 'Normal',
      description: 'Persentil ke-15 hingga ke-85',
    }
  }
  if (percentile <= 97) {
    return {
      status: 'warning',
      label: 'Tinggi',
      description: 'Persentil ke-85 hingga ke-97',
    }
  }
  return {
    status: 'danger',
    label: 'Sangat Tinggi',
    description: 'Di atas persentil ke-97',
  }
}

/**
 * Calculate BMI from height and weight
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

/**
 * Calculate age in months from birth date
 */
export function calculateAgeInMonths(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const now = new Date()
  
  const months = (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth()) +
    (now.getDate() >= birth.getDate() ? 0 : -1)
  
  return Math.max(0, months)
}

/**
 * Format percentile for display
 */
export function formatPercentile(percentile: number): string {
  return `${Math.round(percentile)}%`
}

// ============================================================================
// MILESTONE TYPES AND CONSTANTS
// ============================================================================

export type MilestoneType = 'motor' | 'language' | 'social' | 'cognitive'

export const MILESTONE_TYPES: Record<MilestoneType, { label: string; icon: string }> = {
  motor: { label: 'Motorik', icon: '🏃' },
  language: { label: 'Bahasa', icon: '💬' },
  social: { label: 'Sosial', icon: '👋' },
  cognitive: { label: 'Kognitif', icon: '🧠' },
}

export const COMMON_MILESTONES: Record<MilestoneType, Array<{ name: string; typicalAgeMonths: number }>> = {
  motor: [
    { name: 'Mengangkat kepala', typicalAgeMonths: 2 },
    { name: 'Berguling', typicalAgeMonths: 4 },
    { name: 'Duduk tanpa bantuan', typicalAgeMonths: 6 },
    { name: 'Merangkak', typicalAgeMonths: 8 },
    { name: 'Berdiri berpegangan', typicalAgeMonths: 9 },
    { name: 'Langkah pertama', typicalAgeMonths: 12 },
    { name: 'Berjalan sendiri', typicalAgeMonths: 14 },
    { name: 'Berlari', typicalAgeMonths: 18 },
    { name: 'Naik tangga', typicalAgeMonths: 24 },
    { name: 'Melompat', typicalAgeMonths: 30 },
  ],
  language: [
    { name: 'Mengoceh', typicalAgeMonths: 4 },
    { name: 'Kata pertama', typicalAgeMonths: 12 },
    { name: '10 kata', typicalAgeMonths: 18 },
    { name: 'Kalimat 2 kata', typicalAgeMonths: 24 },
    { name: 'Kalimat lengkap', typicalAgeMonths: 36 },
    { name: 'Bercerita', typicalAgeMonths: 48 },
  ],
  social: [
    { name: 'Senyum sosial', typicalAgeMonths: 2 },
    { name: 'Tertawa', typicalAgeMonths: 4 },
    { name: 'Mengenali orang asing', typicalAgeMonths: 6 },
    { name: 'Melambaikan tangan', typicalAgeMonths: 9 },
    { name: 'Bermain cilukba', typicalAgeMonths: 10 },
    { name: 'Bermain bersama', typicalAgeMonths: 24 },
    { name: 'Berbagi mainan', typicalAgeMonths: 36 },
  ],
  cognitive: [
    { name: 'Mengikuti objek dengan mata', typicalAgeMonths: 2 },
    { name: 'Meraih objek', typicalAgeMonths: 4 },
    { name: 'Object permanence', typicalAgeMonths: 8 },
    { name: 'Menunjuk objek', typicalAgeMonths: 12 },
    { name: 'Bermain pura-pura', typicalAgeMonths: 18 },
    { name: 'Mengenal warna', typicalAgeMonths: 30 },
    { name: 'Menghitung 1-10', typicalAgeMonths: 36 },
  ],
}