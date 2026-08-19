import { Orb } from "@/components/orb/Orb";

export default function AppLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <Orb size={72} state="thinking" playful />
      <p className="mt-4 text-sm text-muted">Cargando módulo…</p>
    </div>
  );
}
