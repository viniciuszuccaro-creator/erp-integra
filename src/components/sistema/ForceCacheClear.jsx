import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Zap } from 'lucide-react';

/**
 * Componente para forçar limpeza de cache
 */
export default function ForceCacheClear() {
  const [clearing, setClearing] = React.useState(false);

  const forcarLimpezaTotal = async () => {
    setClearing(true);
    
    try {
      // 1. Limpar localStorage
      localStorage.clear();
      
      // 2. Limpar sessionStorage
      sessionStorage.clear();
      
      // 3. Limpar Cache API (se disponível)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // 4. Forçar reload sem cache
      setTimeout(() => {
        window.location.reload(true);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setClearing(false);
    }
  };

  return (
    <Card className="border-red-300 bg-red-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-600" />
          Limpeza de Cache Forçada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-300 bg-orange-50">
          <AlertDescription className="text-sm text-orange-900">
            <p className="font-semibold mb-2">⚠️ Use isso se estiver vendo erros como:</p>
            <ul className="list-disc ml-5 text-xs">
              <li>"ReferenceError: apis is not defined"</li>
              <li>"Cannot read property of undefined"</li>
              <li>Componentes não carregando</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            O que este botão faz:
          </p>
          <ul className="text-sm text-slate-700 space-y-1 ml-4">
            <li>✓ Limpa localStorage</li>
            <li>✓ Limpa sessionStorage</li>
            <li>✓ Remove cache do navegador</li>
            <li>✓ Recarrega a aplicação</li>
          </ul>
        </div>

        <Button
          onClick={forcarLimpezaTotal}
          disabled={clearing}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          {clearing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Limpando e Recarregando...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Limpar Cache e Recarregar
            </>
          )}
        </Button>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <p className="font-semibold mb-1">💡 Alternativa Manual:</p>
          <p>Pressione <kbd className="px-2 py-1 bg-white border rounded">Ctrl+Shift+R</kbd> (Windows/Linux)</p>
          <p>ou <kbd className="px-2 py-1 bg-white border rounded">Cmd+Shift+R</kbd> (Mac)</p>
        </div>
      </CardContent>
    </Card>
  );
}