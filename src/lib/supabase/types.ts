// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      auditoria_acesso: {
        Row: {
          acao: string
          criado_em: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          registro_id: string | null
          tabela_acessada: string
          tenant_id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id?: string | null
          tabela_acessada: string
          tenant_id: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id?: string | null
          tabela_acessada?: string
          tenant_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_acesso_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria_tarefas_rotina: {
        Row: {
          criado_em: string
          id: string
          mensagem: string | null
          tarefa_id: string
          tenant_id: string | null
          timestamp_cliente: string
          usuario_id: string
          valido: boolean
        }
        Insert: {
          criado_em?: string
          id?: string
          mensagem?: string | null
          tarefa_id: string
          tenant_id?: string | null
          timestamp_cliente: string
          usuario_id: string
          valido: boolean
        }
        Update: {
          criado_em?: string
          id?: string
          mensagem?: string | null
          tarefa_id?: string
          tenant_id?: string | null
          timestamp_cliente?: string
          usuario_id?: string
          valido?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_tarefas_rotina_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_rotina"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_tarefas_rotina_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_tarefas_rotina_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ausencias: {
        Row: {
          criado_em: string
          data: string
          data_fim: string | null
          descricao: string
          dia_mes: number | null
          dias_semana: Json | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          recorrencia: string | null
          tenant_id: string | null
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string
          data: string
          data_fim?: string | null
          descricao: string
          dia_mes?: number | null
          dias_semana?: Json | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          recorrencia?: string | null
          tenant_id?: string | null
          tipo?: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string
          data?: string
          data_fim?: string | null
          descricao?: string
          dia_mes?: number | null
          dias_semana?: Json | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          recorrencia?: string | null
          tenant_id?: string | null
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausencias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          destino_fiscal: string | null
          id: string
          observacoes: string | null
          observacoes_fechamento: string | null
          origem_id: string | null
          paciente_id: string
          proxima_data_contato: string | null
          status: string | null
          temperatura_lead: string | null
          tenant_id: string | null
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
          destino_fiscal?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          origem_id?: string | null
          paciente_id: string
          proxima_data_contato?: string | null
          status?: string | null
          temperatura_lead?: string | null
          tenant_id?: string | null
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
          destino_fiscal?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          origem_id?: string | null
          paciente_id?: string
          proxima_data_contato?: string | null
          status?: string | null
          temperatura_lead?: string | null
          tenant_id?: string | null
          tipo_tratamento?: string | null
          valor_entrada?: number | null
          valor_orcamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_crc_comercial_id_fkey"
            columns: ["crc_comercial_id"]
            isOneToOne: false
            referencedRelation: "crc_comercial"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_dentista_avaliador_id_fkey"
            columns: ["dentista_avaliador_id"]
            isOneToOne: false
            referencedRelation: "dentistas_avaliadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "funil_origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa_diario_fechamentos: {
        Row: {
          conferido: boolean
          conferido_em: string | null
          conferido_por: string | null
          criado_em: string
          data_referencia: string
          tenant_id: string | null
        }
        Insert: {
          conferido?: boolean
          conferido_em?: string | null
          conferido_por?: string | null
          criado_em?: string
          data_referencia: string
          tenant_id?: string | null
        }
        Update: {
          conferido?: boolean
          conferido_em?: string | null
          conferido_por?: string | null
          criado_em?: string
          data_referencia?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caixa_diario_fechamentos_conferido_por_fkey"
            columns: ["conferido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_diario_fechamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          campo_id?: string | null
          especialidade_id?: string | null
          id?: string
          label_customizado?: string | null
          ordem?: number | null
          tenant_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          campo_id?: string | null
          especialidade_id?: string | null
          id?: string
          label_customizado?: string | null
          ordem?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campo_configuracao_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_personalizados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campo_configuracao_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campo_configuracao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
        }
        Insert: {
          campo_id: string
          data_criacao?: string | null
          especialidade_id?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          campo_id?: string
          data_criacao?: string | null
          especialidade_id?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campo_opcoes_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_personalizados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campo_opcoes_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campo_opcoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
          tipo: string | null
        }
        Insert: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome: string
          opcoes?: Json | null
          tenant_id?: string | null
          tipo?: string | null
        }
        Update: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          opcoes?: Json | null
          tenant_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campos_personalizados_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos: {
        Row: {
          descricao: string | null
          id: string
          nome: string
          setor: string | null
          tenant_id: string | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          nome: string
          setor?: string | null
          tenant_id?: string | null
        }
        Update: {
          descricao?: string | null
          id?: string
          nome?: string
          setor?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cargos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      carteira_transacoes: {
        Row: {
          criado_em: string
          descricao: string
          id: string
          mes_referencia: string
          origem_id: string | null
          tenant_id: string | null
          tipo: string
          transacao_original_id: string | null
          usuario_id: string
          valor: number
        }
        Insert: {
          criado_em?: string
          descricao: string
          id?: string
          mes_referencia: string
          origem_id?: string | null
          tenant_id?: string | null
          tipo: string
          transacao_original_id?: string | null
          usuario_id: string
          valor: number
        }
        Update: {
          criado_em?: string
          descricao?: string
          id?: string
          mes_referencia?: string
          origem_id?: string | null
          tenant_id?: string | null
          tipo?: string
          transacao_original_id?: string | null
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "carteira_transacoes_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "performance_bonificacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carteira_transacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carteira_transacoes_transacao_original_id_fkey"
            columns: ["transacao_original_id"]
            isOneToOne: false
            referencedRelation: "carteira_transacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carteira_transacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversas: {
        Row: {
          criado_em: string
          criado_por: string | null
          id: string
          nome: string | null
          tenant_id: string | null
          tipo: string
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          id?: string
          nome?: string | null
          tenant_id?: string | null
          tipo: string
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          id?: string
          nome?: string | null
          tenant_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_mensagens: {
        Row: {
          conteudo: string
          conversa_id: string | null
          criado_em: string
          id: string
          remetente_id: string | null
          tenant_id: string | null
        }
        Insert: {
          conteudo: string
          conversa_id?: string | null
          criado_em?: string
          id?: string
          remetente_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          conteudo?: string
          conversa_id?: string | null
          criado_em?: string
          id?: string
          remetente_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chat_conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mensagens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participantes: {
        Row: {
          conversa_id: string
          criado_em: string
          tenant_id: string | null
          ultima_leitura: string
          usuario_id: string
        }
        Insert: {
          conversa_id: string
          criado_em?: string
          tenant_id?: string | null
          ultima_leitura?: string
          usuario_id: string
        }
        Update: {
          conversa_id?: string
          criado_em?: string
          tenant_id?: string | null
          ultima_leitura?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participantes_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chat_conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participantes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participantes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_detalhes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_detalhes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "compra_itens_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compra_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compra_itens_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compra_itens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          valor_total_compra?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compromissos: {
        Row: {
          arquivado: boolean
          atualizado_em: string
          concluido_em: string | null
          concluido_por: string | null
          criado_em: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          eh_dia_inteiro: boolean
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          lead_id: string | null
          paciente_id: string | null
          resultado_acao: string | null
          setor: string | null
          status_acao: string | null
          tenant_id: string | null
          tipo_compromisso: Database["public"]["Enums"]["tipo_compromisso_enum"]
          usuario_id: string
        }
        Insert: {
          arquivado?: boolean
          atualizado_em?: string
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          eh_dia_inteiro?: boolean
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          lead_id?: string | null
          paciente_id?: string | null
          resultado_acao?: string | null
          setor?: string | null
          status_acao?: string | null
          tenant_id?: string | null
          tipo_compromisso: Database["public"]["Enums"]["tipo_compromisso_enum"]
          usuario_id: string
        }
        Update: {
          arquivado?: boolean
          atualizado_em?: string
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          eh_dia_inteiro?: boolean
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          lead_id?: string | null
          paciente_id?: string | null
          resultado_acao?: string | null
          setor?: string | null
          status_acao?: string | null
          tenant_id?: string | null
          tipo_compromisso?: Database["public"]["Enums"]["tipo_compromisso_enum"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compromissos_concluido_por_fkey"
            columns: ["concluido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funil_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_acesso: {
        Row: {
          atualizado_em: string | null
          id: string
          qua_fim: string | null
          qua_inicio: string | null
          qui_fim: string | null
          qui_inicio: string | null
          sab_fim: string | null
          sab_inicio: string | null
          seg_fim: string | null
          seg_inicio: string | null
          sex_fim: string | null
          sex_inicio: string | null
          tenant_id: string | null
          ter_fim: string | null
          ter_inicio: string | null
        }
        Insert: {
          atualizado_em?: string | null
          id?: string
          qua_fim?: string | null
          qua_inicio?: string | null
          qui_fim?: string | null
          qui_inicio?: string | null
          sab_fim?: string | null
          sab_inicio?: string | null
          seg_fim?: string | null
          seg_inicio?: string | null
          sex_fim?: string | null
          sex_inicio?: string | null
          tenant_id?: string | null
          ter_fim?: string | null
          ter_inicio?: string | null
        }
        Update: {
          atualizado_em?: string | null
          id?: string
          qua_fim?: string | null
          qua_inicio?: string | null
          qui_fim?: string | null
          qui_inicio?: string | null
          sab_fim?: string | null
          sab_inicio?: string | null
          seg_fim?: string | null
          seg_inicio?: string | null
          sex_fim?: string | null
          sex_inicio?: string | null
          tenant_id?: string | null
          ter_fim?: string | null
          ter_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_acesso_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_negociacao: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          percentual_entrada_padrao: number
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          percentual_entrada_padrao?: number
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          percentual_entrada_padrao?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_negociacao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_nfse: {
        Row: {
          atualizado_em: string | null
          bairro: string | null
          cep: string | null
          certificado_digital_path: string | null
          certificado_senha: string | null
          cnpj: string | null
          complemento: string | null
          criado_em: string | null
          email: string | null
          estado: string | null
          id: string
          inscricao_municipal: string | null
          logradouro: string | null
          municipio: string | null
          nome_fantasia: string | null
          numero: string | null
          optante_simples: boolean | null
          portal_nacional: boolean | null
          razao_social: string | null
          regime_tributacao: string | null
          rps_lote: string | null
          rps_numero: string | null
          rps_serie: string | null
          telefone: string | null
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          bairro?: string | null
          cep?: string | null
          certificado_digital_path?: string | null
          certificado_senha?: string | null
          cnpj?: string | null
          complemento?: string | null
          criado_em?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          optante_simples?: boolean | null
          portal_nacional?: boolean | null
          razao_social?: string | null
          regime_tributacao?: string | null
          rps_lote?: string | null
          rps_numero?: string | null
          rps_serie?: string | null
          telefone?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          bairro?: string | null
          cep?: string | null
          certificado_digital_path?: string | null
          certificado_senha?: string | null
          cnpj?: string | null
          complemento?: string | null
          criado_em?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          optante_simples?: boolean | null
          portal_nacional?: boolean | null
          razao_social?: string | null
          regime_tributacao?: string | null
          rps_lote?: string | null
          rps_numero?: string | null
          rps_serie?: string | null
          telefone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_nfse_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_follow_up_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatos_follow_up_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatos_follow_up_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          nome: string
          status?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          nome?: string
          status?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crc_comercial_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crc_comercial_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string | null
          data_criacao?: string | null
          dentista_avaliador_id: string
          descricao_video?: string | null
          id?: string
          mes_referencia?: string | null
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string | null
          data_criacao?: string | null
          dentista_avaliador_id?: string
          descricao_video?: string | null
          id?: string
          mes_referencia?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "criativos_gerados_dentista_avaliador_id_fkey"
            columns: ["dentista_avaliador_id"]
            isOneToOne: false
            referencedRelation: "dentistas_avaliadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criativos_gerados_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dentistas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dentistas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dentistas_avaliadores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dentistas_avaliadores_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          faixa_numero: number
          id?: string
          percentual_desconto?: number
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          faixa_numero?: number
          id?: string
          percentual_desconto?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "descontos_por_prazo_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      diametros_implante: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diametros_implante_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      embalagens: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embalagens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          unidade_consumo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entrada_produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrada_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrada_produtos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          campo_id: string
          especialidade_id: string
          id?: string | null
          label_customizado?: string | null
          ordem?: number | null
          tenant_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          campo_id?: string
          especialidade_id?: string
          id?: string | null
          label_customizado?: string | null
          ordem?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "especialidade_campos_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_personalizados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "especialidade_campos_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "especialidade_campos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      especialidades: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "especialidades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          nivel_criticidade:
            | Database["public"]["Enums"]["nivel_criticidade_enum"]
            | null
          tarefa_id: string
          tenant_id: string | null
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
          nivel_criticidade?:
            | Database["public"]["Enums"]["nivel_criticidade_enum"]
            | null
          tarefa_id: string
          tenant_id?: string | null
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
          nivel_criticidade?:
            | Database["public"]["Enums"]["nivel_criticidade_enum"]
            | null
          tarefa_id?: string
          tenant_id?: string | null
          timestamp_conclusao?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_rotina_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_rotina"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_rotina_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_rotina_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      faixas_valores_parcelas: {
        Row: {
          criado_em: string
          faixa_numero: number | null
          id: string
          max_parcelas: number
          tenant_id: string | null
          valor_maximo: number
          valor_minimo: number
        }
        Insert: {
          criado_em?: string
          faixa_numero?: number | null
          id?: string
          max_parcelas?: number
          tenant_id?: string | null
          valor_maximo: number
          valor_minimo?: number
        }
        Update: {
          criado_em?: string
          faixa_numero?: number | null
          id?: string
          max_parcelas?: number
          tenant_id?: string | null
          valor_maximo?: number
          valor_minimo?: number
        }
        Relationships: [
          {
            foreignKeyName: "faixas_valores_parcelas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      faturamento_comissoes: {
        Row: {
          criado_em: string | null
          data_faturamento: string | null
          data_pagamento_prevista: string | null
          id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string | null
          data_faturamento?: string | null
          data_pagamento_prevista?: string | null
          id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string | null
          data_faturamento?: string | null
          data_pagamento_prevista?: string | null
          id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faturamento_comissoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          tipo_profissional?: string | null
          valor_total_comissao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_comissoes_faturamento_id_fkey"
            columns: ["faturamento_id"]
            isOneToOne: false
            referencedRelation: "faturamento_comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_comissoes_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_comissoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fet_etiquetas: {
        Row: {
          cor: string
          criado_em: string
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          cor?: string
          criado_em?: string
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          cor?: string
          criado_em?: string
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fet_etiquetas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fet_historico: {
        Row: {
          acao: string
          criado_em: string
          detalhes: string | null
          id: string
          paciente_id: string | null
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          paciente_id?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          paciente_id?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fet_historico_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "fet_pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fet_historico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fet_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      fet_pacientes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome: string
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      fet_procedimentos: {
        Row: {
          atualizado_em: string
          concluido: boolean
          concluido_em: string | null
          concluido_por: string | null
          criado_em: string
          dentista_id: string | null
          etiquetas: Json | null
          id: string
          observacoes: string | null
          ordem: number
          paciente_id: string
          procedimento: string
          tempo_execucao: string | null
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          concluido?: boolean
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          dentista_id?: string | null
          etiquetas?: Json | null
          id?: string
          observacoes?: string | null
          ordem?: number
          paciente_id: string
          procedimento: string
          tempo_execucao?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          concluido?: boolean
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string
          dentista_id?: string | null
          etiquetas?: Json | null
          id?: string
          observacoes?: string | null
          ordem?: number
          paciente_id?: string
          procedimento?: string
          tempo_execucao?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fet_procedimentos_concluido_por_fkey"
            columns: ["concluido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fet_procedimentos_dentista_id_fkey"
            columns: ["dentista_id"]
            isOneToOne: false
            referencedRelation: "pro_agenda_dentistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fet_procedimentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "fet_pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_pagamentos: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          conta_origem: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string | null
          fornecedor: string | null
          id: string
          recorrencia_id: string | null
          referencia: string | null
          status: string | null
          tenant_id: string | null
          valor: number | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          conta_origem?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          recorrencia_id?: string | null
          referencia?: string | null
          status?: string | null
          tenant_id?: string | null
          valor?: number | null
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          conta_origem?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          recorrencia_id?: string | null
          referencia?: string | null
          status?: string | null
          tenant_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_pagamentos_recorrencia_id_fkey"
            columns: ["recorrencia_id"]
            isOneToOne: false
            referencedRelation: "financeiro_recorrencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_pagamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_recorrencias: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          frequencia: string | null
          id: string
          parcela_atual: number | null
          proxima_data_vencimento: string | null
          tenant_id: string | null
          total_parcelas: number | null
          valor_total: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          frequencia?: string | null
          id?: string
          parcela_atual?: number | null
          proxima_data_vencimento?: string | null
          tenant_id?: string | null
          total_parcelas?: number | null
          valor_total?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          frequencia?: string | null
          id?: string
          parcela_atual?: number | null
          proxima_data_vencimento?: string | null
          tenant_id?: string | null
          total_parcelas?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_recorrencias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_caixa_categorias: {
        Row: {
          criado_em: string
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_caixa_categorias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_caixa_despesas: {
        Row: {
          atualizado_em: string
          categoria: string
          criado_em: string
          data_vencimento: string
          descricao: string | null
          id: string
          tenant_id: string | null
          valor_estimado: number
        }
        Insert: {
          atualizado_em?: string
          categoria: string
          criado_em?: string
          data_vencimento: string
          descricao?: string | null
          id?: string
          tenant_id?: string | null
          valor_estimado?: number
        }
        Update: {
          atualizado_em?: string
          categoria?: string
          criado_em?: string
          data_vencimento?: string
          descricao?: string | null
          id?: string
          tenant_id?: string | null
          valor_estimado?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_caixa_despesas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_caixa_parceiros: {
        Row: {
          atualizado_em: string
          criado_em: string
          criterio_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          id: string
          nome: string
          status: string | null
          tenant_id: string | null
          tipo: string
          valor: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          criterio_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          id?: string
          nome: string
          status?: string | null
          tenant_id?: string | null
          tipo: string
          valor?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          criterio_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          id?: string
          nome?: string
          status?: string | null
          tenant_id?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_caixa_parceiros_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_caixa_receitas: {
        Row: {
          atualizado_em: string
          ciclo: number
          criado_em: string
          id: string
          mes_referencia: string
          tenant_id: string | null
          valor_estimado: number
        }
        Insert: {
          atualizado_em?: string
          ciclo: number
          criado_em?: string
          id?: string
          mes_referencia: string
          tenant_id?: string | null
          valor_estimado?: number
        }
        Update: {
          atualizado_em?: string
          ciclo?: number
          criado_em?: string
          id?: string
          mes_referencia?: string
          tenant_id?: string | null
          valor_estimado?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_caixa_receitas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          url?: string | null
          usuario_login?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_dados_mensais: {
        Row: {
          agendamentos_realizado: number
          atualizado_em: string
          comparecimentos_realizado: number
          criado_em: string
          faltas_realizado: number | null
          fechamentos_qtde_realizado: number
          fechamentos_valor_realizado: number
          id: string
          investimento: number
          leads_realizado: number
          mes_referencia: string
          meta_agendamentos_perc: number
          meta_agendamentos_qtde: number
          meta_comparecimentos_perc: number
          meta_comparecimentos_qtde: number
          meta_fechamento_valor: number
          meta_fechamentos_perc: number | null
          meta_leads: number
          origem_id: string
          tenant_id: string | null
          ticket_medio_esperado: number
        }
        Insert: {
          agendamentos_realizado?: number
          atualizado_em?: string
          comparecimentos_realizado?: number
          criado_em?: string
          faltas_realizado?: number | null
          fechamentos_qtde_realizado?: number
          fechamentos_valor_realizado?: number
          id?: string
          investimento?: number
          leads_realizado?: number
          mes_referencia: string
          meta_agendamentos_perc?: number
          meta_agendamentos_qtde?: number
          meta_comparecimentos_perc?: number
          meta_comparecimentos_qtde?: number
          meta_fechamento_valor?: number
          meta_fechamentos_perc?: number | null
          meta_leads?: number
          origem_id: string
          tenant_id?: string | null
          ticket_medio_esperado?: number
        }
        Update: {
          agendamentos_realizado?: number
          atualizado_em?: string
          comparecimentos_realizado?: number
          criado_em?: string
          faltas_realizado?: number | null
          fechamentos_qtde_realizado?: number
          fechamentos_valor_realizado?: number
          id?: string
          investimento?: number
          leads_realizado?: number
          mes_referencia?: string
          meta_agendamentos_perc?: number
          meta_agendamentos_qtde?: number
          meta_comparecimentos_perc?: number
          meta_comparecimentos_qtde?: number
          meta_fechamento_valor?: number
          meta_fechamentos_perc?: number | null
          meta_leads?: number
          origem_id?: string
          tenant_id?: string | null
          ticket_medio_esperado?: number
        }
        Relationships: [
          {
            foreignKeyName: "funil_dados_mensais_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "funil_origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_dados_mensais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_etapas: {
        Row: {
          ativo: boolean | null
          cor: string | null
          criado_em: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
          tenant_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          criado_em?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
          tenant_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funil_etapas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_leads: {
        Row: {
          atualizado_em: string
          avaliacao_id: string | null
          criado_em: string
          data_agendamento: string | null
          data_avaliacao: string | null
          data_proximo_contato: string | null
          descricao: string | null
          email: string | null
          id: string
          mes_referencia: string
          nome: string
          origem_id: string
          qtd_agendamentos: number | null
          qtd_faltas: number | null
          quantidade_contatos: number | null
          status: string | null
          telefone: string | null
          temperatura: string | null
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          avaliacao_id?: string | null
          criado_em?: string
          data_agendamento?: string | null
          data_avaliacao?: string | null
          data_proximo_contato?: string | null
          descricao?: string | null
          email?: string | null
          id?: string
          mes_referencia: string
          nome: string
          origem_id: string
          qtd_agendamentos?: number | null
          qtd_faltas?: number | null
          quantidade_contatos?: number | null
          status?: string | null
          telefone?: string | null
          temperatura?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          avaliacao_id?: string | null
          criado_em?: string
          data_agendamento?: string | null
          data_avaliacao?: string | null
          data_proximo_contato?: string | null
          descricao?: string | null
          email?: string | null
          id?: string
          mes_referencia?: string
          nome?: string
          origem_id?: string
          qtd_agendamentos?: number | null
          qtd_faltas?: number | null
          quantidade_contatos?: number | null
          status?: string | null
          telefone?: string | null
          temperatura?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funil_leads_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_leads_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "funil_origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_leads_historico: {
        Row: {
          acao: string
          criado_em: string
          detalhes: string | null
          id: string
          lead_id: string
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          lead_id: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          lead_id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funil_leads_historico_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funil_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_leads_historico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_leads_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_leads_notas: {
        Row: {
          criado_em: string
          id: string
          lead_id: string
          nota: string
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          lead_id: string
          nota: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          lead_id?: string
          nota?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funil_leads_notas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "funil_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_leads_notas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_leads_notas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_origens: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
          ordem: number
          tenant_id: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          tenant_id?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funil_origens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_temperaturas: {
        Row: {
          ativo: boolean | null
          cor: string | null
          criado_em: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
          tenant_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          criado_em?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
          tenant_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funil_temperaturas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gestao_fiscal_config: {
        Row: {
          atualizado_em: string
          faturamento_previsto: number
          id: string
          pf_despesa: number
          pf_imposto_perc: number
          pf_receita: number
          pj1_despesa_folha: number
          pj1_imposto_perc: number
          pj1_margem_perc: number
          pj1_receita: number
          pj1_titulo: string
          pj2_imposto_perc: number
          pj2_titulo: string
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          faturamento_previsto?: number
          id?: string
          pf_despesa?: number
          pf_imposto_perc?: number
          pf_receita?: number
          pj1_despesa_folha?: number
          pj1_imposto_perc?: number
          pj1_margem_perc?: number
          pj1_receita?: number
          pj1_titulo?: string
          pj2_imposto_perc?: number
          pj2_titulo?: string
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          faturamento_previsto?: number
          id?: string
          pf_despesa?: number
          pf_imposto_perc?: number
          pf_receita?: number
          pj1_despesa_folha?: number
          pj1_imposto_perc?: number
          pj1_margem_perc?: number
          pj1_receita?: number
          pj1_titulo?: string
          pj2_imposto_perc?: number
          pj2_titulo?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gestao_fiscal_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gestao_fiscal_entradas_manuais: {
        Row: {
          criado_em: string
          data_lancamento: string
          destino_fiscal: string
          id: string
          mes_referencia: string
          tenant_id: string | null
          valor: number
        }
        Insert: {
          criado_em?: string
          data_lancamento?: string
          destino_fiscal: string
          id?: string
          mes_referencia: string
          tenant_id?: string | null
          valor?: number
        }
        Update: {
          criado_em?: string
          data_lancamento?: string
          destino_fiscal?: string
          id?: string
          mes_referencia?: string
          tenant_id?: string | null
          valor?: number
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
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string | null
          data_compra?: string | null
          fornecedor_id?: string | null
          id?: string
          preco_anterior: number
          produto_id: string
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string | null
          data_compra?: string | null
          fornecedor_id?: string | null
          id?: string
          preco_anterior?: number
          produto_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_compras_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_compras_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_compras_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_onboarding_etapas: {
        Row: {
          ativo: boolean
          cargo_id: string | null
          criado_em: string
          descricao: string | null
          dia: number
          fase_id: string | null
          id: string
          ordem: number
          tenant_id: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean
          cargo_id?: string | null
          criado_em?: string
          descricao?: string | null
          dia?: number
          fase_id?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean
          cargo_id?: string | null
          criado_em?: string
          descricao?: string | null
          dia?: number
          fase_id?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "intranet_onboarding_etapas_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_onboarding_etapas_fase_id_fkey"
            columns: ["fase_id"]
            isOneToOne: false
            referencedRelation: "intranet_onboarding_fases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_onboarding_etapas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_onboarding_fases: {
        Row: {
          cargo_id: string | null
          cargos_alvo: Json | null
          criado_em: string
          id: string
          ordem: number
          tenant_id: string | null
          titulo: string
          todos_usuarios: boolean | null
          usuarios_alvo: Json | null
        }
        Insert: {
          cargo_id?: string | null
          cargos_alvo?: Json | null
          criado_em?: string
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo: string
          todos_usuarios?: boolean | null
          usuarios_alvo?: Json | null
        }
        Update: {
          cargo_id?: string | null
          cargos_alvo?: Json | null
          criado_em?: string
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo?: string
          todos_usuarios?: boolean | null
          usuarios_alvo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "intranet_onboarding_fases_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_onboarding_fases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_onboarding_progresso: {
        Row: {
          concluido: boolean
          concluido_em: string | null
          criado_em: string
          id: string
          tarefa_id: string | null
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          concluido?: boolean
          concluido_em?: string | null
          criado_em?: string
          id?: string
          tarefa_id?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          concluido?: boolean
          concluido_em?: string | null
          criado_em?: string
          id?: string
          tarefa_id?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intranet_onboarding_progresso_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "intranet_onboarding_tarefas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_onboarding_progresso_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_onboarding_progresso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_onboarding_tarefas: {
        Row: {
          criado_em: string
          descricao: string | null
          etapa_id: string | null
          id: string
          ordem: number
          tenant_id: string | null
          titulo: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "intranet_onboarding_tarefas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "intranet_onboarding_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_onboarding_tarefas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_treinamentos_cursos: {
        Row: {
          ativo: boolean
          criado_em: string
          descricao: string | null
          id: string
          ordem: number
          setor: string | null
          tenant_id: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          descricao?: string | null
          id?: string
          ordem?: number
          setor?: string | null
          tenant_id?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          descricao?: string | null
          id?: string
          ordem?: number
          setor?: string | null
          tenant_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "intranet_treinamentos_cursos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_treinamentos_modulos: {
        Row: {
          arquivo_url: string | null
          criado_em: string
          curso_id: string | null
          descricao: string | null
          id: string
          nota_minima: number | null
          ordem: number
          quiz_json: Json | null
          tenant_id: string | null
          titulo: string
          video_url: string | null
        }
        Insert: {
          arquivo_url?: string | null
          criado_em?: string
          curso_id?: string | null
          descricao?: string | null
          id?: string
          nota_minima?: number | null
          ordem?: number
          quiz_json?: Json | null
          tenant_id?: string | null
          titulo: string
          video_url?: string | null
        }
        Update: {
          arquivo_url?: string | null
          criado_em?: string
          curso_id?: string | null
          descricao?: string | null
          id?: string
          nota_minima?: number | null
          ordem?: number
          quiz_json?: Json | null
          tenant_id?: string | null
          titulo?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intranet_treinamentos_modulos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "intranet_treinamentos_cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_treinamentos_modulos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_treinamentos_progresso: {
        Row: {
          aprovado: boolean
          atualizado_em: string
          criado_em: string
          id: string
          modulo_id: string | null
          nota_quiz: number | null
          pontos: number
          tenant_id: string | null
          tentativas: number
          usuario_id: string | null
          video_visto: boolean
        }
        Insert: {
          aprovado?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          modulo_id?: string | null
          nota_quiz?: number | null
          pontos?: number
          tenant_id?: string | null
          tentativas?: number
          usuario_id?: string | null
          video_visto?: boolean
        }
        Update: {
          aprovado?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          modulo_id?: string | null
          nota_quiz?: number | null
          pontos?: number
          tenant_id?: string | null
          tentativas?: number
          usuario_id?: string | null
          video_visto?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "intranet_treinamentos_progresso_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "intranet_treinamentos_modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_treinamentos_progresso_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intranet_treinamentos_progresso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      marcas_implante: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marcas_implante_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      normas_aceites: {
        Row: {
          aceito_em: string
          id: string
          norma_id: string
          tenant_id: string | null
          usuario_id: string
        }
        Insert: {
          aceito_em?: string
          id?: string
          norma_id: string
          tenant_id?: string | null
          usuario_id: string
        }
        Update: {
          aceito_em?: string
          id?: string
          norma_id?: string
          tenant_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "normas_aceites_norma_id_fkey"
            columns: ["norma_id"]
            isOneToOne: false
            referencedRelation: "normas_internas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "normas_aceites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "normas_aceites_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          titulo?: string
          todos_usuarios?: boolean | null
          usuarios_alvo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "normas_internas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "normas_internas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          avaliacao_id: string
          criado_em: string | null
          data_orcamento: string | null
          id: string
          ordem: number | null
          status: string | null
          tenant_id: string | null
          valor: number
        }
        Insert: {
          avaliacao_id: string
          criado_em?: string | null
          data_orcamento?: string | null
          id?: string
          ordem?: number | null
          status?: string | null
          tenant_id?: string | null
          valor: number
        }
        Update: {
          avaliacao_id?: string
          criado_em?: string | null
          data_orcamento?: string | null
          id?: string
          ordem?: number | null
          status?: string | null
          tenant_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_cadastro?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_cadastro?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          descricao_item: string | null
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          status: string | null
          tenant_id: string | null
          valor_total: number
        }
        Insert: {
          descricao_item?: string | null
          id?: string
          pedido_id: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade: number
          status?: string | null
          tenant_id?: string | null
          valor_total?: number
        }
        Update: {
          descricao_item?: string | null
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          status?: string | null
          tenant_id?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_materiais: {
        Row: {
          ciclo_entrega: string
          data_criacao: string
          data_entrega: string | null
          data_envio: string | null
          entregue_por: string | null
          id: string
          observacoes: string | null
          status: string
          tenant_id: string | null
          usuario_id: string
          valor_total: number
        }
        Insert: {
          ciclo_entrega: string
          data_criacao?: string
          data_entrega?: string | null
          data_envio?: string | null
          entregue_por?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          usuario_id: string
          valor_total?: number
        }
        Update: {
          ciclo_entrega?: string
          data_criacao?: string
          data_entrega?: string | null
          data_envio?: string | null
          entregue_por?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tenant_id?: string | null
          usuario_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_materiais_entregue_por_fkey"
            columns: ["entregue_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_materiais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_materiais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_materiais_usuario_id_usuarios_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_bonificacao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_bonificacao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_bonificacao_itens: {
        Row: {
          ativo: boolean
          criado_em: string
          descricao: string
          explicacao: string | null
          id: string
          ordem: number
          tenant_id: string | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          descricao: string
          explicacao?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          descricao?: string
          explicacao?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_bonificacao_itens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_google_reviews: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_comentario: string
          data_contato: string
          id: string
          mes_referencia: string
          paciente_nome: string
          status: string
          tenant_id: string | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_comentario: string
          data_contato: string
          id?: string
          mes_referencia: string
          paciente_nome: string
          status?: string
          tenant_id?: string | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_comentario?: string
          data_contato?: string
          id?: string
          mes_referencia?: string
          paciente_nome?: string
          status?: string
          tenant_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_google_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_google_reviews_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_pp_pdm: {
        Row: {
          atualizado_em: string
          consideracoes_gestao: Json | null
          criado_em: string
          data_registro: string
          id: string
          inovacao_validada: boolean | null
          inovacoes: string | null
          nota_pdm: number | null
          pdm_itens: Json | null
          pontos_melhoria: string
          pontos_positivos: string
          pp_validado: boolean | null
          status_gestao: string | null
          tenant_id: string | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          consideracoes_gestao?: Json | null
          criado_em?: string
          data_registro?: string
          id?: string
          inovacao_validada?: boolean | null
          inovacoes?: string | null
          nota_pdm?: number | null
          pdm_itens?: Json | null
          pontos_melhoria: string
          pontos_positivos: string
          pp_validado?: boolean | null
          status_gestao?: string | null
          tenant_id?: string | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          consideracoes_gestao?: Json | null
          criado_em?: string
          data_registro?: string
          id?: string
          inovacao_validada?: boolean | null
          inovacoes?: string | null
          nota_pdm?: number | null
          pdm_itens?: Json | null
          pontos_melhoria?: string
          pontos_positivos?: string
          pp_validado?: boolean | null
          status_gestao?: string | null
          tenant_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_pp_pdm_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_pp_pdm_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_custos_fixos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          descricao: string
          id: string
          ordem: number
          tenant_id: string | null
          valor: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          descricao: string
          id?: string
          ordem?: number
          tenant_id?: string | null
          valor?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          descricao?: string
          id?: string
          ordem?: number
          tenant_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_custos_fixos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_custos_fixos_detalhes: {
        Row: {
          atualizado_em: string
          criado_em: string
          custo_fixo_id: string
          descricao: string
          id: string
          ordem: number
          tenant_id: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          custo_fixo_id: string
          descricao: string
          id?: string
          ordem?: number
          tenant_id?: string | null
          valor?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          custo_fixo_id?: string
          descricao?: string
          id?: string
          ordem?: number
          tenant_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_custos_fixos_detalhes_custo_fixo_id_fkey"
            columns: ["custo_fixo_id"]
            isOneToOne: false
            referencedRelation: "precificacao_custos_fixos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precificacao_custos_fixos_detalhes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_especialidades: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_especialidades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_globais: {
        Row: {
          atualizado_em: string
          comissao: number
          id: string
          imposto: number
          inadimplencia: number
          taxa_cartao: number
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          comissao?: number
          id?: string
          imposto?: number
          inadimplencia?: number
          taxa_cartao?: number
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          comissao?: number
          id?: string
          imposto?: number
          inadimplencia?: number
          taxa_cartao?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_globais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_ocupacao_cadeiras: {
        Row: {
          atualizado_em: string
          capacidade_maxima: number | null
          consultorio: string
          cor: string | null
          criado_em: string
          dentista: string | null
          dia_semana: string
          especialidade: string | null
          horas_trabalhadas: number | null
          id: string
          semana: number
          tenant_id: string | null
          turno: string
        }
        Insert: {
          atualizado_em?: string
          capacidade_maxima?: number | null
          consultorio: string
          cor?: string | null
          criado_em?: string
          dentista?: string | null
          dia_semana: string
          especialidade?: string | null
          horas_trabalhadas?: number | null
          id?: string
          semana?: number
          tenant_id?: string | null
          turno: string
        }
        Update: {
          atualizado_em?: string
          capacidade_maxima?: number | null
          consultorio?: string
          cor?: string | null
          criado_em?: string
          dentista?: string | null
          dia_semana?: string
          especialidade?: string | null
          horas_trabalhadas?: number | null
          id?: string
          semana?: number
          tenant_id?: string | null
          turno?: string
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_ocupacao_cadeiras_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_ocupacao_config: {
        Row: {
          criado_em: string
          id: string
          nome: string
          tenant_id: string | null
          tipo: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome: string
          tenant_id?: string | null
          tipo: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
          tenant_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_ocupacao_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_procedimentos: {
        Row: {
          atualizado_em: string
          criado_em: string
          custo_laboratorio: number
          custo_material: number
          especialidade_id: string
          honorarios_dentista: number
          id: string
          nome: string
          tempo_execucao: number
          tenant_id: string | null
          valor_cobrado: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          custo_laboratorio?: number
          custo_material?: number
          especialidade_id: string
          honorarios_dentista?: number
          id?: string
          nome: string
          tempo_execucao?: number
          tenant_id?: string | null
          valor_cobrado?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          custo_laboratorio?: number
          custo_material?: number
          especialidade_id?: string
          honorarios_dentista?: number
          id?: string
          nome?: string
          tempo_execucao?: number
          tenant_id?: string | null
          valor_cobrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_procedimentos_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "precificacao_especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precificacao_procedimentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_agenda_dentistas: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          nome: string
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          nome: string
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_agenda_dentistas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_agenda_procedimentos: {
        Row: {
          atualizado_em: string
          criado_em: string
          descricao: string
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          descricao: string
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          descricao?: string
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_agenda_procedimentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_agenda_tempos: {
        Row: {
          criado_em: string
          dentista_id: string
          id: string
          procedimento_id: string
          tempo_minutos: number
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string
          dentista_id: string
          id?: string
          procedimento_id: string
          tempo_minutos?: number
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string
          dentista_id?: string
          id?: string
          procedimento_id?: string
          tempo_minutos?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_agenda_tempos_dentista_id_fkey"
            columns: ["dentista_id"]
            isOneToOne: false
            referencedRelation: "pro_agenda_dentistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_agenda_tempos_procedimento_id_fkey"
            columns: ["procedimento_id"]
            isOneToOne: false
            referencedRelation: "pro_agenda_procedimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_agenda_tempos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_campos_valores: {
        Row: {
          atualizado_em: string
          campo_id: string
          criado_em: string
          id: string
          produto_id: string
          tenant_id: string | null
          valor: string | null
        }
        Insert: {
          atualizado_em?: string
          campo_id: string
          criado_em?: string
          id?: string
          produto_id: string
          tenant_id?: string | null
          valor?: string | null
        }
        Update: {
          atualizado_em?: string
          campo_id?: string
          criado_em?: string
          id?: string
          produto_id?: string
          tenant_id?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produto_campos_valores_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_personalizados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_campos_valores_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_campos_valores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          alerta_prazo_dias: number | null
          categoria: string | null
          codigo_barras: string | null
          consumo_estimado_frequencia: string | null
          consumo_estimado_valor: number | null
          custo_unitario: number | null
          data_criacao: string | null
          data_proxima_revisao: string | null
          embalagem: string | null
          embalagem_id: string | null
          especialidade_id: string | null
          id: string
          lote: string | null
          marca: string | null
          nome: string
          numero_armario: string | null
          observacoes: string | null
          quantidade_estoque: number | null
          quantidade_minima: number | null
          referencia_consumo:
            | Database["public"]["Enums"]["referencia_consumo_enum"]
            | null
          sala: string | null
          sala_id: string | null
          tenant_id: string | null
          validade: string | null
          variacao: string | null
        }
        Insert: {
          alerta_prazo_dias?: number | null
          categoria?: string | null
          codigo_barras?: string | null
          consumo_estimado_frequencia?: string | null
          consumo_estimado_valor?: number | null
          custo_unitario?: number | null
          data_criacao?: string | null
          data_proxima_revisao?: string | null
          embalagem?: string | null
          embalagem_id?: string | null
          especialidade_id?: string | null
          id?: string
          lote?: string | null
          marca?: string | null
          nome: string
          numero_armario?: string | null
          observacoes?: string | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          referencia_consumo?:
            | Database["public"]["Enums"]["referencia_consumo_enum"]
            | null
          sala?: string | null
          sala_id?: string | null
          tenant_id?: string | null
          validade?: string | null
          variacao?: string | null
        }
        Update: {
          alerta_prazo_dias?: number | null
          categoria?: string | null
          codigo_barras?: string | null
          consumo_estimado_frequencia?: string | null
          consumo_estimado_valor?: number | null
          custo_unitario?: number | null
          data_criacao?: string | null
          data_proxima_revisao?: string | null
          embalagem?: string | null
          embalagem_id?: string | null
          especialidade_id?: string | null
          id?: string
          lote?: string | null
          marca?: string | null
          nome?: string
          numero_armario?: string | null
          observacoes?: string | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          referencia_consumo?:
            | Database["public"]["Enums"]["referencia_consumo_enum"]
            | null
          sala?: string | null
          sala_id?: string | null
          tenant_id?: string | null
          validade?: string | null
          variacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_embalagem_id_fkey"
            columns: ["embalagem_id"]
            isOneToOne: false
            referencedRelation: "embalagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referencias_comissao_crc_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          faixa_entrada_maxima?: number | null
          faixa_entrada_minima?: number | null
          id?: string
          percentual_comissao?: number | null
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referencias_comissao_dentista_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_ferias: {
        Row: {
          atualizado_em: string
          criado_em: string
          dias_direito: number
          dias_gozados: number
          historico: Json | null
          id: string
          periodo_fim: string
          periodo_inicio: string
          prazo_limite: string
          status: string
          tenant_id: string | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          dias_direito?: number
          dias_gozados?: number
          historico?: Json | null
          id?: string
          periodo_fim: string
          periodo_inicio: string
          prazo_limite: string
          status?: string
          tenant_id?: string | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          dias_direito?: number
          dias_gozados?: number
          historico?: Json | null
          id?: string
          periodo_fim?: string
          periodo_inicio?: string
          prazo_limite?: string
          status?: string
          tenant_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_ferias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_ferias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      roteiros: {
        Row: {
          atualizado_em: string
          conteudo: string | null
          criado_em: string
          id: string
          objetivo: string | null
          ordem: number
          quando: string | null
          setor_id: string
          tenant_id: string | null
          tipo_comunicacao: string
          titulo: string
        }
        Insert: {
          atualizado_em?: string
          conteudo?: string | null
          criado_em?: string
          id?: string
          objetivo?: string | null
          ordem?: number
          quando?: string | null
          setor_id: string
          tenant_id?: string | null
          tipo_comunicacao: string
          titulo: string
        }
        Update: {
          atualizado_em?: string
          conteudo?: string | null
          criado_em?: string
          id?: string
          objetivo?: string | null
          ordem?: number
          quando?: string | null
          setor_id?: string
          tenant_id?: string | null
          tipo_comunicacao?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "roteiros_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "roteiros_setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      roteiros_setores: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
          ordem: number
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roteiros_setores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rotinas_usuarios: {
        Row: {
          ativa: boolean
          cargo_id: string | null
          data_atualizacao: string
          data_criacao: string
          id: string
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          ativa?: boolean
          cargo_id?: string | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          ativa?: boolean
          cargo_id?: string | null
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rotinas_usuarios_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotinas_usuarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotinas_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      sac_acoes_solucao: {
        Row: {
          criado_em: string
          data_acao: string
          demanda_id: string
          descricao: string
          id: string
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string
          data_acao?: string
          demanda_id: string
          descricao: string
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string
          data_acao?: string
          demanda_id?: string
          descricao?: string
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sac_acoes_solucao_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "sac_demandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sac_acoes_solucao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sac_acoes_solucao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      sac_configuracoes: {
        Row: {
          atualizado_em: string
          id: string
          orientacao_data_solucao: string
          orientacao_status: string
          tenant_id: string | null
        }
        Insert: {
          atualizado_em?: string
          id?: string
          orientacao_data_solucao?: string
          orientacao_status?: string
          tenant_id?: string | null
        }
        Update: {
          atualizado_em?: string
          id?: string
          orientacao_data_solucao?: string
          orientacao_status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sac_configuracoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sac_demandas: {
        Row: {
          atualizado_em: string
          criado_em: string
          data_prevista: string | null
          data_recebimento: string
          descricao: string | null
          id: string
          limite_primeiro_contato: string
          paciente_nome: string
          quem_recebeu_id: string | null
          quem_resolve_id: string | null
          setor: string | null
          solucao: string | null
          status: string
          tenant_id: string | null
          tipo: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          data_prevista?: string | null
          data_recebimento?: string
          descricao?: string | null
          id?: string
          limite_primeiro_contato: string
          paciente_nome: string
          quem_recebeu_id?: string | null
          quem_resolve_id?: string | null
          setor?: string | null
          solucao?: string | null
          status?: string
          tenant_id?: string | null
          tipo: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          data_prevista?: string | null
          data_recebimento?: string
          descricao?: string | null
          id?: string
          limite_primeiro_contato?: string
          paciente_nome?: string
          quem_recebeu_id?: string | null
          quem_resolve_id?: string | null
          setor?: string | null
          solucao?: string | null
          status?: string
          tenant_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "sac_demandas_quem_recebeu_id_fkey"
            columns: ["quem_recebeu_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sac_demandas_quem_resolve_id_fkey"
            columns: ["quem_resolve_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sac_demandas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sac_historico: {
        Row: {
          acao: string
          criado_em: string
          demanda_id: string
          detalhes: string | null
          id: string
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          demanda_id: string
          detalhes?: string | null
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          demanda_id?: string
          detalhes?: string | null
          id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sac_historico_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "sac_demandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sac_historico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sac_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          tipo_saida?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saida_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saida_produtos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saida_produtos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      salas: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sorriso_dos_sonhos_config: {
        Row: {
          atualizado_em: string
          id: string
          meta_indicacoes: number
          tenant_id: string | null
          usuarios_elegiveis: Json | null
          valor_bonus: number
        }
        Insert: {
          atualizado_em?: string
          id?: string
          meta_indicacoes?: number
          tenant_id?: string | null
          usuarios_elegiveis?: Json | null
          valor_bonus?: number
        }
        Update: {
          atualizado_em?: string
          id?: string
          meta_indicacoes?: number
          tenant_id?: string | null
          usuarios_elegiveis?: Json | null
          valor_bonus?: number
        }
        Relationships: [
          {
            foreignKeyName: "sorriso_dos_sonhos_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          valor_premio_paciente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sorriso_dos_sonhos_indicacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorriso_dos_sonhos_indicacoes_paciente_indicador_id_fkey"
            columns: ["paciente_indicador_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorriso_dos_sonhos_indicacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tamanhos_implante: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tamanhos_implante_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_rotina_rotina_id_fkey"
            columns: ["rotina_id"]
            isOneToOne: false
            referencedRelation: "rotinas_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_rotina_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          atualizado_em: string | null
          auditoria_ativa: boolean | null
          auditoria_eventos: string[] | null
          auditoria_retencao_dias: number | null
          configuracoes: Json | null
          criado_em: string | null
          id: string
          limite_dentistas: number | null
          limite_usuarios: number | null
          nome: string
          plano: string | null
          slug: string
          status: string | null
        }
        Insert: {
          atualizado_em?: string | null
          auditoria_ativa?: boolean | null
          auditoria_eventos?: string[] | null
          auditoria_retencao_dias?: number | null
          configuracoes?: Json | null
          criado_em?: string | null
          id?: string
          limite_dentistas?: number | null
          limite_usuarios?: number | null
          nome: string
          plano?: string | null
          slug: string
          status?: string | null
        }
        Update: {
          atualizado_em?: string | null
          auditoria_ativa?: boolean | null
          auditoria_eventos?: string[] | null
          auditoria_retencao_dias?: number | null
          configuracoes?: Json | null
          criado_em?: string | null
          id?: string
          limite_dentistas?: number | null
          limite_usuarios?: number | null
          nome?: string
          plano?: string | null
          slug?: string
          status?: string | null
        }
        Relationships: []
      }
      terceiros_categorias: {
        Row: {
          criado_em: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
          tenant_id: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
          tenant_id?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceiros_categorias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      terceiros_colunas: {
        Row: {
          categoria_slug: string
          cor: string
          criado_em: string | null
          id: string
          ordem: number
          tenant_id: string | null
          titulo: string
        }
        Insert: {
          categoria_slug: string
          cor?: string
          criado_em?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo: string
        }
        Update: {
          categoria_slug?: string
          cor?: string
          criado_em?: string | null
          id?: string
          ordem?: number
          tenant_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "terceiros_colunas_categoria_slug_tenant_fkey"
            columns: ["categoria_slug", "tenant_id"]
            isOneToOne: false
            referencedRelation: "terceiros_categorias"
            referencedColumns: ["slug", "tenant_id"]
          },
          {
            foreignKeyName: "terceiros_colunas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      terceiros_etiquetas: {
        Row: {
          cor: string
          criado_em: string
          id: string
          nome: string
          tenant_id: string | null
        }
        Insert: {
          cor: string
          criado_em?: string
          id?: string
          nome: string
          tenant_id?: string | null
        }
        Update: {
          cor?: string
          criado_em?: string
          id?: string
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceiros_etiquetas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          tenant_id: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          tarefa_id: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          detalhes?: string | null
          id?: string
          tarefa_id?: string
          tenant_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceiros_historico_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "terceiros_tarefas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceiros_historico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceiros_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          terceiro_nome?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceiros_tarefas_categoria_slug_tenant_fkey"
            columns: ["categoria_slug", "tenant_id"]
            isOneToOne: false
            referencedRelation: "terceiros_categorias"
            referencedColumns: ["slug", "tenant_id"]
          },
          {
            foreignKeyName: "terceiros_tarefas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceiros_tarefas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          acesso_chat: boolean
          avatar_url: string | null
          cargo_id: string | null
          cargo_secundario_id: string | null
          cpf: string | null
          criado_em: string | null
          data_admissao: string | null
          data_nascimento: string | null
          dias_trabalho: Json | null
          elegivel_ferias: boolean | null
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
          pode_realizar_lancamento: boolean
          possui_carteira: boolean
          retorno_almoco: string | null
          role: string | null
          saida_almoco: string | null
          salario: number | null
          status: string | null
          telefone: string | null
          tenant_id: string | null
        }
        Insert: {
          acesso_chat?: boolean
          avatar_url?: string | null
          cargo_id?: string | null
          cargo_secundario_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          dias_trabalho?: Json | null
          elegivel_ferias?: boolean | null
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
          pode_realizar_lancamento?: boolean
          possui_carteira?: boolean
          retorno_almoco?: string | null
          role?: string | null
          saida_almoco?: string | null
          salario?: number | null
          status?: string | null
          telefone?: string | null
          tenant_id?: string | null
        }
        Update: {
          acesso_chat?: boolean
          avatar_url?: string | null
          cargo_id?: string | null
          cargo_secundario_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          dias_trabalho?: Json | null
          elegivel_ferias?: boolean | null
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
          pode_realizar_lancamento?: boolean
          possui_carteira?: boolean
          retorno_almoco?: string | null
          role?: string | null
          saida_almoco?: string | null
          salario?: number | null
          status?: string | null
          telefone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_cargo_secundario_id_fkey"
            columns: ["cargo_secundario_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_compromissos: {
        Row: {
          compromisso_id: string
          criado_em: string
          id: string
          permissao: Database["public"]["Enums"]["permissao_compromisso_enum"]
          tenant_id: string | null
          usuario_criador_id: string
          usuario_destinatario_id: string
        }
        Insert: {
          compromisso_id: string
          criado_em?: string
          id?: string
          permissao?: Database["public"]["Enums"]["permissao_compromisso_enum"]
          tenant_id?: string | null
          usuario_criador_id: string
          usuario_destinatario_id: string
        }
        Update: {
          compromisso_id?: string
          criado_em?: string
          id?: string
          permissao?: Database["public"]["Enums"]["permissao_compromisso_enum"]
          tenant_id?: string | null
          usuario_criador_id?: string
          usuario_destinatario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_compromissos_compromisso_id_fkey"
            columns: ["compromisso_id"]
            isOneToOne: false
            referencedRelation: "compromissos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_compromissos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_compromissos_usuario_criador_id_fkey"
            columns: ["usuario_criador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_compromissos_usuario_destinatario_id_fkey"
            columns: ["usuario_destinatario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
          destino_fiscal: string | null
          destino_pagamento: string | null
          fatura_comissao_id: string | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          observacoes_fechamento: string | null
          oportunidade_id: string | null
          origem_id: string | null
          paciente_nome: string
          percentual_comissao: number | null
          percentual_entrada: number
          status_comissao: string | null
          telefone: string | null
          tenant_id: string | null
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
          destino_fiscal?: string | null
          destino_pagamento?: string | null
          fatura_comissao_id?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          oportunidade_id?: string | null
          origem_id?: string | null
          paciente_nome: string
          percentual_comissao?: number | null
          percentual_entrada: number
          status_comissao?: string | null
          telefone?: string | null
          tenant_id?: string | null
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
          destino_fiscal?: string | null
          destino_pagamento?: string | null
          fatura_comissao_id?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          observacoes_fechamento?: string | null
          oportunidade_id?: string | null
          origem_id?: string | null
          paciente_nome?: string
          percentual_comissao?: number | null
          percentual_entrada?: number
          status_comissao?: string | null
          telefone?: string | null
          tenant_id?: string | null
          tratamento?: string | null
          valor_comissao?: number | null
          valor_entrada?: number
          valor_tratamento?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_confirmadas_crc_fkey"
            columns: ["crc"]
            isOneToOne: false
            referencedRelation: "crc_comercial"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_confirmadas_dentista_avaliador_fkey"
            columns: ["dentista_avaliador"]
            isOneToOne: false
            referencedRelation: "dentistas_avaliadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_confirmadas_fatura_comissao_id_fkey"
            columns: ["fatura_comissao_id"]
            isOneToOne: false
            referencedRelation: "faturas_comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_confirmadas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_confirmadas_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "funil_origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_confirmadas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas_diarias: {
        Row: {
          crc_comercial_id: string | null
          criado_em: string
          data_venda: string
          dentista_avaliador_id: string | null
          destino_fiscal: string | null
          destino_pagamento: string | null
          forma_pagamento: string | null
          id: string
          origem_id: string | null
          paciente_nome: string | null
          tenant_id: string | null
          usuario_id: string | null
          valor: number
          valor_tratamento: number | null
        }
        Insert: {
          crc_comercial_id?: string | null
          criado_em?: string
          data_venda: string
          dentista_avaliador_id?: string | null
          destino_fiscal?: string | null
          destino_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          origem_id?: string | null
          paciente_nome?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
          valor?: number
          valor_tratamento?: number | null
        }
        Update: {
          crc_comercial_id?: string | null
          criado_em?: string
          data_venda?: string
          dentista_avaliador_id?: string | null
          destino_fiscal?: string | null
          destino_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          origem_id?: string | null
          paciente_nome?: string | null
          tenant_id?: string | null
          usuario_id?: string | null
          valor?: number
          valor_tratamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_diarias_crc_comercial_id_fkey"
            columns: ["crc_comercial_id"]
            isOneToOne: false
            referencedRelation: "crc_comercial"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_diarias_dentista_avaliador_id_fkey"
            columns: ["dentista_avaliador_id"]
            isOneToOne: false
            referencedRelation: "dentistas_avaliadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_diarias_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "funil_origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_diarias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_diarias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_funil_dados_mensais: {
        Args: { p_mes_referencia: string; p_origem_id: string }
        Returns: undefined
      }
      calcular_comissao_periodo: {
        Args: { p_data_fim: string; p_data_inicio: string }
        Returns: {
          crc: string
          crc_nome: string
          data_fechamento: string
          dentista_avaliador: string
          dentista_nome: string
          id: string
          paciente_nome: string
          percentual_comissao_crc: number
          percentual_comissao_dentista: number
          percentual_entrada: number
          status_comissao: string
          valor_comissao_crc: number
          valor_comissao_dentista: number
          valor_entrada: number
          valor_tratamento: number
        }[]
      }
      gerar_adiantamento_mes_google: {
        Args: { p_mes: string }
        Returns: undefined
      }
      gerar_adiantamento_mes_inovacao: {
        Args: { p_mes: string }
        Returns: undefined
      }
      gerar_adiantamento_mes_sorriso: {
        Args: { p_mes: string }
        Returns: undefined
      }
      gerar_todos_adiantamentos_mensais: { Args: never; Returns: undefined }
      get_my_tenant_id: { Args: never; Returns: string }
      get_oportunidades_geradas: {
        Args: { p_mes_referencia: string }
        Returns: {
          origem_id: string
          origem_nome: string
          qtd_oportunidades: number
          valor_oportunidades: number
        }[]
      }
      get_or_create_direct_chat: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_unread_chat_count: { Args: { p_usuario_id: string }; Returns: number }
      get_unread_counts_per_conversation: {
        Args: { p_usuario_id: string }
        Returns: {
          conversa_id: string
          unread_count: number
        }[]
      }
      get_vendas_por_origem: {
        Args: { p_mes_referencia: string }
        Returns: {
          origem_id: string
          origem_nome: string
          qtd_vendas: number
          valor_vendas: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_tenant_admin: { Args: never; Returns: boolean }
      processar_fechamento_mes_feijao: {
        Args: { p_mes: string }
        Returns: undefined
      }
      processar_fechamento_mes_google: {
        Args: { p_mes: string }
        Returns: undefined
      }
      processar_fechamento_mes_inovacao: {
        Args: { p_mes: string }
        Returns: undefined
      }
      processar_fechamento_mes_sorriso: {
        Args: { p_mes: string }
        Returns: undefined
      }
      seed_tenant_defaults: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      unaccent_string: { Args: { input: string }; Returns: string }
    }
    Enums: {
      nivel_criticidade_enum:
        | "no_horario"
        | "tolerancia"
        | "critico"
        | "nao_concluida"
      permissao_compromisso_enum: "visualizar" | "editar" | "deletar"
      referencia_consumo_enum: "qtd_comprada" | "itens_embalagem"
      tipo_compromisso_enum:
        | "consulta"
        | "viagem_pessoal"
        | "viagem_trabalho"
        | "reuniao"
        | "congresso"
        | "folga_ferias"
        | "treinamento"
        | "atendimento_externo"
        | "acao_comercial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      nivel_criticidade_enum: [
        "no_horario",
        "tolerancia",
        "critico",
        "nao_concluida",
      ],
      permissao_compromisso_enum: ["visualizar", "editar", "deletar"],
      referencia_consumo_enum: ["qtd_comprada", "itens_embalagem"],
      tipo_compromisso_enum: [
        "consulta",
        "viagem_pessoal",
        "viagem_trabalho",
        "reuniao",
        "congresso",
        "folga_ferias",
        "treinamento",
        "atendimento_externo",
        "acao_comercial",
      ],
    },
  },
} as const

