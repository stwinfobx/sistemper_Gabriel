# Checklist de Reestruturação — SISTEMPER 2025

## Fase 0 — Auditoria e Limpeza
- [x] Inventariar e categorizar todos os arquivos do projeto
- [x] Deletar scripts temporários (peek-*, check-*, import-kits-v2.ts, etc)
- [x] Criar `types/index.ts` com tipos globais compartilhados
- [x] Revisar Prisma schema — adicionar campo `flags Json?` no `Kit`

## Fase 1 — Importação Definitiva dos Dados
- [x] Criar `scripts/seed.ts` unificado (apaga e reimporta tudo em ordem segura)
- [x] Importar Materiais de Vidro (3 fornecedores) de TABELA DE PREÇOS.xlsm
- [x] Importar Perfis de Alumínio de TABELA DE PREÇOS.xlsm
- [x] Importar Acessórios de TABELA DE PREÇOS.xlsm
- [x] Importar Tipologias + Kits de TIPOLOGIA ESQUADRIAS.xlsm com fórmulas corretas
- [x] Importar Tipologias + Kits de TIPOLOGIA PORTÕES E GRADIL.xlsm com fórmulas corretas
- [x] Implementar mapeamento fuzzy: se não encontrar material, criar com price=0 e logar
- [x] Gerar relatório de sanidade pós-seed (materiais ok / com price=0)

## Fase 2 — Motor de Cálculo Compartilhado
- [x] Reescrever `lib/engine/calculator.ts` limpo, recebendo tudo por parâmetro (sem acesso ao banco)
- [x] Criar `app/api/calculate/route.ts` (POST) que busca kit no Prisma e delega ao motor
- [x] Testar motor com kit de portão real (verificar se fórmulas produzem valores corretos)

## Fase 3 — Os 6 Módulos

### 3.1 Tabela de Preço Temperado (prioridade 1)
- [x] Criar `app/api/materials/route.ts` GET com filtros por tipo e provider
- [x] Reativar `components/tabelas/glass-table.tsx` usando dados do banco
- [x] Botão de reajuste global por fornecedor funcional (salva em MaterialAdjustment)
- [x] Edição inline de preço individual funcional (salva direto no banco)

### 3.2 Tipologia Vidro Temperado (prioridade 2)
- [x] Criar `/calculos/vidro` com seleção de tipologia (exclui portões/esquadrias)
- [x] Conectar a `POST /api/calculate` — exibir vidro + ferragens da tipologia
- [x] Botão "Adicionar ao Orçamento" funcional

### 3.3 Tipologia Esquadrias (prioridade 3)
- [x] Criar `/calculos/esquadrias` com seleção filtrada por category='Esquadria'
- [x] Conectar a `POST /api/calculate` — exibir perfis e acessórios calculados
- [x] Personalização de componentes (remover/adicionar item extra)

### 3.4 Tipologia Portões e Gradil (prioridade 4)
- [x] Criar `/calculos/portoes` com seleção filtrada por category='Portão'
- [x] Implementar flags condicionais: checkboxes para Social e Mata-Cachorro
- [x] Conectar a `POST /api/calculate` com flags

### 3.5 Orçamento para o Cliente (prioridade 5)
- [x] Criar `/orcamento` com formulário de cliente
- [x] Carrinho multi-item (vidro + esquadria + portão no mesmo orçamento)
- [x] Aplicar margem global e por item
- [x] Salvar Budget + BudgetItems no banco com snapshot JSON dos custos

### 3.6 Recibo Automático (prioridade 6)
- [ ] Criar `/orcamento/[id]/recibo` com layout de recibo
- [ ] Layout CSS com `@media print` para exportar PDF sem biblioteca externa
- [ ] Dados da empresa vindos de SystemConfig no banco

## Fase 4 — Qualidade e Segurança de Dados
- [ ] Criar `/admin/dados-faltantes` listando materiais com price=0
- [ ] Proteger deleção de Material e Kit com validação antes de apagar (409 se tiver dependentes)
- [ ] Relatório de sanidade automático após qualquer seed
