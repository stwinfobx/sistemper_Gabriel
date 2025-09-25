"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Building2, Shield } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simular autenticação
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Credenciais de exemplo
      const validCredentials = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "vendedor", password: "vend123", role: "vendedor" },
        { username: "demo", password: "demo", role: "admin" },
      ]

      const user = validCredentials.find(
        (cred) => cred.username === formData.username && cred.password === formData.password,
      )

      if (user) {
        // Salvar dados do usuário no localStorage
        localStorage.setItem(
          "sistemper_user",
          JSON.stringify({
            username: user.username,
            role: user.role,
            loginTime: new Date().toISOString(),
          }),
        )

        router.push("/")
      } else {
        setError("Usuário ou senha incorretos")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sistemper 2025</h1>
          <p className="text-slate-400">Sistema de Orçamentos para Vidraçarias</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">Entrar no Sistema</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Digite suas credenciais para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-900/20 border-red-800 text-red-400">
                  <Shield className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Credenciais de demonstração */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <h3 className="text-sm font-medium text-slate-200 mb-2">Credenciais de Demonstração:</h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div>
                  <strong>Admin:</strong> admin / admin123
                </div>
                <div>
                  <strong>Vendedor:</strong> vendedor / vend123
                </div>
                <div>
                  <strong>Demo:</strong> demo / demo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-slate-400 text-sm">© 2025 Sistemper. Todos os direitos reservados.</div>
      </div>
    </div>
  )
}
