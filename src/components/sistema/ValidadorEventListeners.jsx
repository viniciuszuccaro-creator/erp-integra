import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * V22.0 - Validador de Event Listeners Globais
 * Identifica listeners que podem estar interferindo na interatividade
 */
export default function ValidadorEventListeners() {
  const [listeners, setListeners] = useState([]);
  const [scanning, setScanning] = useState(false);

  const escanearListeners = () => {
    setScanning(true);
    const found = [];

    try {
      // Escanear listeners no document
      const docListeners = getEventListeners?.(document) || {};
      Object.entries(docListeners).forEach(([eventType, handlers]) => {
        if (handlers.length > 0) {
          found.push({
            target: 'document',
            eventType,
            count: handlers.length,
            handlers: handlers.map(h => ({
              listener: h.listener?.name || 'anonymous',
              useCapture: h.useCapture
            }))
          });
        }
      });

      // Escanear listeners no window
      const winListeners = getEventListeners?.(window) || {};
      Object.entries(winListeners).forEach(([eventType, handlers]) => {
        if (handlers.length > 0) {
          found.push({
            target: 'window',
            eventType,
            count: handlers.length,
            handlers: handlers.map(h => ({
              listener: h.listener?.name || 'anonymous',
              useCapture: h.useCapture
            }))
          });
        }
      });

      // Escanear inputs ativos
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach((input, idx) => {
        const inputListeners = getEventListeners?.(input) || {};
        const relevantEvents = ['input', 'change', 'keydown', 'keyup', 'mousedown', 'click'];
        relevantEvents.forEach(eventType => {
          if (inputListeners[eventType]?.length > 0) {
            found.push({
              target: `input#${input.id || idx}`,
              eventType,
              count: inputListeners[eventType].length,
              handlers: inputListeners[eventType].map(h => ({
                listener: h.listener?.name || 'anonymous',
                useCapture: h.useCapture
              }))
            });
          }
        });
      });

    } catch (error) {
      found.push({
        target: 'ERROR',
        eventType: 'scan',
        count: 0,
        error: error.message,
        note: 'getEventListeners() não disponível. Abra DevTools para usar esta função.'
      });
    }

    setListeners(found);
    setScanning(false);
  };

  useEffect(() => {
    escanearListeners();
  }, []);

  const listenersProblematicos = listeners.filter(l => 
    (l.eventType === 'input' || l.eventType === 'change') && 
    l.target !== 'document' && 
    l.target !== 'window' &&
    l.count > 2 // Mais de 2 listeners no mesmo input pode indicar problema
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Validador de Event Listeners
          </div>
          <Button variant="outline" size="sm" onClick={escanearListeners} disabled={scanning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            Reescanear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {listenersProblematicos.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold text-red-900 mb-2">
              ⚠️ {listenersProblematicos.length} listener(s) problemático(s) detectado(s)
            </p>
            {listenersProblematicos.map((l, idx) => (
              <div key={idx} className="text-sm text-red-700 ml-4">
                • {l.target} ({l.eventType}): {l.count} handlers
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-auto">
          {listeners.map((l, idx) => (
            <Card key={idx} className="bg-slate-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{l.target}</Badge>
                    <Badge className="bg-blue-100 text-blue-700">{l.eventType}</Badge>
                  </div>
                  <Badge>{l.count} handler(s)</Badge>
                </div>
                {l.error && (
                  <p className="text-xs text-red-600 mt-2">{l.error}</p>
                )}
                {l.note && (
                  <p className="text-xs text-amber-600 mt-2">{l.note}</p>
                )}
                {l.handlers && (
                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    {l.handlers.map((h, hidx) => (
                      <div key={hidx} className="ml-4">
                        → {h.listener} {h.useCapture ? '(capture)' : '(bubble)'}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {listeners.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>Nenhum listener detectado. Clique em "Reescanear".</p>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 mb-1">💡 Como usar:</p>
          <ol className="text-blue-700 space-y-1 ml-4">
            <li>1. Abra as DevTools do navegador (F12)</li>
            <li>2. Clique em "Reescanear" para obter dados completos</li>
            <li>3. Listeners problemáticos aparecem em vermelho no topo</li>
            <li>4. Investigue handlers anônimos ou em excesso em inputs</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}