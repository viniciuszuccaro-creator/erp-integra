import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Instagram, Send as TelegramIcon, Mail } from 'lucide-react';
import ChatbotWidgetAvancado from './ChatbotWidgetAvancado';

/**
 * V21.5 - CHATBOT MULTI-CANAL UNIFICADO
 * Container que permite trocar entre canais
 */
export default function ChatbotMulticanal({ clienteId, configuracoes = {} }) {
  const [canalAtivo, setCanalAtivo] = useState('Portal');

  const canais = [
    { id: 'Portal', nome: 'Portal', icone: MessageCircle, cor: 'text-blue-600' },
    { id: 'WhatsApp', nome: 'WhatsApp', icone: MessageCircle, cor: 'text-green-600' },
    { id: 'Instagram', nome: 'Instagram', icone: Instagram, cor: 'text-pink-600' },
    { id: 'Telegram', nome: 'Telegram', icone: TelegramIcon, cor: 'text-blue-500' },
    { id: 'Email', nome: 'Email', icone: Mail, cor: 'text-slate-600' }
  ];

  return (
    <div className="w-full h-full">
      <Tabs value={canalAtivo} onValueChange={setCanalAtivo} className="w-full h-full flex flex-col">
        <TabsList className="w-full justify-start bg-slate-100 p-1">
          {canais.map(canal => {
            const Icon = canal.icone;
            return (
              <TabsTrigger 
                key={canal.id} 
                value={canal.id}
                className="flex items-center gap-2"
              >
                <Icon className={`w-4 h-4 ${canal.cor}`} />
                {canal.nome}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {canais.map(canal => (
          <TabsContent key={canal.id} value={canal.id} className="flex-1">
            <ChatbotWidgetAvancado
              clienteId={clienteId}
              canal={canal.id}
              exibirBotaoFlutuante={false}
              configuracoes={configuracoes}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}