"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Building2, Shield, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess(false)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    password: formData.password,
                    role: "admin" // Criando os primeiros acessos como admin
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            } else {
                setError(data.error || "Erro ao registrar usuário")
            }
        } catch (err) {
            setError("Erro ao se conectar com o servidor. Tente novamente.")
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
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Registro - Sistemper</h1>
                    <p className="text-slate-400">Criar primeiro acesso</p>
                </div>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center text-white">Novo Usuário</CardTitle>
                        <CardDescription className="text-center text-slate-400">
                            Preencha os dados do responsável pelo sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <Alert className="bg-green-900/20 border-green-800 text-green-400 text-center">
                                <AlertDescription>Usuário registrado com sucesso! Redirecionando...</AlertDescription>
                            </Alert>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-200">
                                        Nome Completo
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Nome e Sobrenome"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-slate-200">
                                        Usuário de Acesso
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="nomedeusuario"
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
                                            placeholder="Criar uma senha de acesso"
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
                                    {isLoading ? "Criando usuário..." : "Finalizar Cadastro"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="link"
                                    className="w-full text-slate-400"
                                    onClick={() => router.push("/login")}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
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
