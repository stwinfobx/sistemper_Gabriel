"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react"
import Link from "next/link"

interface TableItem {
  id: string
  type: "jato" | "pelicula"
  name: string
  unit: string
  cost: number
  price: number
  margin: number
}

export default function JatosPeliculasPage() {
  const [items, setItems] = useState<TableItem[]>([
    { id: "1", type: "jato", name: "Jato de Areia Comum", unit: "m²", cost: 15.0, price: 25.0, margin: 66.67 },
    { id: "2", type: "jato", name: "Jato de Areia Fino", unit: "m²", cost: 18.0, price: 30.0, margin: 66.67 },
    { id: "3", type: "pelicula", name: "Película Fumê 20%", unit: "m²", cost: 35.0, price: 60.0, margin: 71.43 },
    { id: "4", type: "pelicula", name: "Película Espelhada", unit: "m²", cost: 45.0, price: 80.0, margin: 77.78 },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Partial<TableItem>>({
    type: "jato",
    name: "",
    unit: "m²",
    cost: 0,
    price: 0,
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const calculateMargin = (cost: number, price: number) => {
    if (price === 0) return 0
    return ((price - cost) / price) * 100
  }

  const handleEdit = (item: TableItem) => {
    setEditingId(item.id)
  }

  const handleSave = (id: string, updatedData: Partial<TableItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedData,
              margin: calculateMargin(updatedData.cost || item.cost, updatedData.price || item.price),
            }
          : item,
      ),
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleAddItem = () => {
    if (newItem.name && newItem.cost && newItem.price) {
      const item: TableItem = {
        id: Date.now().toString(),
        type: newItem.type as "jato" | "pelicula",
        name: newItem.name,
        unit: newItem.unit || "m²",
        cost: newItem.cost,
        price: newItem.price,
        margin: calculateMargin(newItem.cost, newItem.price),
      }
      setItems((prev) => [...prev, item])
      setNewItem({ type: "jato", name: "", unit: "m²", cost: 0, price: 0 })
      setShowAddForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Tabela - Jatos & Películas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Add New Item Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Itens</CardTitle>
                  <CardDescription>Adicione e edite jatos, películas e acabamentos</CardDescription>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Item</span>
                </Button>
              </div>
            </CardHeader>

            {showAddForm && (
              <CardContent className="border-t">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <select
                      id="type"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={newItem.type}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, type: e.target.value as "jato" | "pelicula" }))}
                    >
                      <option value="jato">Jato</option>
                      <option value="pelicula">Película</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do item"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, unit: e.target.value }))}
                      placeholder="m², un, etc"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Custo (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={newItem.cost}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, cost: Number.parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddItem} size="sm">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)} size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Itens Cadastrados</CardTitle>
              <CardDescription>Lista de todos os jatos, películas e acabamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={item.type === "jato" ? "default" : "secondary"}>
                          {item.type === "jato" ? "Jato" : "Película"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            defaultValue={item.name}
                            onBlur={(e) => handleSave(item.id, { name: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          item.name
                        )}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={item.cost}
                            onBlur={(e) => handleSave(item.id, { cost: Number.parseFloat(e.target.value) || 0 })}
                            className="w-20"
                          />
                        ) : (
                          `R$ ${item.cost.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={item.price}
                            onBlur={(e) => handleSave(item.id, { price: Number.parseFloat(e.target.value) || 0 })}
                            className="w-20"
                          />
                        ) : (
                          `R$ ${item.price.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.margin.toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            disabled={editingId === item.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
