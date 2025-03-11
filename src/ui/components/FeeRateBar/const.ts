enum FeeRateType {
  SLOW,
  AVG,
  FAST,
  CUSTOM
}

const translationKeys = {
  [FeeRateType.SLOW]: { title: 'slow', desc: 'about_1_hour' },
  [FeeRateType.AVG]: { title: 'avg', desc: 'about_30_minutes' },
  [FeeRateType.FAST]: { title: 'fast', desc: 'about_10_minutes' }
};

const MAX_FEE_RATE = 10000;

export { FeeRateType, MAX_FEE_RATE, translationKeys };
