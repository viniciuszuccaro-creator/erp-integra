# 🎯 ETAPA 4 - GUIA COMPLETO DE IMPLEMENTAÇÃO

## 📘 VERSÃO: V21.4 FINAL - ETAPAS 2, 3 E 4 = 100%

---

## 🌟 VISÃO GERAL

A **ETAPA 4** unifica todo o fluxo financeiro do sistema, criando um **Caixa Central** que recebe, consolida e liquida operações de múltiplas origens (Contas a Receber, Contas a Pagar, Pagamentos Omnichannel).

Além disso, implementa **aprovação hierárquica de descontos** em pedidos e **conciliação bancária inteligente** com IA.

As **ETAPAS 2 e 3** garantem que o **Cadastro de Produtos** seja completo, com tripla classificação, dados fiscais/contábeis detalhados e controle de estoque avançado.

---

## 🏗️ ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUXO FINANCEIRO UNIFICADO                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │   Contas a   │   │   Contas a   │   │   Pagamentos     │   │
│  │   Receber    │   │    Pagar     │   │  Omnichannel     │   │
│  └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘   │
│         │                  │                     │              │
│         │    ENVIAR        │       ENVIAR        │   WEBHOOK    │
│         │    PARA          │       PARA          │   GATEWAY    │
│         │    CAIXA         │       CAIXA         │              │
│         ▼                  ▼                     ▼              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          CAIXA CENTRAL - LIQUIDAÇÃO                      │  │
│  │  • Ordens de Recebimento                                │  │
│  │  • Ordens de Pagamento                                  │  │
│  │  • Consolidação Multiempresa                            │  │
│  │  • Liquidação Single/Lote                               │  │
│  │  • Acréscimos e Descontos                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                         │
│                    │ BAIXA AUTOMÁTICA │                         │
│                    │  DE TÍTULOS      │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 ENTIDADES DA ETAPA 4

### 1. CaixaOrdemLiquidacao
**Arquivo**: `entities/CaixaOrdemLiquidacao.json`

**Propósito**: Receber ordens de liquidação de múltiplas origens e consolidá-las para processamento no Caixa.

**Campos Principais**:
- `tipo_operacao`: "Recebimento" | "Pagamento"
- `origem`: "Contas a Receber" | "Contas a Pagar" | "Venda Direta" | "Omnichannel"
- `titulos_vinculados`: Array de títulos (CR/CP) a serem liquidados
- `status`: "Pendente" | "Liquidado" | "Cancelado"
- `valor_total`: Soma de todos os títulos
- `forma_pagamento_pretendida`: "PIX" | "Dinheiro" | "Transferência" | etc.

**Uso**:
```javascript
await base44.entities.CaixaOrdemLiquidacao.create({
  tipo_operacao: 'Recebimento',
  origem: 'Contas a Receber',
  valor_total: 1500.00,
  status: 'Pendente',
  titulos_vinculados: [
    {
      titulo_id: 'cr_123',
      numero_titulo: 'CR-001',
      cliente_fornecedor_nome: 'Cliente ABC',
      valor_titulo: 1500.00
    }
  ]
});
```

---

### 2. PagamentoOmnichannel
**Arquivo**: `entities/PagamentoOmnichannel.json`

**Propósito**: Registrar pagamentos recebidos via Site, App, Link de Pagamento ou API de Gateway.

**Campos Principais**:
- `origem_pagamento`: "Site" | "App" | "Link Pagamento" | "API"
- `gateway_utilizado`: "Asaas" | "Juno" | "Mercado Pago" | etc.
- `status_transacao`: "Pendente" | "Aprovado" | "Cancelado"
- `status_conferencia`: "Pendente" | "Conciliado" | "Divergente"
- `conta_receber_id`: ID da CR vinculada
- `webhook_payload`: JSON completo do webhook

**Uso**:
```javascript
await base44.entities.PagamentoOmnichannel.create({
  origem_pagamento: 'Link Pagamento',
  gateway_utilizado: 'Asaas',
  valor_bruto: 1000.00,
  valor_liquido: 970.00, // descontando taxa gateway
  status_transacao: 'Aprovado',
  status_conferencia: 'Pendente',
  conta_receber_id: 'cr_123'
});
```

---

## 🎨 COMPONENTES PRINCIPAIS

### 1. CaixaCentralLiquidacao.jsx
**Localização**: `components/financeiro/CaixaCentralLiquidacao.jsx`

**5 Abas**:
1. **Liquidar Receber**: Lista CRs pendentes, permite seleção múltipla e envio para Caixa
2. **Liquidar Pagar**: Lista CPs pendentes, permite seleção múltipla e envio para Caixa
3. **Ordens Pendentes**: Ordens aguardando liquidação
4. **Ordens Liquidadas**: Histórico de liquidações
5. **Ordens Canceladas**: Ordens canceladas

**Como usar**:
```jsx
// Em Financeiro.jsx
<CaixaCentralLiquidacao windowMode={false} />

// Ou em janela multitarefa
openWindow(CaixaCentralLiquidacao, { windowMode: true }, {
  title: '💰 Caixa Central',
  width: 1200,
  height: 700
});
```

---

### 2. AprovacaoDescontosManager.jsx
**Localização**: `components/comercial/AprovacaoDescontosManager.jsx`

**Funcionalidades**:
- Lista pedidos com `status_aprovacao === "pendente"`
- Permite aprovar/negar descontos
- Registra histórico de aprovações
- Calcula margem após desconto
- Alertas para margem < 5%

