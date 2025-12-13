import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShoppingCart, DollarSign, Package, Truck, Eye, UserCircle } from "lucide-react";

/**
 * 🤖 TEMPLATES INTELIGENTES DE PERFIS V21.7
 * 
 * Templates pré-configurados com permissões ideais para cada função
 * Baseado em melhores práticas de segregação de funções
 */

export const TEMPLATES_PERFIS = {
  vendedor: {
    nome: "Vendedor",
    descricao: "Vendedor com acesso a clientes, pedidos e comissões",
    nivel: "Operacional",
    icone: ShoppingCart,
    cor: "green",
    permissoes: {
      dashboard: {
        principal: ["visualizar"]
      },
      comercial: {
        clientes: ["visualizar", "criar", "editar"],
        pedidos: ["visualizar", "criar", "editar"],
        orcamentos: ["visualizar", "criar", "editar"],
        comissoes: ["visualizar"]
      },
      cadastros_gerais: {
        clientes: ["visualizar", "criar", "editar"],
        produtos: ["visualizar"]
      },
      crm: {
        oportunidades: ["visualizar", "criar", "editar"],
        interacoes: ["visualizar", "criar"]
      }
    }
  },
  gerente_vendas: {
    nome: "Gerente de Vendas",
    descricao: "Gerente com aprovação de pedidos e descontos",
    nivel: "Gerencial",
    icone: ShoppingCart,
    cor: "blue",
    permissoes: {
      dashboard: {
        principal: ["visualizar"],
        corporativo: ["visualizar"]
      },
      comercial: {
        clientes: ["visualizar", "criar", "editar", "excluir"],
        pedidos: ["visualizar", "criar", "editar", "aprovar", "exportar"],
        orcamentos: ["visualizar", "criar", "editar", "aprovar"],
        tabelas_preco: ["visualizar", "criar", "editar"],
        comissoes: ["visualizar", "criar", "editar", "aprovar"],
        notas_fiscais: ["visualizar"]
      },
      relatorios: {
        dashboards: ["visualizar"],
        relatorios: ["visualizar", "exportar"]
      }
    }
  },
  financeiro: {
    nome: "Analista Financeiro",
    descricao: "Analista com controle de contas sem aprovação",
    nivel: "Operacional",
    icone: DollarSign,
    cor: "emerald",
    permissoes: {
      dashboard: {
        principal: ["visualizar"]
      },
      financeiro: {
        contas_receber: ["visualizar", "criar", "editar"],
        contas_pagar: ["visualizar", "criar", "editar"],
        caixa: ["visualizar"],
        conciliacao: ["visualizar"],
        relatorios: ["visualizar", "exportar"]
      },
      cadastros_gerais: {
        clientes: ["visualizar"],
        fornecedores: ["visualizar"]
      }
    }
  },
  gerente_financeiro: {
    nome: "Gerente Financeiro",
    descricao: "Gerente com aprovação de pagamentos",
    nivel: "Gerencial",
    icone: DollarSign,
    cor: "indigo",
    permissoes: {
      dashboard: {
        principal: ["visualizar"],
        corporativo: ["visualizar"]
      },
      financeiro: {
        contas_receber: ["visualizar", "editar", "aprovar", "exportar"],
        contas_pagar: ["visualizar", "editar", "aprovar", "exportar"],
        caixa: ["visualizar", "editar", "aprovar"],
        conciliacao: ["visualizar", "criar", "editar"],
        relatorios: ["visualizar", "exportar"]
      },
      relatorios: {
        dashboards: ["visualizar"],
        relatorios: ["visualizar", "exportar"]
      }
    }
  },
  almoxarife: {
    nome: "Almoxarife",
    descricao: "Controle de estoque e movimentações",
    nivel: "Operacional",
    icone: Package,
    cor: "purple",
    permissoes: {
      dashboard: {
        principal: ["visualizar"]
      },
      estoque: {
        produtos: ["visualizar", "editar"],
        movimentacoes: ["visualizar", "criar", "editar"],
        inventario: ["visualizar", "criar"],
        requisicoes: ["visualizar", "criar"]
      },
      compras: {
        solicitacoes: ["visualizar", "criar"]
      },
      cadastros_gerais: {
        produtos: ["visualizar"]
      }
    }
  },
  motorista: {
    nome: "Motorista",
    descricao: "Acesso a entregas e rastreamento",
    nivel: "Operacional",
    icone: Truck,
    cor: "cyan",
    permissoes: {
      expedicao: {
        entregas: ["visualizar", "editar"],
        romaneios: ["visualizar"],
        roteirizacao: ["visualizar"]
      }
    }
  },
  consultor: {
    nome: "Consultor (Somente Leitura)",
    descricao: "Acesso completo apenas para visualização",
    nivel: "Consulta",
    icone: Eye,
    cor: "slate",
    permissoes: {
      dashboard: { principal: ["visualizar"], corporativo: ["visualizar"] },
      comercial: {
        clientes: ["visualizar"],
        pedidos: ["visualizar"],
        orcamentos: ["visualizar"],
        tabelas_preco: ["visualizar"],
        comissoes: ["visualizar"],
        notas_fiscais: ["visualizar"]
      },
      financeiro: {
        contas_receber: ["visualizar"],
        contas_pagar: ["visualizar"],
        caixa: ["visualizar"],
        conciliacao: ["visualizar"],
        relatorios: ["visualizar", "exportar"]
      },
      estoque: {
        produtos: ["visualizar"],
        movimentacoes: ["visualizar"],
        inventario: ["visualizar"],
        requisicoes: ["visualizar"]
      },
      relatorios: {
        dashboards: ["visualizar"],
        relatorios: ["visualizar", "exportar"]
      }
    }
  },
  operador_producao: {
    nome: "Operador de Produção",
    descricao: "Apontamentos e controle de produção",
    nivel: "Operacional",
    icone: UserCircle,
    cor: "indigo",
    permissoes: {
      producao: {
        ordens_producao: ["visualizar"],
        apontamentos: ["visualizar", "criar", "editar"],
        qualidade: ["visualizar", "criar"]
      }
    }
  }
};

export default function TemplatesPerfisInteligentes({ onSelecionarTemplate }) {
  return (
    <div className="space-y-4">
      <Alert className="border-blue-300 bg-blue-50">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Templates Inteligentes:</strong> Perfis pré-configurados com as melhores práticas de segurança
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(TEMPLATES_PERFIS).map(([id, template]) => {
          const Icone = template.icone;
          const totalPermissoes = Object.values(template.permissoes).reduce((sum, mod) => {
            return sum + Object.values(mod || {}).reduce((s, sec) => s + (sec?.length || 0), 0);
          }, 0);

          return (
            <Card key={id} className="hover:shadow-lg transition-all border-2">
              <CardHeader className={`bg-${template.cor}-50 border-b pb-3`}>
                <div className="flex items-center gap-2">
                  <Icone className={`w-5 h-5 text-${template.cor}-600`} />
                  <CardTitle className="text-sm">{template.nome}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-slate-600 mb-3">{template.descricao}</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{template.nivel}</Badge>
                  <Badge className="bg-blue-100 text-blue-700">
                    {totalPermissoes} permissões
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className={`w-full bg-${template.cor}-600 hover:bg-${template.cor}-700`}
                  onClick={() => onSelecionarTemplate(template)}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Usar Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}