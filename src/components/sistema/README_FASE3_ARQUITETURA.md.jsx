# 🏗️ ARQUITETURA FASE 3 - PADRÕES E CONVENÇÕES

## 🎯 PRINCÍPIOS FUNDAMENTAIS

### **1. REGRA-MÃE (UNIVERSAL)**
```
✅ Acrescentar
✅ Reorganizar
✅ Conectar
✅ Melhorar
❌ NUNCA APAGAR
```

### **2. MULTIEMPRESA (OBRIGATÓRIO)**
Todas entidades DEVEM ter:
```json
{
  "group_id": "string",           // ID do grupo empresarial
  "empresa_dona_id": "string",    // Empresa que criou
  "empresas_compartilhadas_ids": ["string"], // Empresas compartilhadas
  "origem_escopo": "grupo" | "empresa" // Onde foi criado
}
```

### **3. JANELAS (w-full/h-full)**
Todos formulários DEVEM:
- ✅ Aceitar prop `windowMode`
- ✅ Renderizar w-full/h-full quando `windowMode=true`
- ✅ Ser responsivos (mobile/tablet/desktop)
- ✅ Ter overflow-auto para scroll

### **4. LOOKUPS E SNAPSHOTS**
Para performance, usar snapshots:
```json
{
  "setor_atividade_id": "uuid",
  "setor_atividade_nome": "Revenda", // SNAPSHOT
  
  "grupo_produto_id": "uuid",
  "grupo_produto_nome": "Bitolas", // SNAPSHOT
  
  "marca_id": "uuid",
  "marca_nome": "Gerdau" // SNAPSHOT
}
```

### **5. IA UBÍQUA**
Todas operações críticas DEVEM ter:
- ✅ Log em `LogsIA`
- ✅ Campo `confianca_ia` (0-100)
- ✅ Campo `validado_ia` (boolean)
- ✅ Campo `sugerida_por_ia` (boolean)

---

## 📦 PADRÃO DE ENTIDADES

### **Campos Obrigatórios (Todas Entidades):**
```json
{
  "group_id": "string",
  "ativo": "boolean (default: true)",
  "observacoes": "string (opcional)"
}
```

### **Campos Multiempresa:**
```json
{
  "empresa_dona_id": "string",
  "empresas_compartilhadas_ids": ["string"],
  "origem_escopo": "grupo" | "empresa"
}
```

### **Campos de Auditoria (Built-in):**
```json
{
  "id": "uuid (auto)",
  "created_date": "datetime (auto)",
  "updated_date": "datetime (auto)",
  "created_by": "email (auto)"
}
```

---

## 🎨 PADRÃO DE FORMS

### **Estrutura Básica:**
```jsx
export default function MeuForm({ dados, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(dados || {...defaults});
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* campos */}
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}
```

### **Validações:**
- ✅ Campos obrigatórios com `required`
- ✅ Validação de CNPJ/CPF com IA
- ✅ Lookups para relacionamentos
- ✅ Desabilitar submit durante salvamento

---

## 🔐 PADRÃO DE SEGURANÇA

### **Controle de Acesso:**
```jsx
import usePermissions from '@/components/lib/usePermissions';

const { hasPermission } = usePermissions();

<Button
  disabled={!hasPermission('modulo', 'acao')}
  onClick={handleAction}
>
  Ação
</Button>
```

### **Permissões Granulares:**
- `hasPermission('comercial', 'criar')`
- `hasPermission('financeiro', 'baixar_titulos')`
- `hasPermission('estoque', 'movimentar')`
- `hasPermission('fiscal', 'emitir_nfe')`

---

## 🤖 PADRÃO DE IAs

### **Executar IA:**
```jsx
const resultado = await base44.integrations.Core.InvokeLLM({
  prompt: "...",
  add_context_from_internet: true,
  response_json_schema: {...}
});

// Registrar log
await base44.entities.LogsIA.create({
  tipo_ia: 'IA_PriceBrain',
  contexto_execucao: 'Comercial',
  entidade_relacionada: 'Produto',
  entidade_id: produto.id,
  acao_sugerida: "Preço sugerido: R$ 100",
  resultado: 'Automático',
  confianca_ia: 90,
  dados_entrada: {...},
  dados_saida: resultado
});
```

---

## 📱 PADRÃO DE UI

### **Cores por Módulo:**
- 🔵 **Comercial** - Blue/Purple
- 🟢 **Financeiro** - Green
- 🟠 **Logística** - Orange
- 🟣 **Produção** - Indigo
- 🔴 **Fiscal** - Red
- 🟡 **RH** - Pink/Amber

### **Badges de Status:**
```jsx
const statusColors = {
  'Ativo': 'bg-green-100 text-green-700',
  'Inativo': 'bg-gray-100 text-gray-700',
  'Bloqueado': 'bg-red-100 text-red-700',
  'Pendente': 'bg-yellow-100 text-yellow-700'
};
```

---

## 🌐 PADRÃO DE FILTROS

### **Filtro por Empresa:**
```jsx
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const { empresaAtual } = useContextoVisual();

// Filtrar dados
const dadosFiltrados = dados.filter(d => 
  !empresaAtual || 
  d.empresa_id === empresaAtual.id ||
  d.empresas_compartilhadas_ids?.includes(empresaAtual.id)
);
```

---

## 🚀 PERFORMANCE

### **Otimizações Aplicadas:**
- ✅ React Query com staleTime (30-60s)
- ✅ Snapshots de lookups (evita N+1)
- ✅ Paginação em listas grandes
- ✅ Lazy loading de tabs
- ✅ Memoização de cálculos pesados

---

## 📚 DOCUMENTAÇÃO

### **Arquivos de Referência:**
1. `README_FASE3_COMPLETA.md` - Overview geral
2. `CHECKLIST_FASE3_100.md` - Checklist de validação
3. `FASE3_MANIFESTO_FINAL.md` - Manifesto técnico
4. `VALIDACAO_FASE3_FINAL.md` - Validação detalhada
5. `README_FASE3_ARQUITETURA.md` - Este arquivo

---

## ✅ CONCLUSÃO

**FASE 3 implementada seguindo TODOS os padrões arquiteturais.**

Próximas fases devem seguir estes mesmos princípios:
- Regra-Mãe
- Multiempresa
- w-full/h-full
- IA ubíqua
- Governança
- Auditoria

**Arquitetura sólida, escalável e preparada para crescimento infinito.**