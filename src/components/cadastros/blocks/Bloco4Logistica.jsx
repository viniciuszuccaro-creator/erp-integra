import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { Truck, MapPin, Package, FileText, User, Settings } from "lucide-react";
import AppEntregasMotorista from "@/components/mobile/AppEntregasMotorista";

import VeiculoForm from "@/components/cadastros/VeiculoForm";
import MotoristaForm from "@/components/cadastros/MotoristaForm";
import TipoFreteForm from "@/components/cadastros/TipoFreteForm";
import LocalEstoqueForm from "@/components/cadastros/LocalEstoqueForm";
import RotaPadraoForm from "@/components/cadastros/RotaPadraoForm";
import ModeloDocumentoForm from "@/components/cadastros/ModeloDocumentoForm";

export default function Bloco4Logistica() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const openList = (entidade, titulo, Icon, campos, FormComp) => () => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });

  const tiles = [
    { k: 'Veiculo', t: 'Veículos', i: Truck, c: ['placa','modelo','capacidade_kg','ativo'], f: VeiculoForm },
    { k: 'Motorista', t: 'Motoristas', i: User, c: ['nome','cnh_categoria','cnh_validade','telefone'], f: MotoristaForm },
    { k: 'TipoFrete', t: 'Tipos de Frete', i: Settings, c: ['descricao','modalidade'], f: TipoFreteForm },
    { k: 'LocalEstoque', t: 'Locais de Estoque', i: Package, c: ['descricao','codigo','endereco'], f: LocalEstoqueForm },
    { k: 'RotaPadrao', t: 'Rotas Padrão', i: MapPin, c: ['nome_rota','regiao','prazo_dias'], f: RotaPadraoForm },
    { k: 'ModeloDocumento', t: 'Modelos de Documento Logístico', i: FileText, c: ['tipo','descricao'], f: ModeloDocumentoForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {tiles.map(({ k, t, i: Icon, c, f: FormComp }) => (
        <Card key={k} className="hover:shadow-lg transition-all">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="w-5 h-5 text-slate-600"/> {t}
              </CardTitle>
              <div className="flex items-center gap-2">
                {k === 'Motorista' && (
                  <Button variant="outline" size="sm" onClick={() => openWindow(AppEntregasMotorista, {}, { title: 'App Motorista', width: 420, height: 800 })}>
                    App Motorista
                  </Button>
                )}
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openList(k, t, Icon, c, FormComp)} disabled={!hasPermission('expedicao','ver')}>
                  Abrir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-sm text-slate-600">Gerencie {t} em janelas redimensionáveis.</CardContent>
        </Card>
      ))}
    </div>
  );
}