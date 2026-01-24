# 🚀 ETAPA 2 — PROCESSOS OPERACIONAIS (ERP DE VERDADE) — Iniciada

**Data de Início:** 24 de Janeiro de 2026  
**Status:** 🟡 **EM IMPLEMENTAÇÃO**  
**Escopo:** Fluxo Comercial BPMN + Gestão de Estoque + Fluxo Financeiro

---

## 📋 3 Pilares em Implementação

### 1️⃣ **FLUXO COMERCIAL INTEGRADO (BPMN Executável)**

#### ✅ Implementado
- **Função `fluxoComercialBPMN`** - Orquestração de transições
  - `converter_orcamento` - Oportunidade → OrcamentoCliente
  - `converter_pedido` - OrcamentoCliente → Pedido
  - `aprovar_pedido` - Pedido → Reservar Estoque

- **Componente `AprovacaoDescontoModal`**
  - Interface de aprovação com análise de margem
  - Validação de margem mínima
  - Fluxo de aprovação/rejeição com comentário

- **Função `calcularComissaoAutomatica`**
  - Calcula comissão após faturamento/pagamento
  - Registra em AuditLog
  - Integra com vendedor_id

- **Função `validacaoFluxoFinanceiro`**
  - Validações de negócio para pedidos
  - Proibição de faturamento com desconto não aprovado

#### 🔄 Fluxo Completo
```
Oportunidade 
  ↓ (converter_orcamento)
OrcamentoCliente 
  ↓ (converter_pedido)
Pedido 
  ↓ (Aprovação de Desconto)
Pedido Aprovado 
  ↓ (aprovar_pedido)
Reserva de Estoque 
  ↓ (Faturamento)
Cálculo de Comissão
```

---

### 2️⃣ **GESTÃO DE ESTOQUE COMPLETA**

#### ✅ Implementado
- **Entidade `AjusteEstoque`**
  - Contagem física com diferenças
  - Tipos de ajuste: inventário, devolução, avaria, obsoleto, perda
  - Fluxo de aprovação com aprovador_id
  - Rastreabilidade completa

- **Componente `InventarioContagem`**
  - Interface interativa para contagem física
  - Cálculo automático de diferenças
  - Submissão de ajustes para aprovação
  - Responsável de contagem rastreável

#### 🔄 Fluxo de Estoque
```
Pedido Criado
  ↓
Reserva de Estoque (reservado +)
  ↓
Faturamento
  ↓
Saída de Estoque (estoque -)
  ↓
Contagem Física
  ↓
Ajuste (se diferença)
```

---

### 3️⃣ **FLUXO FINANCEIRO CONTROLADO**

#### ✅ Implementado
- **Função `validacaoFluxoFinanceiro`**
  - `centro_custo_id` obrigatório
  - Proibição de exclusão após processamento
  - Apenas "Cancelamento" com justificativa
  - Validação de margem em pedidos

- **Componente `AprovacaoContasFluxo`**
  - Interface de aprovação com status progression
  - Filtros por status (Pendente, Aprovado, Rejeitado)
  - Fluxo: Aguardando → Aprovado → Pago
  - Integração com AuditLog

#### 🔄 Fluxo Financeiro
```
Conta Criada (Pendente)
  ↓ (Validação: centro_custo_id obrigatório)
Em Aguardação (Aguardando Aprovação)
  ↓ (Aprovação de Gestor)
Aprovado
  ↓ (Processamento de Pagamento)
Pago
  ↓ (Conciliação Bancária)
Compensado
```

---

## 🎯 Próximos: Completar ETAPA 2

### To-Do Imediato
- [ ] Dashboard BPMN visual
- [ ] Roteiro de faturamento automático
- [ ] Integração com NotaFiscal
- [ ] Relatórios de fluxo comercial
- [ ] Validador de estoque (transações)
- [ ] Conciliação bancária avançada
- [ ] Histórico de transições (audit trail)
- [ ] Webhooks para eventos BPMN

---

## 📚 Documentação

- **fluxoComercialBPMN.js** - Funções de orquestração
- **validacaoFluxoFinanceiro.js** - Validações de negócio
- **calcularComissaoAutomatica.js** - Cálculo de comissões
- **AjusteEstoque.json** - Entidade de ajustes
- **AprovacaoDescontoModal.jsx** - Interface de aprovação desconto
- **InventarioContagem.jsx** - Interface de contagem
- **AprovacaoContasFluxo.jsx** - Interface de aprovação contas

---

## ✨ Características Principais

✅ **Multiempresa Integrada** - Todos os processos respeitam empresa_id/group_id  
✅ **Auditoria Completa** - Cada transição registrada em AuditLog  
✅ **Validações de Negócio** - Backend impõe regras operacionais  
✅ **Fluxos Automáticos** - BPMN executa transições automáticas  
✅ **Rastreabilidade Total** - Origem e histórico de cada ação  

---

**ETAPA 2 — Em Desenvolvimento** 🚀