**Como usar**:
```jsx
// Em Comercial.jsx ou Financeiro.jsx
<AprovacaoDescontosManager windowMode={false} />
```

---

### 3. ProdutoFormV22_Completo.jsx
**Localização**: `components/cadastros/ProdutoFormV22_Completo.jsx`

**7 Abas**:
1. **Dados Gerais**: Tripla classificação (Setor + Grupo + Marca), bitola, precificação
2. **Conversões**: Unidades múltiplas, fatores de conversão automáticos
3. **Dimensões & Peso**: Cubagem para frete
4. **E-Commerce**: SEO, imagem IA, marketplace
5. **Fiscal/Contábil**: ICMS, PIS, COFINS, IPI, CFOP, conta contábil
6. **Estoque Avançado**: Lote, validade, localização física
7. **Histórico**: Timeline de alterações

---

## 🔗 INTEGRAÇÕES ENTRE MÓDULOS

### Contas a Receber → Caixa
```jsx
// Em ContasReceberTab.jsx
const enviarParaCaixaMutation = useMutation({
  mutationFn: async (titulos) => {
    return await Promise.all(titulos.map(titulo => 
      base44.entities.CaixaOrdemLiquidacao.create({
        tipo_operacao: 'Recebimento',
        origem: 'Contas a Receber',
        titulos_vinculados: [{ titulo_id: titulo.id, ... }],
        valor_total: titulo.valor
      })
    ));
  }
});
```

### Pedido → Aprovação de Desconto
```jsx
// Em PedidoFormCompleto.jsx
if (margemAposDesconto < margemMinima) {
  dadosPedido.status_aprovacao = 'pendente';
  dadosPedido.status = 'Aguardando Aprovação';
}
```

### Gateway → Omnichannel → Conciliação
```jsx
// 1. Cliente paga via link
// 2. Webhook cria PagamentoOmnichannel
// 3. PagamentoOmnichannel cria CaixaOrdemLiquidacao
// 4. IA faz pareamento automático
// 5. Conciliação atualiza status_conferencia
```

---

## 🎯 FLUXOS COMPLETOS

### Fluxo 1: Recebimento via Boleto/PIX
1. CR criada manualmente ou via pedido
2. Gerar cobrança (boleto/PIX)
3. Cliente paga
4. Webhook atualiza CR
5. Cria PagamentoOmnichannel
6. Cria CaixaOrdemLiquidacao
7. Liquidação manual ou automática
8. CR baixada, HistoricoCliente atualizado

### Fluxo 2: Pagamento a Fornecedor
1. CP criada via OC ou manual
2. CP aguarda aprovação
3. Gestor aprova
4. Enviar para Caixa
5. CaixaOrdemLiquidacao criada
6. Liquidação no Caixa
7. CP baixada automaticamente

### Fluxo 3: Desconto em Pedido
1. Vendedor aplica desconto
2. Sistema calcula margem
3. Se margem < mínima → status_aprovacao = "pendente"
4. Gestor recebe alerta
5. Gestor aprova/nega
6. Pedido atualizado
7. Auditoria registrada

---

## 🔐 PERMISSÕES NECESSÁRIAS

Em **PerfilAcesso.permissoes**:

```json
{
  "financeiro": {
    "caixa_liquidar": true,
    "caixa_cancelar_ordem": true,
    "receber_criar": true,
    "receber_baixar": true,
    "receber_baixar_multiplos": true,
    "receber_gerar_cobranca": true,
    "pagar_criar": true,
    "pagar_aprovar": true,
    "pagar_baixar": true,
    "conciliacao_bancaria": true
  },
  "comercial": {
    "aprovar_desconto": true,
    "negar_desconto": true,
    "visualizar_historico_aprovacoes": true
  }
}
```

---

## 📊 VALIDAÇÕES

Execute `ValidadorEtapa4.jsx` para verificar:
- ✅ Entidades criadas
- ✅ Componentes implementados
- ✅ Integrações funcionando
- ✅ Zero duplicação
- ✅ Regra-Mãe aplicada

---

## 🚀 COMO USAR

### Abrir Caixa Central
1. Ir em **Financeiro** → Tab **Caixa Central**
2. Ou clicar em "Abrir Caixa Central em Nova Janela"

### Enviar Títulos para Caixa
1. Ir em **Contas a Receber** ou **Contas a Pagar**
2. Selecionar títulos (checkbox)
3. Clicar em **Enviar para Caixa**
4. Títulos viram ordens no Caixa Central

### Liquidar Ordens
1. Abrir **Caixa Central**
2. Ir na aba **Ordens Pendentes**
3. Clicar em **Liquidar** na ordem desejada
4. Confirmar forma de pagamento
5. Títulos são baixados automaticamente

### Aprovar Descontos
1. Ir em **Comercial** → Tab **Aprovação Descontos**
2. Ou **Financeiro** → Tab **Aprovações**
3. Analisar pedidos pendentes
4. Aprovar ou Negar com comentários

---

## 🎉 RESULTADO

**SISTEMA 100% INTEGRADO E FUNCIONAL**

✅ Fluxo financeiro unificado  
✅ Caixa Central operacional  
✅ Aprovações hierárquicas  
✅ Conciliação bancária IA  
✅ Produto completo (7 abas)  
✅ Multiempresa 100%  
✅ Multitarefa w-full/h-full  
✅ Controle de acesso  
✅ Auditoria completa  
✅ Zero duplicação  
✅ Regra-Mãe aplicada  

---

**Desenvolvido por**: Base44 ERP Zuccaro  
**Data**: 21/11/2025  
**Versão**: V21.4 FINAL