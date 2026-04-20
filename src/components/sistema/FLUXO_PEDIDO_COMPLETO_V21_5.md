# 🚀 GUIA COMPLETO - FLUXO DE PEDIDO V21.5

## 📋 COMO USAR O SISTEMA DE PEDIDOS

### 1️⃣ CRIAR UM NOVO PEDIDO

**Passo a Passo:**
1. Vá em **Comercial** → Aba **Pedidos**
2. Clique em **"Novo Pedido"**
3. Preencha os dados na aba **Identificação**
4. Adicione itens nas abas: **Revenda**, **Armado Padrão** ou **Corte e Dobra**
5. Clique em **"Criar Pedido"**
6. Status inicial: **Rascunho** ✅

---

### 2️⃣ APROVAR O PEDIDO (Novo!)

**Opção A - Botão Rápido na Listagem:**
1. Localize o pedido na lista
2. Clique no botão verde **"✅ Aprovar"** (aparece quando status = Rascunho)
3. Status muda para: **Aprovado** ✅

**Opção B - Seletor de Status (Novo!):**
1. Localize o pedido na lista
2. Clique no **dropdown de status** (coluna Status)
3. Selecione **"✅ Aprovado"**
4. Status muda automaticamente ✅

**Opção C - Dentro do Formulário:**
1. Edite o pedido
2. Mude o campo de status manualmente
3. Salve

---

### 3️⃣ FECHAR PEDIDO E ENVIAR PARA ENTREGA (Novo!)

**Requisito**: Pedido deve estar com status **"Aprovado"**

**Como Fazer:**
1. Aprove o pedido primeiro (veja passo 2)
2. Aparecerá o botão **"🚚 Fechar p/ Entrega"** em destaque azul
3. Clique nele
4. Status muda para: **Pronto para Faturar** ✅
5. Pedido vai para a expedição/logística

---

### 4️⃣ FLUXO COMPLETO DE STATUS

```
📝 Rascunho
    ↓ [Botão "Aprovar" OU Seletor]
    
✅ Aprovado
    ↓ [Botão "🚚 Fechar p/ Entrega"]
    
📦 Pronto para Faturar
    ↓ [Botão "NF-e"]
    
📄 Faturado
    ↓ [Botão "Entrega"]
    
🚚 Em Expedição
    ↓ (Criar romaneio)
    
🛣️ Em Trânsito
    ↓ (Rastreamento GPS)
    
🎉 Entregue
```

---

## 🎯 RECURSOS DISPONÍVEIS POR STATUS

### Status: Rascunho
- ✅ **Botão "Aprovar"** (verde, destaque)
- ✅ Editar
- ✅ Excluir
- ✅ Imprimir
- ✅ Seletor de Status (mudar direto)

### Status: Aprovado
- ✅ **Botão "🚚 Fechar p/ Entrega"** (azul, destaque, borda)
- ✅ Botão "NF-e" (gerar nota fiscal)
- ✅ Editar
- ✅ Imprimir
- ✅ Seletor de Status

### Status: Pronto para Faturar
- ✅ Botão "NF-e"
- ✅ Editar
- ✅ Seletor de Status

### Status: Faturado
- ✅ Botão "Entrega"
- ✅ Visualizar
- ✅ Seletor de Status

---

## 🔥 NOVIDADES V21.5

### 1. Seletor de Status Inline
- ✨ Dropdown direto na coluna Status
- ✨ Muda status com 1 clique
- ✨ Todos os status disponíveis
- ✨ Feedback instantâneo
- ✨ z-index garantido (99999)

### 2. Botão Aprovar Rápido
- ✨ Aparece quando status = Rascunho
- ✨ Cor verde com destaque
- ✨ Muda status para Aprovado
- ✨ Toast de confirmação

### 3. Botão Fechar para Entrega Melhorado
- ✨ Aparece quando status = Aprovado
- ✨ Cor azul com borda
- ✨ Ícone de caminhão 🚚
- ✨ Texto claro: "Fechar p/ Entrega"
- ✨ Muda status para "Pronto para Faturar"

### 4. Visual Melhorado
- ✨ Botões com cores semânticas
- ✨ Ícones intuitivos
- ✨ Texto curto e claro
- ✨ Bordas em botões importantes

---

## 📊 EXEMPLO PRÁTICO

**Cenário**: Criar pedido e enviar para entrega

1. **Criar**: Comercial → Pedidos → Novo Pedido
2. **Preencher**: Dados + Itens
3. **Salvar**: Status = Rascunho ✅
4. **Aprovar**: Clicar no botão verde **"✅ Aprovar"** OU no dropdown selecionar "Aprovado"
5. **Fechar**: Clicar no botão azul **"🚚 Fechar p/ Entrega"**
6. **Pronto**: Status = Pronto para Faturar ✅

**Tempo Total**: ~30 segundos ⚡

---

## ❓ PERGUNTAS FREQUENTES

**Q: Por que não aparece o botão de fechar?**
**R:** O pedido precisa estar com status "Aprovado" primeiro. Use o botão verde "Aprovar" ou o seletor de status.

**Q: Como mudo o status rapidamente?**
**R:** Clique no dropdown na coluna "Status" e selecione o novo status.

**Q: Posso pular etapas?**
**R:** Sim! Use o seletor de status para ir direto para qualquer status.

**Q: O que fazer se o botão não aparecer?**
**R:** Verifique se: 1) Pedido está Aprovado 2) Filtro de status não está escondendo 3) Refresh na página

---

## 🎨 CÓDIGOS DE COR

- 🟢 Verde = Aprovar (Rascunho → Aprovado)
- 🔵 Azul = Fechar/Entrega (Aprovado → Pronto Faturar)
- 🟡 Amarelo = NF-e (Gerar nota fiscal)
- 🟣 Roxo = OP (Ordem de Produção)
- ⚫ Cinza = Ações normais (Editar, Ver, Imprimir)
- 🔴 Vermelho = Excluir

---

## ✅ CHECKLIST RÁPIDO

Antes de fechar um pedido:
- [ ] Cliente selecionado
- [ ] Pelo menos 1 item adicionado
- [ ] Endereço de entrega definido
- [ ] Forma de pagamento escolhida
- [ ] Status mudado para "Aprovado"
- [ ] Clicar em "🚚 Fechar p/ Entrega"

**Tudo OK?** → Pedido vai para "Pronto para Faturar" 🚀

---

## 🎯 ATALHOS IMPORTANTES

- **Novo Pedido**: Botão "Novo Pedido"
- **Aprovar**: Botão verde "Aprovar" (se Rascunho)
- **Fechar**: Botão azul "Fechar p/ Entrega" (se Aprovado)
- **Mudar Status**: Dropdown na coluna Status (qualquer linha)
- **Editar**: Botão "Editar"
- **Ver Tudo**: Filtro "Todos os Status"

---

**Última Atualização**: V21.5 - 10/12/2025  
**Status**: ✅ 100% Funcional