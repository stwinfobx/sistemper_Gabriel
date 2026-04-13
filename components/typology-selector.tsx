"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, ImageIcon, ChevronRight, GlassWater, Frame, Fence } from "lucide-react"

interface Tipology {
  id: string
  name: string
  category: string
  imagePath: string | null
}

interface TypologySelectorProps {
  onSelect?: (tipology: Tipology) => void
  category?: string
}

export function TypologySelector({ onSelect, category }: TypologySelectorProps) {
  const [tipologies, setTipologies] = useState<Tipology[]>([])
  const [filteredTipologies, setFilteredTipologies] = useState<Tipology[]>([])
  const [selectedTipology, setSelectedTipology] = useState<Tipology | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const handleSelect = (t: Tipology) => {
    setSelectedTipology(t)
    if (onSelect) onSelect(t)
  }

  useEffect(() => {
    async function fetchTipologies() {
      try {
        const url = category ? `/api/tipologies?category=${category}` : "/api/tipologies"
        const response = await fetch(url)
        const data = await response.json()
        setTipologies(data)
        setFilteredTipologies(data)
      } catch (error) {
        console.error("Error fetching tipologies:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTipologies()
  }, [])

  useEffect(() => {
    const filtered = tipologies.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTipologies(filtered)
  }, [searchTerm, tipologies])

  return (
    <div className="flex flex-col md:flex-row h-[600px] w-full border border-white/10 rounded-2xl bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden">
      {/* Sidebar: Search & List */}
      <div className="w-full md:w-[450px] h-full flex flex-col border-r border-white/5 bg-white/[0.02]">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
              Catálogo de Tipologias
            </h3>
            <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">
              {filteredTipologies.length} ITENS
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Filtro rápido..."
              className="pl-10 h-11 bg-white/5 border-white/10 text-sm focus:border-primary/50 transition-all rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable List Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Carregando...</span>
            </div>
          ) : filteredTipologies.map((t) => (
            <div
              key={t.id}
              className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTipology?.id === t.id
                  ? "bg-primary/20 border-primary/40 shadow-lg shadow-primary/10"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20"
              }`}
              onClick={() => handleSelect(t)}
            >
              <div className="flex flex-col gap-1 overflow-hidden pr-2">
                <span className={`text-xs font-bold truncate tracking-tight ${selectedTipology?.id === t.id ? "text-primary" : "text-white/80"}`}>
                  {t.name}
                </span>
                <span className="text-[9px] font-medium text-white/30 uppercase">
                  {t.category}
                </span>
              </div>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                selectedTipology?.id === t.id 
                  ? "bg-primary text-black scale-110 shadow-lg shadow-primary/40" 
                  : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white"
              }`}>
                <Plus className={`h-4 w-4 ${selectedTipology?.id === t.id ? "rotate-45" : ""}`} />
              </div>
            </div>
          ))}
          {!loading && filteredTipologies.length === 0 && (
            <div className="h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase">
              Vazio.
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 h-full flex flex-col bg-gradient-to-br from-white/[0.03] to-transparent relative">
        {selectedTipology ? (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Image Box */}
            <div className="flex-1 relative min-h-0 flex items-center justify-center p-8 overflow-hidden">
               <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent opacity-50" />
               {selectedTipology.imagePath ? (
                 <img
                   src={selectedTipology.imagePath}
                   alt={selectedTipology.name}
                   className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-700 hover:scale-[1.05]"
                 />
               ) : (
                 <div className="relative z-10 flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-500">
                    <div className={`w-32 h-32 rounded-3xl border-2 border-white/5 flex items-center justify-center shadow-2xl backdrop-blur-md ${
                      selectedTipology.category === 'Vidro' ? 'bg-blue-500/10 text-blue-400' :
                      selectedTipology.category === 'Portão' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      {selectedTipology.category === 'Vidro' ? <GlassWater className="h-16 w-16" /> :
                       selectedTipology.category === 'Portão' ? <Fence className="h-16 w-16" /> :
                       <Frame className="h-16 w-16" />}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Tipologia Técnica</p>
                      <p className="text-lg font-bold text-white/90">{selectedTipology.name}</p>
                    </div>
                 </div>
               )}
               <Badge className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white/60 border-0 backdrop-blur-md">
                 {selectedTipology.imagePath ? "PREVISUALIZAÇÃO HD" : "ESQUEMA TÉCNICO"}
               </Badge>
            </div>
            
            {/* Info & Button */}
            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl">
              <div className="mb-6">
                <h4 className="text-xl font-black text-white uppercase tracking-tight line-clamp-2">
                  {selectedTipology.name}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest italic">
                    Configuração Pronta para Cálculo
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  handleSelect(selectedTipology)
                }}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-primary/20 rounded-xl group transition-all"
              >
                Confirmar Seleção & Ajustar Medidas
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
             <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-6">
                <ImageIcon className="h-10 w-10 text-white" />
             </div>
             <h4 className="text-xs font-black uppercase tracking-[0.3em]">Seleção Técnica</h4>
             <p className="text-[10px] mt-2 max-w-[200px] leading-relaxed">Selecione uma tipologia no catálogo lateral para ver os detalhes técnicos.</p>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb active {
           background: rgba(var(--primary), 0.5);
        }
      `}</style>
    </div>
  )
}
