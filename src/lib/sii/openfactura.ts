import { openFacturaBaseUrl, type SiiEnvironment } from "./dte";
import { buildOpenFacturaPayload, type DteBuildInput } from "./xml";

export type OpenFacturaResult = {
  ok: true;
  folio: number;
  trackId: string;
  xml?: string;
  raw: unknown;
} | {
  ok: false;
  message: string;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function pick(raw: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

export async function emitOpenFactura(
  input: DteBuildInput,
  apiKey: string,
  environment: SiiEnvironment,
): Promise<OpenFacturaResult> {
  const base = openFacturaBaseUrl(environment);
  const payload = buildOpenFacturaPayload(input);
  let response: Response;
  try {
    response = await fetch(`${base}/v2/dte/document`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      message: "No se pudo contactar OpenFactura. Revisa la red o el ambiente (certificación / producción).",
    };
  }

  const text = await response.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    json = { raw: text.slice(0, 400) };
  }

  if (!response.ok) {
    const message =
      asString(json.message) ||
      asString(json.error) ||
      asString(json.Error) ||
      `OpenFactura respondió ${response.status}.`;
    return { ok: false, message };
  }

  const folio = asNumber(pick(json, ["folio", "Folio", "FOLIO"])) ?? input.folio;
  const trackId =
    asString(pick(json, ["trackid", "trackId", "TrackID", "TRACKID"])) ||
    `OF-${input.dteType}-${folio}`;
  const xml = asString(pick(json, ["xml", "XML"]));
  return { ok: true, folio, trackId, xml, raw: json };
}

export async function testOpenFactura(
  apiKey: string,
  environment: SiiEnvironment,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const base = openFacturaBaseUrl(environment);
  try {
    const response = await fetch(`${base}/v2/dte/document/issued`, {
      method: "GET",
      headers: {
        apikey: apiKey,
        Accept: "application/json",
      },
    });
    if (response.ok || response.status === 404) return { ok: true };
    const text = await response.text();
    let message = `OpenFactura respondió ${response.status}.`;
    try {
      const json = JSON.parse(text) as { message?: string; error?: string };
      message = json.message || json.error || message;
    } catch {
      /* keep default */
    }
    if (response.status === 401 || response.status === 403) {
      return { ok: false, message: "API key rechazada por OpenFactura." };
    }
    return { ok: false, message };
  } catch {
    return { ok: false, message: "No se pudo contactar OpenFactura." };
  }
}
