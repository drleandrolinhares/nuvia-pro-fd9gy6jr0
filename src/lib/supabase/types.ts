// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      auditoria_tarefas_rotina: {
        Row: {
          criado_em: string
          id: string
          mensagem: string | null
          tarefa_id: string
          timestamp_cliente: string
          usuario_id: string
          valido: boolean
        }
        Insert: {
          criado_em?: string
          id?: string
          mensagem?: string | null
          tarefa_id: string
          timestamp_cliente: string
          usuario_id: string
          valido: boolean
        }
        Update: {
          criado_em?: string
          id?: string
          mensagem?: string | null
          tarefa_id?: string
          timestamp_cliente?: string
          usuario_id?: string
          valido?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'auditoria_tarefas_rotina_tarefa_id_fkey'
            columns: ['tarefa_id']
            isOneToOne: false
            referencedRelation: 'tarefas_rotina'
            referencedColumns: ['id']
          },
        ]
      }
      ausencias: {
        Row: {
          criado_em: string
          data: string
          descricao: string
          id: string
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string
          data: string
          descricao: string
          id?: string
          tipo?: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string
          data?: string
          descricao?: string
          id?: string
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ausencias_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      avaliacoes: {
        Row: {
          atualizado_em: string | null
          crc_comercial_id: string | null
          criado_em: string | null
          data_avaliacao: string | null
          data_fechamento: string | null
          dentista_avaliador_id: string | null
          id: string
          observacoes: string | null
          observacoes_fechamento: string | null
          paciente_id: string
          proxima_data_contato: string | null
          status: string | null
          temperatura_lead: string | null
          tipo_tratamento: string | null
          valor_entrada: number | null
          valor_orcamento: number | null
        }
        Insert: {
          atualizado_em?: string | null
          crc_comercial_id?: string | null
          criado_em?: string | null
          data_avaliacao?: string | null
          data_fechamento?: string | null
          dentista_avaliador_id?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          paciente_id: string
          proxima_data_contato?: string | null
          status?: string | null
          temperatura_lead?: string | null
          tipo_tratamento?: string | null
          valor_entrada?: number | null
          valor_orcamento?: number | null
        }
        Update: {
          atualizado_em?: string | null
          crc_comercial_id?: string | null
          criado_em?: string | null
          data_avaliacao?: string | null
          data_fechamento?: string | null
          dentista_avaliador_id?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          paciente_id?: string
          proxima_data_contato?: string | null
          status?: string | null
          temperatura_lead?: string | null
          tipo_tratamento?: string | null
          valor_entrada?: number | null
          valor_orcamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'avaliacoes_crc_comercial_id_fkey'
            columns: ['crc_comercial_id']
            isOneToOne: false
            referencedRelation: 'crc_comercial'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'avaliacoes_dentista_avaliador_id_fkey'
            columns: ['dentista_avaliador_id']
            isOneToOne: false
            referencedRelation: 'dentistas_avaliadores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'avaliacoes_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
        ]
      }
      campo_configuracao: {
        Row: {
          ativo: boolean | null
          campo_id: string | null
          especialidade_id: string | null
          id: string
          label_customizado: string | null
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          campo_id?: string | null
          especialidade_id?: string | null
          id?: string
          label_customizado?: string | null
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          campo_id?: string | null
          especialidade_id?: string | null
          id?: string
          label_customizado?: string | null
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'campo_configuracao_campo_id_fkey'
            columns: ['campo_id']
            isOneToOne: false
            referencedRelation: 'campos_personalizados'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campo_configuracao_especialidade_id_fkey'
            columns: ['especialidade_id']
            isOneToOne: false
            referencedRelation: 'especialidades'
            referencedColumns: ['id']
          },
        ]
      }
      campo_opcoes: {
        Row: {
          campo_id: string
          data_criacao: string | null
          especialidade_id: string | null
          id: string
          nome: string
        }
        Insert: {
          campo_id: string
          data_criacao?: string | null
          especialidade_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          campo_id?: string
          data_criacao?: string | null
          especialidade_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campo_opcoes_campo_id_fkey'
            columns: ['campo_id']
            isOneToOne: false
            referencedRelation: 'campos_personalizados'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campo_opcoes_especialidade_id_fkey'
            columns: ['especialidade_id']
            isOneToOne: false
            referencedRelation: 'especialidades'
            referencedColumns: ['id']
          },
        ]
      }
      campos_personalizados: {
        Row: {
          data_criacao: string | null
          descricao: string | null
          id: string
          nome: string
          opcoes: Json | null
          tipo: string | null
        }
        Insert: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome: string
          opcoes?: Json | null
          tipo?: string | null
        }
        Update: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          opcoes?: Json | null
          tipo?: string | null
        }
        Relationships: []
      }
      cargo_permissoes: {
        Row: {
          cargo_id: string
          permissao_id: string
        }
        Insert: {
          cargo_id: string
          permissao_id: string
        }
        Update: {
          cargo_id?: string
          permissao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cargo_permissoes_cargo_id_fkey'
            columns: ['cargo_id']
            isOneToOne: false
            referencedRelation: 'cargos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cargo_permissoes_permissao_id_fkey'
            columns: ['permissao_id']
            isOneToOne: false
            referencedRelation: 'permissoes'
            referencedColumns: ['id']
          },
        ]
      }
      cargos: {
        Row: {
          descricao: string | null
          id: string
          nome: string
          setor: string | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          nome: string
          setor?: string | null
        }
        Update: {
          descricao?: string | null
          id?: string
          nome?: string
          setor?: string | null
        }
        Relationships: []
      }
      carteira_transacoes: {
        Row: {
          criado_em: string
          descricao: string
          id: string
          mes_referencia: string
          origem_id: string | null
          tipo: string
          usuario_id: string
          valor: number
        }
        Insert: {
          criado_em?: string
          descricao: string
          id?: string
          mes_referencia: string
          origem_id?: string | null
          tipo: string
          usuario_id: string
          valor: number
        }
        Update: {
          criado_em?: string
          descricao?: string
          id?: string
          mes_referencia?: string
          origem_id?: string | null
          tipo?: string
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'carteira_transacoes_origem_id_fkey'
            columns: ['origem_id']
            isOneToOne: false
            referencedRelation: 'performance_bonificacao'
            referencedColumns: ['id']
          },
        ]
      }
      colaboradores_detalhes: {
        Row: {
          agencia: string | null
          banco: string | null
          beneficiario_emergencia: string | null
          conta: string | null
          ctps: string | null
          dependentes: number | null
          pis: string | null
          pix: string | null
          usuario_id: string
        }
        Insert: {
          agencia?: string | null
          banco?: string | null
          beneficiario_emergencia?: string | null
          conta?: string | null
          ctps?: string | null
          dependentes?: number | null
          pis?: string | null
          pix?: string | null
          usuario_id: string
        }
        Update: {
          agencia?: string | null
          banco?: string | null
          beneficiario_emergencia?: string | null
          conta?: string | null
          ctps?: string | null
          dependentes?: number | null
          pis?: string | null
          pix?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'colaboradores_detalhes_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: true
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      compra_itens: {
        Row: {
          compra_id: string
          data_criacao: string | null
          data_validade: string | null
          estoque_adicionado: number | null
          id: string
          itens_embalagem: number | null
          numero_armario: string | null
          observacoes: string | null
          produto_id: string
          qtd_comprada: number
          referencia_consumo: string | null
          sala_id: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          compra_id: string
          data_criacao?: string | null
          data_validade?: string | null
          estoque_adicionado?: number | null
          id?: string
          itens_embalagem?: number | null
          numero_armario?: string | null
          observacoes?: string | null
          produto_id: string
          qtd_comprada?: number
          referencia_consumo?: string | null
          sala_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          compra_id?: string
          data_criacao?: string | null
          data_validade?: string | null
          estoque_adicionado?: number | null
          id?: string
          itens_embalagem?: number | null
          numero_armario?: string | null
          observacoes?: string | null
          produto_id?: string
          qtd_comprada?: number
          referencia_consumo?: string | null
          sala_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: 'compra_itens_compra_id_fkey'
            columns: ['compra_id']
            isOneToOne: false
            referencedRelation: 'compras'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'compra_itens_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'compra_itens_sala_id_fkey'
            columns: ['sala_id']
            isOneToOne: false
            referencedRelation: 'salas'
            referencedColumns: ['id']
          },
        ]
      }
      compras: {
        Row: {
          data: string
          data_criacao: string | null
          fornecedor_id: string | null
          id: string
          nfe: string | null
          sala_id: string | null
          status: string
          valor_total_compra: number
        }
        Insert: {
          data: string
          data_criacao?: string | null
          fornecedor_id?: string | null
          id?: string
          nfe?: string | null
          sala_id?: string | null
          status?: string
          valor_total_compra?: number
        }
        Update: {
          data?: string
          data_criacao?: string | null
          fornecedor_id?: string | null
          id?: string
          nfe?: string | null
          sala_id?: string | null
          status?: string
          valor_total_compra?: number
        }
        Relationships: [
          {
            foreignKeyName: 'compras_fornecedor_id_fkey'
            columns: ['fornecedor_id']
            isOneToOne: false
            referencedRelation: 'fornecedores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'compras_sala_id_fkey'
            columns: ['sala_id']
            isOneToOne: false
            referencedRelation: 'salas'
            referencedColumns: ['id']
          },
        ]
      }
      compromissos: {
        Row: {
          arquivado: boolean
          atualizado_em: string
          criado_em: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          eh_dia_inteiro: boolean
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          tipo_compromisso: Database['public']['Enums']['tipo_compromisso_enum']
          usuario_id: string
        }
        Insert: {
          arquivado?: boolean
          atualizado_em?: string
          criado_em?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          eh_dia_inteiro?: boolean
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          tipo_compromisso: Database['public']['Enums']['tipo_compromisso_enum']
          usuario_id: string
        }
        Update: {
          arquivado?: boolean
          atualizado_em?: string
          criado_em?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          eh_dia_inteiro?: boolean
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          tipo_compromisso?: Database['public']['Enums']['tipo_compromisso_enum']
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'compromissos_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      configuracoes_negociacao: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          percentual_entrada_padrao: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          percentual_entrada_padrao?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          percentual_entrada_padrao?: number
        }
        Relationships: []
      }
      contatos_follow_up: {
        Row: {
          avaliacao_id: string
          canal: string | null
          criado_em: string | null
          data_contato: string | null
          id: string
          observacoes: string | null
          responsavel_id: string | null
          resultado: string | null
          resumo_conversa: string | null
        }
        Insert: {
          avaliacao_id: string
          canal?: string | null
          criado_em?: string | null
          data_contato?: string | null
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          resultado?: string | null
          resumo_conversa?: string | null
        }
        Update: {
          avaliacao_id?: string
          canal?: string | null
          criado_em?: string | null
          data_contato?: string | null
          id?: string
          observacoes?: string | null
          responsavel_id?: string | null
          resultado?: string | null
          resumo_conversa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contatos_follow_up_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contatos_follow_up_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      crc_comercial: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          email: string | null
          id: string
          nome: string
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          nome: string
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          nome?: string
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'crc_comercial_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      criativos_gerados: {
        Row: {
          criado_em: string | null
          data_criacao: string | null
          dentista_avaliador_id: string
          descricao_video: string | null
          id: string
          mes_referencia: string | null
        }
        Insert: {
          criado_em?: string | null
          data_criacao?: string | null
          dentista_avaliador_id: string
          descricao_video?: string | null
          id?: string
          mes_referencia?: string | null
        }
        Update: {
          criado_em?: string | null
          data_criacao?: string | null
          dentista_avaliador_id?: string
          descricao_video?: string | null
          id?: string
          mes_referencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'criativos_gerados_dentista_avaliador_id_fkey'
            columns: ['dentista_avaliador_id']
            isOneToOne: false
            referencedRelation: 'dentistas_avaliadores'
            referencedColumns: ['id']
          },
        ]
      }
      dentistas: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          email: string | null
          especialidade: string | null
          id: string
          nome: string
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          especialidade?: string | null
          id?: string
          nome: string
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          especialidade?: string | null
          id?: string
          nome?: string
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'dentistas_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      dentistas_avaliadores: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          email: string | null
          especialidade: string | null
          id: string
          meta_mensal_criativos: number | null
          nome: string
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          especialidade?: string | null
          id?: string
          meta_mensal_criativos?: number | null
          nome: string
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          especialidade?: string | null
          id?: string
          meta_mensal_criativos?: number | null
          nome?: string
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'dentistas_avaliadores_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      descontos_por_prazo: {
        Row: {
          criado_em: string
          descricao: string | null
          faixa_numero: number
          id: string
          percentual_desconto: number
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          faixa_numero: number
          id?: string
          percentual_desconto?: number
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          faixa_numero?: number
          id?: string
          percentual_desconto?: number
        }
        Relationships: []
      }
      diametros_implante: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      embalagens: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      entrada_produtos: {
        Row: {
          criado_em: string | null
          data_entrada: string | null
          data_validade: string | null
          fornecedor_id: string | null
          id: string
          numero_nfe: string | null
          observacoes: string | null
          observacoes_criticas: string | null
          preco_total: number
          preco_unitario: number
          produto_id: string
          quantidade_comprada: number
          quantidade_embalagem: number | null
          unidade_consumo: string | null
        }
        Insert: {
          criado_em?: string | null
          data_entrada?: string | null
          data_validade?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nfe?: string | null
          observacoes?: string | null
          observacoes_criticas?: string | null
          preco_total: number
          preco_unitario: number
          produto_id: string
          quantidade_comprada: number
          quantidade_embalagem?: number | null
          unidade_consumo?: string | null
        }
        Update: {
          criado_em?: string | null
          data_entrada?: string | null
          data_validade?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nfe?: string | null
          observacoes?: string | null
          observacoes_criticas?: string | null
          preco_total?: number
          preco_unitario?: number
          produto_id?: string
          quantidade_comprada?: number
          quantidade_embalagem?: number | null
          unidade_consumo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'entrada_produtos_fornecedor_id_fkey'
            columns: ['fornecedor_id']
            isOneToOne: false
            referencedRelation: 'fornecedores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'entrada_produtos_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id']
          },
        ]
      }
      especialidade_campos: {
        Row: {
          ativo: boolean | null
          campo_id: string
          especialidade_id: string
          id: string | null
          label_customizado: string | null
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          campo_id: string
          especialidade_id: string
          id?: string | null
          label_customizado?: string | null
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          campo_id?: string
          especialidade_id?: string
          id?: string | null
          label_customizado?: string | null
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'especialidade_campos_campo_id_fkey'
            columns: ['campo_id']
            isOneToOne: false
            referencedRelation: 'campos_personalizados'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'especialidade_campos_especialidade_id_fkey'
            columns: ['especialidade_id']
            isOneToOne: false
            referencedRelation: 'especialidades'
            referencedColumns: ['id']
          },
        ]
      }
      especialidades: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      execucoes_rotina: {
        Row: {
          concluida: boolean
          data_criacao: string
          data_execucao: string
          data_fechamento: string | null
          fechamento_confirmado: boolean
          id: string
          minutos_atrasado: number
          nivel_criticidade: Database['public']['Enums']['nivel_criticidade_enum'] | null
          tarefa_id: string
          timestamp_conclusao: string | null
          usuario_id: string
        }
        Insert: {
          concluida?: boolean
          data_criacao?: string
          data_execucao?: string
          data_fechamento?: string | null
          fechamento_confirmado?: boolean
          id?: string
          minutos_atrasado?: number
          nivel_criticidade?: Database['public']['Enums']['nivel_criticidade_enum'] | null
          tarefa_id: string
          timestamp_conclusao?: string | null
          usuario_id: string
        }
        Update: {
          concluida?: boolean
          data_criacao?: string
          data_execucao?: string
          data_fechamento?: string | null
          fechamento_confirmado?: boolean
          id?: string
          minutos_atrasado?: number
          nivel_criticidade?: Database['public']['Enums']['nivel_criticidade_enum'] | null
          tarefa_id?: string
          timestamp_conclusao?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'execucoes_rotina_tarefa_id_fkey'
            columns: ['tarefa_id']
            isOneToOne: false
            referencedRelation: 'tarefas_rotina'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'execucoes_rotina_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      faixas_valores_parcelas: {
        Row: {
          criado_em: string
          faixa_numero: number | null
          id: string
          max_parcelas: number
          valor_maximo: number
          valor_minimo: number
        }
        Insert: {
          criado_em?: string
          faixa_numero?: number | null
          id?: string
          max_parcelas?: number
          valor_maximo: number
          valor_minimo?: number
        }
        Update: {
          criado_em?: string
          faixa_numero?: number | null
          id?: string
          max_parcelas?: number
          valor_maximo?: number
          valor_minimo?: number
        }
        Relationships: []
      }
      faturamento_comissoes: {
        Row: {
          criado_em: string | null
          data_faturamento: string | null
          data_pagamento_prevista: string | null
          id: string
          periodo_fim: string | null
          periodo_inicio: string | null
        }
        Insert: {
          criado_em?: string | null
          data_faturamento?: string | null
          data_pagamento_prevista?: string | null
          id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
        }
        Update: {
          criado_em?: string | null
          data_faturamento?: string | null
          data_pagamento_prevista?: string | null
          id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
        }
        Relationships: []
      }
      faturas_comissoes: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_pagamento: string | null
          faturamento_id: string
          forma_pagamento: string | null
          id: string
          observacao_pagamento: string | null
          profissional_id: string
          status_pagamento: string | null
          tipo_profissional: string | null
          valor_total_comissao: number | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          faturamento_id: string
          forma_pagamento?: string | null
          id?: string
          observacao_pagamento?: string | null
          profissional_id: string
          status_pagamento?: string | null
          tipo_profissional?: string | null
          valor_total_comissao?: number | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          faturamento_id?: string
          forma_pagamento?: string | null
          id?: string
          observacao_pagamento?: string | null
          profissional_id?: string
          status_pagamento?: string | null
          tipo_profissional?: string | null
          valor_total_comissao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'faturas_comissoes_faturamento_id_fkey'
            columns: ['faturamento_id']
            isOneToOne: false
            referencedRelation: 'faturamento_comissoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'faturas_comissoes_profissional_id_fkey'
            columns: ['profissional_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      fornecedores: {
        Row: {
          cnpj: string | null
          contato_principal: string | null
          criado_em: string | null
          data_criacao: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          senha: string | null
          telefone: string | null
          url: string | null
          usuario_login: string | null
        }
        Insert: {
          cnpj?: string | null
          contato_principal?: string | null
          criado_em?: string | null
          data_criacao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          senha?: string | null
          telefone?: string | null
          url?: string | null
          usuario_login?: string | null
        }
        Update: {
          cnpj?: string | null
          contato_principal?: string | null
          criado_em?: string | null
          data_criacao?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          senha?: string | null
          telefone?: string | null
          url?: string | null
          usuario_login?: string | null
        }
        Relationships: []
      }
      historico_compras: {
        Row: {
          criado_em: string | null
          data_compra: string | null
          fornecedor_id: string | null
          id: string
          preco_anterior: number
          produto_id: string
        }
        Insert: {
          criado_em?: string | null
          data_compra?: string | null
          fornecedor_id?: string | null
          id?: string
          preco_anterior: number
          produto_id: string
        }
        Update: {
          criado_em?: string | null
          data_compra?: string | null
          fornecedor_id?: string | null
          id?: string
          preco_anterior?: number
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'historico_compras_fornecedor_id_fkey'
            columns: ['fornecedor_id']
            isOneToOne: false
            referencedRelation: 'fornecedores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'historico_compras_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id']
          },
        ]
      }
      marcas_implante: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      normas_aceites: {
        Row: {
          aceito_em: string
          id: string
          norma_id: string
          usuario_id: string
        }
        Insert: {
          aceito_em?: string
          id?: string
          norma_id: string
          usuario_id: string
        }
        Update: {
          aceito_em?: string
          id?: string
          norma_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'normas_aceites_norma_id_fkey'
            columns: ['norma_id']
            isOneToOne: false
            referencedRelation: 'normas_internas'
            referencedColumns: ['id']
          },
        ]
      }
      normas_internas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          conteudo: string
          criado_em: string
          criado_por: string | null
          id: string
          titulo: string
          todos_usuarios: boolean | null
          usuarios_alvo: Json | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          conteudo: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          titulo: string
          todos_usuarios?: boolean | null
          usuarios_alvo?: Json | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          conteudo?: string
          criado_em?: string
          criado_por?: string | null
          id?: string
          titulo?: string
          todos_usuarios?: boolean | null
          usuarios_alvo?: Json | null
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          avaliacao_id: string
          criado_em: string | null
          data_orcamento: string | null
          id: string
          ordem: number | null
          status: string | null
          valor: number
        }
        Insert: {
          avaliacao_id: string
          criado_em?: string | null
          data_orcamento?: string | null
          id?: string
          ordem?: number | null
          status?: string | null
          valor: number
        }
        Update: {
          avaliacao_id?: string
          criado_em?: string | null
          data_orcamento?: string | null
          id?: string
          ordem?: number | null
          status?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'orcamentos_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
        ]
      }
      pacientes: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_cadastro: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_cadastro?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_cadastro?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      performance_bonificacao: {
        Row: {
          atingiu_meta: boolean
          atualizado_em: string
          criado_em: string
          id: string
          itens_marcados: Json
          mes_referencia: string
          pontuacao_total: number
          usuario_id: string
        }
        Insert: {
          atingiu_meta?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          itens_marcados?: Json
          mes_referencia: string
          pontuacao_total?: number
          usuario_id: string
        }
        Update: {
          atingiu_meta?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          itens_marcados?: Json
          mes_referencia?: string
          pontuacao_total?: number
          usuario_id?: string
        }
        Relationships: []
      }
      performance_bonificacao_itens: {
        Row: {
          ativo: boolean
          criado_em: string
          descricao: string
          explicacao: string | null
          id: string
          ordem: number
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          descricao: string
          explicacao?: string | null
          id?: string
          ordem?: number
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          descricao?: string
          explicacao?: string | null
          id?: string
          ordem?: number
        }
        Relationships: []
      }
      performance_pp_pdm: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_registro: string
          id: string
          nota_pdm: number | null
          pdm_itens: Json | null
          pontos_melhoria: string
          pontos_positivos: string
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_registro?: string
          id?: string
          nota_pdm?: number | null
          pdm_itens?: Json | null
          pontos_melhoria: string
          pontos_positivos: string
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_registro?: string
          id?: string
          nota_pdm?: number | null
          pdm_itens?: Json | null
          pontos_melhoria?: string
          pontos_positivos?: string
          usuario_id?: string
        }
        Relationships: []
      }
      permissoes: {
        Row: {
          descricao: string | null
          id: string
          modulo: string | null
          nome: string
        }
        Insert: {
          descricao?: string | null
          id?: string
          modulo?: string | null
          nome: string
        }
        Update: {
          descricao?: string | null
          id?: string
          modulo?: string | null
          nome?: string
        }
        Relationships: []
      }
      produto_campos_valores: {
        Row: {
          atualizado_em: string
          campo_id: string
          criado_em: string
          id: string
          produto_id: string
          valor: string | null
        }
        Insert: {
          atualizado_em?: string
          campo_id: string
          criado_em?: string
          id?: string
          produto_id: string
          valor?: string | null
        }
        Update: {
          atualizado_em?: string
          campo_id?: string
          criado_em?: string
          id?: string
          produto_id?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'produto_campos_valores_campo_id_fkey'
            columns: ['campo_id']
            isOneToOne: false
            referencedRelation: 'campos_personalizados'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produto_campos_valores_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id']
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string | null
          codigo_barras: string | null
          custo_unitario: number | null
          data_criacao: string | null
          embalagem: string | null
          embalagem_id: string | null
          especialidade_id: string | null
          id: string
          lote: string | null
          marca: string | null
          nome: string
          numero_armario: string | null
          quantidade_estoque: number | null
          quantidade_minima: number | null
          referencia_consumo: Database['public']['Enums']['referencia_consumo_enum'] | null
          sala: string | null
          sala_id: string | null
          validade: string | null
          variacao: string | null
        }
        Insert: {
          categoria?: string | null
          codigo_barras?: string | null
          custo_unitario?: number | null
          data_criacao?: string | null
          embalagem?: string | null
          embalagem_id?: string | null
          especialidade_id?: string | null
          id?: string
          lote?: string | null
          marca?: string | null
          nome: string
          numero_armario?: string | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          referencia_consumo?: Database['public']['Enums']['referencia_consumo_enum'] | null
          sala?: string | null
          sala_id?: string | null
          validade?: string | null
          variacao?: string | null
        }
        Update: {
          categoria?: string | null
          codigo_barras?: string | null
          custo_unitario?: number | null
          data_criacao?: string | null
          embalagem?: string | null
          embalagem_id?: string | null
          especialidade_id?: string | null
          id?: string
          lote?: string | null
          marca?: string | null
          nome?: string
          numero_armario?: string | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          referencia_consumo?: Database['public']['Enums']['referencia_consumo_enum'] | null
          sala?: string | null
          sala_id?: string | null
          validade?: string | null
          variacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'produtos_embalagem_id_fkey'
            columns: ['embalagem_id']
            isOneToOne: false
            referencedRelation: 'embalagens'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produtos_especialidade_id_fkey'
            columns: ['especialidade_id']
            isOneToOne: false
            referencedRelation: 'especialidades'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produtos_sala_id_fkey'
            columns: ['sala_id']
            isOneToOne: false
            referencedRelation: 'salas'
            referencedColumns: ['id']
          },
        ]
      }
      referencias_comissao_crc: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          faixa_entrada_maxima: number | null
          faixa_entrada_minima: number | null
          id: string
          percentual_comissao: number | null
          status: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
        }
        Relationships: []
      }
      referencias_comissao_dentista: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          faixa_entrada_maxima: number | null
          faixa_entrada_minima: number | null
          id: string
          percentual_comissao: number | null
          status: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
        }
        Relationships: []
      }
      rotinas_usuarios: {
        Row: {
          ativa: boolean
          cargo_id: string | null
          data_atualizacao: string
          data_criacao: string
          id: string
          usuario_id: string | null
        }
        Insert: {
          ativa?: boolean
          cargo_id?: string | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          usuario_id?: string | null
        }
        Update: {
          ativa?: boolean
          cargo_id?: string | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'rotinas_usuarios_cargo_id_fkey'
            columns: ['cargo_id']
            isOneToOne: false
            referencedRelation: 'cargos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rotinas_usuarios_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      saida_produtos: {
        Row: {
          criado_em: string | null
          data_saida: string | null
          descricao: string | null
          id: string
          observacoes: string | null
          produto_id: string
          quantidade: number
          quantidade_devolver: number | null
          tipo_saida: string | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          data_saida?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          produto_id: string
          quantidade: number
          quantidade_devolver?: number | null
          tipo_saida?: string | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          data_saida?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          quantidade_devolver?: number | null
          tipo_saida?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'saida_produtos_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'saida_produtos_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      salas: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      sorriso_dos_sonhos_config: {
        Row: {
          atualizado_em: string
          id: string
          meta_indicacoes: number
          usuarios_elegiveis: Json | null
          valor_bonus: number
        }
        Insert: {
          atualizado_em?: string
          id?: string
          meta_indicacoes?: number
          usuarios_elegiveis?: Json | null
          valor_bonus?: number
        }
        Update: {
          atualizado_em?: string
          id?: string
          meta_indicacoes?: number
          usuarios_elegiveis?: Json | null
          valor_bonus?: number
        }
        Relationships: []
      }
      sorriso_dos_sonhos_indicacoes: {
        Row: {
          atualizado_em: string
          colaborador_id: string | null
          criado_em: string
          data_fechamento: string | null
          id: string
          nome_indicado: string
          paciente_indicador_id: string | null
          status: string
          telefone_indicado: string | null
          valor_premio_paciente: number | null
        }
        Insert: {
          atualizado_em?: string
          colaborador_id?: string | null
          criado_em?: string
          data_fechamento?: string | null
          id?: string
          nome_indicado: string
          paciente_indicador_id?: string | null
          status?: string
          telefone_indicado?: string | null
          valor_premio_paciente?: number | null
        }
        Update: {
          atualizado_em?: string
          colaborador_id?: string | null
          criado_em?: string
          data_fechamento?: string | null
          id?: string
          nome_indicado?: string
          paciente_indicador_id?: string | null
          status?: string
          telefone_indicado?: string | null
          valor_premio_paciente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'sorriso_dos_sonhos_indicacoes_colaborador_id_fkey'
            columns: ['colaborador_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sorriso_dos_sonhos_indicacoes_paciente_indicador_id_fkey'
            columns: ['paciente_indicador_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
        ]
      }
      tamanhos_implante: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tarefas_rotina: {
        Row: {
          ativa: boolean
          data_criacao: string
          data_inicio_contagem: string | null
          descricao_tarefa: string
          dia_mes: number | null
          dias_semana: Json | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          numero_sequencia: number
          observacao: string | null
          periodicidade: string
          peso_percentual: number
          rotina_id: string
        }
        Insert: {
          ativa?: boolean
          data_criacao?: string
          data_inicio_contagem?: string | null
          descricao_tarefa: string
          dia_mes?: number | null
          dias_semana?: Json | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          numero_sequencia: number
          observacao?: string | null
          periodicidade?: string
          peso_percentual?: number
          rotina_id: string
        }
        Update: {
          ativa?: boolean
          data_criacao?: string
          data_inicio_contagem?: string | null
          descricao_tarefa?: string
          dia_mes?: number | null
          dias_semana?: Json | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          numero_sequencia?: number
          observacao?: string | null
          periodicidade?: string
          peso_percentual?: number
          rotina_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tarefas_rotina_rotina_id_fkey'
            columns: ['rotina_id']
            isOneToOne: false
            referencedRelation: 'rotinas_usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      terceiros_categorias: {
        Row: {
          criado_em: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
        }
        Relationships: []
      }
      terceiros_colunas: {
        Row: {
          categoria_slug: string
          cor: string
          criado_em: string | null
          id: string
          ordem: number
          titulo: string
        }
        Insert: {
          categoria_slug: string
          cor?: string
          criado_em?: string | null
          id?: string
          ordem?: number
          titulo: string
        }
        Update: {
          categoria_slug?: string
          cor?: string
          criado_em?: string | null
          id?: string
          ordem?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'terceiros_colunas_categoria_slug_fkey'
            columns: ['categoria_slug']
            isOneToOne: false
            referencedRelation: 'terceiros_categorias'
            referencedColumns: ['slug']
          },
        ]
      }
      terceiros_historico: {
        Row: {
          acao: string
          criado_em: string
          detalhes: string | null
          id: string
          tarefa_id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          tarefa_id: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          tarefa_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'terceiros_historico_tarefa_id_fkey'
            columns: ['tarefa_id']
            isOneToOne: false
            referencedRelation: 'terceiros_tarefas'
            referencedColumns: ['id']
          },
        ]
      }
      terceiros_tarefas: {
        Row: {
          atualizado_em: string | null
          categoria_slug: string
          cor: string | null
          criado_em: string | null
          data_prevista: string | null
          descricao: string | null
          etiquetas: Json | null
          id: string
          ordem: number | null
          paciente_nome: string | null
          status: string
          terceiro_nome: string | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria_slug: string
          cor?: string | null
          criado_em?: string | null
          data_prevista?: string | null
          descricao?: string | null
          etiquetas?: Json | null
          id?: string
          ordem?: number | null
          paciente_nome?: string | null
          status?: string
          terceiro_nome?: string | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          categoria_slug?: string
          cor?: string | null
          criado_em?: string | null
          data_prevista?: string | null
          descricao?: string | null
          etiquetas?: Json | null
          id?: string
          ordem?: number | null
          paciente_nome?: string | null
          status?: string
          terceiro_nome?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'terceiros_tarefas_categoria_slug_fkey'
            columns: ['categoria_slug']
            isOneToOne: false
            referencedRelation: 'terceiros_categorias'
            referencedColumns: ['slug']
          },
        ]
      }
      usuario_permissoes: {
        Row: {
          permissao_id: string
          usuario_id: string
        }
        Insert: {
          permissao_id: string
          usuario_id: string
        }
        Update: {
          permissao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'usuario_permissoes_permissao_id_fkey'
            columns: ['permissao_id']
            isOneToOne: false
            referencedRelation: 'permissoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'usuario_permissoes_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      usuarios: {
        Row: {
          avatar_url: string | null
          cargo_id: string | null
          cargo_secundario_id: string | null
          cpf: string | null
          criado_em: string | null
          data_admissao: string | null
          data_nascimento: string | null
          dias_trabalho: Json | null
          email: string
          endereco: string | null
          exigir_rotina: boolean
          fim_lanche_manha: string | null
          fim_lanche_tarde: string | null
          horario_entrada: string | null
          horario_saida: string | null
          id: string
          inicio_lanche_manha: string | null
          inicio_lanche_tarde: string | null
          nome: string
          obrigatorio_bonificacao: boolean
          obrigatorio_pp_pdm: boolean
          ordem: number | null
          possui_carteira: boolean
          retorno_almoco: string | null
          role: string | null
          saida_almoco: string | null
          salario: number | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          avatar_url?: string | null
          cargo_id?: string | null
          cargo_secundario_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          dias_trabalho?: Json | null
          email: string
          endereco?: string | null
          exigir_rotina?: boolean
          fim_lanche_manha?: string | null
          fim_lanche_tarde?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id: string
          inicio_lanche_manha?: string | null
          inicio_lanche_tarde?: string | null
          nome: string
          obrigatorio_bonificacao?: boolean
          obrigatorio_pp_pdm?: boolean
          ordem?: number | null
          possui_carteira?: boolean
          retorno_almoco?: string | null
          role?: string | null
          saida_almoco?: string | null
          salario?: number | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          avatar_url?: string | null
          cargo_id?: string | null
          cargo_secundario_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          dias_trabalho?: Json | null
          email?: string
          endereco?: string | null
          exigir_rotina?: boolean
          fim_lanche_manha?: string | null
          fim_lanche_tarde?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id?: string
          inicio_lanche_manha?: string | null
          inicio_lanche_tarde?: string | null
          nome?: string
          obrigatorio_bonificacao?: boolean
          obrigatorio_pp_pdm?: boolean
          ordem?: number | null
          possui_carteira?: boolean
          retorno_almoco?: string | null
          role?: string | null
          saida_almoco?: string | null
          salario?: number | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_cargo_id_fkey'
            columns: ['cargo_id']
            isOneToOne: false
            referencedRelation: 'cargos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'usuarios_cargo_secundario_id_fkey'
            columns: ['cargo_secundario_id']
            isOneToOne: false
            referencedRelation: 'cargos'
            referencedColumns: ['id']
          },
        ]
      }
      usuarios_compromissos: {
        Row: {
          compromisso_id: string
          criado_em: string
          id: string
          permissao: Database['public']['Enums']['permissao_compromisso_enum']
          usuario_criador_id: string
          usuario_destinatario_id: string
        }
        Insert: {
          compromisso_id: string
          criado_em?: string
          id?: string
          permissao?: Database['public']['Enums']['permissao_compromisso_enum']
          usuario_criador_id: string
          usuario_destinatario_id: string
        }
        Update: {
          compromisso_id?: string
          criado_em?: string
          id?: string
          permissao?: Database['public']['Enums']['permissao_compromisso_enum']
          usuario_criador_id?: string
          usuario_destinatario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_compromissos_compromisso_id_fkey'
            columns: ['compromisso_id']
            isOneToOne: false
            referencedRelation: 'compromissos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'usuarios_compromissos_usuario_criador_id_fkey'
            columns: ['usuario_criador_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'usuarios_compromissos_usuario_destinatario_id_fkey'
            columns: ['usuario_destinatario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      vendas_confirmadas: {
        Row: {
          atualizado_em: string
          crc: string | null
          criado_em: string
          data_fechamento: string
          data_original: string | null
          dentista_avaliador: string | null
          fatura_comissao_id: string | null
          id: string
          observacoes: string | null
          observacoes_fechamento: string | null
          oportunidade_id: string
          paciente_nome: string
          percentual_comissao: number | null
          percentual_entrada: number
          status_comissao: string | null
          telefone: string | null
          tratamento: string | null
          valor_comissao: number | null
          valor_entrada: number
          valor_tratamento: number
        }
        Insert: {
          atualizado_em?: string
          crc?: string | null
          criado_em?: string
          data_fechamento: string
          data_original?: string | null
          dentista_avaliador?: string | null
          fatura_comissao_id?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          oportunidade_id: string
          paciente_nome: string
          percentual_comissao?: number | null
          percentual_entrada: number
          status_comissao?: string | null
          telefone?: string | null
          tratamento?: string | null
          valor_comissao?: number | null
          valor_entrada: number
          valor_tratamento: number
        }
        Update: {
          atualizado_em?: string
          crc?: string | null
          criado_em?: string
          data_fechamento?: string
          data_original?: string | null
          dentista_avaliador?: string | null
          fatura_comissao_id?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          oportunidade_id?: string
          paciente_nome?: string
          percentual_comissao?: number | null
          percentual_entrada?: number
          status_comissao?: string | null
          telefone?: string | null
          tratamento?: string | null
          valor_comissao?: number | null
          valor_entrada?: number
          valor_tratamento?: number
        }
        Relationships: [
          {
            foreignKeyName: 'vendas_confirmadas_crc_fkey'
            columns: ['crc']
            isOneToOne: false
            referencedRelation: 'crc_comercial'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vendas_confirmadas_dentista_avaliador_fkey'
            columns: ['dentista_avaliador']
            isOneToOne: false
            referencedRelation: 'dentistas_avaliadores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vendas_confirmadas_fatura_comissao_id_fkey'
            columns: ['fatura_comissao_id']
            isOneToOne: false
            referencedRelation: 'faturas_comissoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vendas_confirmadas_oportunidade_id_fkey'
            columns: ['oportunidade_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gerar_adiantamento_mes_sorriso: {
        Args: { p_mes: string }
        Returns: undefined
      }
      has_permission: { Args: { permission_name: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      processar_fechamento_mes_sorriso: {
        Args: { p_mes: string }
        Returns: undefined
      }
    }
    Enums: {
      nivel_criticidade_enum: 'no_horario' | 'tolerancia' | 'critico' | 'nao_concluida'
      permissao_compromisso_enum: 'visualizar' | 'editar' | 'deletar'
      referencia_consumo_enum: 'qtd_comprada' | 'itens_embalagem'
      tipo_compromisso_enum:
        | 'consulta'
        | 'viagem_pessoal'
        | 'viagem_trabalho'
        | 'reuniao'
        | 'congresso'
        | 'folga_ferias'
        | 'treinamento'
        | 'atendimento_externo'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      nivel_criticidade_enum: ['no_horario', 'tolerancia', 'critico', 'nao_concluida'],
      permissao_compromisso_enum: ['visualizar', 'editar', 'deletar'],
      referencia_consumo_enum: ['qtd_comprada', 'itens_embalagem'],
      tipo_compromisso_enum: [
        'consulta',
        'viagem_pessoal',
        'viagem_trabalho',
        'reuniao',
        'congresso',
        'folga_ferias',
        'treinamento',
        'atendimento_externo',
      ],
    },
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: auditoria_tarefas_rotina
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   tarefa_id: uuid (not null)
//   timestamp_cliente: timestamp with time zone (not null)
//   valido: boolean (not null)
//   mensagem: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: ausencias
//   id: uuid (not null, default: gen_random_uuid())
//   data: date (not null)
//   descricao: text (not null)
//   tipo: text (not null, default: 'feriado'::text)
//   usuario_id: uuid (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: avaliacoes
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   dentista_avaliador_id: uuid (nullable)
//   crc_comercial_id: uuid (nullable)
//   data_avaliacao: date (nullable, default: CURRENT_DATE)
//   valor_orcamento: numeric (nullable)
//   tipo_tratamento: text (nullable)
//   status: text (nullable, default: 'avaliacao_realizada'::text)
//   temperatura_lead: text (nullable, default: 'morno'::text)
//   proxima_data_contato: date (nullable)
//   observacoes: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   data_fechamento: date (nullable)
//   valor_entrada: numeric (nullable)
//   observacoes_fechamento: text (nullable)
// Table: campo_configuracao
//   id: uuid (not null, default: gen_random_uuid())
//   especialidade_id: uuid (nullable)
//   campo_id: uuid (nullable)
//   label_customizado: text (nullable)
//   ordem: integer (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
// Table: campo_opcoes
//   id: uuid (not null, default: gen_random_uuid())
//   campo_id: uuid (not null)
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   especialidade_id: uuid (nullable)
// Table: campos_personalizados
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   tipo: text (nullable, default: 'text'::text)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   opcoes: jsonb (nullable)
// Table: cargo_permissoes
//   cargo_id: uuid (not null)
//   permissao_id: uuid (not null)
// Table: cargos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   setor: text (nullable)
// Table: carteira_transacoes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   tipo: text (not null)
//   valor: numeric (not null)
//   descricao: text (not null)
//   mes_referencia: text (not null)
//   origem_id: uuid (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: colaboradores_detalhes
//   usuario_id: uuid (not null)
//   banco: text (nullable)
//   agencia: text (nullable)
//   conta: text (nullable)
//   pix: text (nullable)
//   ctps: text (nullable)
//   pis: text (nullable)
//   dependentes: integer (nullable, default: 0)
//   beneficiario_emergencia: text (nullable)
// Table: compra_itens
//   id: uuid (not null, default: gen_random_uuid())
//   compra_id: uuid (not null)
//   produto_id: uuid (not null)
//   valor_total: numeric (not null, default: 0)
//   qtd_comprada: integer (not null, default: 0)
//   itens_embalagem: integer (nullable)
//   referencia_consumo: text (nullable)
//   valor_unitario: numeric (not null, default: 0)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   estoque_adicionado: integer (nullable)
//   data_validade: date (nullable)
//   numero_armario: text (nullable)
//   observacoes: text (nullable)
//   sala_id: uuid (nullable)
// Table: compras
//   id: uuid (not null, default: gen_random_uuid())
//   fornecedor_id: uuid (nullable)
//   data: date (not null)
//   nfe: text (nullable)
//   valor_total_compra: numeric (not null, default: 0)
//   status: text (not null, default: 'pendente'::text)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   sala_id: uuid (nullable)
// Table: compromissos
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   tipo_compromisso: tipo_compromisso_enum (not null)
//   data_inicio: date (not null)
//   data_fim: date (not null)
//   hora_inicio: time without time zone (nullable)
//   hora_fim: time without time zone (nullable)
//   eh_dia_inteiro: boolean (not null, default: false)
//   descricao: text (nullable)
//   arquivado: boolean (not null, default: false)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
// Table: configuracoes_negociacao
//   id: uuid (not null, default: gen_random_uuid())
//   percentual_entrada_padrao: numeric (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
// Table: contatos_follow_up
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   data_contato: timestamp with time zone (nullable, default: now())
//   responsavel_id: uuid (nullable)
//   canal: text (nullable)
//   resumo_conversa: text (nullable)
//   resultado: text (nullable)
//   observacoes: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: crc_comercial
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome: text (not null)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   email: text (nullable)
// Table: criativos_gerados
//   id: uuid (not null, default: gen_random_uuid())
//   dentista_avaliador_id: uuid (not null)
//   data_criacao: date (nullable, default: CURRENT_DATE)
//   descricao_video: text (nullable)
//   mes_referencia: date (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: dentistas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome: text (not null)
//   email: text (nullable)
//   especialidade: text (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: dentistas_avaliadores
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome: text (not null)
//   especialidade: text (nullable)
//   meta_mensal_criativos: integer (nullable, default: 0)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   email: text (nullable)
// Table: descontos_por_prazo
//   id: uuid (not null, default: gen_random_uuid())
//   faixa_numero: integer (not null)
//   percentual_desconto: numeric (not null, default: 0)
//   descricao: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: diametros_implante
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: embalagens
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: entrada_produtos
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (not null)
//   fornecedor_id: uuid (nullable)
//   quantidade_embalagem: integer (nullable)
//   quantidade_comprada: integer (not null)
//   unidade_consumo: text (nullable)
//   preco_unitario: numeric (not null)
//   preco_total: numeric (not null)
//   data_entrada: timestamp with time zone (nullable, default: now())
//   observacoes: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   data_validade: date (nullable)
//   numero_nfe: text (nullable)
//   observacoes_criticas: text (nullable)
// Table: especialidade_campos
//   especialidade_id: uuid (not null)
//   campo_id: uuid (not null)
//   ativo: boolean (nullable, default: true)
//   id: uuid (nullable, default: gen_random_uuid())
//   ordem: integer (nullable, default: 0)
//   label_customizado: text (nullable)
// Table: especialidades
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: execucoes_rotina
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   data_execucao: date (not null, default: CURRENT_DATE)
//   tarefa_id: uuid (not null)
//   concluida: boolean (not null, default: false)
//   timestamp_conclusao: timestamp with time zone (nullable)
//   minutos_atrasado: integer (not null, default: 0)
//   nivel_criticidade: nivel_criticidade_enum (nullable)
//   fechamento_confirmado: boolean (not null, default: false)
//   data_fechamento: timestamp with time zone (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: faixas_valores_parcelas
//   id: uuid (not null, default: gen_random_uuid())
//   valor_minimo: numeric (not null, default: 0)
//   valor_maximo: numeric (not null)
//   max_parcelas: integer (not null, default: 1)
//   criado_em: timestamp with time zone (not null, default: now())
//   faixa_numero: integer (nullable)
// Table: faturamento_comissoes
//   id: uuid (not null, default: gen_random_uuid())
//   periodo_inicio: date (nullable)
//   periodo_fim: date (nullable)
//   data_faturamento: date (nullable, default: CURRENT_DATE)
//   data_pagamento_prevista: date (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: faturas_comissoes
//   id: uuid (not null, default: gen_random_uuid())
//   faturamento_id: uuid (not null)
//   profissional_id: uuid (not null)
//   tipo_profissional: text (nullable)
//   valor_total_comissao: numeric (nullable)
//   status_pagamento: text (nullable, default: 'em_aberto'::text)
//   data_pagamento: date (nullable)
//   forma_pagamento: text (nullable)
//   observacao_pagamento: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: fornecedores
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   cnpj: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   endereco: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   contato_principal: text (nullable)
//   observacoes: text (nullable)
//   url: text (nullable)
//   senha: text (nullable)
//   usuario_login: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: historico_compras
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (not null)
//   fornecedor_id: uuid (nullable)
//   preco_anterior: numeric (not null)
//   data_compra: timestamp with time zone (nullable, default: now())
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: marcas_implante
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: normas_aceites
//   id: uuid (not null, default: gen_random_uuid())
//   norma_id: uuid (not null)
//   usuario_id: uuid (not null)
//   aceito_em: timestamp with time zone (not null, default: now())
// Table: normas_internas
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   conteudo: text (not null)
//   ativo: boolean (not null, default: true)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   criado_por: uuid (nullable)
//   todos_usuarios: boolean (nullable, default: true)
//   usuarios_alvo: jsonb (nullable, default: '[]'::jsonb)
// Table: orcamentos
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   valor: numeric (not null)
//   data_orcamento: date (nullable, default: CURRENT_DATE)
//   status: text (nullable, default: 'ativo'::text)
//   ordem: integer (nullable, default: 1)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   telefone: text (nullable)
//   email: text (nullable)
//   data_cadastro: date (nullable, default: CURRENT_DATE)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: performance_bonificacao
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   mes_referencia: text (not null)
//   itens_marcados: jsonb (not null, default: '[]'::jsonb)
//   pontuacao_total: integer (not null, default: 0)
//   atingiu_meta: boolean (not null, default: false)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
// Table: performance_bonificacao_itens
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   ordem: integer (not null, default: 0)
//   ativo: boolean (not null, default: true)
//   criado_em: timestamp with time zone (not null, default: now())
//   explicacao: text (nullable)
// Table: performance_pp_pdm
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   data_registro: date (not null, default: CURRENT_DATE)
//   pontos_positivos: text (not null)
//   pontos_melhoria: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   nota_pdm: integer (nullable, default: 0)
//   pdm_itens: jsonb (nullable, default: '[]'::jsonb)
// Table: permissoes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   modulo: text (nullable)
// Table: produto_campos_valores
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (not null)
//   campo_id: uuid (not null)
//   valor: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
// Table: produtos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   marca: text (nullable)
//   variacao: text (nullable)
//   categoria: text (nullable)
//   especialidade_id: uuid (nullable)
//   codigo_barras: text (nullable)
//   embalagem: text (nullable)
//   sala: text (nullable)
//   validade: date (nullable)
//   lote: text (nullable)
//   custo_unitario: numeric (nullable, default: 0)
//   quantidade_estoque: integer (nullable, default: 0)
//   quantidade_minima: integer (nullable, default: 0)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   numero_armario: text (nullable)
//   embalagem_id: uuid (nullable)
//   sala_id: uuid (nullable)
//   referencia_consumo: referencia_consumo_enum (nullable, default: 'qtd_comprada'::referencia_consumo_enum)
// Table: referencias_comissao_crc
//   id: uuid (not null, default: gen_random_uuid())
//   faixa_entrada_minima: numeric (nullable)
//   faixa_entrada_maxima: numeric (nullable)
//   percentual_comissao: numeric (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: referencias_comissao_dentista
//   id: uuid (not null, default: gen_random_uuid())
//   faixa_entrada_minima: numeric (nullable)
//   faixa_entrada_maxima: numeric (nullable)
//   percentual_comissao: numeric (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: rotinas_usuarios
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   cargo_id: uuid (nullable)
//   ativa: boolean (not null, default: true)
//   data_criacao: timestamp with time zone (not null, default: now())
//   data_atualizacao: timestamp with time zone (not null, default: now())
// Table: saida_produtos
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (not null)
//   quantidade: integer (not null)
//   tipo_saida: text (nullable)
//   descricao: text (nullable)
//   usuario_id: uuid (nullable)
//   data_saida: timestamp with time zone (nullable, default: now())
//   observacoes: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   quantidade_devolver: integer (nullable)
// Table: salas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: sorriso_dos_sonhos_config
//   id: uuid (not null, default: gen_random_uuid())
//   valor_bonus: numeric (not null, default: 100)
//   meta_indicacoes: integer (not null, default: 2)
//   atualizado_em: timestamp with time zone (not null, default: now())
//   usuarios_elegiveis: jsonb (nullable, default: '[]'::jsonb)
// Table: sorriso_dos_sonhos_indicacoes
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_indicador_id: uuid (nullable)
//   nome_indicado: text (not null)
//   telefone_indicado: text (nullable)
//   colaborador_id: uuid (nullable)
//   status: text (not null, default: 'pendente'::text)
//   valor_premio_paciente: numeric (nullable, default: 0)
//   data_fechamento: date (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
// Table: tamanhos_implante
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: tarefas_rotina
//   id: uuid (not null, default: gen_random_uuid())
//   rotina_id: uuid (not null)
//   numero_sequencia: integer (not null)
//   descricao_tarefa: text (not null)
//   horario_inicio: time without time zone (nullable)
//   horario_fim: time without time zone (nullable)
//   peso_percentual: numeric (not null, default: 5)
//   ativa: boolean (not null, default: true)
//   data_criacao: timestamp with time zone (not null, default: now())
//   periodicidade: text (not null, default: 'diaria'::text)
//   dias_semana: jsonb (nullable)
//   dia_mes: integer (nullable)
//   data_inicio_contagem: date (nullable)
//   observacao: text (nullable)
// Table: terceiros_categorias
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   slug: text (not null)
//   ordem: integer (nullable, default: 0)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: terceiros_colunas
//   id: uuid (not null, default: gen_random_uuid())
//   categoria_slug: text (not null)
//   titulo: text (not null)
//   cor: text (not null, default: 'border-slate-700 bg-slate-800/50'::text)
//   ordem: integer (not null, default: 0)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: terceiros_historico
//   id: uuid (not null, default: gen_random_uuid())
//   tarefa_id: uuid (not null)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: terceiros_tarefas
//   id: uuid (not null, default: gen_random_uuid())
//   categoria_slug: text (not null)
//   titulo: text (not null)
//   descricao: text (nullable)
//   paciente_nome: text (nullable)
//   terceiro_nome: text (nullable)
//   status: text (not null, default: 'pendente'::text)
//   data_prevista: date (nullable)
//   ordem: integer (nullable, default: 0)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   usuario_id: uuid (nullable)
//   cor: text (nullable, default: 'border-slate-700'::text)
//   etiquetas: jsonb (nullable, default: '[]'::jsonb)
// Table: usuario_permissoes
//   usuario_id: uuid (not null)
//   permissao_id: uuid (not null)
// Table: usuarios
//   id: uuid (not null)
//   email: text (not null)
//   nome: text (not null)
//   role: text (nullable, default: 'user'::text)
//   cpf: text (nullable)
//   data_nascimento: date (nullable)
//   telefone: text (nullable)
//   endereco: text (nullable)
//   cargo_id: uuid (nullable)
//   data_admissao: date (nullable)
//   salario: numeric (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   cargo_secundario_id: uuid (nullable)
//   avatar_url: text (nullable)
//   ordem: integer (nullable, default: 0)
//   horario_entrada: time without time zone (nullable)
//   inicio_lanche_manha: time without time zone (nullable)
//   fim_lanche_manha: time without time zone (nullable)
//   saida_almoco: time without time zone (nullable)
//   retorno_almoco: time without time zone (nullable)
//   inicio_lanche_tarde: time without time zone (nullable)
//   fim_lanche_tarde: time without time zone (nullable)
//   horario_saida: time without time zone (nullable)
//   obrigatorio_pp_pdm: boolean (not null, default: false)
//   obrigatorio_bonificacao: boolean (not null, default: false)
//   possui_carteira: boolean (not null, default: true)
//   exigir_rotina: boolean (not null, default: true)
//   dias_trabalho: jsonb (nullable, default: '[1, 2, 3, 4, 5]'::jsonb)
// Table: usuarios_compromissos
//   id: uuid (not null, default: gen_random_uuid())
//   compromisso_id: uuid (not null)
//   usuario_criador_id: uuid (not null)
//   usuario_destinatario_id: uuid (not null)
//   permissao: permissao_compromisso_enum (not null, default: 'visualizar'::permissao_compromisso_enum)
//   criado_em: timestamp with time zone (not null, default: now())
// Table: vendas_confirmadas
//   id: uuid (not null, default: gen_random_uuid())
//   oportunidade_id: uuid (not null)
//   paciente_nome: text (not null)
//   telefone: text (nullable)
//   data_original: date (nullable)
//   dentista_avaliador: uuid (nullable)
//   crc: uuid (nullable)
//   valor_tratamento: numeric (not null)
//   tratamento: text (nullable)
//   observacoes: text (nullable)
//   data_fechamento: date (not null)
//   valor_entrada: numeric (not null)
//   percentual_entrada: numeric (not null)
//   observacoes_fechamento: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   fatura_comissao_id: uuid (nullable)
//   status_comissao: text (nullable, default: 'em_aberto'::text)
//   percentual_comissao: numeric (nullable)
//   valor_comissao: numeric (nullable)

// --- CONSTRAINTS ---
// Table: auditoria_tarefas_rotina
//   PRIMARY KEY auditoria_tarefas_rotina_pkey: PRIMARY KEY (id)
//   FOREIGN KEY auditoria_tarefas_rotina_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES tarefas_rotina(id) ON DELETE CASCADE
//   FOREIGN KEY auditoria_tarefas_rotina_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: ausencias
//   PRIMARY KEY ausencias_pkey: PRIMARY KEY (id)
//   FOREIGN KEY ausencias_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: avaliacoes
//   FOREIGN KEY avaliacoes_crc_comercial_id_fkey: FOREIGN KEY (crc_comercial_id) REFERENCES crc_comercial(id) ON DELETE SET NULL
//   FOREIGN KEY avaliacoes_dentista_avaliador_id_fkey: FOREIGN KEY (dentista_avaliador_id) REFERENCES dentistas_avaliadores(id) ON DELETE SET NULL
//   FOREIGN KEY avaliacoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
// Table: campo_configuracao
//   FOREIGN KEY campo_configuracao_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   UNIQUE campo_configuracao_especialidade_id_campo_id_key: UNIQUE (especialidade_id, campo_id)
//   FOREIGN KEY campo_configuracao_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
//   PRIMARY KEY campo_configuracao_pkey: PRIMARY KEY (id)
// Table: campo_opcoes
//   FOREIGN KEY campo_opcoes_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   FOREIGN KEY campo_opcoes_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
//   PRIMARY KEY campo_opcoes_pkey: PRIMARY KEY (id)
// Table: campos_personalizados
//   UNIQUE campos_personalizados_nome_key: UNIQUE (nome)
//   PRIMARY KEY campos_personalizados_pkey: PRIMARY KEY (id)
// Table: cargo_permissoes
//   FOREIGN KEY cargo_permissoes_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
//   FOREIGN KEY cargo_permissoes_permissao_id_fkey: FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
//   PRIMARY KEY cargo_permissoes_pkey: PRIMARY KEY (cargo_id, permissao_id)
// Table: cargos
//   PRIMARY KEY cargos_pkey: PRIMARY KEY (id)
// Table: carteira_transacoes
//   FOREIGN KEY carteira_transacoes_origem_id_fkey: FOREIGN KEY (origem_id) REFERENCES performance_bonificacao(id) ON DELETE CASCADE
//   PRIMARY KEY carteira_transacoes_pkey: PRIMARY KEY (id)
//   CHECK carteira_transacoes_tipo_check: CHECK ((tipo = ANY (ARRAY['credito'::text, 'debito'::text, 'saque'::text])))
//   FOREIGN KEY carteira_transacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: colaboradores_detalhes
//   PRIMARY KEY colaboradores_detalhes_pkey: PRIMARY KEY (usuario_id)
//   FOREIGN KEY colaboradores_detalhes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: compra_itens
//   FOREIGN KEY compra_itens_compra_id_fkey: FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE
//   PRIMARY KEY compra_itens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compra_itens_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
//   FOREIGN KEY compra_itens_sala_id_fkey: FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
// Table: compras
//   FOREIGN KEY compras_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY compras_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compras_sala_id_fkey: FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
// Table: compromissos
//   PRIMARY KEY compromissos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compromissos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: configuracoes_negociacao
//   PRIMARY KEY configuracoes_negociacao_pkey: PRIMARY KEY (id)
// Table: contatos_follow_up
//   FOREIGN KEY contatos_follow_up_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY contatos_follow_up_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contatos_follow_up_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: crc_comercial
//   PRIMARY KEY crc_comercial_pkey: PRIMARY KEY (id)
//   FOREIGN KEY crc_comercial_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: criativos_gerados
//   FOREIGN KEY criativos_gerados_dentista_avaliador_id_fkey: FOREIGN KEY (dentista_avaliador_id) REFERENCES dentistas_avaliadores(id) ON DELETE CASCADE
//   PRIMARY KEY criativos_gerados_pkey: PRIMARY KEY (id)
// Table: dentistas
//   PRIMARY KEY dentistas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dentistas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: dentistas_avaliadores
//   PRIMARY KEY dentistas_avaliadores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dentistas_avaliadores_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: descontos_por_prazo
//   CHECK descontos_por_prazo_faixa_numero_check: CHECK (((faixa_numero >= 0) AND (faixa_numero <= 5)))
//   PRIMARY KEY descontos_por_prazo_pkey: PRIMARY KEY (id)
// Table: diametros_implante
//   UNIQUE diametros_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY diametros_implante_pkey: PRIMARY KEY (id)
// Table: embalagens
//   UNIQUE embalagens_nome_key: UNIQUE (nome)
//   PRIMARY KEY embalagens_pkey: PRIMARY KEY (id)
// Table: entrada_produtos
//   FOREIGN KEY entrada_produtos_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY entrada_produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY entrada_produtos_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
// Table: especialidade_campos
//   FOREIGN KEY especialidade_campos_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   FOREIGN KEY especialidade_campos_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
//   PRIMARY KEY especialidade_campos_pkey: PRIMARY KEY (especialidade_id, campo_id)
// Table: especialidades
//   UNIQUE especialidades_nome_key: UNIQUE (nome)
//   PRIMARY KEY especialidades_pkey: PRIMARY KEY (id)
// Table: execucoes_rotina
//   PRIMARY KEY execucoes_rotina_pkey: PRIMARY KEY (id)
//   FOREIGN KEY execucoes_rotina_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES tarefas_rotina(id) ON DELETE CASCADE
//   FOREIGN KEY execucoes_rotina_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: faixas_valores_parcelas
//   PRIMARY KEY faixas_valores_parcelas_pkey: PRIMARY KEY (id)
// Table: faturamento_comissoes
//   PRIMARY KEY faturamento_comissoes_pkey: PRIMARY KEY (id)
// Table: faturas_comissoes
//   FOREIGN KEY faturas_comissoes_faturamento_id_fkey: FOREIGN KEY (faturamento_id) REFERENCES faturamento_comissoes(id) ON DELETE CASCADE
//   PRIMARY KEY faturas_comissoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY faturas_comissoes_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: fornecedores
//   PRIMARY KEY fornecedores_pkey: PRIMARY KEY (id)
// Table: historico_compras
//   FOREIGN KEY historico_compras_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY historico_compras_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_compras_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
// Table: marcas_implante
//   UNIQUE marcas_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY marcas_implante_pkey: PRIMARY KEY (id)
// Table: normas_aceites
//   FOREIGN KEY normas_aceites_norma_id_fkey: FOREIGN KEY (norma_id) REFERENCES normas_internas(id) ON DELETE CASCADE
//   UNIQUE normas_aceites_norma_id_usuario_id_key: UNIQUE (norma_id, usuario_id)
//   PRIMARY KEY normas_aceites_pkey: PRIMARY KEY (id)
//   FOREIGN KEY normas_aceites_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: normas_internas
//   FOREIGN KEY normas_internas_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE SET NULL
//   PRIMARY KEY normas_internas_pkey: PRIMARY KEY (id)
// Table: orcamentos
//   FOREIGN KEY orcamentos_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY orcamentos_pkey: PRIMARY KEY (id)
// Table: pacientes
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
// Table: performance_bonificacao
//   PRIMARY KEY performance_bonificacao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY performance_bonificacao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE performance_bonificacao_usuario_id_mes_referencia_key: UNIQUE (usuario_id, mes_referencia)
// Table: performance_bonificacao_itens
//   PRIMARY KEY performance_bonificacao_itens_pkey: PRIMARY KEY (id)
// Table: performance_pp_pdm
//   PRIMARY KEY performance_pp_pdm_pkey: PRIMARY KEY (id)
//   UNIQUE performance_pp_pdm_usuario_id_data_registro_key: UNIQUE (usuario_id, data_registro)
//   FOREIGN KEY performance_pp_pdm_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: permissoes
//   UNIQUE permissoes_nome_key: UNIQUE (nome)
//   PRIMARY KEY permissoes_pkey: PRIMARY KEY (id)
// Table: produto_campos_valores
//   FOREIGN KEY produto_campos_valores_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   PRIMARY KEY produto_campos_valores_pkey: PRIMARY KEY (id)
//   UNIQUE produto_campos_valores_produto_id_campo_id_key: UNIQUE (produto_id, campo_id)
//   FOREIGN KEY produto_campos_valores_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
// Table: produtos
//   FOREIGN KEY produtos_embalagem_id_fkey: FOREIGN KEY (embalagem_id) REFERENCES embalagens(id) ON DELETE SET NULL
//   FOREIGN KEY produtos_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE SET NULL
//   PRIMARY KEY produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY produtos_sala_id_fkey: FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
// Table: referencias_comissao_crc
//   PRIMARY KEY referencias_comissao_crc_pkey: PRIMARY KEY (id)
// Table: referencias_comissao_dentista
//   PRIMARY KEY referencias_comissao_dentista_pkey: PRIMARY KEY (id)
// Table: rotinas_usuarios
//   FOREIGN KEY rotinas_usuarios_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE SET NULL
//   PRIMARY KEY rotinas_usuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY rotinas_usuarios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: saida_produtos
//   PRIMARY KEY saida_produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY saida_produtos_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
//   CHECK saida_produtos_tipo_saida_check: CHECK ((tipo_saida = ANY (ARRAY['definitiva'::text, 'parcial'::text])))
//   FOREIGN KEY saida_produtos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: salas
//   UNIQUE salas_nome_key: UNIQUE (nome)
//   PRIMARY KEY salas_pkey: PRIMARY KEY (id)
// Table: sorriso_dos_sonhos_config
//   PRIMARY KEY sorriso_dos_sonhos_config_pkey: PRIMARY KEY (id)
// Table: sorriso_dos_sonhos_indicacoes
//   FOREIGN KEY sorriso_dos_sonhos_indicacoes_colaborador_id_fkey: FOREIGN KEY (colaborador_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY sorriso_dos_sonhos_indicacoes_paciente_indicador_id_fkey: FOREIGN KEY (paciente_indicador_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY sorriso_dos_sonhos_indicacoes_pkey: PRIMARY KEY (id)
// Table: tamanhos_implante
//   UNIQUE tamanhos_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY tamanhos_implante_pkey: PRIMARY KEY (id)
// Table: tarefas_rotina
//   PRIMARY KEY tarefas_rotina_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tarefas_rotina_rotina_id_fkey: FOREIGN KEY (rotina_id) REFERENCES rotinas_usuarios(id) ON DELETE CASCADE
// Table: terceiros_categorias
//   PRIMARY KEY terceiros_categorias_pkey: PRIMARY KEY (id)
//   UNIQUE terceiros_categorias_slug_key: UNIQUE (slug)
// Table: terceiros_colunas
//   FOREIGN KEY terceiros_colunas_categoria_slug_fkey: FOREIGN KEY (categoria_slug) REFERENCES terceiros_categorias(slug) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY terceiros_colunas_pkey: PRIMARY KEY (id)
// Table: terceiros_historico
//   PRIMARY KEY terceiros_historico_pkey: PRIMARY KEY (id)
//   FOREIGN KEY terceiros_historico_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES terceiros_tarefas(id) ON DELETE CASCADE
//   FOREIGN KEY terceiros_historico_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: terceiros_tarefas
//   FOREIGN KEY terceiros_tarefas_categoria_slug_fkey: FOREIGN KEY (categoria_slug) REFERENCES terceiros_categorias(slug) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY terceiros_tarefas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY terceiros_tarefas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: usuario_permissoes
//   FOREIGN KEY usuario_permissoes_permissao_id_fkey: FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
//   PRIMARY KEY usuario_permissoes_pkey: PRIMARY KEY (usuario_id, permissao_id)
//   FOREIGN KEY usuario_permissoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE SET NULL
//   FOREIGN KEY usuarios_cargo_secundario_id_fkey: FOREIGN KEY (cargo_secundario_id) REFERENCES cargos(id) ON DELETE SET NULL
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
// Table: usuarios_compromissos
//   FOREIGN KEY usuarios_compromissos_compromisso_id_fkey: FOREIGN KEY (compromisso_id) REFERENCES compromissos(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_compromissos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY usuarios_compromissos_usuario_criador_id_fkey: FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   FOREIGN KEY usuarios_compromissos_usuario_destinatario_id_fkey: FOREIGN KEY (usuario_destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: vendas_confirmadas
//   FOREIGN KEY vendas_confirmadas_crc_fkey: FOREIGN KEY (crc) REFERENCES crc_comercial(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_confirmadas_dentista_avaliador_fkey: FOREIGN KEY (dentista_avaliador) REFERENCES dentistas_avaliadores(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_confirmadas_fatura_comissao_id_fkey: FOREIGN KEY (fatura_comissao_id) REFERENCES faturas_comissoes(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_confirmadas_oportunidade_id_fkey: FOREIGN KEY (oportunidade_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY vendas_confirmadas_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: auditoria_tarefas_rotina
//   Policy "auditoria_tarefas_rotina_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "auditoria_tarefas_rotina_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: ausencias
//   Policy "ausencias_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: avaliacoes
//   Policy "avaliacoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: campo_configuracao
//   Policy "campo_configuracao_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: campo_opcoes
//   Policy "campo_opcoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: campos_personalizados
//   Policy "campos_personalizados_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "campos_personalizados_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: cargo_permissoes
//   Policy "cargo_permissoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "cargo_permissoes_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: cargos
//   Policy "cargos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "cargos_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: carteira_transacoes
//   Policy "carteira_transacoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('operacional_performance'::text))
//   Policy "carteira_transacoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((usuario_id = auth.uid()) OR is_admin() OR has_permission('operacional_performance'::text))
//   Policy "carteira_transacoes_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id = auth.uid()) OR is_admin() OR has_permission('operacional_performance'::text))
//   Policy "carteira_transacoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('operacional_performance'::text))
// Table: colaboradores_detalhes
//   Policy "colaboradores_detalhes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Colaboradores'::text))
//   Policy "colaboradores_detalhes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "colaboradores_detalhes_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id = auth.uid()) OR is_admin() OR has_permission('Gerenciar Colaboradores'::text))
//   Policy "colaboradores_detalhes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
// Table: compra_itens
//   Policy "compra_itens_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "compra_itens_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "compra_itens_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "compra_itens_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
// Table: compras
//   Policy "compras_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "compras_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "compras_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "compras_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
// Table: compromissos
//   Policy "compromissos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id = auth.uid()) OR has_permission('Excluir Compromissos'::text) OR has_permission('Gerenciar Compromissos'::text) OR has_permission('operacional_comunicados'::text) OR is_admin())
//   Policy "compromissos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((usuario_id = auth.uid()) OR has_permission('Criar Compromissos'::text) OR has_permission('Gerenciar Compromissos'::text) OR has_permission('operacional_comunicados'::text) OR is_admin())
//   Policy "compromissos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id = auth.uid()) OR has_permission('Visualizar Todos Compromissos'::text) OR has_permission('Gerenciar Compromissos'::text) OR is_admin())
//   Policy "compromissos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id = auth.uid()) OR has_permission('Editar Compromissos'::text) OR has_permission('Gerenciar Compromissos'::text) OR has_permission('operacional_comunicados'::text) OR is_admin())
//     WITH CHECK: ((usuario_id = auth.uid()) OR has_permission('Editar Compromissos'::text) OR has_permission('Gerenciar Compromissos'::text) OR has_permission('operacional_comunicados'::text) OR is_admin())
// Table: configuracoes_negociacao
//   Policy "configuracoes_negociacao_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: contatos_follow_up
//   Policy "contatos_follow_up_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: crc_comercial
//   Policy "crc_comercial_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: criativos_gerados
//   Policy "criativos_gerados_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: dentistas
//   Policy "dentistas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: dentistas_avaliadores
//   Policy "dentistas_avaliadores_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: descontos_por_prazo
//   Policy "descontos_por_prazo_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: diametros_implante
//   Policy "diametros_implante_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "diametros_implante_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: embalagens
//   Policy "embalagens_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "embalagens_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: entrada_produtos
//   Policy "entrada_produtos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "entrada_produtos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "entrada_produtos_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "entrada_produtos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
// Table: especialidade_campos
//   Policy "especialidade_campos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "especialidade_campos_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: especialidades
//   Policy "especialidades_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "especialidades_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: execucoes_rotina
//   Policy "execucoes_rotina_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "execucoes_rotina_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((usuario_id = auth.uid()) OR is_admin())
//   Policy "execucoes_rotina_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "execucoes_rotina_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id = auth.uid()) OR is_admin())
//     WITH CHECK: ((usuario_id = auth.uid()) OR is_admin())
// Table: faixas_valores_parcelas
//   Policy "faixas_valores_parcelas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: faturamento_comissoes
//   Policy "faturamento_comissoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: faturas_comissoes
//   Policy "faturas_comissoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: fornecedores
//   Policy "fornecedores_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "fornecedores_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "fornecedores_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "fornecedores_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
// Table: historico_compras
//   Policy "historico_compras_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "historico_compras_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "historico_compras_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "historico_compras_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
// Table: marcas_implante
//   Policy "marcas_implante_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "marcas_implante_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: normas_aceites
//   Policy "normas_aceites_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "normas_aceites_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: normas_internas
//   Policy "normas_internas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "normas_internas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: is_admin()
//   Policy "normas_internas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "normas_internas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
// Table: orcamentos
//   Policy "orcamentos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pacientes
//   Policy "pacientes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: performance_bonificacao
//   Policy "performance_bonificacao_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: performance_bonificacao_itens
//   Policy "performance_bonificacao_itens_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: performance_pp_pdm
//   Policy "performance_pp_pdm_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: permissoes
//   Policy "permissoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "permissoes_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: produto_campos_valores
//   Policy "produto_campos_valores_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: produtos
//   Policy "produtos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "produtos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text) OR has_permission('Editar Estoque'::text))
//   Policy "produtos_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "produtos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text) OR has_permission('Editar Estoque'::text))
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text) OR has_permission('Editar Estoque'::text))
// Table: referencias_comissao_crc
//   Policy "referencias_comissao_crc_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: referencias_comissao_dentista
//   Policy "referencias_comissao_dentista_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: rotinas_usuarios
//   Policy "rotinas_usuarios_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('configuracoes_geral'::text) OR has_permission('configuracoes_rotinas'::text))
//   Policy "rotinas_usuarios_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: saida_produtos
//   Policy "saida_produtos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "saida_produtos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "saida_produtos_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "saida_produtos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Estoque'::text))
// Table: salas
//   Policy "salas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "salas_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: sorriso_dos_sonhos_config
//   Policy "allow_insert_config" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "allow_read_config" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "allow_update_config" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: sorriso_dos_sonhos_indicacoes
//   Policy "sorriso_dos_sonhos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tamanhos_implante
//   Policy "tamanhos_implante_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "tamanhos_implante_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: tarefas_rotina
//   Policy "tarefas_rotina_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('configuracoes_geral'::text) OR has_permission('configuracoes_rotinas'::text))
//   Policy "tarefas_rotina_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: terceiros_categorias
//   Policy "terceiros_categorias_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: terceiros_colunas
//   Policy "terceiros_colunas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: terceiros_historico
//   Policy "terceiros_historico_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: terceiros_tarefas
//   Policy "terceiros_tarefas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: usuario_permissoes
//   Policy "usuario_permissoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "usuario_permissoes_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: usuarios
//   Policy "usuarios_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "usuarios_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (is_admin() OR has_permission('Gerenciar Colaboradores'::text))
//   Policy "usuarios_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "usuarios_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((id = auth.uid()) OR is_admin() OR has_permission('Gerenciar Colaboradores'::text))
// Table: usuarios_compromissos
//   Policy "usuarios_compromissos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: vendas_confirmadas
//   Policy "vendas_confirmadas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION ativar_cascata_dentista_avaliador()
//   CREATE OR REPLACE FUNCTION public.ativar_cascata_dentista_avaliador()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_cargo_nome text;
//     v_cargo_secundario_nome text;
//   BEGIN
//     IF NEW.cargo_id IS NOT NULL THEN
//       SELECT nome INTO v_cargo_nome FROM public.cargos WHERE id = NEW.cargo_id;
//     END IF;
//
//     IF NEW.cargo_secundario_id IS NOT NULL THEN
//       SELECT nome INTO v_cargo_secundario_nome FROM public.cargos WHERE id = NEW.cargo_secundario_id;
//     END IF;
//
//     IF v_cargo_nome = 'Dentista Avaliador' OR v_cargo_secundario_nome = 'Dentista Avaliador' THEN
//       IF NOT EXISTS (SELECT 1 FROM public.dentistas_avaliadores WHERE usuario_id = NEW.id) THEN
//         INSERT INTO public.dentistas_avaliadores (usuario_id, nome, email, status)
//         VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
//       ELSE
//         UPDATE public.dentistas_avaliadores
//         SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
//         WHERE usuario_id = NEW.id;
//       END IF;
//     END IF;
//
//     IF v_cargo_nome = 'Dentista' OR v_cargo_secundario_nome = 'Dentista' THEN
//       IF NOT EXISTS (SELECT 1 FROM public.dentistas WHERE usuario_id = NEW.id) THEN
//         INSERT INTO public.dentistas (usuario_id, nome, email, status)
//         VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
//       ELSE
//         UPDATE public.dentistas
//         SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
//         WHERE usuario_id = NEW.id;
//       END IF;
//     END IF;
//
//     IF v_cargo_nome IN ('CRC', 'CRC Comercial') OR v_cargo_secundario_nome IN ('CRC', 'CRC Comercial') THEN
//       IF NOT EXISTS (SELECT 1 FROM public.crc_comercial WHERE usuario_id = NEW.id) THEN
//         INSERT INTO public.crc_comercial (usuario_id, nome, email, status)
//         VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
//       ELSE
//         UPDATE public.crc_comercial
//         SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
//         WHERE usuario_id = NEW.id;
//       END IF;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION gerar_adiantamento_mes_sorriso(text)
//   CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_sorriso(p_mes text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user RECORD;
//     v_config RECORD;
//   BEGIN
//     SELECT * INTO v_config FROM public.sorriso_dos_sonhos_config LIMIT 1;
//
//     FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
//       IF v_config.id IS NULL OR v_config.usuarios_elegiveis IS NULL OR v_config.usuarios_elegiveis = '[]'::jsonb OR v_config.usuarios_elegiveis @> ('"' || v_user.id || '"')::jsonb THEN
//         IF NOT EXISTS (
//           SELECT 1 FROM public.carteira_transacoes
//           WHERE usuario_id = v_user.id
//           AND mes_referencia = p_mes
//           AND descricao = 'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)'
//         ) THEN
//           INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
//           VALUES (v_user.id, 'credito', 200, 'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)', p_mes);
//         END IF;
//       END IF;
//     END LOOP;
//   END;
//   $function$
//
// FUNCTION has_permission(text)
//   CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     v_is_admin boolean;
//     v_has_user_perm boolean;
//     v_has_cargo_perm boolean;
//     v_user_id uuid;
//   BEGIN
//     v_is_admin := public.is_admin();
//     if v_is_admin then return true; end if;
//
//     v_user_id := auth.uid();
//     if v_user_id is null then return false; end if;
//
//     -- check user perms
//     SELECT EXISTS (
//       SELECT 1 FROM public.usuario_permissoes up
//       JOIN public.permissoes p ON p.id = up.permissao_id
//       WHERE up.usuario_id = v_user_id AND p.nome = permission_name
//     ) INTO v_has_user_perm;
//
//     if v_has_user_perm then return true; end if;
//
//     -- check cargo perms (primary or secondary)
//     SELECT EXISTS (
//       SELECT 1 FROM public.usuarios u
//       JOIN public.cargo_permissoes cp ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
//       JOIN public.permissoes p ON p.id = cp.permissao_id
//       WHERE u.id = v_user_id AND p.nome = permission_name
//     ) INTO v_has_cargo_perm;
//
//     return v_has_cargo_perm;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_role text;
//     v_email text;
//   BEGIN
//     v_email := current_setting('request.jwt.claims', true)::jsonb ->> 'email';
//     IF v_email IN ('drleandro@nuvia.com', 'drleandrolinhares@gmail.com') THEN
//       RETURN true;
//     END IF;
//
//     SELECT role INTO v_role FROM public.usuarios WHERE id = auth.uid();
//     RETURN v_role = 'admin';
//   END;
//   $function$
//
// FUNCTION processar_fechamento_mes_sorriso(text)
//   CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_sorriso(p_mes text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user RECORD;
//     v_config RECORD;
//     v_count integer;
//     v_falta integer;
//     v_valor_debito numeric;
//     v_valor_por_indicacao numeric;
//   BEGIN
//     SELECT * INTO v_config FROM public.sorriso_dos_sonhos_config LIMIT 1;
//     v_valor_por_indicacao := COALESCE(v_config.valor_bonus, 100) / COALESCE(v_config.meta_indicacoes, 2);
//
//     FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
//       IF v_config.id IS NULL OR v_config.usuarios_elegiveis IS NULL OR v_config.usuarios_elegiveis = '[]'::jsonb OR v_config.usuarios_elegiveis @> ('"' || v_user.id || '"')::jsonb THEN
//         IF EXISTS (
//           SELECT 1 FROM public.carteira_transacoes
//           WHERE usuario_id = v_user.id
//           AND mes_referencia = p_mes
//           AND descricao = 'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)'
//         ) THEN
//           IF NOT EXISTS (
//             SELECT 1 FROM public.carteira_transacoes
//             WHERE usuario_id = v_user.id
//             AND mes_referencia = p_mes
//             AND descricao = 'Ajuste de Meta (não atingimento das 4 indicações)'
//           ) THEN
//             SELECT COUNT(*) INTO v_count
//             FROM public.sorriso_dos_sonhos_indicacoes
//             WHERE colaborador_id = v_user.id
//               AND status = 'fechado'
//               AND to_char(data_fechamento::date, 'YYYY-MM') = p_mes;
//
//             IF v_count < 4 THEN
//               v_falta := 4 - v_count;
//               v_valor_debito := v_falta * v_valor_por_indicacao;
//
//               INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
//               VALUES (v_user.id, 'debito', v_valor_debito, 'Ajuste de Meta (não atingimento das 4 indicações)', p_mes);
//             END IF;
//           END IF;
//         END IF;
//       END IF;
//     END LOOP;
//   END;
//   $function$
//
// FUNCTION trg_atualiza_estoque_ao_finalizar_compra()
//   CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_ao_finalizar_compra()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_item RECORD;
//     v_qtd INT;
//   BEGIN
//     -- From anything to Finalizada -> Add stock
//     IF OLD.status IS DISTINCT FROM 'Finalizada' AND NEW.status = 'Finalizada' THEN
//       FOR v_item IN SELECT * FROM public.compra_itens WHERE compra_id = NEW.id LOOP
//         IF v_item.referencia_consumo = 'itens_embalagem' THEN
//           v_qtd := COALESCE(v_item.itens_embalagem, 0);
//         ELSE
//           v_qtd := COALESCE(v_item.qtd_comprada, 0);
//         END IF;
//
//         UPDATE public.produtos
//         SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd
//         WHERE id = v_item.produto_id;
//       END LOOP;
//
//     -- From Finalizada to anything -> Revert stock
//     ELSIF OLD.status = 'Finalizada' AND NEW.status IS DISTINCT FROM 'Finalizada' THEN
//       FOR v_item IN SELECT * FROM public.compra_itens WHERE compra_id = NEW.id LOOP
//         IF v_item.referencia_consumo = 'itens_embalagem' THEN
//           v_qtd := COALESCE(v_item.itens_embalagem, 0);
//         ELSE
//           v_qtd := COALESCE(v_item.qtd_comprada, 0);
//         END IF;
//
//         UPDATE public.produtos
//         SET quantidade_estoque = GREATEST(0, COALESCE(quantidade_estoque, 0) - v_qtd)
//         WHERE id = v_item.produto_id;
//       END LOOP;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trg_atualiza_estoque_compra_item()
//   CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_compra_item()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_status text;
//     v_qtd_adicionar_new integer := 0;
//     v_qtd_adicionar_old integer := 0;
//   BEGIN
//     -- Identify parent status
//     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
//       SELECT status INTO v_status FROM public.compras WHERE id = NEW.compra_id;
//       IF NEW.referencia_consumo = 'itens_embalagem' THEN
//         v_qtd_adicionar_new := COALESCE(NEW.itens_embalagem, 0);
//       ELSE
//         v_qtd_adicionar_new := COALESCE(NEW.qtd_comprada, 0);
//       END IF;
//     END IF;
//
//     IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
//       SELECT status INTO v_status FROM public.compras WHERE id = OLD.compra_id;
//       IF OLD.referencia_consumo = 'itens_embalagem' THEN
//         v_qtd_adicionar_old := COALESCE(OLD.itens_embalagem, 0);
//       ELSE
//         v_qtd_adicionar_old := COALESCE(OLD.qtd_comprada, 0);
//       END IF;
//     END IF;
//
//     -- If status is not Finalizada, we don't touch the stock
//     IF v_status IS DISTINCT FROM 'Finalizada' THEN
//       IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
//     END IF;
//
//     -- If Finalizada, apply changes
//     IF TG_OP = 'INSERT' THEN
//       UPDATE public.produtos
//       SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_adicionar_new
//       WHERE id = NEW.produto_id;
//       RETURN NEW;
//     ELSIF TG_OP = 'UPDATE' THEN
//       IF NEW.produto_id = OLD.produto_id THEN
//         UPDATE public.produtos
//         SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old + v_qtd_adicionar_new
//         WHERE id = NEW.produto_id;
//       ELSE
//         UPDATE public.produtos
//         SET quantidade_estoque = GREATEST(0, COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old)
//         WHERE id = OLD.produto_id;
//
//         UPDATE public.produtos
//         SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_adicionar_new
//         WHERE id = NEW.produto_id;
//       END IF;
//       RETURN NEW;
//     ELSIF TG_OP = 'DELETE' THEN
//       UPDATE public.produtos
//       SET quantidade_estoque = GREATEST(0, COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old)
//       WHERE id = OLD.produto_id;
//       RETURN OLD;
//     END IF;
//
//     RETURN NULL;
//   END;
//   $function$
//
// FUNCTION trg_atualiza_estoque_entrada()
//   CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_entrada()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_ref text;
//   BEGIN
//     SELECT referencia_consumo::text INTO v_ref FROM public.produtos WHERE id = NEW.produto_id;
//
//     IF v_ref = 'itens_embalagem' THEN
//       UPDATE public.produtos
//       SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + COALESCE(NEW.quantidade_embalagem, 0)
//       WHERE id = NEW.produto_id;
//     ELSE
//       UPDATE public.produtos
//       SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + COALESCE(NEW.quantidade_comprada, 0)
//       WHERE id = NEW.produto_id;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trg_atualiza_estoque_saida()
//   CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_saida()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_qtd_new integer := 0;
//     v_qtd_old integer := 0;
//   BEGIN
//     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
//       v_qtd_new := COALESCE(NEW.quantidade, 0);
//     END IF;
//
//     IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
//       v_qtd_old := COALESCE(OLD.quantidade, 0);
//     END IF;
//
//     IF TG_OP = 'INSERT' THEN
//       UPDATE public.produtos
//       SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_new
//       WHERE id = NEW.produto_id;
//       RETURN NEW;
//     ELSIF TG_OP = 'UPDATE' THEN
//       IF NEW.produto_id = OLD.produto_id THEN
//         UPDATE public.produtos
//         SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_old - v_qtd_new
//         WHERE id = NEW.produto_id;
//       ELSE
//         UPDATE public.produtos
//         SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_old
//         WHERE id = OLD.produto_id;
//
//         UPDATE public.produtos
//         SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_new
//         WHERE id = NEW.produto_id;
//       END IF;
//       RETURN NEW;
//     ELSIF TG_OP = 'DELETE' THEN
//       UPDATE public.produtos
//       SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_old
//       WHERE id = OLD.produto_id;
//       RETURN OLD;
//     END IF;
//
//     RETURN NULL;
//   END;
//   $function$
//
// FUNCTION trg_sorriso_fechamento()
//   CREATE OR REPLACE FUNCTION public.trg_sorriso_fechamento()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_count integer;
//     v_mes text;
//     v_config RECORD;
//     v_meta integer;
//     v_valor numeric;
//   BEGIN
//     IF OLD.status IS DISTINCT FROM 'fechado' AND NEW.status = 'fechado' THEN
//       IF NEW.data_fechamento IS NULL THEN
//         NEW.data_fechamento := CURRENT_DATE;
//       END IF;
//
//       v_mes := to_char(NEW.data_fechamento::date, 'YYYY-MM');
//
//       SELECT COUNT(*) INTO v_count
//       FROM public.sorriso_dos_sonhos_indicacoes
//       WHERE colaborador_id = NEW.colaborador_id
//         AND status = 'fechado'
//         AND to_char(data_fechamento::date, 'YYYY-MM') = v_mes;
//
//       SELECT * INTO v_config FROM public.sorriso_dos_sonhos_config LIMIT 1;
//       v_meta := COALESCE(v_config.meta_indicacoes, 2);
//       v_valor := COALESCE(v_config.valor_bonus, 100);
//
//       IF v_count > 4 AND MOD(v_count - 4, v_meta) = 0 THEN
//         INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id)
//         VALUES (
//           NEW.colaborador_id,
//           'credito',
//           v_valor,
//           'Bônus Adicional: ' || v_count || 'ª Indicação (Programa Sorriso dos Sonhos)',
//           v_mes,
//           NULL
//         );
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trg_sync_carteira_bonificacao()
//   CREATE OR REPLACE FUNCTION public.trg_sync_carteira_bonificacao()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_possui_carteira boolean;
//   BEGIN
//     -- Check if user has carteira
//     SELECT possui_carteira INTO v_possui_carteira FROM public.usuarios WHERE id = NEW.usuario_id;
//
//     IF COALESCE(v_possui_carteira, true) = false THEN
//       RETURN NEW;
//     END IF;
//
//     -- Delete old automatic transactions for this origin to recreate them
//     DELETE FROM public.carteira_transacoes WHERE origem_id = NEW.id;
//
//     -- Always insert the initial credit of 350 for the month
//     INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id)
//     VALUES (NEW.usuario_id, 'credito', 350, 'Crédito: Bonificação Feijão com Arroz - ' || NEW.mes_referencia, NEW.mes_referencia, NEW.id);
//
//     -- If not eligible, insert the debit
//     IF NOT NEW.atingiu_meta THEN
//       INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id)
//       VALUES (NEW.usuario_id, 'debito', 350, 'Débito: Desclassificação Bonificação Feijão com Arroz', NEW.mes_referencia, NEW.id);
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: compra_itens
//   after_compra_item_change: CREATE TRIGGER after_compra_item_change AFTER INSERT OR UPDATE ON public.compra_itens FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_compra_item()
//   before_compra_item_delete: CREATE TRIGGER before_compra_item_delete BEFORE DELETE ON public.compra_itens FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_compra_item()
// Table: compras
//   after_compra_status_change: CREATE TRIGGER after_compra_status_change AFTER UPDATE OF status ON public.compras FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_ao_finalizar_compra()
// Table: entrada_produtos
//   after_entrada_produto: CREATE TRIGGER after_entrada_produto AFTER INSERT ON public.entrada_produtos FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_entrada()
// Table: performance_bonificacao
//   sync_carteira_bonificacao_trigger: CREATE TRIGGER sync_carteira_bonificacao_trigger AFTER INSERT OR UPDATE ON public.performance_bonificacao FOR EACH ROW EXECUTE FUNCTION trg_sync_carteira_bonificacao()
// Table: saida_produtos
//   after_saida_produto_change: CREATE TRIGGER after_saida_produto_change AFTER INSERT OR DELETE OR UPDATE ON public.saida_produtos FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_saida()
// Table: sorriso_dos_sonhos_indicacoes
//   trg_sorriso_fechamento_after: CREATE TRIGGER trg_sorriso_fechamento_after AFTER UPDATE ON public.sorriso_dos_sonhos_indicacoes FOR EACH ROW EXECUTE FUNCTION trg_sorriso_fechamento()
// Table: usuarios
//   trg_ativar_cascata_dentista_avaliador_insert: CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_insert AFTER INSERT ON public.usuarios FOR EACH ROW EXECUTE FUNCTION ativar_cascata_dentista_avaliador()
//   trg_ativar_cascata_dentista_avaliador_update: CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_update AFTER UPDATE OF cargo_id, cargo_secundario_id, nome, email, status ON public.usuarios FOR EACH ROW EXECUTE FUNCTION ativar_cascata_dentista_avaliador()

// --- INDEXES ---
// Table: avaliacoes
//   CREATE INDEX avaliacoes_crc_comercial_id_idx ON public.avaliacoes USING btree (crc_comercial_id)
//   CREATE INDEX avaliacoes_dentista_avaliador_id_idx ON public.avaliacoes USING btree (dentista_avaliador_id)
//   CREATE INDEX avaliacoes_paciente_id_idx ON public.avaliacoes USING btree (paciente_id)
//   CREATE INDEX avaliacoes_status_idx ON public.avaliacoes USING btree (status)
// Table: campo_configuracao
//   CREATE UNIQUE INDEX campo_configuracao_especialidade_id_campo_id_key ON public.campo_configuracao USING btree (especialidade_id, campo_id)
// Table: campo_opcoes
//   CREATE INDEX campo_opcoes_campo_id_idx ON public.campo_opcoes USING btree (campo_id)
// Table: campos_personalizados
//   CREATE UNIQUE INDEX campos_personalizados_nome_key ON public.campos_personalizados USING btree (nome)
// Table: compra_itens
//   CREATE INDEX compra_itens_compra_id_idx ON public.compra_itens USING btree (compra_id)
//   CREATE INDEX compra_itens_produto_id_idx ON public.compra_itens USING btree (produto_id)
//   CREATE INDEX compra_itens_sala_id_idx ON public.compra_itens USING btree (sala_id)
// Table: compras
//   CREATE INDEX compras_fornecedor_id_idx ON public.compras USING btree (fornecedor_id)
// Table: contatos_follow_up
//   CREATE INDEX contatos_follow_up_avaliacao_id_idx ON public.contatos_follow_up USING btree (avaliacao_id)
// Table: criativos_gerados
//   CREATE INDEX criativos_gerados_dentista_avaliador_id_idx ON public.criativos_gerados USING btree (dentista_avaliador_id)
// Table: diametros_implante
//   CREATE UNIQUE INDEX diametros_implante_nome_key ON public.diametros_implante USING btree (nome)
// Table: embalagens
//   CREATE UNIQUE INDEX embalagens_nome_key ON public.embalagens USING btree (nome)
// Table: especialidades
//   CREATE UNIQUE INDEX especialidades_nome_key ON public.especialidades USING btree (nome)
// Table: execucoes_rotina
//   CREATE INDEX execucoes_rotina_data_execucao_idx ON public.execucoes_rotina USING btree (data_execucao)
//   CREATE INDEX execucoes_rotina_tarefa_id_idx ON public.execucoes_rotina USING btree (tarefa_id)
//   CREATE INDEX execucoes_rotina_usuario_id_idx ON public.execucoes_rotina USING btree (usuario_id)
// Table: faturas_comissoes
//   CREATE INDEX faturas_comissoes_faturamento_id_idx ON public.faturas_comissoes USING btree (faturamento_id)
//   CREATE INDEX faturas_comissoes_profissional_id_idx ON public.faturas_comissoes USING btree (profissional_id)
// Table: marcas_implante
//   CREATE UNIQUE INDEX marcas_implante_nome_key ON public.marcas_implante USING btree (nome)
// Table: normas_aceites
//   CREATE UNIQUE INDEX normas_aceites_norma_id_usuario_id_key ON public.normas_aceites USING btree (norma_id, usuario_id)
// Table: orcamentos
//   CREATE INDEX orcamentos_avaliacao_id_idx ON public.orcamentos USING btree (avaliacao_id)
//   CREATE INDEX orcamentos_status_idx ON public.orcamentos USING btree (status)
// Table: performance_bonificacao
//   CREATE UNIQUE INDEX performance_bonificacao_usuario_id_mes_referencia_key ON public.performance_bonificacao USING btree (usuario_id, mes_referencia)
// Table: performance_pp_pdm
//   CREATE UNIQUE INDEX performance_pp_pdm_usuario_id_data_registro_key ON public.performance_pp_pdm USING btree (usuario_id, data_registro)
// Table: permissoes
//   CREATE UNIQUE INDEX permissoes_nome_key ON public.permissoes USING btree (nome)
// Table: produto_campos_valores
//   CREATE UNIQUE INDEX produto_campos_valores_produto_id_campo_id_key ON public.produto_campos_valores USING btree (produto_id, campo_id)
// Table: rotinas_usuarios
//   CREATE INDEX rotinas_usuarios_cargo_id_idx ON public.rotinas_usuarios USING btree (cargo_id)
//   CREATE INDEX rotinas_usuarios_usuario_id_idx ON public.rotinas_usuarios USING btree (usuario_id)
// Table: salas
//   CREATE UNIQUE INDEX salas_nome_key ON public.salas USING btree (nome)
// Table: sorriso_dos_sonhos_config
//   CREATE UNIQUE INDEX sorriso_dos_sonhos_config_single_row ON public.sorriso_dos_sonhos_config USING btree ((true))
// Table: tamanhos_implante
//   CREATE UNIQUE INDEX tamanhos_implante_nome_key ON public.tamanhos_implante USING btree (nome)
// Table: tarefas_rotina
//   CREATE INDEX tarefas_rotina_rotina_id_idx ON public.tarefas_rotina USING btree (rotina_id)
// Table: terceiros_categorias
//   CREATE UNIQUE INDEX terceiros_categorias_slug_key ON public.terceiros_categorias USING btree (slug)
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
// Table: vendas_confirmadas
//   CREATE INDEX vendas_confirmadas_oportunidade_id_idx ON public.vendas_confirmadas USING btree (oportunidade_id)
