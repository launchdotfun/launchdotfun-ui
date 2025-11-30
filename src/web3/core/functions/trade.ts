// add 20%
export function calculateGasMargin(value: bigint): bigint {
  return (value * BigInt(10000 + 2000)) / BigInt(10000);
}
