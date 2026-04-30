"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KeyRound, Plus, Copy, Check } from "lucide-react"

interface LicenseKey {
  id: string
  key: string
  daysValid: number
  isUsed: boolean
  usedBy?: { username: string }
  createdAt: string
}

export default function KeysAdminPage() {
  const [keys, setKeys] = useState<LicenseKey[]>([])
  const [loading, setLoading] = useState(true)
  const [daysValid, setDaysValid] = useState("30")
  const [quantity, setQuantity] = useState("1")
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/admin/keys")
      const data = await res.json()
      setKeys(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysValid: parseInt(daysValid), quantity: parseInt(quantity) })
      })
      await fetchKeys()
    } catch (error) {
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <KeyRound className="w-8 h-8 text-blue-500" />
            Gerenciamento de Keys
          </h1>
          <p className="text-muted-foreground mt-1">Gere chaves para dar acesso aos vendedores</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border flex gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">Dias de validade</label>
          <Select value={daysValid} onValueChange={setDaysValid}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="15">15 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="365">1 ano (365d)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Quantidade</label>
          <Input 
            type="number" 
            min="1" max="50" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)}
            className="w-[100px]"
          />
        </div>

        <Button onClick={handleGenerate} disabled={generating} className="gap-2">
          <Plus className="w-4 h-4" />
          {generating ? "Gerando..." : "Gerar Keys"}
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chave</TableHead>
              <TableHead>Validade (Dias)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utilizada por</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Carregando...</TableCell></TableRow>
            ) : keys.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">Nenhuma key gerada ainda.</TableCell></TableRow>
            ) : (
              keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono tracking-wide">{k.key}</TableCell>
                  <TableCell>{k.daysValid}</TableCell>
                  <TableCell>
                    {k.isUsed ? (
                      <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-full text-xs font-medium">Usada</span>
                    ) : (
                      <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs font-medium">Nova</span>
                    )}
                  </TableCell>
                  <TableCell>{k.usedBy ? k.usedBy.username : "-"}</TableCell>
                  <TableCell>{new Date(k.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(k.id, k.key)}
                      title="Copiar Chave"
                    >
                      {copiedId === k.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
