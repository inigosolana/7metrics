import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { ClubProvider } from "@/contexts/club-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
// const _geistMono = Geist_Mono({ subsets: ["latin"] }) // Removed unused mono font

export const metadata: Metadata = {
  title: "Handball.AI - Gestión Profesional de Balonmano",
  description: "Plataforma SaaS completa para gestión y análisis de equipos de balonmano",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ClubProvider>{children}</ClubProvider>
        <Analytics />
      </body>
    </html>
  )
}
