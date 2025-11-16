# 📘 MÓDULO 0 - Framework de Janelas Multitarefa V21.0

## 🎯 Objetivo

Este módulo estabelece a **fundação universal** para todo o sistema ERP Integra, implementando:

✅ Sistema de janelas multitarefa completo  
✅ Auditoria automática de ações de UI  
✅ Verificação de permissões integrada  
✅ Assistente IA contextual em cada janela  
✅ Padrões globais de UX e responsividade  

---

## 📦 Componentes Implementados

### 1. `WindowManager.jsx` (Core)
Gerenciador central de todas as janelas abertas no sistema.

**Funcionalidades:**
- Criação/abertura de janelas com ID único
- Controle de z-index dinâmico
- Gerenciamento de estado (normal, minimizado, maximizado)
- Sistema de "janela ativa" com highlighting visual
- Suporte a múltiplas instâncias (100+ janelas simultâneas)

**Métodos principais:**
```javascript
openWindow(config)       // Abre nova janela
closeWindow(id)          // Fecha janela
minimizeWindow(id)       // Minimiza
maximizeWindow(id)       // Maximiza
restoreWindow(id)        // Restaura
togglePin(id)            // Fixa/desfixa
bringToFront(id)         // Traz para frente
updateWindowData(id, data) // Atualiza dados da janela
```

---

### 2. `WindowModal.jsx`
Componente visual da janela com todos os controles.

**Features:**
- Arraste para mover (drag-and-drop)
- Redimensionamento responsivo
- Cabeçalho customizável (título, subtítulo, ícone, badge)
- Botões de controle (minimizar, maximizar, fechar, fixar)
- Highlighting visual de janela ativa
- Suporte a pinning (fixar janela no topo)

---

### 3. `MinimizedWindowsBar.jsx`
Barra flutuante com janelas minimizadas.

**Features:**
- Exibição de todas as janelas minimizadas
- Drag para restaurar (arraste para fora da barra)
- Botões rápidos de restaurar/fechar
- Contador visual de janelas
- Indicação de janelas fixadas

---

### 4. `WindowRenderer.jsx`
Renderizador global que exibe todas as janelas ativas.

**Responsabilidades:**
- Renderizar janelas não-minimizadas
- Gerenciar z-index de sobreposição
- Renderizar barra de minimizados
- Sincronizar estado com WindowManager

---

### 5. `AuditLogger.jsx` (NOVO - V21.0)
Sistema de auditoria automática para janelas.

**Registra:**
- Abertura de janelas (módulo, usuário, timestamp)
- Fechamento de janelas (tempo de uso)
- Tentativas de acesso negado
- Ações de janela (minimizar, maximizar, fixar)

**Integração:**
Todos os logs são salvos na entidade `AuditLog` com tipo `UI_WINDOW`.

---

### 6. `PermissionChecker.jsx` (NOVO - V21.0)
Verificador de permissões antes de abrir janelas.

**Funcionalidades:**
- Valida `requiredPermission` da configuração da janela
- Bloqueia abertura se usuário não tiver permissão
- Registra tentativas negadas no log de auditoria
- Exibe mensagem clara de erro ao usuário

**Uso:**
```javascript
const { canOpenWindow } = usePermissionChecker();

const permissionCheck = await canOpenWindow({
  title: 'Pedido de Venda',
  module: 'comercial',
  requiredPermission: 'comercial.criar'
});

if (!permissionCheck.allowed) {
  toast.error(permissionCheck.message);
  return;
}
```

---

### 7. `IAWindowAssistant.jsx` (NOVO - V21.0)
Assistente IA contextual para cada janela.

**Features:**
- Botão flutuante "Ajuda com IA"
- Análise inteligente do contexto da janela
- Sugestões de próximos passos
- Alertas e validações preditivas
- Detecção de padrões anormais

**Prompts específicos por módulo:**
- **Comercial:** margem de lucro, crédito do cliente, tabela de preço
- **Fiscal:** regime tributário, NCM/CFOP, impostos
- **Estoque:** níveis críticos, movimentações atípicas, reposição

---

### 8. `WindowManagerEnhanced.jsx` (NOVO - V21.0)
Wrapper aprimorado que integra auditoria + permissões.

**Funcionalidade:**
- Sobrescreve `openWindow` para incluir validação de permissões
- Registra automaticamente no log de auditoria
- Retorna feedback ao usuário em caso de erro

---

## 🚀 Como Usar

### Instalação no Layout Principal

```jsx
import { WindowManagerEnhancedProvider } from '@/components/lib/WindowManagerEnhanced';
import WindowRenderer from '@/components/lib/WindowRenderer';

export default function Layout({ children }) {
  return (
    <WindowManagerEnhancedProvider>
      <div className="app-layout">
        {children}
        
        {/* Renderiza todas as janelas abertas */}
        <WindowRenderer />
      </div>
    </WindowManagerEnhancedProvider>
  );
}
```

---

### Abrindo Janelas em Qualquer Módulo

