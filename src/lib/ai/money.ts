export function parseChileanAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const s = raw.replace(/[$\s]/g, "");
  if (!s) return null;
  let n: number;
  if (s.includes(",") && s.includes(".")) {
    n = Number(s.replace(/\./g, "").replace(",", "."));
  } else if (s.includes(",")) {
    n = Number(s.replace(",", "."));
  } else if ((s.match(/\./g) ?? []).length > 1) {
    n = Number(s.replace(/\./g, ""));
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    n = Number(s.replace(/\./g, ""));
  } else {
    n = Number(s);
  }
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export function parseFlexibleDate(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return fallback;
  const d = m[1].padStart(2, "0");
  const mo = m[2].padStart(2, "0");
  return `${m[3]}-${mo}-${d}`;
}

export function addDaysISO(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
