/** Chilean RUT: compact, format, módulo 11. */

export function compactRut(value: string): string {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function rutBodyAndDv(value: string): { body: string; dv: string } | null {
  const compact = compactRut(value);
  if (compact.length < 2 || compact.length > 9) return null;
  return { body: compact.slice(0, -1), dv: compact.slice(-1) };
}

export function computeRutDv(body: string): string {
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    const digit = Number(body[i]);
    if (!Number.isInteger(digit)) return "";
    sum += digit * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return "0";
  if (rest === 10) return "K";
  return String(rest);
}

export function isValidRut(value: string): boolean {
  const parts = rutBodyAndDv(value);
  if (!parts) return false;
  if (!/^\d{1,8}$/.test(parts.body)) return false;
  return computeRutDv(parts.body) === parts.dv;
}

export function formatRut(value: string): string {
  const compact = compactRut(value);
  if (compact.length < 2) return value.trim();
  const body = compact.slice(0, -1);
  const dv = compact.slice(-1);
  const grouped = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${grouped}-${dv}`;
}

/** SII XML / JSON: 12345678-9 without dots. */
export function siiRut(value: string): string {
  const compact = compactRut(value);
  if (compact.length < 2) return compact;
  return `${compact.slice(0, -1)}-${compact.slice(-1)}`;
}

export const GENERIC_BOLETA_RUT = "66666666-6";
