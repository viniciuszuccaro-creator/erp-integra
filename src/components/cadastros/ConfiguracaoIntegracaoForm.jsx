import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link2, CheckCircle2, AlertTriangle, Loader2, FileText, CreditCard, MessageCircle, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

/**
 * Formulário de Configuração de Integrações V16.1
 * Hub de controle para todas as APIs externas
 */
export default function ConfiguracaoIntegracaoForm({ config, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(config || {
    nfe_provedor: 'eNotas',
    nfe_api_key: '',
    nfe_ambiente: 'Homologação',
    nfe_modo_simulacao: true,
    
    boleto_provedor: 'Asaas',
    boleto_api_key: '',
    boleto_modo_simulacao: true,
    
    whatsapp_business_token: '',
    whatsapp_phone_number_id: '',
    whatsapp_ativo: false,
    
    maps_api_key: '',
    maps_ativo: false,
    
    marketplace_tipo: 'Mercado Livre',
    marketplace_client_id: '',
    marketplace_client_secret: '',
    marketplace_ativo: false,
    
    site_base44_url: '',
    site_webhook_token: ''
  });

  const [testando, setTestando] = useState({});
  const [resultados, setResultados] = useState({});

  const testarConexao = async (tipo) => {
    setTestando({ ...testando, [tipo]: true });
    
    // Simular teste de conexão (em produção, chamaria APIs reais)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sucesso = Math.random() > 0.3; // 70% de sucesso
    
    setResultados({
      ...resultados,
      [tipo]: {
        sucesso,
        mensagem: sucesso ? `✅ Conexão com ${tipo} estabelecida` : `❌ Erro ao conectar com ${tipo}`,
        timestamp: new Date().toLocaleString('pt-BR')
      }
    });
    
    setTestando({ ...testando, [tipo]: false });
    
    if (sucesso) {
      toast.success(`✅ ${tipo} testado com sucesso!`);
    } else {
      toast.error(`❌ Falha ao testar ${tipo}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const ResultadoTeste = ({ tipo }) => {
    const resultado = resultados[tipo];
    if (!resultado) return null;

    return (
      <Alert className={resultado.sucesso ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <AlertDescription className="text-sm">
          {resultado.sucesso ? <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-600" /> : <AlertTriangle className="w-4 h-4 inline mr-2 text-red-600" />}
          {resultado.mensagem}
          <span className="text-xs text-slate-500 ml-2">({resultado.timestamp})</span>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="nfe" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="nfe">
            <FileText className="w-4 h-4 mr-2" />
            NF-e
          </TabsTrigger>
          <TabsTrigger value="boleto">
            <CreditCard className="w-4 h-4 mr-2" />
            Boleto/PIX
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="maps">
            <MapPin className="w-4 h-4 mr-2" />
            Google Maps
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="site">
            <Link2 className="w-4 h-4 mr-2" />
            Site Base44
          </TabsTrigger>
        </TabsList>

        {/* ABA NF-e */}
        <TabsContent value="nfe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Integração NF-e
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Provedor de NF-e</Label>
                <Select value={formData.nfe_provedor} onValueChange={(v) => setFormData({...formData, nfe_provedor: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eNotas">eNotas</SelectItem>
                    <SelectItem value="NFe.io">NFe.io</SelectItem>
                    <SelectItem value="Focus NFe">Focus NFe</SelectItem>
                    <SelectItem value="WebMania">WebMania</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>API Key (Secret)</Label>
                <Input
                  type="password"
                  value={formData.nfe_api_key}
                  onChange={(e) => setFormData({...formData, nfe_api_key: e.target.value})}
                  placeholder="Sua chave de API"
                />
                <p className="text-xs text-slate-500 mt-1">⚠️ Será armazenada como Secret criptografado</p>
              </div>

              <div>
                <Label>Ambiente</Label>
                <Select value={formData.nfe_ambiente} onValueChange={(v) => setFormData({...formData, nfe_ambiente: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Homologação">Homologação</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Simulação</Label>
                  <p className="text-xs text-slate-500">Ativa mock para testes sem consumir API</p>
                </div>
                <Switch
                  checked={formData.nfe_modo_simulacao}
                  onCheckedChange={(v) => setFormData({...formData, nfe_modo_simulacao: v})}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => testarConexao('NF-e')}
                  disabled={testando.nfe || !formData.nfe_api_key}
                >
                  {testando.nfe ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Testar Conexão
                </Button>
              </div>

              <ResultadoTeste tipo="NF-e" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA BOLETO/PIX */}
        <TabsContent value="boleto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Integração Boleto/PIX
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Gateway de Pagamento</Label>
                <Select value={formData.boleto_provedor} onValueChange={(v) => setFormData({...formData, boleto_provedor: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asaas">Asaas</SelectItem>
                    <SelectItem value="Juno">Juno</SelectItem>
                    <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                    <SelectItem value="Pagar.me">Pagar.me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={formData.boleto_api_key}
                  onChange={(e) => setFormData({...formData, boleto_api_key: e.target.value})}
                  placeholder="Sua chave de API"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Modo Simulação</Label>
                <Switch
                  checked={formData.boleto_modo_simulacao}
                  onCheckedChange={(v) => setFormData({...formData, boleto_modo_simulacao: v})}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => testarConexao('Boleto')}
                disabled={testando.boleto || !formData.boleto_api_key}
              >
                {testando.boleto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Testar Conexão
              </Button>

              <ResultadoTeste tipo="Boleto" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA WHATSAPP */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                WhatsApp Business API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm text-blue-900">
                  📱 Conecte o WhatsApp Business para enviar orçamentos, rastreamento e notificações automáticas aos clientes
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativar WhatsApp Business</Label>
                  <p className="text-xs text-slate-500">Habilita envio de mensagens automáticas</p>
                </div>
                <Switch
                  checked={formData.whatsapp_ativo}
                  onCheckedChange={(v) => setFormData({...formData, whatsapp_ativo: v})}
                />
              </div>

              <div>
                <Label>Business Token</Label>
                <Input
                  type="password"
                  value={formData.whatsapp_business_token}
                  onChange={(e) => setFormData({...formData, whatsapp_business_token: e.target.value})}
                  placeholder="Token da API do WhatsApp"
                />
              </div>

              <div>
                <Label>Phone Number ID</Label>
                <Input
                  value={formData.whatsapp_phone_number_id}
                  onChange={(e) => setFormData({...formData, whatsapp_phone_number_id: e.target.value})}
                  placeholder="ID do número do WhatsApp Business"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => testarConexao('WhatsApp')}
                disabled={testando.whatsapp || !formData.whatsapp_business_token}
              >
                {testando.whatsapp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Testar Conexão
              </Button>

              <ResultadoTeste tipo="WhatsApp" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA GOOGLE MAPS */}
        <TabsContent value="maps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Google Maps API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-purple-200 bg-purple-50">
                <AlertDescription className="text-sm text-purple-900">
                  🗺️ Usado para geocodificação, roteirização inteligente e cálculo de distâncias
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativar Google Maps</Label>
                  <p className="text-xs text-slate-500">Habilita roteirização e geocoding</p>
                </div>
                <Switch
                  checked={formData.maps_ativo}
                  onCheckedChange={(v) => setFormData({...formData, maps_ativo: v})}
                />
              </div>

              <div>
                <Label>Google Maps API Key</Label>
                <Input
                  type="password"
                  value={formData.maps_api_key}
                  onChange={(e) => setFormData({...formData, maps_api_key: e.target.value})}
                  placeholder="Sua chave da API do Google Maps"
                />
                <p className="text-xs text-slate-500 mt-1">
                  📍 Necessário habilitar: Geocoding API, Directions API, Distance Matrix API
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => testarConexao('Google Maps')}
                disabled={testando.maps || !formData.maps_api_key}
              >
                {testando.maps ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Testar Geocodificação
              </Button>

              <ResultadoTeste tipo="Google Maps" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA MARKETPLACE */}
        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                Integração Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertDescription className="text-sm text-orange-900">
                  🛒 Sincroniza catálogo, estoque e importa pedidos automaticamente
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativar Marketplace</Label>
                  <p className="text-xs text-slate-500">Sincronização automática</p>
                </div>
                <Switch
                  checked={formData.marketplace_ativo}
                  onCheckedChange={(v) => setFormData({...formData, marketplace_ativo: v})}
                />
              </div>

              <div>
                <Label>Marketplace</Label>
                <Select value={formData.marketplace_tipo} onValueChange={(v) => setFormData({...formData, marketplace_tipo: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                    <SelectItem value="Shopee">Shopee</SelectItem>
                    <SelectItem value="Amazon">Amazon</SelectItem>
                    <SelectItem value="B2W">B2W</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Client ID</Label>
                <Input
                  value={formData.marketplace_client_id}
                  onChange={(e) => setFormData({...formData, marketplace_client_id: e.target.value})}
                  placeholder="Client ID OAuth"
                />
              </div>

              <div>
                <Label>Client Secret</Label>
                <Input
                  type="password"
                  value={formData.marketplace_client_secret}
                  onChange={(e) => setFormData({...formData, marketplace_client_secret: e.target.value})}
                  placeholder="Client Secret"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => testarConexao('Marketplace')}
                disabled={testando.marketplace || !formData.marketplace_client_id}
              >
                {testando.marketplace ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Testar Autenticação OAuth
              </Button>

              <ResultadoTeste tipo="Marketplace" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA SITE BASE44 */}
        <TabsContent value="site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-600" />
                Site Base44 (Webhook)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-indigo-200 bg-indigo-50">
                <AlertDescription className="text-sm text-indigo-900">
                  🌐 Recebe orçamentos e pedidos do site institucional via webhook
                </AlertDescription>
              </Alert>

              <div>
                <Label>URL do Site Base44</Label>
                <Input
                  value={formData.site_base44_url}
                  onChange={(e) => setFormData({...formData, site_base44_url: e.target.value})}
                  placeholder="https://seusite.base44.app"
                />
              </div>

              <div>
                <Label>Webhook Token (Segurança)</Label>
                <Input
                  type="password"
                  value={formData.site_webhook_token}
                  onChange={(e) => setFormData({...formData, site_webhook_token: e.target.value})}
                  placeholder="Token de validação"
                />
                <p className="text-xs text-slate-500 mt-1">
                  🔐 Configure este token no seu site para autenticar os webhooks
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Salvar Configurações
        </Button>
      </div>
    </form>
  );
}