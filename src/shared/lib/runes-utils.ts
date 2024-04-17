import { Decimal } from 'decimal.js';

// Max 38 decimal places
function toDecimalAmount(amount, divisibility) {
  const decimalAmount = new Decimal(amount).dividedBy(new Decimal(10).pow(divisibility));
  return decimalAmount.toFixed();
}

function toDecimalNumber(amount, divisibility) {
  const decimalAmount = new Decimal(amount).dividedBy(new Decimal(10).pow(divisibility));
  return decimalAmount;
}

function fromDecimalAmount(decimalAmount, divisibility) {
  decimalAmount = decimalAmount.replace(/\.$/, '');
  if (divisibility === 0) {
    return decimalAmount;
  }
  const amount = new Decimal(decimalAmount).times(new Decimal(10).pow(divisibility));
  return amount.toString();
}

export const runesUtils = {
  toDecimalAmount,
  toDecimalNumber,
  fromDecimalAmount
};
