import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthGuard } from "@/components/auth-guard"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Sistemper 2025 - Sistema de Orçamentos para Vidraçarias",
  description: "Sistema completo para gestão de orçamentos, clientes e cálculos para vidraçarias",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
