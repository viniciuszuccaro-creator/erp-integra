import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Code, Lightbulb, Zap, CheckCircle } from 'lucide-react';

/**
 * V22.0 ETAPA 3 - Guia de Implementação Prática
 * 
 * Como aplicar os componentes da Etapa 3 nas telas existentes
 */
export default function GuiaImplementacaoEtapa3() {
  const exemplos = [
    {
      titulo: '1. Tornar Tela Responsiva',
      codigo: `import { ResponsiveContainer } from '@/components/ui/responsive-container';

export default function MinhaTelaPage() {
  return (
    <ResponsiveContainer className="p-6">
      {/* Todo o conteúdo aqui */}
      <h1>Minha Tela</h1>
    </ResponsiveContainer>
  );
}`
    },
    {
      titulo: '2. Converter Modal em Janela',
      codigo: `import { useModalAsWindow } from '@/components/lib/useModalAsWindow';

function MeuComponente() {
  const { openAsWindow } = useModalAsWindow();

  const abrirFormulario = () => {
    openAsWindow({
      title: 'Novo Cliente',
      component: ClienteForm,
      props: { onSave: handleSave },
      width: '800px',
      height: '600px'
    });
  };

  return <Button onClick={abrirFormulario}>Novo</Button>;
}`
    },
    {
      titulo: '3. Criar Abas Dinâmicas',
      codigo: `import { DynamicTabs, DynamicTabContent, DynamicTabsList } from '@/components/ui/dynamic-tabs';

<DynamicTabs defaultValue="tab1">
  <DynamicTabsList>
    <TabsTrigger value="tab1">Geral</TabsTrigger>
    <TabsTrigger value="tab2">Detalhes</TabsTrigger>
  </DynamicTabsList>

  <DynamicTabContent value="tab1">
    {/* Conteúdo com scroll automático */}
  </DynamicTabContent>

  <DynamicTabContent value="tab2">
    {/* Altura calculada dinamicamente */}
  </DynamicTabContent>
</DynamicTabs>`
    },
    {
      titulo: '4. Dashboard Interativo',
      codigo: `import { InteractiveCard, InteractiveCardGrid } from '@/components/ui/interactive-card';
import { createPageUrl } from '@/utils';

<InteractiveCardGrid cols={{ sm: 1, md: 2, lg: 3 }}>
  <InteractiveCard
    title="Pedidos Hoje"
    value="127"
    icon={ShoppingCart}
    variant="primary"
    trend="up"
    trendValue="+12%"
    href={createPageUrl('Comercial')}
  />
  
  <InteractiveCard
    title="Análise Detalhada"
    value="Ver Mais"
    icon={TrendingUp}
    variant="success"
    onClick={() => console.log('Drill-down')}
  />
</InteractiveCardGrid>`
    },
    {
      titulo: '5. Grid Responsivo',
      codigo: `import { ResponsiveGrid } from '@/components/ui/responsive-container';

<ResponsiveGrid 
  cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap={4}
>
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</ResponsiveGrid>`
    }
  ];

  return (
    <div className="w-full space-y-6">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Guia de Implementação - Etapa 3
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Alert className="border-blue-300 bg-blue-50">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <AlertDescription>
              <strong>Como usar:</strong> Copie os exemplos abaixo e adapte para suas telas.
              Todos os componentes estão prontos e funcionais.
            </AlertDescription>
          </Alert>

          {/* Exemplos de Código */}
          {exemplos.map((exemplo, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-800">{exemplo.titulo}</h3>
              </div>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono">{exemplo.codigo}</pre>
              </div>
            </div>
          ))}

          {/* Dicas */}
          <Card className="border-purple-300 bg-purple-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Dicas de Implementação
              </h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li>✅ Use ResponsiveContainer para wrapping de páginas completas</li>
                <li>✅ Prefira DynamicTabs ao invés de Tabs padrão para conteúdo longo</li>
                <li>✅ Converta modais em janelas para permitir multitarefa</li>
                <li>✅ Use InteractiveCard em dashboards para navegação direta</li>
                <li>✅ Sempre teste em mobile, tablet e desktop</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}