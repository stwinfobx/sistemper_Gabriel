"use client"

import { useEffect, useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, ClipboardList, Plus, RefreshCcw, Save, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"

type AppointmentChecklistKey = "medidasOrcamento" | "medidasVao" | "medidasProducao"

type Appointment = {
  id: string
  serviceType: string
  date: string // yyyy-MM-dd
  time: string // HH:mm
  clientName: string
  orderNumber: string
  phone: string
  address: string
  vendor: string
  glassColors: string[]
  profileColors: string[]
  notes: string
  sendToTemperDate: string
  deliveryDate: string
  checklist: Record<AppointmentChecklistKey, boolean>
}

type StoredSchedulingState = {
  serviceTypes: string[]
  appointments: Appointment[]
}

const STORAGE_KEY = "sistemper-agendamentos-v1"

const defaultServiceTypes = [
  "Visita Técnica",
  "Orçamento",
  "Medida Final",
  "Instalação",
  "Cobrança",
  "Retorno",
  "Gabriel Fazer",
]

const defaultAppointments: Appointment[] = [
  {
    id: "appt-01",
    serviceType: "Orçamento",
    date: "2024-05-28",
    time: "08:15",
    clientName: "André",
    orderNumber: "SP-240531",
    phone: "47 99663-4244",
    address: "Rua Dr. Reinaldo Schimithausen nº 1994",
    vendor: "Gabriel",
    glassColors: ["Incolor"],
    profileColors: ["Branco"],
    notes: "Casa praia",
    sendToTemperDate: "2024-05-29",
    deliveryDate: "2024-06-03",
    checklist: {
      medidasOrcamento: true,
      medidasVao: false,
      medidasProducao: false,
    },
  },
  {
    id: "appt-02",
    serviceType: "Cobrança",
    date: "2024-06-07",
    time: "10:00",
    clientName: "Miguel",
    orderNumber: "SP-240607",
    phone: "47 9663-4244",
    address: "Rua José Rosa nº 805",
    vendor: "Equipe Comercial",
    glassColors: ["Fumé"],
    profileColors: ["Preto"],
    notes: "",
    sendToTemperDate: "",
    deliveryDate: "",
    checklist: {
      medidasOrcamento: false,
      medidasVao: false,
      medidasProducao: false,
    },
  },
  {
    id: "appt-03",
    serviceType: "Orçamento",
    date: "2025-04-17",
    time: "09:30",
    clientName: "Dona Mariazinha",
    orderNumber: "SP-250417-A",
    phone: "12 99663-4244",
    address: "Rua Nossa Senhora nº 985",
    vendor: "Gabriel",
    glassColors: ["Bronze"],
    profileColors: ["Natural"],
    notes: "",
    sendToTemperDate: "",
    deliveryDate: "",
    checklist: {
      medidasOrcamento: true,
      medidasVao: true,
      medidasProducao: false,
    },
  },
  {
    id: "appt-04",
    serviceType: "Cobrança",
    date: "2025-04-17",
    time: "13:30",
    clientName: "Seu Pedro",
    orderNumber: "SP-250417-B",
    phone: "",
    address: "Rua Nossa Senhora nº 985",
    vendor: "Equipe Financeiro",
    glassColors: ["Verde"],
    profileColors: ["Gold"],
    notes: "",
    sendToTemperDate: "",
    deliveryDate: "",
    checklist: {
      medidasOrcamento: false,
      medidasVao: false,
      medidasProducao: false,
    },
  },
  {
    id: "appt-05",
    serviceType: "Instalação",
    date: "2025-04-17",
    time: "16:00",
    clientName: "Fabiana",
    orderNumber: "SP-250417-C",
    phone: "",
    address: "",
    vendor: "Equipe Técnica",
    glassColors: ["Azul"],
    profileColors: ["Cromado"],
    notes: "",
    sendToTemperDate: "",
    deliveryDate: "",
    checklist: {
      medidasOrcamento: false,
      medidasVao: true,
      medidasProducao: true,
    },
  },
]

const glassColorOptions = ["Incolor", "Fumé", "Verde", "Bronze", "Azul", "Outro"]
const profileColorOptions = ["Branco", "Preto", "Fosco", "Gold", "Cromado", "Amadeirado", "Natural", "Outro"]

const checklistLabels: Record<AppointmentChecklistKey, string> = {
  medidasOrcamento: "Medidas de orçamento",
  medidasVao: "Medidas de vão",
  medidasProducao: "Medidas finais de produção",
}

const toISODate = (value: Date) => format(value, "yyyy-MM-dd")

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `appt-${Math.random().toString(36).slice(2, 9)}`
}

