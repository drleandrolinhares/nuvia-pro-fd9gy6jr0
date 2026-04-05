import { supabase } from '@/lib/supabase/client'

export const faturamentoService = {
  async getFaturas() {
    const { data, error } = await supabase
      .from('faturas_comissoes')
      .select(`
        *,
        faturamento_comissoes(*),
        usuarios(nome)
      `)
      .order('criado_em', { ascending: false })

    if (error) throw error
    return data
  },

  async getFaturaDetalhes(fatura: any) {
    const { tipo_profissional, profissional_id, faturamento_comissoes } = fatura
    const inicio = faturamento_comissoes.periodo_inicio
    const fim = faturamento_comissoes.periodo_fim

    if (tipo_profissional === 'Dentista Avaliador') {
      const { data, error } = await supabase
        .from('comissoes_dentista')
        .select(`
          *, 
          vendas_concretizadas!inner(valor_total_tratamento, data_concretizacao, avaliacoes(pacientes(nome))), 
          dentistas_avaliadores!inner(usuario_id)
        `)
        .eq('dentistas_avaliadores.usuario_id', profissional_id)
        .gte('vendas_concretizadas.data_concretizacao', inicio)
        .lte('vendas_concretizadas.data_concretizacao', fim)
        .neq('status_pagamento', 'em_aberto')
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('comissoes_crc')
        .select(`
          *, 
          vendas_concretizadas!inner(valor_total_tratamento, data_concretizacao, avaliacoes(pacientes(nome))), 
          crc_comercial!inner(usuario_id)
        `)
        .eq('crc_comercial.usuario_id', profissional_id)
        .gte('vendas_concretizadas.data_concretizacao', inicio)
        .lte('vendas_concretizadas.data_concretizacao', fim)
        .neq('status_pagamento', 'em_aberto')
      if (error) throw error
      return data
    }
  },

  async faturar(inicio: string, fim: string, pagamentoPrevisto: string) {
    // 1. Obter comissoes do periodo
    const { data: cDentista, error: errD } = await supabase
      .from('comissoes_dentista')
      .select(
        '*, vendas_concretizadas!inner(data_concretizacao), dentistas_avaliadores!inner(usuario_id)',
      )
      .gte('vendas_concretizadas.data_concretizacao', inicio)
      .lte('vendas_concretizadas.data_concretizacao', fim)
      .eq('status_pagamento', 'em_aberto')

    if (errD) throw errD

    const { data: cCrc, error: errC } = await supabase
      .from('comissoes_crc')
      .select('*, vendas_concretizadas!inner(data_concretizacao), crc_comercial!inner(usuario_id)')
      .gte('vendas_concretizadas.data_concretizacao', inicio)
      .lte('vendas_concretizadas.data_concretizacao', fim)
      .eq('status_pagamento', 'em_aberto')

    if (errC) throw errC

    if ((!cDentista || cDentista.length === 0) && (!cCrc || cCrc.length === 0)) {
      throw new Error('Nenhuma comissão em aberto encontrada para o período selecionado.')
    }

    // 2. Agrupar por usuario_id e tipo
    const faturasToCreate = new Map<
      string,
      {
        profissional_id: string
        tipo_profissional: string
        valor_total_comissao: number
        comissoesIds: string[]
      }
    >()

    let totalGeral = 0

    for (const c of cDentista || []) {
      const uId = c.dentistas_avaliadores?.usuario_id
      if (!uId) continue
      const key = `${uId}-Dentista`
      if (!faturasToCreate.has(key)) {
        faturasToCreate.set(key, {
          profissional_id: uId,
          tipo_profissional: 'Dentista Avaliador',
          valor_total_comissao: 0,
          comissoesIds: [],
        })
      }
      const f = faturasToCreate.get(key)!
      const valor = Number(c.valor_comissao || 0)
      f.valor_total_comissao += valor
      totalGeral += valor
      f.comissoesIds.push(c.id)
    }

    for (const c of cCrc || []) {
      const uId = c.crc_comercial?.usuario_id
      if (!uId) continue
      const key = `${uId}-CRC`
      if (!faturasToCreate.has(key)) {
        faturasToCreate.set(key, {
          profissional_id: uId,
          tipo_profissional: 'CRC Comercial',
          valor_total_comissao: 0,
          comissoesIds: [],
        })
      }
      const f = faturasToCreate.get(key)!
      const valor = Number(c.valor_comissao || 0)
      f.valor_total_comissao += valor
      totalGeral += valor
      f.comissoesIds.push(c.id)
    }

    if (faturasToCreate.size === 0) {
      throw new Error('Nenhuma comissão pôde ser vinculada a um usuário cadastrado no sistema.')
    }

    // 3. Criar registro de faturamento
    const { data: faturamento, error: errFat } = await supabase
      .from('faturamento_comissoes')
      .insert({
        periodo_inicio: inicio,
        periodo_fim: fim,
        data_pagamento_prevista: pagamentoPrevisto,
        data_faturamento: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (errFat) throw errFat

    // 4. Criar as faturas individuais
    const faturasInserts = Array.from(faturasToCreate.values()).map((f) => ({
      faturamento_id: faturamento.id,
      profissional_id: f.profissional_id,
      tipo_profissional: f.tipo_profissional,
      valor_total_comissao: f.valor_total_comissao,
      status_pagamento: 'em_aberto',
    }))

    const { error: errFaturas } = await supabase.from('faturas_comissoes').insert(faturasInserts)

    if (errFaturas) throw errFaturas

    // 5. Atualizar o status das comissoes para faturado
    const dentistaIds = Array.from(faturasToCreate.values())
      .filter((f) => f.tipo_profissional === 'Dentista Avaliador')
      .flatMap((f) => f.comissoesIds)
    const crcIds = Array.from(faturasToCreate.values())
      .filter((f) => f.tipo_profissional === 'CRC Comercial')
      .flatMap((f) => f.comissoesIds)

    if (dentistaIds.length > 0) {
      await supabase
        .from('comissoes_dentista')
        .update({ status_pagamento: 'faturado' })
        .in('id', dentistaIds)
    }
    if (crcIds.length > 0) {
      await supabase.from('comissoes_crc').update({ status_pagamento: 'faturado' }).in('id', crcIds)
    }

    return {
      faturamento,
      profissionaisCount: faturasToCreate.size,
      totalGeral,
    }
  },

  async pagarFatura(
    faturaId: string,
    formaPagamento: string,
    dataPagamento: string,
    observacaoPagamento?: string,
  ) {
    const { error } = await supabase
      .from('faturas_comissoes')
      .update({
        status_pagamento: 'pago',
        forma_pagamento: formaPagamento,
        data_pagamento: dataPagamento,
        observacao_pagamento: observacaoPagamento,
      })
      .eq('id', faturaId)

    if (error) throw error
  },
}
