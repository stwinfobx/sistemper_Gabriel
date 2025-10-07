import type React from "react"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"
import { AuthGuard } from "@/components/auth-guard"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Sistemper 2025 - Sistema de Orçamentos para Vidraçarias",
  description: "Sistema completo para gestão de orçamentos, clientes e cálculos para vidraçarias",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${robotoMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthGuard>{children}</AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  )
}
