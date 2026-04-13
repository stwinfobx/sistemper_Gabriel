# Inventário e Categorização de Arquivos

## 1. Scripts de Automatação (`scripts/`)
| Arquivo | Status | Ação Sugerida |
|---|---|---|
| `PeekDB.ts`, `PeekMaterials.ts` | Temporário | Deletar (Fase 0) |
| `analyze-excel-logic.ts` | Referência | Deletar após criar novo Seed (Fase 1) |
| `check-db.ts`, `check-db.js` | Temporário | Deletar (Fase 0) |
| `explore-excel.ts`, `explore-excel.js` | Temporário | Deletar (Fase 0) |
| `explore-sistemper.js` | Temporário | Deletar (Fase 0) |
| `import-kits-v2.ts` | Obsoleto | Deletar (Fase 0) - Será substituído por `seed.ts` |
| `list-sheets.ts` | Utilitário | Manter |
| `migrate-sistemper-data.ts` | Legado | Deletar após criar novo Seed (Fase 1) |
| `peek-esquadrias.ts`, `peek-kits.ts`, `peek-portoes.ts` | Temporário | Deletar (Fase 0) |
| `setup-db.js` | Inicialização | Manter |

## 2. Componentes de Interface (`components/`)
| Arquivo | Status | Observação |
|---|---|---|
| `aluminum-calculation-form.tsx` | Produção | Contém lógica de cálculo que deve ser modularizada para a Engine. |
| `glass-calculation-form.tsx` | Produção | Contém mocks de preços e lógica de fornecedores que deve ser migrada. |
| `tabelas/` | Produção | Verificado: `aluminum-kits-table`, `glass-table`, `profiles-table`. Necessitam atualização de API. |
| `ui/` | Core | Componentes Shadcn (Button, Card, Input, etc). Manter. |

## 3. Rotas de API (`app/api/`)
| Pasta | Status | Ação Sugerida |
|---|---|---|
| `budgets/` | Produção | Revisar persistência real no DB. |
| `kits/` | Produção | Revisar se retorna todos os dados necessários para o Engine. |
| `materials/` | Produção | Necessita suporte a agrupamentos e filtros por fornecedor. |
| `tipologies/` | Produção | Manter. |

## 4. Definições de Tipos (`types/`)
- [ ] Atualmente inexistente. **Ação: Criar `types/index.ts`.**