```jsx
import { useWindowManagerEnhanced } from '@/components/lib/WindowManagerEnhanced';
import { ShoppingCart } from 'lucide-react';

function MeuComponente() {
  const { openWindow } = useWindowManagerEnhanced();

  const abrirPedido = () => {
    openWindow({
      title: 'Novo Pedido de Venda',
      subtitle: 'Cliente: Metalúrgica XYZ',
      icon: ShoppingCart,
      module: 'comercial',
      requiredPermission: 'comercial.criar',
      badge: 'Novo',
      content: <PedidoFormCompleto />
    });
  };

  return (
    <Button onClick={abrirPedido}>
      Criar Pedido
    </Button>
  );
}
```

---

### Usando o Assistente IA

```jsx
import IAWindowAssistant from '@/components/lib/IAWindowAssistant';

function FormularioPedido({ pedido }) {
  return (
    <div className="p-6">
      <h1>Pedido de Venda</h1>
      
      {/* Formulário aqui */}
      
      {/* Assistente IA */}
      <IAWindowAssistant
        window={{ 
          title: 'Pedido de Venda',
          module: 'comercial'
        }}
        context={{
          cliente: pedido.cliente_nome,
          valor_total: pedido.valor_total,
          margem: pedido.margem_percentual
        }}
      />
    </div>
  );
}
```

---

## 📋 Configuração de Janelas

### Estrutura de `windowConfig`

```javascript
{
  title: string,              // Título da janela (obrigatório)
  subtitle: string,           // Subtítulo opcional
  icon: LucideIcon,          // Ícone do módulo
  module: string,            // Nome do módulo (comercial, fiscal, etc)
  requiredPermission: string, // Permissão necessária (ex: 'comercial.criar')
  badge: string,             // Badge opcional (ex: 'Novo', 'Urgente')
  content: ReactElement,     // Conteúdo da janela (componente React)
  data: object,              // Dados contextuais da janela
  onClose: function          // Callback ao fechar (opcional)
}
```

---

## 🔒 Sistema de Permissões

### Mapeamento Módulo → Permissão

```javascript
const permissionMap = {
  'comercial': 'comercial.visualizar',
  'pedidos': 'comercial.visualizar',
  'clientes': 'cadastros.visualizar',
  'produtos': 'cadastros.visualizar',
  'estoque': 'estoque.visualizar',
  'financeiro': 'financeiro.visualizar',
  'fiscal': 'fiscal.visualizar',
  'compras': 'compras.visualizar',
  'expedicao': 'expedicao.visualizar',
  'producao': 'producao.visualizar',
  'rh': 'rh.visualizar'
};
```

---

## 📊 Auditoria Automática

Todos os eventos são registrados em `AuditLog`:

```json
{
  "usuario": "joao@empresa.com",
  "empresa_id": "empresa-123",
  "acao": "Visualização",
  "modulo": "Sistema",
  "entidade": "Window",
  "descricao": "Abriu janela: Pedido de Venda #1234",
  "dados_novos": {
    "windowId": "window-xyz",
    "tipo": "pedido",
    "modulo": "comercial"
  },
  "data_hora": "2025-11-16T10:30:00Z",
  "sucesso": true
}
```

---

## 🎨 Padrões Visuais

### Estados de Janela

| Estado | Cor | Comportamento |
|--------|-----|--------------|
| **Ativa** | Roxo (`purple-500`) | Border destacado, sombra intensa |
| **Ativa + Fixada** | Azul (`blue-500`) | Border azul, badge "Fixado" |
| **Inativa** | Cinza (`slate-300`) | Border sutil, sombra leve |
| **Inativa + Fixada** | Azul claro (`blue-300`) | Border azul claro |

### Responsividade

- **Largura máxima:** 90vw
- **Altura máxima:** 95vh
- **Maximizado:** ocupa todo o viewport (menos 4px de margem)
- **Minimizado:** aparece na barra flutuante no canto inferior direito

---

## 🧪 Testes e Validação

### Checklist de Implementação

- [ ] WindowManager integrado ao Layout principal
- [ ] Auditoria registrando eventos corretamente
- [ ] Permissões bloqueando acessos não autorizados
- [ ] Assistente IA funcionando em pelo menos 1 módulo
- [ ] Múltiplas janelas abertas simultaneamente
- [ ] Drag-and-drop funcionando
- [ ] Minimizar/Maximizar/Fechar funcionando
- [ ] Z-index dinâmico sem sobreposições incorretas

---

## 🔄 Próximos Passos (Módulos Futuros)

✅ **Módulo 0:** Framework de Janelas (COMPLETO)  
🔜 **Módulo 1:** Cadastros Gerais (Produtos, Clientes, Tabelas)  
🔜 **Módulo 2:** Comercial & CRM  
🔜 **Módulo 3:** Produção & Logística  
🔜 **Módulo 4:** Financeiro & Fiscal  
🔜 **Módulo 5:** Estoque Integrado  

---

## 📚 Referências

- [React Context API](https://react.dev/reference/react/useContext)
- [Lucide Icons](https://lucide.dev/)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Base44 Platform Docs](https://base44.com/docs)

---

**Desenvolvido por:** Time ERP Integra  
**Versão:** V21.0 - Módulo 0  
**Data:** 16/11/2025