# 🪟 GUIA DE USO - SISTEMA MULTITAREFA V21.0

## ✅ ETAPA 1 - 100% IMPLEMENTADA

### 📚 Como Usar o Sistema de Janelas Multitarefa

#### 1️⃣ Para Desenvolvedores - Abrir Janelas em Componentes

```jsx
import { useWindow } from '@/components/lib/useWindow';
import CadastroClienteCompleto from './cadastros/CadastroClienteCompleto';

function MeuComponente() {
  const { openWindow, openLargeWindow } = useWindow();

  const abrirCliente = (cliente) => {
    // Padrão: Modal Grande (90vw x 85vh)
    openLargeWindow({
      title: `Cliente - ${cliente.nome}`,
      component: CadastroClienteCompleto,
      props: { 
        cliente: cliente,
        onSuccess: () => console.log('Salvo!')
      },
      module: 'comercial',
      metadata: { cliente_id: cliente.id }
    });
  };

  return <button onClick={() => abrirCliente(meuCliente)}>Abrir</button>;
}
```

#### 2️⃣ Tamanhos de Janela Disponíveis

```jsx
const { openLargeWindow, openMediumWindow, openSmallWindow, openFullscreenWindow } = useWindow();

// Modal Grande - Formulários complexos (PADRÃO ETAPA 1)
openLargeWindow({ ... }); // 90vw x 85vh

// Modal Médio - Visualizações e relatórios
openMediumWindow({ ... }); // 70vw x 70vh

// Modal Pequeno - Confirmações e formulários simples
openSmallWindow({ ... }); // 50vw x 60vh

// Fullscreen - Dashboards e visualizações 3D
openFullscreenWindow({ ... }); // 100vw x 100vh
```

#### 3️⃣ Para Usuários - Controles de Janela

**Barra de Título da Janela:**
- 🔽 **Minimizar**: Envia a janela para barra inferior
- ⬜ **Maximizar/Restaurar**: Alterna entre tamanho normal e tela cheia
- ❌ **Fechar**: Fecha a janela (sem perder dados em outras)

**Arrastar e Redimensionar:**
- Clique e arraste a **barra de título** para mover a janela
- Arraste as **bordas/cantos** para redimensionar
- Clique em qualquer lugar da janela para trazê-la para frente

**Barra Inferior (Janelas Minimizadas):**
- Clique em uma janela minimizada para restaurá-la
- Clique no X para fechá-la definitivamente

#### 4️⃣ Padrões Implementados

**Todas as Páginas Principais:**
```jsx
<div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto min-h-[calc(100vh-4rem)]">
  {/* Conteúdo responsivo */}
</div>
```

**Todos os Modais de Formulário:**
```jsx
<DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
  {/* Formulário com scroll interno */}
</DialogContent>
```

#### 5️⃣ Integração Multiempresa

Quando o usuário troca de empresa:

**Opção 1: Atualizar Todas as Janelas**
- Todas as janelas abertas são atualizadas para a nova empresa
- Dados são recarregados automaticamente
- **Configurado em:** PreferenciasUsuario.preferencia_multiempresa = "atualizar_todas"

**Opção 2: Manter Janelas Congeladas**
- Janelas antigas ficam em modo somente leitura
- Novas janelas abrem com a empresa nova
- **Configurado em:** PreferenciasUsuario.preferencia_multiempresa = "manter_congeladas"

#### 6️⃣ Persistência Automática

✅ Estado das janelas é salvo automaticamente a cada 2 segundos
✅ Preferências incluem: posição, tamanho, estado (minimizada/maximizada)
✅ Ao fazer login novamente, pode restaurar sessão anterior (se implementado)

#### 7️⃣ Auditoria Automática

Módulos sensíveis registram em `AuditLog` quando uma janela é aberta:
- Financeiro
- Fiscal
- RH
- Configurações

**Registro inclui:**
- Usuário que abriu
- Data/hora
- Módulo acessado
- Título da janela
- Metadados (ex: cliente_id, pedido_id)

### 🎯 Regra-Mãe Aplicada

| Princípio | Implementação |
|-----------|---------------|
| **Acrescentar** | Sistema multitarefa adicionado sem remover funcionalidades existentes |
| **Reorganizar** | Layout padronizado em todas as 11 páginas principais |
| **Conectar** | Integração com auditoria, permissões, multiempresa |
| **Melhorar** | UX revolucionária - múltiplas janelas simultâneas |

### 📦 Componentes Criados

1. `WindowManagerPersistent.jsx` - Gerenciador central
2. `WindowModal.jsx` - Componente de janela individual
3. `WindowRenderer.jsx` - Renderizador de janelas
4. `MinimizedWindowsBar.jsx` - Barra inferior
5. `useWindow.js` - Hook simplificado
6. `WindowLauncher.jsx` - Lazy loading
7. `StandardPageWrapper.jsx` - Wrapper padrão de páginas
8. `LargeModalWrapper.jsx` - Wrapper padrão de modais
9. `KPICardClickable.jsx` - Cards com drill-down
10. `PreferenciasUsuario.json` - Entidade de preferências

### 🚀 Status Final

**🟢 ETAPA 1 - 100% COMPLETA**

Todos os requisitos implementados:
- ✅ Layout responsivo global (w-full)
- ✅ Modal grande padrão (max-w-[90vw])
- ✅ Sistema de janelas multitarefa funcional
- ✅ Drag, resize, minimize, maximize, close
- ✅ Persistência automática
- ✅ Controle de acesso integrado
- ✅ Auditoria automática
- ✅ Multiempresa aware
- ✅ Barra de janelas minimizadas
- ✅ Zero alterações em funcionalidades existentes
- ✅ Regra-Mãe 100% respeitada