const normalizeAppointment = (appt: Appointment, fallbackType: string): Appointment => ({
  ...appt,
  serviceType: appt.serviceType || fallbackType,
  glassColors: appt.glassColors?.length ? appt.glassColors : ["Incolor"],
  profileColors: appt.profileColors ?? [],
  checklist: {
    medidasOrcamento: appt.checklist?.medidasOrcamento ?? false,
    medidasVao: appt.checklist?.medidasVao ?? false,
    medidasProducao: appt.checklist?.medidasProducao ?? false,
  },
})

export function SchedulingBoard() {
  const [hydrated, setHydrated] = useState(false)
  const [serviceTypes, setServiceTypes] = useState<string[]>(defaultServiceTypes)
  const [appointments, setAppointments] = useState<Appointment[]>(defaultAppointments)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2025-04-17T12:00:00"))
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [newTypeName, setNewTypeName] = useState("")

  const [formData, setFormData] = useState<Appointment>(() =>
    normalizeAppointment(
      {
        id: "",
        serviceType: defaultServiceTypes[0],
        date: toISODate(new Date()),
        time: "08:00",
        clientName: "",
        orderNumber: "",
        phone: "",
        address: "",
        vendor: "",
        glassColors: ["Incolor"],
        profileColors: [],
        notes: "",
        sendToTemperDate: "",
        deliveryDate: "",
        checklist: {
          medidasOrcamento: false,
          medidasVao: false,
          medidasProducao: false,
        },
      },
      defaultServiceTypes[0],
    ),
  )

  useEffect(() => {
    try {
      const storedRaw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (storedRaw) {
        const parsed: StoredSchedulingState = JSON.parse(storedRaw)
        setServiceTypes(parsed.serviceTypes.length ? parsed.serviceTypes : defaultServiceTypes)
        const safeAppointments = parsed.appointments.map((appt) =>
          normalizeAppointment(appt, parsed.serviceTypes[0] ?? defaultServiceTypes[0]),
        )
        setAppointments(safeAppointments)
        const todayFromStorage =
          safeAppointments.length > 0 ? parseISO(safeAppointments[0].date) : new Date("2025-04-17T12:00:00")
        setSelectedDate(todayFromStorage)
      }
    } catch {
      // ignore hydration issues and keep defaults
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (hydrated) {
      const payload: StoredSchedulingState = {
        serviceTypes,
        appointments,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }
  }, [appointments, serviceTypes, hydrated])

  useEffect(() => {
    if (!selectedAppointmentId) {
      setFormData((current) => ({
        ...current,
        date: toISODate(selectedDate),
      }))
    }
  }, [selectedAppointmentId, selectedDate])

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time)
        }
        return a.date.localeCompare(b.date)
      }),
    [appointments],
  )

  const appointmentsByDate = useMemo(() => {
    const iso = toISODate(selectedDate)
    return sortedAppointments.filter((appt) => appt.date === iso)
  }, [sortedAppointments, selectedDate])

  const selectedAppointment = selectedAppointmentId
    ? appointments.find((appt) => appt.id === selectedAppointmentId) ?? null
    : null

  useEffect(() => {
    if (selectedAppointment) {
      setFormData(normalizeAppointment(selectedAppointment, serviceTypes[0] ?? defaultServiceTypes[0]))
      setSelectedDate(parseISO(selectedAppointment.date))
    }
  }, [selectedAppointment, serviceTypes])

  const appointmentDates = useMemo(
    () => sortedAppointments.map((appt) => parseISO(appt.date)),
    [sortedAppointments],
  )

  const countsByType = useMemo(() => {
    const counters: Record<string, number> = {}
    for (const type of serviceTypes) {
      counters[type] = 0
    }
    for (const appt of appointments) {
      counters[appt.serviceType] = (counters[appt.serviceType] ?? 0) + 1
    }
    return counters
  }, [appointments, serviceTypes])

  const resetForm = (keepDate = true) => {
    setSelectedAppointmentId(null)
    setFormData(
      normalizeAppointment(
        {
          id: "",
          serviceType: serviceTypes[0] ?? defaultServiceTypes[0],
          date: keepDate ? toISODate(selectedDate) : toISODate(new Date()),
          time: "08:00",
          clientName: "",
          orderNumber: "",
          phone: "",
          address: "",
          vendor: "",
          glassColors: ["Incolor"],
          profileColors: [],
          notes: "",
          sendToTemperDate: "",
          deliveryDate: "",
          checklist: {
            medidasOrcamento: false,
            medidasVao: false,
            medidasProducao: false,
          },
        },
        serviceTypes[0] ?? defaultServiceTypes[0],
      ),
    )
  }

  const handleSave = () => {
    const payload: Appointment = {
      ...formData,
      id: formData.id || createId(),
    }

    if (!payload.serviceType) {
      payload.serviceType = serviceTypes[0] ?? defaultServiceTypes[0]
    }

    setAppointments((prev) => {
      const exists = prev.some((appt) => appt.id === payload.id)
      if (exists) {
        return prev.map((appt) => (appt.id === payload.id ? payload : appt))
      }
      return [...prev, payload]
    })
    setSelectedAppointmentId(payload.id)
  }

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== id))
    if (selectedAppointmentId === id) {
      resetForm()
    }
  }

  const handleDuplicateAppointment = (appt: Appointment) => {
    const duplicated: Appointment = {
      ...appt,
      id: createId(),
      clientName: `${appt.clientName} (cópia)`,
    }
    setAppointments((prev) => [...prev, duplicated])
  }

  const addServiceType = () => {
    const trimmed = newTypeName.trim()
    if (!trimmed) return
    if (serviceTypes.some((type) => type.toLowerCase() === trimmed.toLowerCase())) {
      setNewTypeName("")
      return
    }
    setServiceTypes((prev) => [...prev, trimmed])
    setNewTypeName("")
  }

  const removeServiceType = (type: string) => {
    const remaining = appointments.some((appt) => appt.serviceType === type)
      ? serviceTypes
      : serviceTypes.filter((item) => item !== type)
    setServiceTypes(remaining.length ? remaining : serviceTypes)
    if (remaining.length !== serviceTypes.length && formData.serviceType === type) {
      setFormData((current) => ({
        ...current,
        serviceType: remaining[0] ?? defaultServiceTypes[0],
      }))
    }
  }

  const toggleArrayValue = (field: "glassColors" | "profileColors", value: string) => {
    setFormData((prev) => {
      const currentSet = new Set(prev[field])
      if (currentSet.has(value)) {
        currentSet.delete(value)
      } else {
        currentSet.add(value)
      }
      return {
        ...prev,
        [field]: Array.from(currentSet),
      }
    })
  }

  const toggleChecklistValue = (key: AppointmentChecklistKey) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      },
    }))
  }

  if (!hydrated) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Carregando agendamentos</CardTitle>
          <CardDescription>Sincronizando dados do navegador…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-primary" />
                Agenda Geral
              </CardTitle>
              <CardDescription>
                Escolha o dia do atendimento e utilize o botão Gravar novo para registrar um compromisso.
              </CardDescription>
            </div>
            <Badge variant="outline" className="uppercase tracking-wide">
              {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-8">
            <Calendar
              mode="single"
              selected={selectedDate}
              locale={ptBR}
              onSelect={(value) => value && setSelectedDate(value)}
              captionLayout="dropdown-buttons"
              fromYear={2024}
              toYear={2032}
              buttonVariant="outline"
              modifiers={{
                booked: appointmentDates,
                selectedDay: [selectedDate],
              }}
              modifiersClassNames={{
                booked: "bg-primary/10 text-primary-foreground border border-primary/40",
              }}
            />
            <div className="space-y-3 rounded-md border bg-muted/30 p-4 text-sm font-semibold text-muted-foreground">
              <p className="text-primary">Passos principais</p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>Selecione o dia na agenda.</li>
                <li>Escolha o tipo de atendimento.</li>
                <li>Preencha o formulário ao lado.</li>
                <li>Clique em “Gravar novo” para salvar.</li>
              </ol>
              <Separator />
              <div className="space-y-1">
                <p>Compromissos no dia:</p>
                <p className="text-base font-bold text-foreground">{appointmentsByDate.length}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Agenda local — sincronizada no armazenamento do navegador
            </div>
            <Button variant="outline" size="sm" onClick={() => resetForm()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Limpar formulário
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Tipos de atendimentos
            </CardTitle>
            <CardDescription>Personalize a lista usada no formulário.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 rounded-md border bg-muted/30 p-2">
              <div className="space-y-2">
                {serviceTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={countsByType[type] ? "default" : "outline"}>{countsByType[type] ?? 0}</Badge>
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeServiceType(type)}
                      disabled={countsByType[type] > 0 || serviceTypes.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 flex gap-2">
              <Input
                value={newTypeName}
                onChange={(event) => setNewTypeName(event.target.value)}
                placeholder="Adicionar novo tipo"
                className="h-9"
              />
              <Button size="icon" onClick={addServiceType}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle>Agenda do dia selecionado</CardTitle>
            <CardDescription>Toque em uma linha para editar ou duplicar rapidamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{format(selectedDate, "EEEE", { locale: ptBR })}</Badge>
              <span>{format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/70">
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointmentsByDate.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                        Nenhum atendimento cadastrado para esta data.
                      </TableCell>
                    </TableRow>
                  )}
                  {appointmentsByDate.map((appt, index) => (
                    <TableRow
                      key={appt.id}
                      data-state={appt.id === selectedAppointmentId ? "selected" : undefined}
                      className="cursor-pointer"
                      onClick={() => setSelectedAppointmentId(appt.id)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{appt.serviceType}</TableCell>
                      <TableCell>
                        {format(parseISO(`${appt.date}T${appt.time}`), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{appt.clientName}</TableCell>
                      <TableCell>{appt.phone || "—"}</TableCell>
                      <TableCell>{appt.address || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDuplicateAppointment(appt)
                            }}
                          >
                            Duplicar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeleteAppointment(appt.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle>Resumo rápido</CardTitle>
            <CardDescription>Status geral da agenda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Total de compromissos</Label>
              <div className="text-3xl font-bold">{appointments.length}</div>
              <p className="text-sm text-muted-foreground">
                {appointments.filter((appt) => appt.date === toISODate(new Date())).length} para hoje
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Tipos mais frequentes</Label>
              <div className="space-y-1">
                {serviceTypes.slice(0, 4).map((type) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span>{type}</span>
                    <span className="font-semibold">{countsByType[type] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle>{selectedAppointment ? "Editar atendimento" : "Novo atendimento"}</CardTitle>
          <CardDescription>Preencha os detalhes e clique em Gravar novo para salvar no navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de atendimento</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(event) => setFormData((prev) => ({ ...prev, time: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-number">Pedido nº</Label>
                <Input
                  id="order-number"
                  value={formData.orderNumber}
                  onChange={(event) => setFormData((prev) => ({ ...prev, orderNumber: event.target.value }))}
                  placeholder="SP-"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Input
                  id="client"
                  value={formData.clientName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, clientName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendedor / Medidor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(event) => setFormData((prev) => ({ ...prev, vendor: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="47 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Cor do vidro</Label>
                <div className="flex flex-wrap gap-2">
                  {glassColorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleArrayValue("glassColors", color)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase transition ${
                        formData.glassColors.includes(color)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 hover:border-primary/60"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor do perfil</Label>
                <div className="flex flex-wrap gap-2">
                  {profileColorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleArrayValue("profileColors", color)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase transition ${
                        formData.profileColors.includes(color)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 hover:border-primary/60"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="temper">Envio p/ temper</Label>
                  <Input
                    id="temper"
                    type="date"
                    value={formData.sendToTemperDate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, sendToTemperDate: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery">Chega dia</Label>
                  <Input
                    id="delivery"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, deliveryDate: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-md border p-3">
                <Label className="text-xs font-semibold uppercase text-primary">Checklist de medições</Label>
                <div className="space-y-2">
                  {(Object.keys(checklistLabels) as AppointmentChecklistKey[]).map((key) => (
                    <Label key={key} className="flex items-center gap-2">
                      <Checkbox checked={formData.checklist[key]} onCheckedChange={() => toggleChecklistValue(key)} />
                      {checklistLabels[key]}
                    </Label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={5}
                  value={formData.notes}
                  onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Informações adicionais, materiais, observações…"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {selectedAppointment && (
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                if (selectedAppointmentId) {
                  handleDeleteAppointment(selectedAppointmentId)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </Button>
          )}
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              handleSave()
              resetForm()
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Gravar novo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
