import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Widget de Status de Conexão Tempo Real
 * Mostra status da auto-atualização
 */
export default function WidgetRealtimeStatus({ 
  isConnected = true, 
  lastUpdate = null,
  updateInterval = 10000,
  dataSource = 'Sistema'
}) {
  const ultimaAtualizacao = lastUpdate 
    ? new Date(lastUpdate).toLocaleTimeString('pt-BR')
    : 'Aguardando...';

  const segundosAteProxima = updateInterval / 1000;

  return (
    <Card className={`border-2 ${isConnected ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isConnected ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {isConnected ? (
              <Wifi className="w-6 h-6 text-green-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600" />
            )}
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-sm ${isConnected ? 'text-green-900' : 'text-red-900'}`}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
              {isConnected && (
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Última: {ultimaAtualizacao}
            </p>
            <p className="text-xs text-slate-500">
              Atualiza a cada {segundosAteProxima}s
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}