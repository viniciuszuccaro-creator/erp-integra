/**
 * 🔍 CONSULTA CNPJ NA RECEITA FEDERAL
 * V21.5 FINAL - Busca REAL de dados empresariais
 * Fontes: ReceitaWS → BrasilAPI (fallback automático)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission } from './_lib/guard.js';

export default async function ConsultarCNPJ({ cnpj, cfg }) {
  console.log('🚀 [Backend] ConsultarCNPJ iniciado:', cnpj);
  
  const cnpjLimpo = cnpj?.replace(/\D/g, '') || '';
  
  if (cnpjLimpo.length !== 14) {
    console.error('❌ [Backend] CNPJ inválido:', cnpjLimpo);
    return {
      sucesso: false,
      erro: 'CNPJ deve ter 14 dígitos'
    };
  }
  
  console.log('✅ [Backend] CNPJ validado:', cnpjLimpo);

  // ===== TENTATIVA 1: ReceitaWS =====
  try {
    console.log('🔄 [Backend] Chamando ReceitaWS...');
    
    const receitaUrl = `${(cfg?.receita_federal_api?.receitaws_base_url || 'https://www.receitaws.com.br').replace(/\/$/, '')}/v1/cnpj/${cnpjLimpo}`;
    const response = await fetch(receitaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ERP-Zuccaro/1.0',
        ...(cfg?.receita_federal_api?.receitaws_token ? { 'Authorization': `Bearer ${cfg.receita_federal_api.receitaws_token}` } : {})
      }
    });
    
    console.log('📡 [Backend] ReceitaWS status:', response.status);
    
    if (response.ok) {
      const dados = await response.json();
      console.log('📦 [Backend] ReceitaWS retornou:', dados.status);
      
      if (dados.status !== 'ERROR' && dados.nome) {
        console.log('✅ [Backend] ReceitaWS SUCESSO:', dados.nome);
        return {
          sucesso: true,
          fonte: 'ReceitaWS',
          dados: {
            razao_social: dados.nome || '',
            nome_fantasia: dados.fantasia || dados.nome || '',
            inscricao_estadual: dados.inscricao_estadual || 'ISENTO',
            inscricao_municipal: dados.inscricao_municipal || '',
            situacao_cadastral: dados.situacao || 'ATIVA',
            data_abertura: dados.abertura || '',
            porte: dados.porte || '',
            natureza_juridica: dados.natureza_juridica || '',
            cnae_principal: dados.atividade_principal?.[0]?.text || '',
            cnae_codigo: dados.atividade_principal?.[0]?.code || '',
            capital_social: dados.capital_social || '0',
            endereco_completo: {
              logradouro: dados.logradouro || '',
              numero: dados.numero || 'S/N',
              complemento: dados.complemento || '',
              bairro: dados.bairro || '',
              cidade: dados.municipio || '',
              uf: dados.uf || '',
              cep: dados.cep?.replace(/\D/g, '') || ''
            },
            telefone: dados.telefone ? dados.telefone.replace(/\D/g, '') : '',
            email: dados.email || ''
          }
        };
      }
      console.warn('⚠️ [Backend] ReceitaWS retornou erro:', dados.message);
    }
  } catch (error) {
    console.error('❌ [Backend] ReceitaWS exception:', error.message);
  }

  // ===== TENTATIVA 2: BrasilAPI =====
  try {
    console.log('🔄 [Backend] Chamando BrasilAPI...');
    
    const brasilUrl = `${(cfg?.receita_federal_api?.brasilapi_base_url || 'https://brasilapi.com.br').replace(/\/$/, '')}/api/cnpj/v1/${cnpjLimpo}`;
    const response = await fetch(brasilUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ERP-Zuccaro/1.0'
      }
    });
    
    console.log('📡 [Backend] BrasilAPI status:', response.status);
    
    if (response.ok) {
      const dados = await response.json();
      console.log('📦 [Backend] BrasilAPI retornou:', dados.razao_social ? 'OK' : 'VAZIO');
      
      if (dados.razao_social) {
        console.log('✅ [Backend] BrasilAPI SUCESSO:', dados.razao_social);
        return {
          sucesso: true,
          fonte: 'BrasilAPI',
          dados: {
            razao_social: dados.razao_social || '',
            nome_fantasia: dados.nome_fantasia || dados.razao_social || '',
            inscricao_estadual: dados.inscricao_estadual || 'ISENTO',
            inscricao_municipal: dados.inscricao_municipal || '',
            situacao_cadastral: dados.descricao_situacao_cadastral || 'ATIVA',
            data_abertura: dados.data_inicio_atividade || '',
            porte: dados.porte || '',
            natureza_juridica: dados.descricao_natureza_juridica || '',
            cnae_principal: dados.cnae_fiscal_descricao || '',
            cnae_codigo: dados.cnae_fiscal?.toString() || '',
            capital_social: dados.capital_social?.toString() || '0',
            endereco_completo: {
              logradouro: dados.descricao_tipo_de_logradouro ? 
                `${dados.descricao_tipo_de_logradouro} ${dados.logradouro || ''}`.trim() : 
                dados.logradouro || '',
              numero: dados.numero || 'S/N',
              complemento: dados.complemento || '',
              bairro: dados.bairro || '',
              cidade: dados.municipio || '',
              uf: dados.uf || '',
              cep: dados.cep?.replace(/\D/g, '') || ''
            },
            telefone: dados.ddd_telefone_1 ? `${dados.ddd_telefone_1}`.replace(/\D/g, '') : '',
            email: dados.email || ''
          }
        };
      }
    } else {
      const errorText = await response.text();
      console.error('❌ [Backend] BrasilAPI erro:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ [Backend] BrasilAPI exception:', error.message);
  }

  // ===== TODAS AS FONTES FALHARAM =====
  console.error('❌ [Backend] Todas as APIs falharam para CNPJ:', cnpjLimpo);
  return {
  sucesso: false,
  erro: '❌ CNPJ não encontrado nas fontes públicas. Verifique se digitou corretamente.'
  };
  }

  // HTTP Wrapper - Fase 1: Segurança com autenticação e escopo multiempresa
  Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await getUserAndPerfil(base44);
    const permErr = await assertPermission(base44, ctx, 'Cadastros', 'Cliente', 'visualizar');
    if (permErr) return permErr;

    // Contexto multiempresa validado por permissões (PerfilAcesso); empresa pode vir do payload
    const body = await req.json().catch(() => ({}));
    const { cnpj } = body || {};

    // Carrega configuração centralizada (primeiro registro)
    const cfg = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({}, undefined, 1).then(r => r?.[0]).catch(() => null);

    const result = await ConsultarCNPJ({ cnpj, cfg });

    // Auditoria da consulta (multiempresa, não bloqueante)
    const empresaIdCtx = body?.empresa_id || null;
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaIdCtx,
        acao: 'Visualização',
        modulo: 'Cadastros',
        tipo_auditoria: 'integracao',
        entidade: 'ConsultaCNPJ',
        descricao: `Consulta CNPJ ${String(cnpj || '').slice(0, 4)}**** realizada`,
        dados_novos: { sucesso: !!result?.sucesso, fonte: result?.fonte || null },
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
  });