"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { useStore } from "@/lib/store";
import { DTE_LABEL, type DteType, type SiiEnvironment, type SiiProvider } from "@/lib/sii/dte";
import { siiLabel, siiTone } from "@/lib/status";

const TYPES: DteType[] = [33, 34, 39, 41, 56, 61];

export function SiiPanel() {
  const { siiSettings, saveSiiSettings, testSiiConnection, company } = useStore();
  const [apiKey, setApiKey] = useState(siiSettings.apiKey ?? "");
  const [testing, setTesting] = useState(false);

  const connected = siiSettings.connected;
  const status = connected ? "aceptado" : "pendiente";

  return (
    <Card className="p-6 sm:p-8 md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">SII</p>
          <h2 className="mt-1 text-base font-semibold text-ink">Factura electrónica</h2>
          <p className="mt-1 max-w-xl text-sm text-secondary">
            Orbix arma el DTE (tipo, folio, XML, TED). El sandbox timbra en la plataforma. Para
            producción se envía por OpenFactura (Haulmer), PPM certificado ante el SII.
          </p>
        </div>
        <Badge tone={siiTone(status)}>{connected ? siiLabel("aceptado") : "No conectado"}</Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Ambiente</Label>
          <Select
            value={siiSettings.environment}
            onChange={(e) =>
              saveSiiSettings({ environment: e.target.value as SiiEnvironment }, { silent: true })
            }
          >
            <option value="sandbox">Sandbox Orbix</option>
            <option value="certificacion">Certificación SII (OpenFactura)</option>
            <option value="produccion">Producción SII (OpenFactura)</option>
          </Select>
        </div>
        <div>
          <Label>Proveedor</Label>
          <Select
            value={siiSettings.provider}
            onChange={(e) => {
              const provider = e.target.value as SiiProvider;
              saveSiiSettings(
                {
                  provider,
                  environment: provider === "sandbox" ? "sandbox" : siiSettings.environment === "sandbox" ? "certificacion" : siiSettings.environment,
                },
                { silent: true },
              );
            }}
          >
            <option value="sandbox">Sandbox Orbix</option>
            <option value="openfactura">OpenFactura · Haulmer</option>
          </Select>
        </div>
      </div>

      {siiSettings.provider === "openfactura" ? (
        <div className="mt-4">
          <Label>API key OpenFactura</Label>
          <Input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Pégala desde el panel de Haulmer"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Se guarda en este navegador para la empresa {company?.name ?? "activa"}. No se muestra a Orb.
          </p>
          <Button
            className="mt-3"
            size="sm"
            variant="secondary"
            onClick={() => saveSiiSettings({ apiKey: apiKey.trim(), provider: "openfactura" })}
          >
            Guardar API key
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-secondary">
          El sandbox valida RUT, IVA, folio CAF interno y genera el XML del DTE. Sirve para operar
          la oficina hoy. No sustituye la certificación de software ante el SII.
        </p>
      )}

      {siiSettings.lastError ? (
        <p className="mt-3 text-sm text-red-400">{siiSettings.lastError}</p>
      ) : null}

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Folios CAF
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((type) => {
            const range = siiSettings.folios[type];
            return (
              <div key={type} className="rounded-lg border border-line px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  {type} · {DTE_LABEL[type]}
                </p>
                <p className="mt-1 font-mono text-sm text-ink">
                  próximo {range?.next ?? 1}
                  <span className="text-muted-foreground">
                    {" "}
                    · {range?.from ?? 1}–{range?.to ?? 1000}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        className="mt-6"
        onClick={async () => {
          setTesting(true);
          await testSiiConnection();
          setTesting(false);
        }}
        disabled={testing}
      >
        {testing ? "Probando…" : connected ? "Volver a probar conexión" : "Activar conexión"}
      </Button>
    </Card>
  );
}
