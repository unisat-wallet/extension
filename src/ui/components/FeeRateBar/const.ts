enum FeeRateType {
  SLOW,
  AVG,
  FAST,
  CUSTOM
}

const translationKeys = {
  [FeeRateType.SLOW]: { title: 'slow', desc: 'feerate_slow_desc' },
  [FeeRateType.AVG]: { title: 'avg', desc: 'feerate_avg_desc' },
  [FeeRateType.FAST]: { title: 'fast', desc: 'feerate_fast_desc' }
};

const MAX_FEE_RATE = 10000;

export { FeeRateType, MAX_FEE_RATE, translationKeys };
