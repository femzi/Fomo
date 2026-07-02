export function parseNaira(str: string): number {
  if (str.toLowerCase().includes('free')) return 0;
  const digits = str.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export function formatNaira(n: number): string {
  return `₦${n.toLocaleString()}`;
}
