export function hexToInt(hex: string) {
  return parseInt(hex.replace(/^#/, ""), 16);
}
