import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Bolt } from 'lucide-react';

/**
 * 🔧 DIAGNÓSTICO DE BACKEND FUNCTIONS
 * V21.5 - Verifica se backend functions estão habilitadas
 */
export default function DiagnosticoBackend() {
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const testarBackend = async () => {
    setTestando(true);
    setResultado(null);

    try {
      // Testar com um CNPJ válido conhecido
      const res = await base44.functions.ConsultarCNPJ({ cnpj: '00000000000191' }); // Banco do Brasil
      
      setResultado({
        funciona: res.sucesso || res.erro?.includes('não encontrado'),
        mensagem: res.sucesso ? 
          `✅ Backend Functions ATIVO! Dados recebidos de ${res.fonte || 'API'}` :
          `⚠️ Backend responde mas: ${res.erro}`,
        detalhes: res
      });
    } catch (error) {
      setResultado({
        funciona: false,
        mensagem: '❌ Backend Functions NÃO HABILITADO',
        erro: error.message,
        solucao: 'Vá em Dashboard → Configurações → Habilitar Backend Functions'
      });
    } finally {
      setTestando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bolt className="w-5 h-5 text-yellow-600" />
          Diagnóstico de Backend Functions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testarBackend} 
          disabled={testando}
          className="w-full"
        >
          {testando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Bolt className="w-4 h-4 mr-2" />
              Testar Backend Functions
            </>
          )}
        </Button>

        {resultado && (
          <Alert className={resultado.funciona ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
            {resultado.funciona ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription>
              <p className="font-semibold">{resultado.mensagem}</p>
              {resultado.erro && (
                <p className="text-xs mt-2 opacity-70">Erro: {resultado.erro}</p>
              )}
              {resultado.solucao && (
                <p className="text-xs mt-2 font-medium">💡 {resultado.solucao}</p>
              )}
              {resultado.detalhes && resultado.funciona && (
                <pre className="text-[10px] mt-2 opacity-50 max-h-32 overflow-auto">
                  {JSON.stringify(resultado.detalhes, null, 2)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-slate-500 border-t pt-3">
          <p className="font-semibold mb-1">ℹ️ Como habilitar Backend Functions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Acesse o Dashboard do Base44</li>
            <li>Vá em Configurações do App</li>
            <li>Ative "Backend Functions"</li>
            <li>Aguarde alguns segundos e teste novamente</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}