"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Edit, Trash2, Ban, ShieldCheck } from "lucide-react"

interface UserData {
  id: string
  name: string
  username: string
  role: string
  isActive: boolean
  isBanned: boolean
  expiresAt: string | null
  createdAt: string
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  
  // States para o form de edição
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editExpiresAt, setEditExpiresAt] = useState("")

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEditClick = (user: UserData) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditRole(user.role)
    if (user.expiresAt) {
      setEditExpiresAt(new Date(user.expiresAt).toISOString().split('T')[0])
    } else {
      setEditExpiresAt("")
    }
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    try {
      const updateData: any = {
        name: editName,
        role: editRole,
      }
      if (editExpiresAt) {
        updateData.expiresAt = new Date(editExpiresAt).toISOString()
      } else {
        updateData.expiresAt = null
      }

      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      })
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleBan = async (user: UserData) => {
    if (!confirm(`Tem certeza que deseja ${user.isBanned ? 'DESBANIR' : 'BANIR'} este usuário?`)) return
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !user.isBanned })
      })
      fetchUsers()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (user: UserData) => {
    if (!confirm(`CUIDADO! Isso irá excluir permanentemente o usuário ${user.username}. Deseja continuar?`)) return
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE"
      })
      fetchUsers()
    } catch (error) {
      console.error(error)
    }
  }

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground mt-1">Veja e administre as contas do sistema</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Nenhum usuário encontrado.</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} className={u.isBanned ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {u.expiresAt ? (
                      <span className={isExpired(u.expiresAt) ? "text-red-500 font-bold" : ""}>
                        {new Date(u.expiresAt).toLocaleDateString('pt-BR')}
                      </span>
                    ) : (
                      "Vitalício"
                    )}
                  </TableCell>
                  <TableCell>
                    {u.isBanned ? (
                      <span className="bg-red-900/40 text-red-500 px-2 py-1 rounded flex items-center w-fit gap-1 text-xs">
                        <Ban className="w-3 h-3"/> Banido
                      </span>
                    ) : isExpired(u.expiresAt) ? (
                      <span className="bg-yellow-900/40 text-yellow-500 px-2 py-1 rounded w-fit text-xs">Expirado</span>
                    ) : (
                      <span className="bg-green-900/40 text-green-500 px-2 py-1 rounded flex items-center w-fit gap-1 text-xs">
                        <ShieldCheck className="w-3 h-3"/> Ativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(u)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant={u.isBanned ? "default" : "secondary"} size="sm" onClick={() => handleToggleBan(u)}>
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(u)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Altere as permissões e validade de {editingUser?.username}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>Cargo (Role)</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Validade (Deixe em branco para vitalício)</Label>
              <Input type="date" value={editExpiresAt} onChange={e => setEditExpiresAt(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
