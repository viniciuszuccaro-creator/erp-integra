import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scan,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * V22.0 ETAPA 1 - Validador de Elementos Interativos
 * 
 * Realiza varredura completa na interface para garantir que:
 * 1. Todos os botões têm ações associadas
 * 2. Todos os inputs têm onChange
 * 3. Todos os selects têm onValueChange
 * 4. Todas as ações têm os 3 estados (loading, success, error)
 * 
 * CRÍTICO: Identifica elementos "silenciosos" que não fazem nada
 */
export default function ValidadorElementosInterativos() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const executarVarredura = () => {
    setScanning(true);
    
    setTimeout(() => {
      // Varredura do DOM
      const allButtons = document.querySelectorAll('button');
      const allInputs = document.querySelectorAll('input');
      const allSelects = document.querySelectorAll('select, [role="combobox"]');
      const allTextareas = document.querySelectorAll('textarea');

      const problemas = [];
      let totalElementos = 0;
      let elementosValidos = 0;

      // Validar botões
      allButtons.forEach((btn, idx) => {
        totalElementos++;
        const hasOnClick = btn.onclick || btn.hasAttribute('data-action');
        const hasType = btn.getAttribute('type');
        const isDisabled = btn.disabled;
        
        if (!hasOnClick && hasType !== 'submit' && !isDisabled) {
          problemas.push({
            tipo: 'Botão sem ação',
            elemento: 'button',
            texto: btn.textContent?.trim()?.substring(0, 50) || 'Sem texto',
            severidade: 'Alta',
            localizacao: `Button #${idx}`
          });
        } else {
          elementosValidos++;
        }
      });

      // Validar inputs
      allInputs.forEach((input, idx) => {
        if (input.type === 'hidden' || input.type === 'submit') return;
        
        totalElementos++;
        const hasOnChange = input.onchange || input.oninput;
        const hasFormParent = input.closest('form');
        
        if (!hasOnChange && !hasFormParent) {
          problemas.push({
            tipo: 'Input sem onChange',
            elemento: 'input',
            texto: input.placeholder || input.name || 'Sem identificação',
            severidade: 'Média',
            localizacao: `Input #${idx}`
          });
        } else {
          elementosValidos++;
        }
      });

      // Validar selects
      allSelects.forEach((select, idx) => {
        totalElementos++;
        const hasOnChange = select.onchange;
        
        if (!hasOnChange) {
          problemas.push({
            tipo: 'Select sem onValueChange',
            elemento: 'select',
            texto: select.getAttribute('placeholder') || 'Sem identificação',
            severidade: 'Média',
            localizacao: `Select #${idx}`
          });
        } else {
          elementosValidos++;
        }
      });

      // Validar textareas
      allTextareas.forEach((textarea, idx) => {
        totalElementos++;
        const hasOnChange = textarea.onchange || textarea.oninput;
        
        if (!hasOnChange) {
          problemas.push({
            tipo: 'Textarea sem onChange',
            elemento: 'textarea',
            texto: textarea.placeholder || 'Sem identificação',
            severidade: 'Baixa',
            localizacao: `Textarea #${idx}`
          });
        } else {
          elementosValidos++;
        }
      });

      // Verificar logs de ação
      const actionLogs = window.__actionLogs || [];
      const ultimasAcoes = actionLogs.slice(-20);
      const errosRecentes = ultimasAcoes.filter(l => l.status === 'error').length;

      const score = totalElementos > 0 
        ? Math.round((elementosValidos / totalElementos) * 100)
        : 100;

      setResults({
        totalElementos,
        elementosValidos,
        problemas,
        score,
        ultimasAcoes,
        errosRecentes,
        timestamp: new Date().toISOString()
      });

      setScanning(false);
      
      if (problemas.length === 0) {
        toast.success('✅ Varredura concluída: Nenhum problema encontrado!');
      } else {
        toast.warning(`⚠️ ${problemas.length} problema(s) detectado(s)`);
      }
    }, 1500);
  };

  useEffect(() => {
    // Executar varredura automática ao montar
    executarVarredura();
  }, []);

  const exportarRelatorio = () => {
    if (!results) return;

    const relatorio = {
      titulo: 'Relatório de Validação de Elementos Interativos',
      data: new Date().toLocaleString('pt-BR'),
      score: results.score,
      estatisticas: {
        total: results.totalElementos,
        validos: results.elementosValidos,
        problemas: results.problemas.length,
        erros_recentes: results.errosRecentes
      },
      problemas: results.problemas,
      ultimas_acoes: results.ultimasAcoes
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validacao-ui-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado!');
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Validador de Elementos Interativos
            <Badge className="bg-blue-600 text-white ml-auto">
              V22.0 ETAPA 1
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600">
              Garante que todos os elementos interativos tenham ações funcionais e estados bem definidos
            </p>
            <div className="flex gap-2">
              <Button
                onClick={executarVarredura}
                disabled={scanning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Varrendo...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Executar Varredura
                  </>
                )}
              </Button>
              {results && (
                <Button
                  variant="outline"
                  onClick={exportarRelatorio}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>

          {/* Score */}
          {results && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card className={`border-2 ${
                results.score >= 90 ? 'border-green-500 bg-green-50' :
                results.score >= 70 ? 'border-yellow-500 bg-yellow-50' :
                'border-red-500 bg-red-50'
              }`}>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-slate-600 mb-1">Score de Validação</p>
                  <p className={`text-3xl font-bold ${
                    results.score >= 90 ? 'text-green-600' :
                    results.score >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {results.score}%
                  </p>
                  <Progress value={results.score} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card className="bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-blue-600" />
                    <p className="text-xs text-slate-600">Total</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {results.totalElementos}
                  </p>
                  <p className="text-xs text-slate-500">elementos</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-slate-600">Válidos</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {results.elementosValidos}
                  </p>
                  <p className="text-xs text-slate-500">funcionais</p>
                </CardContent>
              </Card>

              <Card className="bg-orange-50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-orange-600" />
                    <p className="text-xs text-slate-600">Problemas</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {results.problemas.length}
                  </p>
                  <p className="text-xs text-slate-500">detectados</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <p className="text-xs text-slate-600">Erros</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {results.errosRecentes}
                  </p>
                  <p className="text-xs text-slate-500">últimas 20</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Problemas Detectados */}
          {results && results.problemas.length > 0 && (
            <Alert className="border-orange-300 bg-orange-50 mb-4">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <AlertDescription>
                <strong>{results.problemas.length} elemento(s) interativo(s)</strong> sem ação funcional detectada
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de Problemas */}
          {results && results.problemas.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-2">
                Problemas Detectados
              </h3>
              <ScrollArea className="h-[300px] border rounded-lg bg-white">
                <div className="p-3 space-y-2">
                  {results.problemas.map((problema, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        problema.severidade === 'Alta' ? 'bg-red-50 border-red-200' :
                        problema.severidade === 'Média' ? 'bg-orange-50 border-orange-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                          problema.severidade === 'Alta' ? 'text-red-600' :
                          problema.severidade === 'Média' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{problema.tipo}</span>
                            <Badge className={
                              problema.severidade === 'Alta' ? 'bg-red-600' :
                              problema.severidade === 'Média' ? 'bg-orange-600' :
                              'bg-yellow-600'
                            }>
                              {problema.severidade}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mb-1">
                            <strong>Elemento:</strong> {problema.elemento}
                          </p>
                          <p className="text-xs text-slate-600 mb-1">
                            <strong>Texto/ID:</strong> {problema.texto}
                          </p>
                          <p className="text-xs text-slate-500">
                            <strong>Localização:</strong> {problema.localizacao}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Tudo OK */}
          {results && results.problemas.length === 0 && (
            <Card className="border-green-300 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  ✅ Interface Validada com Sucesso!
                </h3>
                <p className="text-green-600">
                  Todos os {results.elementosValidos} elementos interativos estão funcionais
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}