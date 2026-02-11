export default function useDashboardDerivedData({ pedidos = [], contasReceber = [], contasPagar = [], entregas = [], ordensProducao = [], colaboradores = [], clientes = [], produtos = [], periodo = "mes" }) {
  const filtrarPorPeriodo = (data) => {
    const hoje = new Date();
    const dataComparacao = new Date(data);

    if (periodo === "dia") {
      return dataComparacao.toDateString() === hoje.toDateString();
    } else if (periodo === "semana") {
      const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      return dataComparacao >= semanaAtras && dataComparacao <= hoje;
    } else if (periodo === "mes") {
      return (
        dataComparacao.getMonth() === hoje.getMonth() &&
        dataComparacao.getFullYear() === hoje.getFullYear()
      );
    } else if (periodo === "trimestre") {
      const trimestre = Math.floor(hoje.getMonth() / 3);
      const trimestreData = Math.floor(dataComparacao.getMonth() / 3);
      return trimestreData === trimestre && dataComparacao.getFullYear() === hoje.getFullYear();
    } else if (periodo === "ano") {
      return dataComparacao.getFullYear() === hoje.getFullYear();
    }
    return true;
  };

  // KPIs Principais
  const pedidosPeriodo = pedidos.filter((p) => p.data_pedido && filtrarPorPeriodo(p.data_pedido));
  const totalVendas = pedidosPeriodo
    .filter((p) => p.status !== "Cancelado")
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);

  const ticketMedio = pedidosPeriodo.length > 0 ? totalVendas / pedidosPeriodo.length : 0;

  const receitasPendentes = contasReceber
    .filter((c) => c.status === "Pendente")
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const despesasPendentes = contasPagar
    .filter((c) => c.status === "Pendente")
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const fluxoCaixa = receitasPendentes - despesasPendentes;

  const produtosBaixoEstoque = produtos.filter(
    (p) => p.estoque_atual <= p.estoque_minimo && p.status === "Ativo"
  ).length;

  const colaboradoresAtivos = colaboradores.filter((c) => c.status === "Ativo").length;
  const clientesAtivos = clientes.filter((c) => c.status === "Ativo").length;
  const taxaConversao = clientesAtivos > 0
    ? ((pedidosPeriodo.filter((p) => p.status !== "Cancelado").length / clientesAtivos) * 100).toFixed(1)
    : 0;

  const entregasPendentes = entregas.filter((e) => e.status !== "Entregue" && e.status !== "Devolvido").length;

  // OTD (On-Time Delivery)
  const entregasConcluidas = entregas.filter((e) => e.status === "Entregue" && e.data_entrega);
  const entregasNoPrazo = entregasConcluidas.filter((e) => {
    if (!e.data_previsao || !e.data_entrega) return false;
    return new Date(e.data_entrega) <= new Date(e.data_previsao);
  });
  const otd = entregasConcluidas.length > 0
    ? ((entregasNoPrazo.length / entregasConcluidas.length) * 100).toFixed(1)
    : 0;

  // Peso Produzido (kg)
  const opsConcluidas = ordensProducao.filter(
    (op) => op.status === "Concluída" && op.data_conclusao_real && filtrarPorPeriodo(op.data_conclusao_real)
  );
  const pesoProduzido = opsConcluidas.reduce((sum, op) => {
    return sum + ((op.quantidade_produzida || 0) * (op.peso_unitario_kg || 0));
  }, 0);

  // Aproveitamento de Barra (%)
  const totalPlanejado = ordensProducao
    .filter((op) => op.data_emissao && filtrarPorPeriodo(op.data_emissao))
    .reduce((sum, op) => sum + (op.quantidade_planejada || 0), 0);
  const totalProduzido = ordensProducao
    .filter((op) => op.data_emissao && filtrarPorPeriodo(op.data_emissao))
    .reduce((sum, op) => sum + (op.quantidade_produzida || 0), 0);
  const totalRefugado = ordensProducao
    .filter((op) => op.data_emissao && filtrarPorPeriodo(op.data_emissao))
    .reduce((sum, op) => sum + (op.quantidade_refugada || 0), 0);
  const aproveitamentoBarra = totalPlanejado > 0
    ? (((totalProduzido - totalRefugado) / totalPlanejado) * 100).toFixed(1)
    : 0;

  // Inadimplência (%)
  const contasVencidas = contasReceber.filter((c) => {
    if (c.status !== "Pendente" || !c.data_vencimento) return false;
    return new Date(c.data_vencimento) < new Date();
  });
  const valorVencido = contasVencidas.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalContas = contasReceber.filter((c) => c.status === "Pendente").reduce((sum, c) => sum + (c.valor || 0), 0);
  const taxaInadimplencia = totalContas > 0 ? ((valorVencido / totalContas) * 100).toFixed(1) : 0;

  // Dados para gráficos e listas
  const vendasPorStatus = pedidosPeriodo.reduce((acc, p) => {
    const status = p.status || "Indefinido";
    if (!acc[status]) acc[status] = { nome: status, valor: 0, quantidade: 0 };
    acc[status].valor += p.valor_total || 0;
    acc[status].quantidade += 1;
    return acc;
  }, {});
  const dadosVendasStatus = Object.values(vendasPorStatus);

  const vendasUltimos30Dias = Array.from({ length: 30 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (29 - i));
    const dataStr = data.toISOString().split("T")[0];

    const vendasDia = pedidos
      .filter((p) => p.data_pedido === dataStr && p.status !== "Cancelado")
      .reduce((sum, p) => sum + (p.valor_total || 0), 0);

    return { dia: `${data.getDate()}/${data.getMonth() + 1}`, valor: vendasDia };
  });

  const fluxo7Dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (6 - i));
    const dataStr = data.toISOString().split("T")[0];

    const recebimentos = contasReceber
      .filter((c) => c.data_recebimento === dataStr)
      .reduce((sum, c) => sum + (c.valor || 0), 0);

    const pagamentos = contasPagar
      .filter((c) => c.data_pagamento === dataStr)
      .reduce((sum, c) => sum + (c.valor || 0), 0);

    return { dia: `${data.getDate()}/${data.getMonth() + 1}`, receitas: recebimentos, despesas: pagamentos, saldo: recebimentos - pagamentos };
  });

  const produtosComMovimento = pedidos
    .filter((p) => p.itens && p.data_pedido && filtrarPorPeriodo(p.data_pedido))
    .flatMap((p) => p.itens || [])
    .reduce((acc, item) => {
      const key = item.descricao;
      if (!acc[key]) acc[key] = { nome: key, quantidade: 0, valor: 0 };
      acc[key].quantidade += item.quantidade || 0;
      acc[key].valor += item.valor_total || 0;
      return acc;
    }, {});
  const topProdutos = Object.values(produtosComMovimento).sort((a, b) => b.valor - a.valor).slice(0, 5);

  const vendasPorMesData = (() => {
    const meses = {};
    pedidos.forEach((p) => {
      if (p.status !== "Cancelado" && p.data_pedido) {
        const date = new Date(p.data_pedido);
        if (date.toString() !== "Invalid Date" && date.getFullYear() === new Date().getFullYear()) {
          const mesKey = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
          if (!meses[mesKey]) meses[mesKey] = { mes: mesKey, valor: 0 };
          meses[mesKey].valor += p.valor_total || 0;
        }
      }
    });

    const sortedMonths = Object.values(meses).sort((a, b) => {
      const [aMonthStr, aYearStr] = a.mes.split("/");
      const [bMonthStr, bYearStr] = b.mes.split("/");
      const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
      const aMonthIdx = monthOrder.indexOf(aMonthStr.toLowerCase());
      const bMonthIdx = monthOrder.indexOf(bMonthStr.toLowerCase());
      const aYear = parseInt(aYearStr, 10) + 2000;
      const bYear = parseInt(bYearStr, 10) + 2000;
      if (aYear !== bYear) return aYear - bYear;
      return aMonthIdx - bMonthIdx;
    });
    return sortedMonths;
  })();

  const top5ClientesData = (() => {
    const porCliente = {};
    pedidos.forEach((p) => {
      if (p.status !== "Cancelado" && p.cliente_nome) {
        const cliente = p.cliente_nome;
        if (!porCliente[cliente]) porCliente[cliente] = 0;
        porCliente[cliente] += p.valor_total || 0;
      }
    });
    return Object.entries(porCliente)
      .map(([cliente, valor]) => ({ cliente, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  })();

  const statusPedidosDataAll = (() => {
    const porStatus = {};
    pedidos.forEach((p) => {
      const status = p.status || "Indefinido";
      if (!porStatus[status]) porStatus[status] = 0;
      porStatus[status]++;
    });
    return Object.entries(porStatus).map(([status, quantidade]) => ({ status, quantidade }));
  })();

  const fluxoCaixaMensalData = (() => {
    const meses = {};
    const currentYear = new Date().getFullYear();

    const getMonthKey = (dateString) => {
      const date = new Date(dateString);
      if (date.toString() === "Invalid Date") return null;
      if (date.getFullYear() !== currentYear) return null;
      return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    };

    contasReceber
      .filter((c) => c.status === "Recebido" && c.data_recebimento)
      .forEach((c) => {
        const mesKey = getMonthKey(c.data_recebimento);
        if (mesKey) {
          if (!meses[mesKey]) meses[mesKey] = { mes: mesKey, entradas: 0, saidas: 0 };
          meses[mesKey].entradas += c.valor_recebido || c.valor || 0;
        }
      });

    contasPagar
      .filter((c) => c.status === "Pago" && c.data_pagamento)
      .forEach((c) => {
        const mesKey = getMonthKey(c.data_pagamento);
        if (mesKey) {
          if (!meses[mesKey]) meses[mesKey] = { mes: mesKey, entradas: 0, saidas: 0 };
          meses[mesKey].saidas += c.valor_pago || c.valor || 0;
        }
      });

    const sortedMonths = Object.values(meses).sort((a, b) => {
      const [aMonthStr, aYearStr] = a.mes.split("/");
      const [bMonthStr, bYearStr] = b.mes.split("/");
      const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
      const aMonthIdx = monthOrder.indexOf(aMonthStr.toLowerCase());
      const bMonthIdx = monthOrder.indexOf(bMonthStr.toLowerCase());
      const aYear = parseInt(aYearStr, 10) + 2000;
      const bYear = parseInt(bYearStr, 10) + 2000;
      if (aYear !== bYear) return aYear - bYear;
      return aMonthIdx - bMonthIdx;
    });

    return sortedMonths;
  })();

  return {
    // Principais
    pedidosPeriodo,
    totalVendas,
    ticketMedio,
    receitasPendentes,
    despesasPendentes,
    fluxoCaixa,
    produtosBaixoEstoque,
    colaboradoresAtivos,
    clientesAtivos,
    taxaConversao,
    entregasPendentes,
    // Operacionais
    otd,
    entregasNoPrazo,
    entregasConcluidas,
    pesoProduzido,
    aproveitamentoBarra,
    taxaInadimplencia,
    valorVencido,
    // Gráficos e listas
    dadosVendasStatus,
    vendasUltimos30Dias,
    fluxo7Dias,
    topProdutos,
    vendasPorMesData,
    top5ClientesData,
    statusPedidosDataAll,
    fluxoCaixaMensalData,
  };
}