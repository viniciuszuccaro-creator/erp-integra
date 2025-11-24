import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

/**
 * V21.5 - Chatbot Portal (REFATORADO)
 * 
 * Agora utiliza ChatbotWidget como base, mantendo
 * compatibilidade com o Portal do Cliente
 * 
 * ✅ Unificado com ChatbotWidget
 * ✅ IA contextual com dados do cliente
 * ✅ Interface moderna
 * ✅ Auto-scroll e minimização
 * ✅ Conhecimento completo do sistema
 */
export default function ChatbotPortal({ onClose, isMinimized, onToggleMinimize }) {
  const [clienteId, setClienteId] = useState(null);

  // Buscar cliente autenticado
  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const user = await base44.auth.me();
        // Buscar cliente pelo email do usuário
        const clientes = await base44.entities.Cliente.filter({ 
          'contatos.valor': user.email 
        });
        if (clientes.length > 0) {
          setClienteId(clientes[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
      }
    };
    
    fetchCliente();
  }, []);

  if (isMinimized) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-4 right-4 w-full max-w-md h-[600px] z-50 mx-4 sm:mx-0"
    >
      {/* Header customizado para Portal */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-t-lg flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Assistente Virtual</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={onToggleMinimize}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ChatbotWidget integrado */}
      <div className="pt-14 h-full">
        <ChatbotWidget 
          clienteId={clienteId}
          canal="Portal"
          exibirBotaoFlutuante={false}
          configuracoes={{
            mensagemBoasVindas: 'Olá! 👋 Sou seu assistente virtual inteligente do Portal. Posso ajudá-lo com pedidos, rastreamento, boletos, orçamentos e muito mais. Como posso ajudar?'
          }}
        />
      </div>
    </motion.div>
  );
}