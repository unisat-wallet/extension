import { BigNumber } from 'bignumber.js';

// Max 38 decimal places
function toDecimalAmount(amount: string, divisibility: number) {
  const decimalAmount = new BigNumber(amount).dividedBy(new BigNumber(10).pow(divisibility));
  return decimalAmount.toString();
}

function toDecimalNumber(amount, divisibility) {
  const decimalAmount = new BigNumber(amount).dividedBy(new BigNumber(10).pow(divisibility));
  return decimalAmount;
}

function fromDecimalAmount(decimalAmount: string, divisibility: number) {
  decimalAmount = decimalAmount.replace(/\.$/, '');
  if (divisibility === 0) {
    return decimalAmount;
  }
  const amount = new BigNumber(decimalAmount).multipliedBy(new BigNumber(10).pow(divisibility));
  return amount.toString();
}

function compareAmount(a: string, b: string) {
  return new BigNumber(a).comparedTo(new BigNumber(b));
}

function toBigNumber(a: string) {
  return new BigNumber(a);
}

export const runesUtils = {
  toDecimalAmount,
  toDecimalNumber,
  fromDecimalAmount,
  compareAmount,
  toBigNumber
};
