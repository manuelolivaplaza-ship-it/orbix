import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbix — Gestión empresarial",
  description:
    "Facturación, sueldos, RRHH y reportes para empresas chilenas. Un SaaS moderno con la mascota Orb.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`dark ${geist.variable} ${jetbrains.variable}`}>
      <body className="bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
