import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Bolt,
  ShieldCheck,
  Eye,
  Users,
  TrendingUp,
  CheckCircle,
  Download
} from "lucide-react";
import { toast } from "sonner";

const TEMPLATES_PREDEFINIDOS = [
  {
    id: "vendedor_basico",
    nome: "Vendedor Básico",
    icone: Users,
    cor: "blue",
    descricao: "Acesso a pedidos, clientes e orçamentos",
    nivel: "Operacional",
    permissoes: {
      comercial: {
        clientes: ["visualizar", "criar", "editar"],
        pedidos: ["visualizar", "criar", "editar"],
        orcamentos: ["visualizar", "criar", "editar"]
      },
      cadastros: {
        pessoas: ["visualizar"]
      }
    }
  },
  {
    id: "vendedor_senior",
    nome: "Vendedor Sênior",
    icone: TrendingUp,
    cor: "green",
    descricao: "Vendedor com permissões de aprovação",
    nivel: "Gerencial",
    permissoes: {
      comercial: {
        clientes: ["visualizar", "criar", "editar"],
        pedidos: ["visualizar", "criar", "editar", "aprovar"],
        orcamentos: ["visualizar", "criar", "editar", "aprovar"],
        tabelas_preco: ["visualizar", "editar"],
        comissoes: ["visualizar"]
      },
      financeiro: {
        contas_receber: ["visualizar"]
      },
      cadastros: {
        pessoas: ["visualizar", "criar"]
      }
    }
  },
  {
    id: "gerente_comercial",
    nome: "Gerente Comercial",
    icone: ShieldCheck,
    cor: "purple",
    descricao: "Controle total do comercial",
    nivel: "Gerencial",
    permissoes: {
      comercial: {
        clientes: ["visualizar", "criar", "editar", "excluir", "aprovar"],
        pedidos: ["visualizar", "criar", "editar", "excluir", "aprovar"],
        orcamentos: ["visualizar", "criar", "editar", "excluir", "aprovar"],
        tabelas_preco: ["visualizar", "criar", "editar", "aprovar"],
        comissoes: ["visualizar", "criar", "editar", "aprovar"],
        notas_fiscais: ["visualizar"]
      },
      financeiro: {
        contas_receber: ["visualizar", "exportar"]
      },
      relatorios: {
        dashboards: ["visualizar", "exportar"],
        relatorios: ["visualizar", "exportar"]
      }
    }
  },
  {
    id: "financeiro_analitico",
    nome: "Financeiro Analítico",
    icone: Eye,
    cor: "emerald",
    descricao: "Consulta financeira sem alterações",
    nivel: "Consulta",
    permissoes: {
      financeiro: {
        contas_receber: ["visualizar", "exportar"],
        contas_pagar: ["visualizar", "exportar"],
        caixa: ["visualizar"],
        conciliacao: ["visualizar"],
        relatorios: ["visualizar", "exportar"]
      },
      relatorios: {
        dashboards: ["visualizar"],
        relatorios: ["visualizar", "exportar"]
      }
    }
  },
  {
    id: "assistente_financeiro",
    nome: "Assistente Financeiro",
    icone: Bolt,
    cor: "yellow",
    descricao: "Operacional financeiro",
    nivel: "Operacional",
    permissoes: {
      financeiro: {
        contas_receber: ["visualizar", "criar", "editar"],
        contas_pagar: ["visualizar", "criar"],
        caixa: ["visualizar", "criar"]
      },
      cadastros: {
        financeiro: ["visualizar"]
      }
    }
  },
  {
    id: "gerente_financeiro",
    nome: "Gerente Financeiro",
    icone: ShieldCheck,
    cor: "indigo",
    descricao: "Controle total financeiro com aprovações",
    nivel: "Gerencial",
    permissoes: {
      financeiro: {
        contas_receber: ["visualizar", "criar", "editar", "aprovar", "exportar"],
        contas_pagar: ["visualizar", "criar", "editar", "aprovar", "exportar"],
        caixa: ["visualizar", "criar", "editar", "aprovar"],
        conciliacao: ["visualizar", "criar", "editar", "aprovar"],
        relatorios: ["visualizar", "criar", "exportar"]
      },
      relatorios: {
        dashboards: ["visualizar", "exportar"],
        relatorios: ["visualizar", "exportar"],
        exportacao: ["visualizar", "criar"]
      }
    }
  },
  {
    id: "estoquista",
    nome: "Estoquista",
    icone: Users,
    cor: "purple",
    descricao: "Controle operacional de estoque",
    nivel: "Operacional",
    permissoes: {
      estoque: {
        produtos: ["visualizar"],
        movimentacoes: ["visualizar", "criar", "editar"],
        inventario: ["visualizar", "criar"],
        requisicoes: ["visualizar", "criar"]
      },
      cadastros: {
        produtos: ["visualizar"]
      }
    }
  },
  {
    id: "comprador",
    nome: "Comprador",
    icone: Users,
    cor: "orange",
    descricao: "Gestão de compras e fornecedores",
    nivel: "Operacional",
    permissoes: {
      compras: {
        fornecedores: ["visualizar", "criar", "editar"],
        solicitacoes: ["visualizar", "criar", "editar"],
        cotacoes: ["visualizar", "criar", "editar"],
        ordens_compra: ["visualizar", "criar", "editar"]
      },
      cadastros: {
        pessoas: ["visualizar"]
      }
    }
  },
  {
    id: "operador_producao",
    nome: "Operador de Produção",
    icone: Users,
    cor: "cyan",
    descricao: "Apontamento de produção",
    nivel: "Operacional",
    permissoes: {
      producao: {
        ordens_producao: ["visualizar"],
        apontamentos: ["visualizar", "criar"],
        qualidade: ["visualizar"]
      }
    }
  },
  {
    id: "atendente_chatbot",
    nome: "Atendente Chatbot",
    icone: Users,
    cor: "green",
    descricao: "Atendimento omnicanal",
    nivel: "Operacional",
    permissoes: {
      chatbot: {
        atendimento: ["visualizar", "criar", "editar"],
        configuracoes: ["visualizar"],
        analytics: ["visualizar"]
      },
      comercial: {
        clientes: ["visualizar"],
        pedidos: ["visualizar", "criar"]
      }
    }
  }
];

