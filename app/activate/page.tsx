"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, ShieldCheck } from "lucide-react"

export default function ActivatePage() {
  const [formData, setFormData] = useState({
    username: "",
    key: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [newExpiration, setNewExpiration] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/auth/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setNewExpiration(new Date(data.newExpiresAt).toLocaleDateString("pt-BR"))
        
        // Remover a sessão antiga para forçar login de novo,
        // garantindo que ele baixe a data nova.
        localStorage.removeItem("sistemper_user")
        
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(data.error || "Erro ao ativar chave")
      }
    } catch (err) {
      setError("Erro ao se conectar com o servidor.")
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ativar Acesso</h1>
          <p className="text-slate-400">Insira sua chave de ativação</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">Renovar Validade</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Sua conta está expirada ou você deseja prolongar seu tempo?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert className="bg-green-900/20 border-green-800 text-green-400 text-center flex flex-col items-center">
                <ShieldCheck className="w-12 h-12 mb-2" />
                <AlertDescription>
                  <strong>Sucesso!</strong><br />
                  Sua chave foi ativada. O seu novo acesso vai até: <br/>
                  <span className="text-lg font-bold text-white">{newExpiration}</span>
                </AlertDescription>
                <div className="text-sm mt-3 opacity-80">Redirecionando para o login...</div>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-200">
                    Usuário
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu usuário de login"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key" className="text-slate-200">
                    License Key
                  </Label>
                  <Input
                    id="key"
                    type="text"
                    placeholder="Ex: ABCD-1234-WXYZ-5678"
                    value={formData.key}
                    onChange={(e) => handleInputChange("key", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 tracking-widest text-center uppercase"
                    required
                  />
                </div>

                {error && (
                  <Alert className="bg-red-900/20 border-red-800 text-red-400">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                  {isLoading ? "Validando..." : "Ativar Chave"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full text-slate-400" 
                  onClick={() => router.push("/login")}
                >
                  Voltar para tela de Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
