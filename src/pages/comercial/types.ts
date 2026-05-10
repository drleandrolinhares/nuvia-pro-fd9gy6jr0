export interface Avaliacao {
  id: string
  paciente_id: string
  data_avaliacao: string | null
  data_fechamento?: string | null
  valor_orcamento: number | null
  valor_entrada?: number | null
  status: string | null
  temperatura_lead: string | null
  proxima_data_contato: string | null
  tipo_tratamento: string | null
  dentista_avaliador_id?: string | null
  crc_comercial_id?: string | null
  origem_id?: string | null
  destino_fiscal?: string | null
  pacientes?: { id: string; nome: string } | null
  dentistas_avaliadores?: { id: string; nome: string } | null
  crc_comercial?: { id: string; nome: string } | null
  orcamentos?: { valor: number }[]
}

export interface VendasFiltersState {
  periodo: string
  dataInicio: string
  dataFim: string
  status: string
  temperatura: string
  dentista: string
  crc: string
  tratamento: string
  valorRange: number[]
  search: string
}
