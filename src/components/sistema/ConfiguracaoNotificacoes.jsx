import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Mail, 
  MessageCircle, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { REGRAS_PADRAO } from './MotorNotificacoes';

export default function ConfiguracaoNotificacoes({ empresaId }) {
  const { toast } = useToast();
  const [salvando, setSalvando] = useState(false);
  const [regras, setRegras] = useState(REGRAS_PADRAO);

  const toggleRegra = (id) => {
    setRegras(prev => {
      const novasRegras = { ...prev };
      novasRegras[id] = {
        ...novasRegras[id],
        ativo: !novasRegras[id].ativo
      };
      return novasRegras;
    });
  };

  const toggleCanal = (id, canal) => {
    setRegras(prev => {
      const novasRegras = { ...prev };
      const canaisAtuais = novasRegras[id].canais;
      const novosCanais = canaisAtuais.includes(canal)
        ? canaisAtuais.filter(c => c !== canal)
        : [...canaisAtuais, canal];
      
      novasRegras[id] = {
        ...novasRegras[id],
        canais: novosCanais
      };
      return novasRegras;
    });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await base44.entities.ConfiguracaoSistema.create({
        chave: `notificacoes_${empresaId}`,
        categoria: 'Integracoes',
        configuracoes_sistema: {
          regras: regras,
          ativo: true,
          ultima_atualizacao: new Date().toISOString()
        }
      });
      
      toast({
        title: '✅ Configurações Salvas!',
        description: 'Regras de notificação atualizadas com sucesso'
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSalvando(false);
    }
  };

  const agruparPorModulo = () => {
    const grupos = {};
    Object.values(regras).forEach(regra => {
      if (!grupos[regra.modulo]) {
        grupos[regra.modulo] = [];
      }
      grupos[regra.modulo].push(regra);
    });
    return grupos;
  };

  const gruposRegras = agruparPorModulo();

  const getPrioridadeColor = (prioridade) => {
    const cores = {
      'Baixa': 'bg-blue-100 text-blue-700',
      'Normal': 'bg-slate-100 text-slate-700',
      'Alta': 'bg-orange-100 text-orange-700',
      'Urgente': 'bg-red-100 text-red-700'
    };
    return cores[prioridade] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <Alert className="border-blue-300 bg-blue-50">
        <Bell className="w-5 h-5 text-blue-600" />
        <AlertDescription>
          <p className="font-semibold text-blue-900 mb-1">
            🔔 Sistema de Notificações Automáticas
          </p>
          <p className="text-sm text-blue-800">
            Configure regras para envio automático de <strong>Email</strong> e <strong>WhatsApp</strong> 
            baseado em eventos do sistema.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de Regras</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.keys(regras).length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Regras Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(regras).filter(r => r.ativo).length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Com Email</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Object.values(regras).filter(r => r.canais.includes('email')).length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Com WhatsApp</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {Object.values(regras).filter(r => r.canais.includes('whatsapp')).length}
                </p>
              </div>
              <MessageCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.entries(gruposRegras).map(([modulo, regrasModulo]) => (
        <Card key={modulo} className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">{modulo}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {regrasModulo.map((regra) => (
                <div key={regra.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Switch
                          checked={regra.ativo}
                          onCheckedChange={() => toggleRegra(regra.id)}
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{regra.nome}</p>
                          <p className="text-sm text-slate-600">{regra.descricao}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge className={getPrioridadeColor(regra.prioridade)}>
                          {regra.prioridade}
                        </Badge>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => toggleCanal(regra.id, 'email')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                              regra.canais.includes('email')
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </button>
                          
                          <button
                            onClick={() => toggleCanal(regra.id, 'whatsapp')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                              regra.canais.includes('whatsapp')
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </button>
                          
                          <button
                            onClick={() => toggleCanal(regra.id, 'sistema')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                              regra.canais.includes('sistema')
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            <Bell className="w-3 h-3" />
                            Sistema
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {regra.ativo ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Restaurar Padrões
        </Button>
        <Button
          onClick={handleSalvar}
          disabled={salvando}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {salvando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Como Funcionam as Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-slate-900 mb-2">🎯 Gatilhos Automáticos</p>
              <p className="text-sm text-slate-600">
                As notificações são disparadas automaticamente quando eventos ocorrem no sistema.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">📨 Canais Disponíveis</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li><strong>Email:</strong> Envia email formatado com templates profissionais</li>
                <li><strong>WhatsApp:</strong> Envia mensagem via WhatsApp Business</li>
                <li><strong>Sistema:</strong> Cria notificação no painel de notificações</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">⚙️ Pré-requisitos</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Configure Email em: Integrações → Status Integrações</li>
                <li>Configure WhatsApp em: Integrações → WhatsApp Business</li>
                <li>Cliente deve ter email/telefone cadastrado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}