export default function TemplatesPerfilInteligente({ onAplicarTemplate }) {
  const [templateSelecionado, setTemplateSelecionado] = useState(null);

  const aplicarTemplate = (template) => {
    if (onAplicarTemplate) {
      onAplicarTemplate({
        nome_perfil: template.nome,
        descricao: template.descricao,
        nivel_perfil: template.nivel,
        permissoes: template.permissoes,
        ativo: true
      });
      toast.success(`Template "${template.nome}" aplicado!`);
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Templates Inteligentes de Perfis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES_PREDEFINIDOS.map(template => {
              const Icone = template.icone;
              const totalPermissoes = Object.values(template.permissoes).reduce(
                (acc, mod) => acc + Object.values(mod).reduce((sum, arr) => sum + arr.length, 0),
                0
              );

              return (
                <div
                  key={template.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    templateSelecionado?.id === template.id
                      ? `border-${template.cor}-400 bg-${template.cor}-50`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setTemplateSelecionado(template)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-${template.cor}-100 flex items-center justify-center`}>
                      <Icone className={`w-5 h-5 text-${template.cor}-600`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{template.nome}</p>
                      <Badge variant="outline" className="text-xs">
                        {template.nivel}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">{template.descricao}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {totalPermissoes} permissões
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        aplicarTemplate(template);
                      }}
                      className={`bg-${template.cor}-600 hover:bg-${template.cor}-700 h-7 text-xs`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Usar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {templateSelecionado && (
          <div className="mt-4 p-4 border rounded-lg bg-blue-50">
            <p className="text-sm font-medium mb-2">Módulos incluídos:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(templateSelecionado.permissoes).map(mod => (
                <Badge key={mod} variant="outline" className="capitalize">
                  {mod}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}