export function translateAuthError(message: string | undefined | null): string {
  const raw = (message ?? "").trim();
  const lower = raw.toLowerCase();

  if (!raw) return "No se pudo completar la operación.";
  if (lower.includes("supabase no está configurado")) {
    return "Falta conectar Supabase. Completa .env.local con la URL y la anon key.";
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma tu correo para entrar. Revisa la bandeja de entrada.";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "Ese correo ya está registrado.";
  }
  if (lower.includes("password should be at least") || lower.includes("password is known to be weak")) {
    return "La clave es demasiado corta o muy débil. Usa al menos 8 caracteres.";
  }
  if (lower.includes("unable to validate email") || lower.includes("invalid email")) {
    return "El correo no es válido.";
  }
  if (lower.includes("signup is disabled")) {
    return "El registro está deshabilitado en el proyecto de Supabase.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("over_email_send_rate")) {
    return "Demasiados intentos. Espera un minuto y vuelve a probar.";
  }
  if (lower.includes("expired") || lower.includes("otp")) {
    return "El enlace expiró. Pide uno nuevo.";
  }
  if (lower.includes("same password")) {
    return "La nueva clave debe ser distinta a la actual.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "No hay conexión con Supabase. Revisa la URL del proyecto.";
  }
  return raw;
}

export const MIN_PASSWORD_LENGTH = 8;
