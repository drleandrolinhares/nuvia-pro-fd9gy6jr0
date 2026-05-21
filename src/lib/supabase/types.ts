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
      cargo_permissoes: {
        Row: {
          cargo_id: string
          permissao_id: string
          tenant_id: string | null
        }
        Insert: {
          cargo_id: string
          permissao_id: string
          tenant_id?: string | null
        }
        Update: {
          cargo_id?: string
          permissao_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cargo_permissoes_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_permissoes_tenant_id_fkey"
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
      permissoes: {
        Row: {
          descricao: string | null
          id: string
          modulo: string | null
          nome: string
          tenant_id: string | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          modulo?: string | null
          nome: string
          tenant_id?: string | null
        }
        Update: {
          descricao?: string | null
          id?: string
          modulo?: string | null
          nome?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      usuario_permissoes: {
        Row: {
          permissao_id: string
          tenant_id: string | null
          usuario_id: string
        }
        Insert: {
          permissao_id: string
          tenant_id?: string | null
          usuario_id: string
        }
        Update: {
          permissao_id?: string
          tenant_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_permissoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_permissoes_usuario_id_fkey"
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
      has_permission: { Args: { permission_name: string }; Returns: boolean }
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: auditoria_acesso
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (not null)
//   usuario_id: uuid (nullable)
//   tabela_acessada: text (not null)
//   acao: text (not null)
//   registro_id: uuid (nullable)
//   dados_anteriores: jsonb (nullable)
//   dados_novos: jsonb (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: auditoria_tarefas_rotina
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   tarefa_id: uuid (not null)
//   timestamp_cliente: timestamp with time zone (not null)
//   valido: boolean (not null)
//   mensagem: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: ausencias
//   id: uuid (not null, default: gen_random_uuid())
//   data: date (not null)
//   descricao: text (not null)
//   tipo: text (not null, default: 'feriado'::text)
//   usuario_id: uuid (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   hora_inicio: time without time zone (nullable)
//   hora_fim: time without time zone (nullable)
//   recorrencia: text (nullable, default: 'nenhuma'::text)
//   dias_semana: jsonb (nullable)
//   dia_mes: integer (nullable)
//   data_fim: date (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   destino_fiscal: text (nullable)
//   origem_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: caixa_diario_fechamentos
//   data_referencia: date (not null)
//   conferido: boolean (not null, default: false)
//   conferido_por: uuid (nullable)
//   conferido_em: timestamp with time zone (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: campo_configuracao
//   id: uuid (not null, default: gen_random_uuid())
//   especialidade_id: uuid (nullable)
//   campo_id: uuid (nullable)
//   label_customizado: text (nullable)
//   ordem: integer (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: campo_opcoes
//   id: uuid (not null, default: gen_random_uuid())
//   campo_id: uuid (not null)
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   especialidade_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: campos_personalizados
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   tipo: text (nullable, default: 'text'::text)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   opcoes: jsonb (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: cargo_permissoes
//   cargo_id: uuid (not null)
//   permissao_id: uuid (not null)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: cargos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   setor: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: carteira_transacoes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   tipo: text (not null)
//   valor: numeric (not null)
//   descricao: text (not null)
//   mes_referencia: text (not null)
//   origem_id: uuid (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   transacao_original_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: chat_conversas
//   id: uuid (not null, default: gen_random_uuid())
//   tipo: text (not null)
//   nome: text (nullable)
//   criado_por: uuid (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: chat_mensagens
//   id: uuid (not null, default: gen_random_uuid())
//   conversa_id: uuid (nullable)
//   remetente_id: uuid (nullable)
//   conteudo: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: chat_participantes
//   conversa_id: uuid (not null)
//   usuario_id: uuid (not null)
//   ultima_leitura: timestamp with time zone (not null, default: now())
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: compras
//   id: uuid (not null, default: gen_random_uuid())
//   fornecedor_id: uuid (nullable)
//   data: date (not null)
//   nfe: text (nullable)
//   valor_total_compra: numeric (not null, default: 0)
//   status: text (not null, default: 'pendente'::text)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   sala_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   setor: text (nullable, default: 'operacional'::text)
//   paciente_id: uuid (nullable)
//   lead_id: uuid (nullable)
//   status_acao: text (nullable, default: 'pendente'::text)
//   resultado_acao: text (nullable)
//   concluido_em: timestamp with time zone (nullable)
//   concluido_por: uuid (nullable)
// Table: configuracoes_acesso
//   id: uuid (not null, default: gen_random_uuid())
//   seg_inicio: text (nullable, default: '07:00'::text)
//   seg_fim: text (nullable, default: '19:00'::text)
//   ter_inicio: text (nullable, default: '07:00'::text)
//   ter_fim: text (nullable, default: '19:00'::text)
//   qua_inicio: text (nullable, default: '07:00'::text)
//   qua_fim: text (nullable, default: '19:00'::text)
//   qui_inicio: text (nullable, default: '07:00'::text)
//   qui_fim: text (nullable, default: '19:00'::text)
//   sex_inicio: text (nullable, default: '07:00'::text)
//   sex_fim: text (nullable, default: '19:00'::text)
//   sab_inicio: text (nullable, default: '07:00'::text)
//   sab_fim: text (nullable, default: '12:00'::text)
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: configuracoes_negociacao
//   id: uuid (not null, default: gen_random_uuid())
//   percentual_entrada_padrao: numeric (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: crc_comercial
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome: text (not null)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   email: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: criativos_gerados
//   id: uuid (not null, default: gen_random_uuid())
//   dentista_avaliador_id: uuid (not null)
//   data_criacao: date (nullable, default: CURRENT_DATE)
//   descricao_video: text (nullable)
//   mes_referencia: date (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: dentistas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome: text (not null)
//   email: text (nullable)
//   especialidade: text (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: descontos_por_prazo
//   id: uuid (not null, default: gen_random_uuid())
//   faixa_numero: integer (not null)
//   percentual_desconto: numeric (not null, default: 0)
//   descricao: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: diametros_implante
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: embalagens
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: especialidade_campos
//   especialidade_id: uuid (not null)
//   campo_id: uuid (not null)
//   ativo: boolean (nullable, default: true)
//   id: uuid (nullable, default: gen_random_uuid())
//   ordem: integer (nullable, default: 0)
//   label_customizado: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: especialidades
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: faixas_valores_parcelas
//   id: uuid (not null, default: gen_random_uuid())
//   valor_minimo: numeric (not null, default: 0)
//   valor_maximo: numeric (not null)
//   max_parcelas: integer (not null, default: 1)
//   criado_em: timestamp with time zone (not null, default: now())
//   faixa_numero: integer (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: faturamento_comissoes
//   id: uuid (not null, default: gen_random_uuid())
//   periodo_inicio: date (nullable)
//   periodo_fim: date (nullable)
//   data_faturamento: date (nullable, default: CURRENT_DATE)
//   data_pagamento_prevista: date (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: fet_etiquetas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   cor: text (not null, default: '#3b82f6'::text)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: fet_historico
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (nullable)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: fet_pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   status: text (nullable, default: 'ativo'::text)
// Table: fet_procedimentos
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   procedimento: text (not null)
//   dentista_id: uuid (nullable)
//   tempo_execucao: text (nullable)
//   observacoes: text (nullable)
//   concluido: boolean (not null, default: false)
//   ordem: integer (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   etiquetas: jsonb (nullable, default: '[]'::jsonb)
//   concluido_em: timestamp with time zone (nullable)
//   concluido_por: uuid (nullable)
// Table: fluxo_caixa_categorias
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: fluxo_caixa_despesas
//   id: uuid (not null, default: gen_random_uuid())
//   data_vencimento: date (not null)
//   categoria: text (not null)
//   valor_estimado: numeric (not null, default: 0)
//   descricao: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: fluxo_caixa_parceiros
//   id: uuid (not null, default: gen_random_uuid())
//   tipo: text (not null)
//   nome: text (not null)
//   data_vencimento: date (not null)
//   valor: numeric (not null, default: 0)
//   descricao: text (nullable)
//   status: text (nullable, default: 'pendente'::text)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   criterio_pagamento: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: fluxo_caixa_receitas
//   id: uuid (not null, default: gen_random_uuid())
//   mes_referencia: text (not null)
//   ciclo: integer (not null)
//   valor_estimado: numeric (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: funil_dados_mensais
//   id: uuid (not null, default: gen_random_uuid())
//   origem_id: uuid (not null)
//   mes_referencia: text (not null)
//   investimento: numeric (not null, default: 0)
//   meta_leads: integer (not null, default: 0)
//   leads_realizado: integer (not null, default: 0)
//   meta_agendamentos_qtde: integer (not null, default: 0)
//   meta_agendamentos_perc: numeric (not null, default: 0)
//   agendamentos_realizado: integer (not null, default: 0)
//   meta_comparecimentos_qtde: integer (not null, default: 0)
//   meta_comparecimentos_perc: numeric (not null, default: 0)
//   comparecimentos_realizado: integer (not null, default: 0)
//   meta_fechamento_valor: numeric (not null, default: 0)
//   ticket_medio_esperado: numeric (not null, default: 0)
//   fechamentos_qtde_realizado: integer (not null, default: 0)
//   fechamentos_valor_realizado: numeric (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   faltas_realizado: integer (nullable, default: 0)
//   meta_fechamentos_perc: numeric (nullable, default: 0)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: funil_etapas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   slug: text (not null)
//   cor: text (nullable, default: '#3b82f6'::text)
//   ordem: integer (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: funil_leads
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   telefone: text (nullable)
//   origem_id: uuid (not null)
//   descricao: text (nullable)
//   temperatura: text (nullable, default: 'frio'::text)
//   status: text (nullable, default: 'novo'::text)
//   mes_referencia: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   qtd_agendamentos: integer (nullable, default: 0)
//   qtd_faltas: integer (nullable, default: 0)
//   data_proximo_contato: timestamp with time zone (nullable)
//   email: text (nullable)
//   quantidade_contatos: integer (nullable, default: 0)
//   data_agendamento: timestamp with time zone (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   data_avaliacao: date (nullable)
//   avaliacao_id: uuid (nullable)
// Table: funil_leads_historico
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: funil_leads_notas
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   usuario_id: uuid (nullable)
//   nota: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: funil_origens
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   ativo: boolean (not null, default: true)
//   ordem: integer (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: funil_temperaturas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   slug: text (not null)
//   cor: text (nullable, default: 'bg-slate-500/10 text-slate-500 border-slate-500/20'::text)
//   ordem: integer (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: gestao_fiscal_config
//   id: uuid (not null, default: gen_random_uuid())
//   faturamento_previsto: numeric (not null, default: 0)
//   pf_despesa: numeric (not null, default: 0)
//   pf_receita: numeric (not null, default: 0)
//   pf_imposto_perc: numeric (not null, default: 0)
//   pj1_titulo: text (not null, default: 'PJ 01'::text)
//   pj1_despesa_folha: numeric (not null, default: 0)
//   pj1_margem_perc: numeric (not null, default: 30)
//   pj1_receita: numeric (not null, default: 0)
//   pj1_imposto_perc: numeric (not null, default: 0)
//   pj2_titulo: text (not null, default: 'EXCEDENTE (PJ 02)'::text)
//   pj2_imposto_perc: numeric (not null, default: 0)
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: gestao_fiscal_entradas_manuais
//   id: uuid (not null, default: gen_random_uuid())
//   destino_fiscal: text (not null)
//   data_lancamento: date (not null, default: CURRENT_DATE)
//   valor: numeric (not null, default: 0)
//   mes_referencia: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: historico_compras
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (not null)
//   fornecedor_id: uuid (nullable)
//   preco_anterior: numeric (not null)
//   data_compra: timestamp with time zone (nullable, default: now())
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: intranet_onboarding_etapas
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   dia: integer (not null, default: 1)
//   ordem: integer (not null, default: 0)
//   ativo: boolean (not null, default: true)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   criado_em: timestamp with time zone (not null, default: now())
//   cargo_id: uuid (nullable)
//   fase_id: uuid (nullable)
// Table: intranet_onboarding_fases
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   ordem: integer (not null, default: 0)
//   cargo_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   criado_em: timestamp with time zone (not null, default: now())
//   usuarios_alvo: jsonb (nullable, default: '[]'::jsonb)
//   cargos_alvo: jsonb (nullable, default: '[]'::jsonb)
//   todos_usuarios: boolean (nullable, default: false)
// Table: intranet_onboarding_progresso
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   tarefa_id: uuid (nullable)
//   concluido: boolean (not null, default: false)
//   concluido_em: timestamp with time zone (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   criado_em: timestamp with time zone (not null, default: now())
// Table: intranet_onboarding_tarefas
//   id: uuid (not null, default: gen_random_uuid())
//   etapa_id: uuid (nullable)
//   titulo: text (not null)
//   descricao: text (nullable)
//   ordem: integer (not null, default: 0)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   criado_em: timestamp with time zone (not null, default: now())
// Table: intranet_treinamentos_cursos
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   setor: text (nullable)
//   ativo: boolean (not null, default: true)
//   ordem: integer (not null, default: 0)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   criado_em: timestamp with time zone (not null, default: now())
// Table: intranet_treinamentos_modulos
//   id: uuid (not null, default: gen_random_uuid())
//   curso_id: uuid (nullable)
//   titulo: text (not null)
//   descricao: text (nullable)
//   video_url: text (nullable)
//   nota_minima: integer (nullable, default: 7)
//   quiz_json: jsonb (nullable, default: '[]'::jsonb)
//   ordem: integer (not null, default: 0)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   criado_em: timestamp with time zone (not null, default: now())
//   arquivo_url: text (nullable)
// Table: intranet_treinamentos_progresso
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   modulo_id: uuid (nullable)
//   video_visto: boolean (not null, default: false)
//   nota_quiz: integer (nullable)
//   aprovado: boolean (not null, default: false)
//   tentativas: integer (not null, default: 0)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   criado_em: timestamp with time zone (not null, default: now())
//   pontos: integer (not null, default: 0)
// Table: marcas_implante
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: normas_aceites
//   id: uuid (not null, default: gen_random_uuid())
//   norma_id: uuid (not null)
//   usuario_id: uuid (not null)
//   aceito_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: orcamentos
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   valor: numeric (not null)
//   data_orcamento: date (nullable, default: CURRENT_DATE)
//   status: text (nullable, default: 'ativo'::text)
//   ordem: integer (nullable, default: 1)
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   telefone: text (nullable)
//   email: text (nullable)
//   data_cadastro: date (nullable, default: CURRENT_DATE)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: pedido_itens
//   id: uuid (not null, default: gen_random_uuid())
//   pedido_id: uuid (not null)
//   produto_id: uuid (nullable)
//   quantidade: integer (not null)
//   preco_unitario: numeric (not null, default: 0)
//   valor_total: numeric (not null, default: 0)
//   descricao_item: text (nullable)
//   status: text (nullable, default: 'pendente'::text)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: pedidos_materiais
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   status: text (not null, default: 'rascunho'::text)
//   ciclo_entrega: date (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
//   data_envio: timestamp with time zone (nullable)
//   data_entrega: timestamp with time zone (nullable)
//   entregue_por: uuid (nullable)
//   valor_total: numeric (not null, default: 0)
//   observacoes: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: performance_bonificacao
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   mes_referencia: text (not null)
//   itens_marcados: jsonb (not null, default: '[]'::jsonb)
//   pontuacao_total: integer (not null, default: 0)
//   atingiu_meta: boolean (not null, default: false)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: performance_bonificacao_itens
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   ordem: integer (not null, default: 0)
//   ativo: boolean (not null, default: true)
//   criado_em: timestamp with time zone (not null, default: now())
//   explicacao: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: performance_google_reviews
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_nome: text (not null)
//   data_contato: date (not null)
//   data_comentario: date (not null)
//   status: text (not null, default: 'pendente'::text)
//   mes_referencia: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   inovacoes: text (nullable, default: ''::text)
//   pp_validado: boolean (nullable, default: false)
//   inovacao_validada: boolean (nullable, default: false)
//   status_gestao: text (nullable, default: 'aguardando_acao'::text)
//   consideracoes_gestao: jsonb (nullable, default: '[]'::jsonb)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: permissoes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   modulo: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: precificacao_custos_fixos
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   valor: numeric (not null, default: 0)
//   ordem: integer (not null, default: 0)
//   ativo: boolean (not null, default: true)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: precificacao_custos_fixos_detalhes
//   id: uuid (not null, default: gen_random_uuid())
//   custo_fixo_id: uuid (not null)
//   descricao: text (not null)
//   valor: numeric (not null, default: 0)
//   ordem: integer (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: precificacao_especialidades
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: precificacao_globais
//   id: uuid (not null, default: gen_random_uuid())
//   taxa_cartao: numeric (not null, default: 3)
//   comissao: numeric (not null, default: 5)
//   inadimplencia: numeric (not null, default: 2)
//   imposto: numeric (not null, default: 6)
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: precificacao_ocupacao_cadeiras
//   id: uuid (not null, default: gen_random_uuid())
//   consultorio: text (not null)
//   turno: text (not null)
//   dia_semana: text (not null)
//   especialidade: text (nullable)
//   dentista: text (nullable)
//   horas_trabalhadas: numeric (nullable, default: 0)
//   cor: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   semana: integer (not null, default: 1)
//   capacidade_maxima: numeric (nullable, default: 0)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: precificacao_ocupacao_config
//   id: uuid (not null, default: gen_random_uuid())
//   tipo: text (not null)
//   nome: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: precificacao_procedimentos
//   id: uuid (not null, default: gen_random_uuid())
//   especialidade_id: uuid (not null)
//   nome: text (not null)
//   valor_cobrado: numeric (not null, default: 0)
//   tempo_execucao: integer (not null, default: 30)
//   custo_laboratorio: numeric (not null, default: 0)
//   custo_material: numeric (not null, default: 0)
//   honorarios_dentista: numeric (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: pro_agenda_dentistas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: pro_agenda_procedimentos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: pro_agenda_tempos
//   id: uuid (not null, default: gen_random_uuid())
//   procedimento_id: uuid (not null)
//   dentista_id: uuid (not null)
//   tempo_minutos: integer (not null, default: 30)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: produto_campos_valores
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (not null)
//   campo_id: uuid (not null)
//   valor: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   alerta_prazo_dias: integer (nullable)
//   data_proxima_revisao: date (nullable)
//   consumo_estimado_valor: numeric (nullable)
//   consumo_estimado_frequencia: text (nullable)
//   observacoes: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: referencias_comissao_crc
//   id: uuid (not null, default: gen_random_uuid())
//   faixa_entrada_minima: numeric (nullable)
//   faixa_entrada_maxima: numeric (nullable)
//   percentual_comissao: numeric (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: referencias_comissao_dentista
//   id: uuid (not null, default: gen_random_uuid())
//   faixa_entrada_minima: numeric (nullable)
//   faixa_entrada_maxima: numeric (nullable)
//   percentual_comissao: numeric (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: rh_ferias
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   periodo_inicio: date (not null)
//   periodo_fim: date (not null)
//   prazo_limite: date (not null)
//   dias_direito: integer (not null, default: 30)
//   dias_gozados: integer (not null, default: 0)
//   historico: jsonb (nullable, default: '[]'::jsonb)
//   status: text (not null, default: 'pendente'::text)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: roteiros
//   id: uuid (not null, default: gen_random_uuid())
//   setor_id: uuid (not null)
//   titulo: text (not null)
//   objetivo: text (nullable)
//   tipo_comunicacao: text (not null)
//   conteudo: text (nullable)
//   ordem: integer (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   quando: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: roteiros_setores
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   ordem: integer (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: rotinas_usuarios
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   cargo_id: uuid (nullable)
//   ativa: boolean (not null, default: true)
//   data_criacao: timestamp with time zone (not null, default: now())
//   data_atualizacao: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: sac_acoes_solucao
//   id: uuid (not null, default: gen_random_uuid())
//   demanda_id: uuid (not null)
//   data_acao: date (not null, default: CURRENT_DATE)
//   descricao: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   usuario_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: sac_configuracoes
//   id: uuid (not null, default: gen_random_uuid())
//   orientacao_status: text (not null, default: 'STATUS: este campo deve ser alterado pela pessoa responsável pela solução da demanda. Ao tomar ciência e mudar para SENDO TRATADO, mostra para todos os gestores e colaboradores que você já tem ciência da situação e que resolverá.'::text)
//   atualizado_em: timestamp with time zone (not null, default: now())
//   orientacao_data_solucao: text (not null, default: 'Se o status do caso estiver como SENDO TRATADO, esta data representará a data prevista para a solução. Se o status estiver como RESOLVIDO, a data significará a data da solução do caso.'::text)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: sac_demandas
//   id: uuid (not null, default: gen_random_uuid())
//   tipo: text (not null)
//   data_recebimento: date (not null, default: CURRENT_DATE)
//   limite_primeiro_contato: date (not null)
//   paciente_nome: text (not null)
//   quem_recebeu_id: uuid (nullable)
//   quem_resolve_id: uuid (nullable)
//   status: text (not null, default: 'recebido'::text)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
//   descricao: text (nullable)
//   setor: text (nullable)
//   data_prevista: date (nullable)
//   solucao: text (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: sac_historico
//   id: uuid (not null, default: gen_random_uuid())
//   demanda_id: uuid (not null)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: salas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: sorriso_dos_sonhos_config
//   id: uuid (not null, default: gen_random_uuid())
//   valor_bonus: numeric (not null, default: 100)
//   meta_indicacoes: integer (not null, default: 2)
//   atualizado_em: timestamp with time zone (not null, default: now())
//   usuarios_elegiveis: jsonb (nullable, default: '[]'::jsonb)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: tamanhos_implante
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: tenants
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   slug: text (not null)
//   status: text (nullable, default: 'ativo'::text)
//   plano: text (nullable, default: 'basico'::text)
//   limite_usuarios: integer (nullable, default: 10)
//   limite_dentistas: integer (nullable, default: 5)
//   auditoria_ativa: boolean (nullable, default: false)
//   auditoria_eventos: _text (nullable, default: '{}'::text[])
//   auditoria_retencao_dias: integer (nullable, default: 90)
//   configuracoes: jsonb (nullable, default: '{}'::jsonb)
//   criado_em: timestamp with time zone (nullable, default: now())
//   atualizado_em: timestamp with time zone (nullable, default: now())
// Table: terceiros_categorias
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   slug: text (not null)
//   ordem: integer (nullable, default: 0)
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: terceiros_colunas
//   id: uuid (not null, default: gen_random_uuid())
//   categoria_slug: text (not null)
//   titulo: text (not null)
//   cor: text (not null, default: 'border-slate-700 bg-slate-800/50'::text)
//   ordem: integer (not null, default: 0)
//   criado_em: timestamp with time zone (nullable, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: terceiros_etiquetas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   cor: text (not null)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: terceiros_historico
//   id: uuid (not null, default: gen_random_uuid())
//   tarefa_id: uuid (not null)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: usuario_permissoes
//   usuario_id: uuid (not null)
//   permissao_id: uuid (not null)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
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
//   dias_trabalho: jsonb (nullable, default: '[1, 2, 3, 4, 5]'::jsonb)
//   exigir_rotina: boolean (not null, default: true)
//   elegivel_ferias: boolean (nullable, default: false)
//   acesso_chat: boolean (not null, default: true)
//   pode_realizar_lancamento: boolean (not null, default: false)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: usuarios_compromissos
//   id: uuid (not null, default: gen_random_uuid())
//   compromisso_id: uuid (not null)
//   usuario_criador_id: uuid (not null)
//   usuario_destinatario_id: uuid (not null)
//   permissao: permissao_compromisso_enum (not null, default: 'visualizar'::permissao_compromisso_enum)
//   criado_em: timestamp with time zone (not null, default: now())
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: vendas_confirmadas
//   id: uuid (not null, default: gen_random_uuid())
//   oportunidade_id: uuid (nullable)
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
//   forma_pagamento: text (nullable)
//   destino_pagamento: text (nullable)
//   destino_fiscal: text (nullable)
//   origem_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())
// Table: vendas_diarias
//   id: uuid (not null, default: gen_random_uuid())
//   data_venda: date (not null)
//   valor: numeric (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   usuario_id: uuid (nullable)
//   paciente_nome: text (nullable)
//   valor_tratamento: numeric (nullable)
//   forma_pagamento: text (nullable)
//   destino_pagamento: text (nullable)
//   destino_fiscal: text (nullable)
//   dentista_avaliador_id: uuid (nullable)
//   crc_comercial_id: uuid (nullable)
//   origem_id: uuid (nullable)
//   tenant_id: uuid (nullable, default: get_my_tenant_id())

// --- CONSTRAINTS ---
// Table: auditoria_acesso
//   CHECK auditoria_acesso_acao_check: CHECK ((acao = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
//   PRIMARY KEY auditoria_acesso_pkey: PRIMARY KEY (id)
//   FOREIGN KEY auditoria_acesso_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: auditoria_tarefas_rotina
//   PRIMARY KEY auditoria_tarefas_rotina_pkey: PRIMARY KEY (id)
//   FOREIGN KEY auditoria_tarefas_rotina_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES tarefas_rotina(id) ON DELETE CASCADE
//   FOREIGN KEY auditoria_tarefas_rotina_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY auditoria_tarefas_rotina_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: ausencias
//   PRIMARY KEY ausencias_pkey: PRIMARY KEY (id)
//   FOREIGN KEY ausencias_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY ausencias_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: avaliacoes
//   FOREIGN KEY avaliacoes_crc_comercial_id_fkey: FOREIGN KEY (crc_comercial_id) REFERENCES crc_comercial(id) ON DELETE SET NULL
//   FOREIGN KEY avaliacoes_dentista_avaliador_id_fkey: FOREIGN KEY (dentista_avaliador_id) REFERENCES dentistas_avaliadores(id) ON DELETE SET NULL
//   FOREIGN KEY avaliacoes_origem_id_fkey: FOREIGN KEY (origem_id) REFERENCES funil_origens(id) ON DELETE SET NULL
//   FOREIGN KEY avaliacoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY avaliacoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: caixa_diario_fechamentos
//   FOREIGN KEY caixa_diario_fechamentos_conferido_por_fkey: FOREIGN KEY (conferido_por) REFERENCES usuarios(id)
//   PRIMARY KEY caixa_diario_fechamentos_pkey: PRIMARY KEY (data_referencia)
//   FOREIGN KEY caixa_diario_fechamentos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: campo_configuracao
//   FOREIGN KEY campo_configuracao_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   UNIQUE campo_configuracao_especialidade_id_campo_id_key: UNIQUE (especialidade_id, campo_id)
//   FOREIGN KEY campo_configuracao_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
//   PRIMARY KEY campo_configuracao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY campo_configuracao_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: campo_opcoes
//   FOREIGN KEY campo_opcoes_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   FOREIGN KEY campo_opcoes_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
//   PRIMARY KEY campo_opcoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY campo_opcoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: campos_personalizados
//   UNIQUE campos_personalizados_nome_key: UNIQUE (nome)
//   PRIMARY KEY campos_personalizados_pkey: PRIMARY KEY (id)
//   FOREIGN KEY campos_personalizados_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: cargo_permissoes
//   FOREIGN KEY cargo_permissoes_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
//   FOREIGN KEY cargo_permissoes_permissao_id_fkey: FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
//   PRIMARY KEY cargo_permissoes_pkey: PRIMARY KEY (cargo_id, permissao_id)
//   FOREIGN KEY cargo_permissoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: cargos
//   PRIMARY KEY cargos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY cargos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: carteira_transacoes
//   FOREIGN KEY carteira_transacoes_origem_id_fkey: FOREIGN KEY (origem_id) REFERENCES performance_bonificacao(id) ON DELETE CASCADE
//   PRIMARY KEY carteira_transacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY carteira_transacoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   CHECK carteira_transacoes_tipo_check: CHECK ((tipo = ANY (ARRAY['credito'::text, 'debito'::text, 'saque'::text])))
//   FOREIGN KEY carteira_transacoes_transacao_original_id_fkey: FOREIGN KEY (transacao_original_id) REFERENCES carteira_transacoes(id) ON DELETE SET NULL
//   FOREIGN KEY carteira_transacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: chat_conversas
//   FOREIGN KEY chat_conversas_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
//   PRIMARY KEY chat_conversas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY chat_conversas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   CHECK chat_conversas_tipo_check: CHECK ((tipo = ANY (ARRAY['individual'::text, 'grupo'::text])))
// Table: chat_mensagens
//   FOREIGN KEY chat_mensagens_conversa_id_fkey: FOREIGN KEY (conversa_id) REFERENCES chat_conversas(id) ON DELETE CASCADE
//   PRIMARY KEY chat_mensagens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY chat_mensagens_remetente_id_fkey: FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY chat_mensagens_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: chat_participantes
//   FOREIGN KEY chat_participantes_conversa_id_fkey: FOREIGN KEY (conversa_id) REFERENCES chat_conversas(id) ON DELETE CASCADE
//   PRIMARY KEY chat_participantes_pkey: PRIMARY KEY (conversa_id, usuario_id)
//   FOREIGN KEY chat_participantes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY chat_participantes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: colaboradores_detalhes
//   PRIMARY KEY colaboradores_detalhes_pkey: PRIMARY KEY (usuario_id)
//   FOREIGN KEY colaboradores_detalhes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY colaboradores_detalhes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: compra_itens
//   FOREIGN KEY compra_itens_compra_id_fkey: FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE
//   PRIMARY KEY compra_itens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compra_itens_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
//   FOREIGN KEY compra_itens_sala_id_fkey: FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
//   FOREIGN KEY compra_itens_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: compras
//   FOREIGN KEY compras_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY compras_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compras_sala_id_fkey: FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
//   FOREIGN KEY compras_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: compromissos
//   FOREIGN KEY compromissos_concluido_por_fkey: FOREIGN KEY (concluido_por) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY compromissos_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES funil_leads(id) ON DELETE SET NULL
//   FOREIGN KEY compromissos_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL
//   PRIMARY KEY compromissos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compromissos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY compromissos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: configuracoes_acesso
//   PRIMARY KEY configuracoes_acesso_pkey: PRIMARY KEY (id)
//   FOREIGN KEY configuracoes_acesso_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: configuracoes_negociacao
//   PRIMARY KEY configuracoes_negociacao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY configuracoes_negociacao_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: contatos_follow_up
//   FOREIGN KEY contatos_follow_up_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY contatos_follow_up_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contatos_follow_up_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY contatos_follow_up_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: crc_comercial
//   PRIMARY KEY crc_comercial_pkey: PRIMARY KEY (id)
//   FOREIGN KEY crc_comercial_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY crc_comercial_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: criativos_gerados
//   FOREIGN KEY criativos_gerados_dentista_avaliador_id_fkey: FOREIGN KEY (dentista_avaliador_id) REFERENCES dentistas_avaliadores(id) ON DELETE CASCADE
//   PRIMARY KEY criativos_gerados_pkey: PRIMARY KEY (id)
//   FOREIGN KEY criativos_gerados_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: dentistas
//   PRIMARY KEY dentistas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dentistas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY dentistas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: dentistas_avaliadores
//   PRIMARY KEY dentistas_avaliadores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dentistas_avaliadores_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY dentistas_avaliadores_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: descontos_por_prazo
//   CHECK descontos_por_prazo_faixa_numero_check: CHECK (((faixa_numero >= 0) AND (faixa_numero <= 5)))
//   PRIMARY KEY descontos_por_prazo_pkey: PRIMARY KEY (id)
//   FOREIGN KEY descontos_por_prazo_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: diametros_implante
//   UNIQUE diametros_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY diametros_implante_pkey: PRIMARY KEY (id)
//   FOREIGN KEY diametros_implante_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: embalagens
//   UNIQUE embalagens_nome_key: UNIQUE (nome)
//   PRIMARY KEY embalagens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY embalagens_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: entrada_produtos
//   FOREIGN KEY entrada_produtos_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY entrada_produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY entrada_produtos_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
//   FOREIGN KEY entrada_produtos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: especialidade_campos
//   FOREIGN KEY especialidade_campos_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   FOREIGN KEY especialidade_campos_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE CASCADE
//   PRIMARY KEY especialidade_campos_pkey: PRIMARY KEY (especialidade_id, campo_id)
//   FOREIGN KEY especialidade_campos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: especialidades
//   UNIQUE especialidades_nome_key: UNIQUE (nome)
//   PRIMARY KEY especialidades_pkey: PRIMARY KEY (id)
//   FOREIGN KEY especialidades_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: execucoes_rotina
//   PRIMARY KEY execucoes_rotina_pkey: PRIMARY KEY (id)
//   FOREIGN KEY execucoes_rotina_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES tarefas_rotina(id) ON DELETE CASCADE
//   FOREIGN KEY execucoes_rotina_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY execucoes_rotina_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: faixas_valores_parcelas
//   PRIMARY KEY faixas_valores_parcelas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY faixas_valores_parcelas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: faturamento_comissoes
//   PRIMARY KEY faturamento_comissoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY faturamento_comissoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: faturas_comissoes
//   FOREIGN KEY faturas_comissoes_faturamento_id_fkey: FOREIGN KEY (faturamento_id) REFERENCES faturamento_comissoes(id) ON DELETE CASCADE
//   PRIMARY KEY faturas_comissoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY faturas_comissoes_profissional_id_fkey: FOREIGN KEY (profissional_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   FOREIGN KEY faturas_comissoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: fet_etiquetas
//   PRIMARY KEY fet_etiquetas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fet_etiquetas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: fet_historico
//   FOREIGN KEY fet_historico_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES fet_pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY fet_historico_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fet_historico_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY fet_historico_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: fet_pacientes
//   PRIMARY KEY fet_pacientes_pkey: PRIMARY KEY (id)
// Table: fet_procedimentos
//   FOREIGN KEY fet_procedimentos_concluido_por_fkey: FOREIGN KEY (concluido_por) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY fet_procedimentos_dentista_id_fkey: FOREIGN KEY (dentista_id) REFERENCES pro_agenda_dentistas(id) ON DELETE SET NULL
//   FOREIGN KEY fet_procedimentos_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES fet_pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY fet_procedimentos_pkey: PRIMARY KEY (id)
// Table: fluxo_caixa_categorias
//   UNIQUE fluxo_caixa_categorias_nome_key: UNIQUE (nome)
//   PRIMARY KEY fluxo_caixa_categorias_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fluxo_caixa_categorias_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: fluxo_caixa_despesas
//   PRIMARY KEY fluxo_caixa_despesas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fluxo_caixa_despesas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: fluxo_caixa_parceiros
//   PRIMARY KEY fluxo_caixa_parceiros_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fluxo_caixa_parceiros_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: fluxo_caixa_receitas
//   UNIQUE fluxo_caixa_receitas_mes_referencia_ciclo_key: UNIQUE (mes_referencia, ciclo)
//   PRIMARY KEY fluxo_caixa_receitas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fluxo_caixa_receitas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: fornecedores
//   PRIMARY KEY fornecedores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fornecedores_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: funil_dados_mensais
//   FOREIGN KEY funil_dados_mensais_origem_id_fkey: FOREIGN KEY (origem_id) REFERENCES funil_origens(id) ON DELETE CASCADE
//   UNIQUE funil_dados_mensais_origem_id_mes_referencia_key: UNIQUE (origem_id, mes_referencia)
//   PRIMARY KEY funil_dados_mensais_pkey: PRIMARY KEY (id)
//   FOREIGN KEY funil_dados_mensais_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: funil_etapas
//   PRIMARY KEY funil_etapas_pkey: PRIMARY KEY (id)
//   UNIQUE funil_etapas_slug_key: UNIQUE (slug)
//   FOREIGN KEY funil_etapas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: funil_leads
//   FOREIGN KEY funil_leads_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE SET NULL
//   FOREIGN KEY funil_leads_origem_id_fkey: FOREIGN KEY (origem_id) REFERENCES funil_origens(id) ON DELETE CASCADE
//   PRIMARY KEY funil_leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY funil_leads_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: funil_leads_historico
//   FOREIGN KEY funil_leads_historico_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES funil_leads(id) ON DELETE CASCADE
//   PRIMARY KEY funil_leads_historico_pkey: PRIMARY KEY (id)
//   FOREIGN KEY funil_leads_historico_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY funil_leads_historico_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: funil_leads_notas
//   FOREIGN KEY funil_leads_notas_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES funil_leads(id) ON DELETE CASCADE
//   PRIMARY KEY funil_leads_notas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY funil_leads_notas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY funil_leads_notas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: funil_origens
//   UNIQUE funil_origens_nome_key: UNIQUE (nome)
//   PRIMARY KEY funil_origens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY funil_origens_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: funil_temperaturas
//   PRIMARY KEY funil_temperaturas_pkey: PRIMARY KEY (id)
//   UNIQUE funil_temperaturas_slug_key: UNIQUE (slug)
//   FOREIGN KEY funil_temperaturas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: gestao_fiscal_config
//   PRIMARY KEY gestao_fiscal_config_pkey: PRIMARY KEY (id)
//   FOREIGN KEY gestao_fiscal_config_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: gestao_fiscal_entradas_manuais
//   PRIMARY KEY gestao_fiscal_entradas_manuais_pkey: PRIMARY KEY (id)
// Table: historico_compras
//   FOREIGN KEY historico_compras_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY historico_compras_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_compras_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
//   FOREIGN KEY historico_compras_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: intranet_onboarding_etapas
//   FOREIGN KEY intranet_onboarding_etapas_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
//   FOREIGN KEY intranet_onboarding_etapas_fase_id_fkey: FOREIGN KEY (fase_id) REFERENCES intranet_onboarding_fases(id) ON DELETE CASCADE
//   PRIMARY KEY intranet_onboarding_etapas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY intranet_onboarding_etapas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: intranet_onboarding_fases
//   FOREIGN KEY intranet_onboarding_fases_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
//   PRIMARY KEY intranet_onboarding_fases_pkey: PRIMARY KEY (id)
//   FOREIGN KEY intranet_onboarding_fases_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: intranet_onboarding_progresso
//   PRIMARY KEY intranet_onboarding_progresso_pkey: PRIMARY KEY (id)
//   FOREIGN KEY intranet_onboarding_progresso_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES intranet_onboarding_tarefas(id) ON DELETE CASCADE
//   FOREIGN KEY intranet_onboarding_progresso_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY intranet_onboarding_progresso_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   UNIQUE intranet_onboarding_progresso_usuario_id_tarefa_id_key: UNIQUE (usuario_id, tarefa_id)
// Table: intranet_onboarding_tarefas
//   FOREIGN KEY intranet_onboarding_tarefas_etapa_id_fkey: FOREIGN KEY (etapa_id) REFERENCES intranet_onboarding_etapas(id) ON DELETE CASCADE
//   PRIMARY KEY intranet_onboarding_tarefas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY intranet_onboarding_tarefas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: intranet_treinamentos_cursos
//   PRIMARY KEY intranet_treinamentos_cursos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY intranet_treinamentos_cursos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: intranet_treinamentos_modulos
//   FOREIGN KEY intranet_treinamentos_modulos_curso_id_fkey: FOREIGN KEY (curso_id) REFERENCES intranet_treinamentos_cursos(id) ON DELETE CASCADE
//   PRIMARY KEY intranet_treinamentos_modulos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY intranet_treinamentos_modulos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: intranet_treinamentos_progresso
//   FOREIGN KEY intranet_treinamentos_progresso_modulo_id_fkey: FOREIGN KEY (modulo_id) REFERENCES intranet_treinamentos_modulos(id) ON DELETE CASCADE
//   PRIMARY KEY intranet_treinamentos_progresso_pkey: PRIMARY KEY (id)
//   FOREIGN KEY intranet_treinamentos_progresso_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY intranet_treinamentos_progresso_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   UNIQUE intranet_treinamentos_progresso_usuario_id_modulo_id_key: UNIQUE (usuario_id, modulo_id)
// Table: marcas_implante
//   UNIQUE marcas_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY marcas_implante_pkey: PRIMARY KEY (id)
//   FOREIGN KEY marcas_implante_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: normas_aceites
//   FOREIGN KEY normas_aceites_norma_id_fkey: FOREIGN KEY (norma_id) REFERENCES normas_internas(id) ON DELETE CASCADE
//   UNIQUE normas_aceites_norma_id_usuario_id_key: UNIQUE (norma_id, usuario_id)
//   PRIMARY KEY normas_aceites_pkey: PRIMARY KEY (id)
//   FOREIGN KEY normas_aceites_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY normas_aceites_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: normas_internas
//   FOREIGN KEY normas_internas_criado_por_fkey: FOREIGN KEY (criado_por) REFERENCES usuarios(id)
//   PRIMARY KEY normas_internas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY normas_internas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: orcamentos
//   FOREIGN KEY orcamentos_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY orcamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY orcamentos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: pacientes
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pacientes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: pedido_itens
//   FOREIGN KEY pedido_itens_pedido_id_fkey: FOREIGN KEY (pedido_id) REFERENCES pedidos_materiais(id) ON DELETE CASCADE
//   PRIMARY KEY pedido_itens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pedido_itens_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
//   CHECK pedido_itens_quantidade_check: CHECK ((quantidade > 0))
//   FOREIGN KEY pedido_itens_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: pedidos_materiais
//   FOREIGN KEY pedidos_materiais_entregue_por_fkey: FOREIGN KEY (entregue_por) REFERENCES usuarios(id)
//   PRIMARY KEY pedidos_materiais_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pedidos_materiais_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY pedidos_materiais_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
//   FOREIGN KEY pedidos_materiais_usuario_id_usuarios_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   CHECK valid_status: CHECK ((status = ANY (ARRAY['rascunho'::text, 'enviado'::text, 'entregue'::text, 'cancelado'::text])))
// Table: performance_bonificacao
//   PRIMARY KEY performance_bonificacao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY performance_bonificacao_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY performance_bonificacao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
//   UNIQUE performance_bonificacao_usuario_id_mes_referencia_key: UNIQUE (usuario_id, mes_referencia)
// Table: performance_bonificacao_itens
//   PRIMARY KEY performance_bonificacao_itens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY performance_bonificacao_itens_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: performance_google_reviews
//   PRIMARY KEY performance_google_reviews_pkey: PRIMARY KEY (id)
//   FOREIGN KEY performance_google_reviews_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY performance_google_reviews_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: performance_pp_pdm
//   PRIMARY KEY performance_pp_pdm_pkey: PRIMARY KEY (id)
//   FOREIGN KEY performance_pp_pdm_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   UNIQUE performance_pp_pdm_usuario_id_data_registro_key: UNIQUE (usuario_id, data_registro)
//   FOREIGN KEY performance_pp_pdm_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: permissoes
//   UNIQUE permissoes_nome_tenant_key: UNIQUE (nome, tenant_id)
//   PRIMARY KEY permissoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY permissoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: precificacao_custos_fixos
//   PRIMARY KEY precificacao_custos_fixos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY precificacao_custos_fixos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: precificacao_custos_fixos_detalhes
//   FOREIGN KEY precificacao_custos_fixos_detalhes_custo_fixo_id_fkey: FOREIGN KEY (custo_fixo_id) REFERENCES precificacao_custos_fixos(id) ON DELETE CASCADE
//   PRIMARY KEY precificacao_custos_fixos_detalhes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY precificacao_custos_fixos_detalhes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: precificacao_especialidades
//   UNIQUE precificacao_especialidades_nome_key: UNIQUE (nome)
//   PRIMARY KEY precificacao_especialidades_pkey: PRIMARY KEY (id)
//   FOREIGN KEY precificacao_especialidades_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: precificacao_globais
//   PRIMARY KEY precificacao_globais_pkey: PRIMARY KEY (id)
//   FOREIGN KEY precificacao_globais_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: precificacao_ocupacao_cadeiras
//   UNIQUE precificacao_ocupacao_cadeiras_consultorio_turno_dia_semana_sem: UNIQUE (consultorio, turno, dia_semana, semana)
//   PRIMARY KEY precificacao_ocupacao_cadeiras_pkey: PRIMARY KEY (id)
//   FOREIGN KEY precificacao_ocupacao_cadeiras_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: precificacao_ocupacao_config
//   PRIMARY KEY precificacao_ocupacao_config_pkey: PRIMARY KEY (id)
//   FOREIGN KEY precificacao_ocupacao_config_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   CHECK precificacao_ocupacao_config_tipo_check: CHECK ((tipo = ANY (ARRAY['especialidade'::text, 'dentista'::text])))
// Table: precificacao_procedimentos
//   FOREIGN KEY precificacao_procedimentos_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES precificacao_especialidades(id) ON DELETE CASCADE
//   PRIMARY KEY precificacao_procedimentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY precificacao_procedimentos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: pro_agenda_dentistas
//   PRIMARY KEY pro_agenda_dentistas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pro_agenda_dentistas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: pro_agenda_procedimentos
//   PRIMARY KEY pro_agenda_procedimentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pro_agenda_procedimentos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: pro_agenda_tempos
//   FOREIGN KEY pro_agenda_tempos_dentista_id_fkey: FOREIGN KEY (dentista_id) REFERENCES pro_agenda_dentistas(id) ON DELETE CASCADE
//   PRIMARY KEY pro_agenda_tempos_pkey: PRIMARY KEY (id)
//   UNIQUE pro_agenda_tempos_procedimento_id_dentista_id_key: UNIQUE (procedimento_id, dentista_id)
//   FOREIGN KEY pro_agenda_tempos_procedimento_id_fkey: FOREIGN KEY (procedimento_id) REFERENCES pro_agenda_procedimentos(id) ON DELETE CASCADE
//   FOREIGN KEY pro_agenda_tempos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: produto_campos_valores
//   FOREIGN KEY produto_campos_valores_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   PRIMARY KEY produto_campos_valores_pkey: PRIMARY KEY (id)
//   UNIQUE produto_campos_valores_produto_id_campo_id_key: UNIQUE (produto_id, campo_id)
//   FOREIGN KEY produto_campos_valores_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
//   FOREIGN KEY produto_campos_valores_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: produtos
//   FOREIGN KEY produtos_embalagem_id_fkey: FOREIGN KEY (embalagem_id) REFERENCES embalagens(id) ON DELETE SET NULL
//   FOREIGN KEY produtos_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE SET NULL
//   PRIMARY KEY produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY produtos_sala_id_fkey: FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
//   FOREIGN KEY produtos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: referencias_comissao_crc
//   PRIMARY KEY referencias_comissao_crc_pkey: PRIMARY KEY (id)
//   FOREIGN KEY referencias_comissao_crc_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: referencias_comissao_dentista
//   PRIMARY KEY referencias_comissao_dentista_pkey: PRIMARY KEY (id)
//   FOREIGN KEY referencias_comissao_dentista_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: rh_ferias
//   PRIMARY KEY rh_ferias_pkey: PRIMARY KEY (id)
//   FOREIGN KEY rh_ferias_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY rh_ferias_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: roteiros
//   PRIMARY KEY roteiros_pkey: PRIMARY KEY (id)
//   FOREIGN KEY roteiros_setor_id_fkey: FOREIGN KEY (setor_id) REFERENCES roteiros_setores(id) ON DELETE CASCADE
//   FOREIGN KEY roteiros_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: roteiros_setores
//   PRIMARY KEY roteiros_setores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY roteiros_setores_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: rotinas_usuarios
//   FOREIGN KEY rotinas_usuarios_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE SET NULL
//   PRIMARY KEY rotinas_usuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY rotinas_usuarios_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY rotinas_usuarios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: sac_acoes_solucao
//   FOREIGN KEY sac_acoes_solucao_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES sac_demandas(id) ON DELETE CASCADE
//   PRIMARY KEY sac_acoes_solucao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sac_acoes_solucao_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY sac_acoes_solucao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: sac_configuracoes
//   PRIMARY KEY sac_configuracoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sac_configuracoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: sac_demandas
//   PRIMARY KEY sac_demandas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sac_demandas_quem_recebeu_id_fkey: FOREIGN KEY (quem_recebeu_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY sac_demandas_quem_resolve_id_fkey: FOREIGN KEY (quem_resolve_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   CHECK sac_demandas_status_check: CHECK ((status = ANY (ARRAY['recebido'::text, 'sendo_tratado'::text, 'resolvido'::text])))
//   FOREIGN KEY sac_demandas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   CHECK sac_demandas_tipo_check: CHECK ((tipo = ANY (ARRAY['reclamacao'::text, 'sugestao'::text])))
// Table: sac_historico
//   FOREIGN KEY sac_historico_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES sac_demandas(id) ON DELETE CASCADE
//   PRIMARY KEY sac_historico_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sac_historico_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY sac_historico_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: saida_produtos
//   PRIMARY KEY saida_produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY saida_produtos_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
//   FOREIGN KEY saida_produtos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   CHECK saida_produtos_tipo_saida_check: CHECK ((tipo_saida = ANY (ARRAY['definitiva'::text, 'parcial'::text])))
//   FOREIGN KEY saida_produtos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: salas
//   UNIQUE salas_nome_key: UNIQUE (nome)
//   PRIMARY KEY salas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY salas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: sorriso_dos_sonhos_config
//   PRIMARY KEY sorriso_dos_sonhos_config_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sorriso_dos_sonhos_config_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: sorriso_dos_sonhos_indicacoes
//   FOREIGN KEY sorriso_dos_sonhos_indicacoes_colaborador_id_fkey: FOREIGN KEY (colaborador_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY sorriso_dos_sonhos_indicacoes_paciente_indicador_id_fkey: FOREIGN KEY (paciente_indicador_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY sorriso_dos_sonhos_indicacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sorriso_dos_sonhos_indicacoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: tamanhos_implante
//   UNIQUE tamanhos_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY tamanhos_implante_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tamanhos_implante_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: tarefas_rotina
//   PRIMARY KEY tarefas_rotina_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tarefas_rotina_rotina_id_fkey: FOREIGN KEY (rotina_id) REFERENCES rotinas_usuarios(id) ON DELETE CASCADE
//   FOREIGN KEY tarefas_rotina_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: tenants
//   PRIMARY KEY tenants_pkey: PRIMARY KEY (id)
//   UNIQUE tenants_slug_key: UNIQUE (slug)
//   CHECK tenants_status_check: CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'suspenso'::text])))
// Table: terceiros_categorias
//   PRIMARY KEY terceiros_categorias_pkey: PRIMARY KEY (id)
//   UNIQUE terceiros_categorias_slug_tenant_key: UNIQUE (slug, tenant_id)
//   FOREIGN KEY terceiros_categorias_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: terceiros_colunas
//   FOREIGN KEY terceiros_colunas_categoria_slug_tenant_fkey: FOREIGN KEY (categoria_slug, tenant_id) REFERENCES terceiros_categorias(slug, tenant_id)
//   PRIMARY KEY terceiros_colunas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY terceiros_colunas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: terceiros_etiquetas
//   PRIMARY KEY terceiros_etiquetas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY terceiros_etiquetas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: terceiros_historico
//   PRIMARY KEY terceiros_historico_pkey: PRIMARY KEY (id)
//   FOREIGN KEY terceiros_historico_tarefa_id_fkey: FOREIGN KEY (tarefa_id) REFERENCES terceiros_tarefas(id) ON DELETE CASCADE
//   FOREIGN KEY terceiros_historico_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY terceiros_historico_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: terceiros_tarefas
//   FOREIGN KEY terceiros_tarefas_categoria_slug_tenant_fkey: FOREIGN KEY (categoria_slug, tenant_id) REFERENCES terceiros_categorias(slug, tenant_id)
//   PRIMARY KEY terceiros_tarefas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY terceiros_tarefas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY terceiros_tarefas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: usuario_permissoes
//   FOREIGN KEY usuario_permissoes_permissao_id_fkey: FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
//   PRIMARY KEY usuario_permissoes_pkey: PRIMARY KEY (usuario_id, permissao_id)
//   FOREIGN KEY usuario_permissoes_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY usuario_permissoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE SET NULL
//   FOREIGN KEY usuarios_cargo_secundario_id_fkey: FOREIGN KEY (cargo_secundario_id) REFERENCES cargos(id) ON DELETE SET NULL
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY usuarios_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: usuarios_compromissos
//   FOREIGN KEY usuarios_compromissos_compromisso_id_fkey: FOREIGN KEY (compromisso_id) REFERENCES compromissos(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_compromissos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY usuarios_compromissos_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY usuarios_compromissos_usuario_criador_id_fkey: FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   FOREIGN KEY usuarios_compromissos_usuario_destinatario_id_fkey: FOREIGN KEY (usuario_destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: vendas_confirmadas
//   FOREIGN KEY vendas_confirmadas_crc_fkey: FOREIGN KEY (crc) REFERENCES crc_comercial(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_confirmadas_dentista_avaliador_fkey: FOREIGN KEY (dentista_avaliador) REFERENCES dentistas_avaliadores(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_confirmadas_fatura_comissao_id_fkey: FOREIGN KEY (fatura_comissao_id) REFERENCES faturas_comissoes(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_confirmadas_oportunidade_id_fkey: FOREIGN KEY (oportunidade_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   FOREIGN KEY vendas_confirmadas_origem_id_fkey: FOREIGN KEY (origem_id) REFERENCES funil_origens(id) ON DELETE SET NULL
//   PRIMARY KEY vendas_confirmadas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY vendas_confirmadas_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
// Table: vendas_diarias
//   FOREIGN KEY vendas_diarias_crc_comercial_id_fkey: FOREIGN KEY (crc_comercial_id) REFERENCES crc_comercial(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_diarias_dentista_avaliador_id_fkey: FOREIGN KEY (dentista_avaliador_id) REFERENCES dentistas_avaliadores(id) ON DELETE SET NULL
//   FOREIGN KEY vendas_diarias_origem_id_fkey: FOREIGN KEY (origem_id) REFERENCES funil_origens(id) ON DELETE SET NULL
//   PRIMARY KEY vendas_diarias_pkey: PRIMARY KEY (id)
//   FOREIGN KEY vendas_diarias_tenant_id_fkey: FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
//   FOREIGN KEY vendas_diarias_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: auditoria_acesso
//   Policy "auditoria_read_own" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((tenant_id = (((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))::uuid) OR ((((auth.jwt() -> 'app_metadata'::text) ->> 'is_super_admin'::text))::boolean = true))
// Table: auditoria_tarefas_rotina
//   Policy "auditoria_tarefas_rotina_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "auditoria_tarefas_rotina_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "auditoria_tarefas_rotina_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "auditoria_tarefas_rotina_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: ausencias
//   Policy "ausencias_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "ausencias_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "ausencias_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "ausencias_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: avaliacoes
//   Policy "avaliacoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "avaliacoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "avaliacoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "avaliacoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: caixa_diario_fechamentos
//   Policy "caixa_diario_fechamentos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "caixa_diario_fechamentos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "caixa_diario_fechamentos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "caixa_diario_fechamentos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: campo_configuracao
//   Policy "campo_configuracao_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "campo_configuracao_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "campo_configuracao_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "campo_configuracao_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: campo_opcoes
//   Policy "campo_opcoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "campo_opcoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "campo_opcoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "campo_opcoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: campos_personalizados
//   Policy "campos_personalizados_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "campos_personalizados_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "campos_personalizados_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "campos_personalizados_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: cargo_permissoes
//   Policy "cargo_permissoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "cargo_permissoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "cargo_permissoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "cargo_permissoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: cargos
//   Policy "cargos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "cargos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "cargos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "cargos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: carteira_transacoes
//   Policy "carteira_transacoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "carteira_transacoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "carteira_transacoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "carteira_transacoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: chat_conversas
//   Policy "chat_conversas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "chat_conversas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "chat_conversas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "chat_conversas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: chat_mensagens
//   Policy "chat_mensagens_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "chat_mensagens_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "chat_mensagens_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "chat_mensagens_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: chat_participantes
//   Policy "chat_participantes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "chat_participantes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "chat_participantes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "chat_participantes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: colaboradores_detalhes
//   Policy "colaboradores_detalhes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "colaboradores_detalhes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "colaboradores_detalhes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "colaboradores_detalhes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: compra_itens
//   Policy "compra_itens_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "compra_itens_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "compra_itens_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "compra_itens_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: compras
//   Policy "compras_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "compras_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "compras_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "compras_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: compromissos
//   Policy "compromissos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "compromissos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "compromissos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "compromissos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "compromissos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: configuracoes_acesso
//   Policy "configuracoes_acesso_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "configuracoes_acesso_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "configuracoes_acesso_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "configuracoes_acesso_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: configuracoes_negociacao
//   Policy "configuracoes_negociacao_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "configuracoes_negociacao_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "configuracoes_negociacao_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "configuracoes_negociacao_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: contatos_follow_up
//   Policy "contatos_follow_up_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "contatos_follow_up_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "contatos_follow_up_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "contatos_follow_up_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: crc_comercial
//   Policy "crc_comercial_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "crc_comercial_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "crc_comercial_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "crc_comercial_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: criativos_gerados
//   Policy "criativos_gerados_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "criativos_gerados_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "criativos_gerados_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "criativos_gerados_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: dentistas
//   Policy "dentistas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "dentistas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "dentistas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "dentistas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: dentistas_avaliadores
//   Policy "dentistas_avaliadores_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "dentistas_avaliadores_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "dentistas_avaliadores_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "dentistas_avaliadores_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: descontos_por_prazo
//   Policy "descontos_por_prazo_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "descontos_por_prazo_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "descontos_por_prazo_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "descontos_por_prazo_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: diametros_implante
//   Policy "diametros_implante_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "diametros_implante_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "diametros_implante_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "diametros_implante_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: embalagens
//   Policy "embalagens_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "embalagens_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "embalagens_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "embalagens_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: entrada_produtos
//   Policy "entrada_produtos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "entrada_produtos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "entrada_produtos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "entrada_produtos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: especialidade_campos
//   Policy "especialidade_campos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "especialidade_campos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "especialidade_campos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "especialidade_campos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: especialidades
//   Policy "especialidades_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "especialidades_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "especialidades_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "especialidades_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: execucoes_rotina
//   Policy "execucoes_rotina_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "execucoes_rotina_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "execucoes_rotina_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "execucoes_rotina_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: faixas_valores_parcelas
//   Policy "faixas_valores_parcelas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "faixas_valores_parcelas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "faixas_valores_parcelas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "faixas_valores_parcelas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: faturamento_comissoes
//   Policy "faturamento_comissoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "faturamento_comissoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "faturamento_comissoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "faturamento_comissoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: faturas_comissoes
//   Policy "faturas_comissoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "faturas_comissoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "faturas_comissoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "faturas_comissoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: fet_etiquetas
//   Policy "fet_etiquetas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fet_etiquetas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fet_etiquetas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fet_etiquetas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
// Table: fet_historico
//   Policy "fet_historico_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fet_historico_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
// Table: fet_pacientes
//   Policy "fet_pacientes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fet_pacientes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fet_pacientes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fet_pacientes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: fet_procedimentos
//   Policy "fet_procedimentos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fet_procedimentos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fet_procedimentos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fet_procedimentos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: fluxo_caixa_categorias
//   Policy "fluxo_caixa_categorias_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_categorias_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_categorias_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_categorias_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: fluxo_caixa_despesas
//   Policy "fluxo_caixa_despesas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_despesas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_despesas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_despesas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: fluxo_caixa_parceiros
//   Policy "fluxo_caixa_parceiros_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_parceiros_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_parceiros_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_parceiros_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: fluxo_caixa_receitas
//   Policy "fluxo_caixa_receitas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_receitas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_receitas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fluxo_caixa_receitas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: fornecedores
//   Policy "fornecedores_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fornecedores_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "fornecedores_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "fornecedores_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: funil_dados_mensais
//   Policy "funil_dados_mensais_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_dados_mensais_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_dados_mensais_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_dados_mensais_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: funil_etapas
//   Policy "funil_etapas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_etapas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_etapas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_etapas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: funil_leads
//   Policy "funil_leads_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: funil_leads_historico
//   Policy "funil_leads_historico_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_historico_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_historico_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_historico_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_historico_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: funil_leads_notas
//   Policy "funil_leads_notas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_notas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_notas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_leads_notas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: funil_origens
//   Policy "funil_origens_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_origens_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_origens_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_origens_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: funil_temperaturas
//   Policy "funil_temperaturas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_temperaturas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "funil_temperaturas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "funil_temperaturas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: gestao_fiscal_config
//   Policy "gestao_fiscal_config_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "gestao_fiscal_config_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "gestao_fiscal_config_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "gestao_fiscal_config_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: gestao_fiscal_entradas_manuais
//   Policy "gestao_fiscal_entradas_manuais_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "gestao_fiscal_entradas_manuais_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "gestao_fiscal_entradas_manuais_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "gestao_fiscal_entradas_manuais_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: historico_compras
//   Policy "historico_compras_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "historico_compras_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "historico_compras_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "historico_compras_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: intranet_onboarding_etapas
//   Policy "authenticated_all_ioe" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: intranet_onboarding_fases
//   Policy "authenticated_all_iof" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: intranet_onboarding_progresso
//   Policy "authenticated_all_iop" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: intranet_onboarding_tarefas
//   Policy "authenticated_all_iot" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: intranet_treinamentos_cursos
//   Policy "authenticated_all_itc" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: intranet_treinamentos_modulos
//   Policy "authenticated_all_itm" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: intranet_treinamentos_progresso
//   Policy "authenticated_all_itp" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: marcas_implante
//   Policy "marcas_implante_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "marcas_implante_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "marcas_implante_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "marcas_implante_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: normas_aceites
//   Policy "normas_aceites_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "normas_aceites_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "normas_aceites_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "normas_aceites_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: normas_internas
//   Policy "normas_internas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "normas_internas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "normas_internas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "normas_internas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: orcamentos
//   Policy "orcamentos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "orcamentos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "orcamentos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "orcamentos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: pacientes
//   Policy "pacientes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pacientes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "pacientes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pacientes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: pedido_itens
//   Policy "pedido_itens_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pedido_itens_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "pedido_itens_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pedido_itens_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: pedidos_materiais
//   Policy "pedidos_materiais_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pedidos_materiais_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "pedidos_materiais_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pedidos_materiais_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: performance_bonificacao
//   Policy "performance_bonificacao_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_bonificacao_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "performance_bonificacao_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_bonificacao_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: performance_bonificacao_itens
//   Policy "performance_bonificacao_itens_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_bonificacao_itens_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "performance_bonificacao_itens_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_bonificacao_itens_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: performance_google_reviews
//   Policy "performance_google_reviews_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_google_reviews_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "performance_google_reviews_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_google_reviews_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: performance_pp_pdm
//   Policy "performance_pp_pdm_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_pp_pdm_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "performance_pp_pdm_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "performance_pp_pdm_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: permissoes
//   Policy "permissoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "permissoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "permissoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "permissoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: precificacao_custos_fixos
//   Policy "precificacao_custos_fixos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_custos_fixos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_custos_fixos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_custos_fixos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: precificacao_custos_fixos_detalhes
//   Policy "precificacao_custos_fixos_detalhes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_custos_fixos_detalhes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_custos_fixos_detalhes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_custos_fixos_detalhes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: precificacao_especialidades
//   Policy "precificacao_especialidades_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_especialidades_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_especialidades_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_especialidades_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: precificacao_globais
//   Policy "precificacao_globais_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_globais_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_globais_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_globais_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: precificacao_ocupacao_cadeiras
//   Policy "precificacao_ocupacao_cadeiras_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_ocupacao_cadeiras_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_ocupacao_cadeiras_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_ocupacao_cadeiras_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: precificacao_ocupacao_config
//   Policy "precificacao_ocupacao_config_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_ocupacao_config_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_ocupacao_config_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_ocupacao_config_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: precificacao_procedimentos
//   Policy "precificacao_procedimentos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_procedimentos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_procedimentos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "precificacao_procedimentos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: pro_agenda_dentistas
//   Policy "pro_agenda_dentistas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_dentistas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_dentistas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_dentistas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: pro_agenda_procedimentos
//   Policy "pro_agenda_procedimentos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_procedimentos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_procedimentos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_procedimentos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: pro_agenda_tempos
//   Policy "pro_agenda_tempos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_tempos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_tempos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "pro_agenda_tempos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: produto_campos_valores
//   Policy "produto_campos_valores_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "produto_campos_valores_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "produto_campos_valores_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "produto_campos_valores_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: produtos
//   Policy "produtos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "produtos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "produtos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "produtos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: referencias_comissao_crc
//   Policy "referencias_comissao_crc_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "referencias_comissao_crc_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "referencias_comissao_crc_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "referencias_comissao_crc_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: referencias_comissao_dentista
//   Policy "referencias_comissao_dentista_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "referencias_comissao_dentista_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "referencias_comissao_dentista_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "referencias_comissao_dentista_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: rh_ferias
//   Policy "rh_ferias_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "rh_ferias_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "rh_ferias_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "rh_ferias_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: roteiros
//   Policy "roteiros_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "roteiros_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "roteiros_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "roteiros_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: roteiros_setores
//   Policy "roteiros_setores_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "roteiros_setores_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "roteiros_setores_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "roteiros_setores_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: rotinas_usuarios
//   Policy "rotinas_usuarios_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "rotinas_usuarios_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "rotinas_usuarios_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "rotinas_usuarios_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: sac_acoes_solucao
//   Policy "sac_acoes_solucao_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_acoes_solucao_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "sac_acoes_solucao_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_acoes_solucao_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: sac_configuracoes
//   Policy "sac_configuracoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_configuracoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "sac_configuracoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_configuracoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: sac_demandas
//   Policy "sac_demandas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_demandas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "sac_demandas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_demandas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: sac_historico
//   Policy "sac_historico_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_historico_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "sac_historico_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sac_historico_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: saida_produtos
//   Policy "saida_produtos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "saida_produtos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "saida_produtos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "saida_produtos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: salas
//   Policy "salas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "salas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "salas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "salas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: sorriso_dos_sonhos_config
//   Policy "sorriso_dos_sonhos_config_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sorriso_dos_sonhos_config_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "sorriso_dos_sonhos_config_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sorriso_dos_sonhos_config_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: sorriso_dos_sonhos_indicacoes
//   Policy "sorriso_dos_sonhos_indicacoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sorriso_dos_sonhos_indicacoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "sorriso_dos_sonhos_indicacoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "sorriso_dos_sonhos_indicacoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: tamanhos_implante
//   Policy "tamanhos_implante_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "tamanhos_implante_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "tamanhos_implante_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "tamanhos_implante_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: tarefas_rotina
//   Policy "tarefas_rotina_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "tarefas_rotina_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "tarefas_rotina_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "tarefas_rotina_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: tenants
//   Policy "tenants_read_own" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((id = (((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))::uuid) OR ((((auth.jwt() -> 'app_metadata'::text) ->> 'is_super_admin'::text))::boolean = true))
//   Policy "tenants_super_admin_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((((auth.jwt() -> 'app_metadata'::text) ->> 'is_super_admin'::text))::boolean = true)
// Table: terceiros_categorias
//   Policy "terceiros_categorias_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_categorias_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_categorias_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_categorias_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: terceiros_colunas
//   Policy "terceiros_colunas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_colunas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_colunas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_colunas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: terceiros_etiquetas
//   Policy "terceiros_etiquetas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_etiquetas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_etiquetas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_etiquetas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: terceiros_historico
//   Policy "terceiros_historico_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_historico_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_historico_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_historico_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: terceiros_tarefas
//   Policy "terceiros_tarefas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_tarefas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_tarefas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "terceiros_tarefas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: usuario_permissoes
//   Policy "usuario_permissoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "usuario_permissoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "usuario_permissoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "usuario_permissoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: usuarios
//   Policy "usuarios_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "usuarios_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "usuarios_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "usuarios_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: usuarios_compromissos
//   Policy "usuarios_compromissos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "usuarios_compromissos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "usuarios_compromissos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "usuarios_compromissos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: vendas_confirmadas
//   Policy "vendas_confirmadas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "vendas_confirmadas_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "vendas_confirmadas_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "vendas_confirmadas_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "vendas_confirmadas_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())
// Table: vendas_diarias
//   Policy "vendas_diarias_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "vendas_diarias_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (tenant_id = get_my_tenant_id())
//   Policy "vendas_diarias_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//   Policy "vendas_diarias_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (tenant_id = get_my_tenant_id())
//     WITH CHECK: (tenant_id = get_my_tenant_id())

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
// FUNCTION atualizar_funil_dados_mensais(uuid, text)
//   CREATE OR REPLACE FUNCTION public.atualizar_funil_dados_mensais(p_origem_id uuid, p_mes_referencia text)
//    RETURNS void
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_total_leads INT;
//     v_agendamentos INT;
//     v_comparecimentos INT;
//     v_fechamentos INT;
//     v_faltas INT;
//     v_valor_fechado NUMERIC;
//   BEGIN
//     -- Leads (agora usa mes_referencia baseado estritamente na data_avaliacao/criado_em para alinhar com frontend)
//     SELECT COUNT(id) INTO v_total_leads FROM public.funil_leads 
//     WHERE origem_id = p_origem_id 
//     AND to_char(COALESCE(data_avaliacao, criado_em::date), 'YYYY-MM') = p_mes_referencia
//     AND lower(status) NOT IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho')
//     AND nome IS NOT NULL AND trim(nome) != '';
//     
//     -- Agendamentos
//     SELECT COUNT(id) INTO v_agendamentos FROM public.funil_leads 
//     WHERE origem_id = p_origem_id 
//     AND to_char(COALESCE(data_avaliacao, criado_em::date), 'YYYY-MM') = p_mes_referencia
//     AND (lower(status) IN ('agendado', 'reagendado', 'atendido', 'faltou', 'venda-fechada', 'venda_concretizada', 'avaliacao', 'fechamento', 'negociacao', 'em_follow_up', 'venda-perdida') OR COALESCE(qtd_agendamentos, 0) > 0)
//     AND lower(status) NOT IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho')
//     AND nome IS NOT NULL AND trim(nome) != '';
//   
//     -- Comparecimentos
//     SELECT COUNT(id) INTO v_comparecimentos FROM public.funil_leads 
//     WHERE origem_id = p_origem_id 
//     AND to_char(COALESCE(data_avaliacao, criado_em::date), 'YYYY-MM') = p_mes_referencia
//     AND lower(status) IN ('atendido', 'negociacao', 'venda-fechada', 'venda_concretizada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up')
//     AND lower(status) NOT IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho')
//     AND nome IS NOT NULL AND trim(nome) != '';
//   
//     -- Faltas
//     SELECT COUNT(id) INTO v_faltas FROM public.funil_leads 
//     WHERE origem_id = p_origem_id 
//     AND to_char(COALESCE(data_avaliacao, criado_em::date), 'YYYY-MM') = p_mes_referencia
//     AND (lower(status) = 'faltou' OR COALESCE(qtd_faltas, 0) > 0)
//     AND lower(status) NOT IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho')
//     AND nome IS NOT NULL AND trim(nome) != '';
//   
//     -- Fechamentos
//     SELECT COUNT(id) INTO v_fechamentos FROM public.vendas_confirmadas 
//     WHERE origem_id = p_origem_id 
//     AND to_char(data_fechamento::date, 'YYYY-MM') = p_mes_referencia;
//   
//     -- Valor Fechado
//     SELECT COALESCE(SUM(valor_tratamento), 0) INTO v_valor_fechado FROM public.vendas_confirmadas
//     WHERE origem_id = p_origem_id 
//     AND to_char(data_fechamento::date, 'YYYY-MM') = p_mes_referencia;
//   
//     INSERT INTO public.funil_dados_mensais (
//       origem_id, 
//       mes_referencia, 
//       leads_realizado, 
//       agendamentos_realizado, 
//       comparecimentos_realizado,
//       fechamentos_qtde_realizado,
//       fechamentos_valor_realizado,
//       faltas_realizado,
//       investimento,
//       meta_leads,
//       meta_agendamentos_qtde,
//       meta_agendamentos_perc,
//       meta_comparecimentos_qtde,
//       meta_comparecimentos_perc,
//       meta_fechamento_valor,
//       ticket_medio_esperado
//     )
//     VALUES (
//       p_origem_id, 
//       p_mes_referencia, 
//       v_total_leads, 
//       v_agendamentos, 
//       v_comparecimentos,
//       v_fechamentos,
//       v_valor_fechado,
//       v_faltas,
//       0, 0, 0, 0, 0, 0, 0, 0
//     )
//     ON CONFLICT (origem_id, mes_referencia) 
//     DO UPDATE SET
//       leads_realizado = EXCLUDED.leads_realizado,
//       agendamentos_realizado = EXCLUDED.agendamentos_realizado,
//       comparecimentos_realizado = EXCLUDED.comparecimentos_realizado,
//       fechamentos_qtde_realizado = EXCLUDED.fechamentos_qtde_realizado,
//       fechamentos_valor_realizado = EXCLUDED.fechamentos_valor_realizado,
//       faltas_realizado = EXCLUDED.faltas_realizado,
//       atualizado_em = NOW();
//   END;
//   $function$
//   
// FUNCTION gerar_adiantamento_mes_google(text)
//   CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_google(p_mes text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user RECORD;
//   BEGIN
//     FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
//       IF NOT EXISTS (
//         SELECT 1 FROM public.carteira_transacoes 
//         WHERE usuario_id = v_user.id 
//         AND mes_referencia = p_mes 
//         AND descricao = 'Adiantamento Google Avaliações (Meta 5)'
//       ) THEN
//         INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, criado_em)
//         VALUES (
//           v_user.id, 
//           'credito', 
//           100, 
//           'Adiantamento Google Avaliações (Meta 5)', 
//           p_mes,
//           CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
//         );
//       END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION gerar_adiantamento_mes_inovacao(text)
//   CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_inovacao(p_mes text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user RECORD;
//   BEGIN
//     FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
//       IF NOT EXISTS (
//         SELECT 1 FROM public.carteira_transacoes 
//         WHERE usuario_id = v_user.id 
//         AND mes_referencia = p_mes 
//         AND descricao = 'Adiantamento de Inovação'
//       ) THEN
//         INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, criado_em)
//         VALUES (
//           v_user.id, 
//           'credito', 
//           100, 
//           'Adiantamento de Inovação', 
//           p_mes,
//           CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
//         );
//       END IF;
//     END LOOP;
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
//           INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, criado_em)
//           VALUES (
//             v_user.id, 
//             'credito', 
//             200, 
//             'Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)', 
//             p_mes,
//             CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
//           );
//         END IF;
//       END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION gerar_todos_adiantamentos_mensais()
//   CREATE OR REPLACE FUNCTION public.gerar_todos_adiantamentos_mensais()
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_mes_atual text;
//     v_data_atual date := (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date;
//     v_user RECORD;
//   BEGIN
//     -- Trava de segurança: Iniciar apenas a partir de 1º de Maio de 2026
//     IF v_data_atual < '2026-05-01'::date THEN
//       RETURN;
//     END IF;
//   
//     v_mes_atual := to_char(v_data_atual, 'YYYY-MM');
//   
//     -- 1. Gerar Adiantamentos Específicos usando funções existentes
//     PERFORM public.gerar_adiantamento_mes_google(v_mes_atual);
//     PERFORM public.gerar_adiantamento_mes_inovacao(v_mes_atual);
//     PERFORM public.gerar_adiantamento_mes_sorriso(v_mes_atual);
//   
//     -- 2. Gerar registros base de Bonificação Feijão com Arroz para acionar o trigger de adiantamento
//     FOR v_user IN SELECT id FROM public.usuarios WHERE status = 'ativo' AND possui_carteira = true LOOP
//       IF NOT EXISTS (
//         SELECT 1 FROM public.performance_bonificacao 
//         WHERE usuario_id = v_user.id AND mes_referencia = v_mes_atual
//       ) THEN
//         INSERT INTO public.performance_bonificacao (usuario_id, mes_referencia, itens_marcados, pontuacao_total, atingiu_meta)
//         VALUES (v_user.id, v_mes_atual, '[]'::jsonb, 0, false);
//       END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION get_my_tenant_id()
//   CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
//    RETURNS uuid
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//       SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid;
//   $function$
//   
// FUNCTION get_oportunidades_geradas(text)
//   CREATE OR REPLACE FUNCTION public.get_oportunidades_geradas(p_mes_referencia text)
//    RETURNS TABLE(origem_id uuid, origem_nome text, qtd_oportunidades bigint, valor_oportunidades numeric)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       RETURN QUERY
//       SELECT 
//           o.id as origem_id,
//           o.nome as origem_nome,
//           COUNT(a.id) as qtd_oportunidades,
//           COALESCE(SUM(a.valor_orcamento), 0) as valor_oportunidades
//       FROM public.funil_origens o
//       LEFT JOIN public.avaliacoes a 
//           ON a.origem_id = o.id 
//           AND to_char(COALESCE(a.data_avaliacao, a.criado_em::date), 'YYYY-MM') = p_mes_referencia
//       GROUP BY o.id, o.nome
//       ORDER BY o.ordem;
//   END;
//   $function$
//   
// FUNCTION get_or_create_direct_chat(uuid)
//   CREATE OR REPLACE FUNCTION public.get_or_create_direct_chat(target_user_id uuid)
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_chat_id uuid;
//     v_current_user uuid := auth.uid();
//   BEGIN
//     IF v_current_user IS NULL THEN
//       RAISE EXCEPTION 'Not authenticated';
//     END IF;
//   
//     -- Tenta encontrar uma conversa individual existente entre os dois usuários
//     SELECT c.id INTO v_chat_id
//     FROM public.chat_conversas c
//     JOIN public.chat_participantes p1 ON p1.conversa_id = c.id AND p1.usuario_id = v_current_user
//     JOIN public.chat_participantes p2 ON p2.conversa_id = c.id AND p2.usuario_id = target_user_id
//     WHERE c.tipo = 'individual'
//     LIMIT 1;
//   
//     -- Se não encontrou, cria uma nova
//     IF v_chat_id IS NULL THEN
//       INSERT INTO public.chat_conversas (tipo, criado_por)
//       VALUES ('individual', v_current_user)
//       RETURNING id INTO v_chat_id;
//   
//       INSERT INTO public.chat_participantes (conversa_id, usuario_id)
//       VALUES 
//         (v_chat_id, v_current_user),
//         (v_chat_id, target_user_id);
//     END IF;
//   
//     RETURN v_chat_id;
//   END;
//   $function$
//   
// FUNCTION get_unread_chat_count(uuid)
//   CREATE OR REPLACE FUNCTION public.get_unread_chat_count(p_usuario_id uuid)
//    RETURNS integer
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_count INTEGER;
//   BEGIN
//     SELECT COUNT(*)
//     INTO v_count
//     FROM public.chat_mensagens m
//     JOIN public.chat_participantes p ON p.conversa_id = m.conversa_id
//     WHERE p.usuario_id = p_usuario_id
//       AND m.remetente_id != p_usuario_id
//       AND m.criado_em > p.ultima_leitura;
//       
//     RETURN v_count;
//   END;
//   $function$
//   
// FUNCTION get_unread_counts_per_conversation(uuid)
//   CREATE OR REPLACE FUNCTION public.get_unread_counts_per_conversation(p_usuario_id uuid)
//    RETURNS TABLE(conversa_id uuid, unread_count bigint)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY
//     SELECT m.conversa_id, COUNT(m.id)
//     FROM public.chat_mensagens m
//     JOIN public.chat_participantes p ON p.conversa_id = m.conversa_id
//     WHERE p.usuario_id = p_usuario_id
//       AND m.remetente_id != p_usuario_id
//       AND m.criado_em > p.ultima_leitura
//     GROUP BY m.conversa_id;
//   END;
//   $function$
//   
// FUNCTION get_vendas_por_origem(text)
//   CREATE OR REPLACE FUNCTION public.get_vendas_por_origem(p_mes_referencia text)
//    RETURNS TABLE(origem_id uuid, origem_nome text, qtd_vendas bigint, valor_vendas numeric)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       RETURN QUERY
//       SELECT 
//           o.id as origem_id,
//           o.nome as origem_nome,
//           COUNT(v.id) as qtd_vendas,
//           COALESCE(SUM(v.valor_tratamento), 0) as valor_vendas
//       FROM public.funil_origens o
//       LEFT JOIN public.vendas_confirmadas v 
//           ON v.origem_id = o.id 
//           AND to_char(v.data_fechamento::date, 'YYYY-MM') = p_mes_referencia
//       GROUP BY o.id, o.nome
//       ORDER BY o.ordem;
//   END;
//   $function$
//   
// FUNCTION has_permission(text)
//   CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_tenant_id uuid;
//       v_cargo_id  uuid;
//       v_has_perm  boolean := false;
//   BEGIN
//       IF public.is_tenant_admin() THEN RETURN true; END IF;
//       v_tenant_id := public.get_my_tenant_id();
//       IF v_tenant_id IS NULL THEN RETURN false; END IF;
//   
//       SELECT EXISTS (
//           SELECT 1 FROM public.usuario_permissoes up
//           JOIN public.permissoes p ON p.id = up.permissao_id
//           WHERE up.usuario_id = auth.uid() AND up.tenant_id = v_tenant_id
//             AND p.nome = permission_name AND p.tenant_id = v_tenant_id
//       ) INTO v_has_perm;
//       IF v_has_perm THEN RETURN true; END IF;
//   
//       SELECT cargo_id INTO v_cargo_id
//       FROM public.usuarios WHERE id = auth.uid() AND tenant_id = v_tenant_id;
//   
//       IF v_cargo_id IS NOT NULL THEN
//           SELECT EXISTS (
//               SELECT 1 FROM public.cargo_permissoes cp
//               JOIN public.permissoes p ON p.id = cp.permissao_id
//               WHERE cp.cargo_id = v_cargo_id AND cp.tenant_id = v_tenant_id
//                 AND p.nome = permission_name AND p.tenant_id = v_tenant_id
//           ) INTO v_has_perm;
//       END IF;
//       RETURN v_has_perm;
//   END;
//   $function$
//   
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE sql
//    SECURITY DEFINER
//   AS $function$
//       SELECT public.is_tenant_admin();
//   $function$
//   
// FUNCTION is_super_admin()
//   CREATE OR REPLACE FUNCTION public.is_super_admin()
//    RETURNS boolean
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//       SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false);
//   $function$
//   
// FUNCTION is_tenant_admin()
//   CREATE OR REPLACE FUNCTION public.is_tenant_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_role      text;
//       v_tenant_id uuid;
//   BEGIN
//       v_tenant_id := public.get_my_tenant_id();
//       IF v_tenant_id IS NULL THEN RETURN false; END IF;
//       SELECT role INTO v_role
//       FROM public.usuarios
//       WHERE id = auth.uid() AND tenant_id = v_tenant_id;
//       RETURN v_role = 'admin';
//   END;
//   $function$
//   
// FUNCTION processar_fechamento_mes_feijao(text)
//   CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_feijao(p_mes text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_bonificacao RECORD;
//     v_debito_existente boolean;
//   BEGIN
//     FOR v_bonificacao IN 
//       SELECT * FROM public.performance_bonificacao 
//       WHERE mes_referencia = p_mes AND atingiu_meta = false
//     LOOP
//       SELECT EXISTS (
//         SELECT 1 FROM public.carteira_transacoes 
//         WHERE origem_id = v_bonificacao.id AND tipo = 'debito'
//       ) INTO v_debito_existente;
//   
//       IF NOT v_debito_existente THEN
//         INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id, criado_em)
//         VALUES (
//           v_bonificacao.usuario_id, 
//           'debito', 
//           350, 
//           'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto', 
//           p_mes, 
//           v_bonificacao.id,
//           CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
//         );
//       END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION processar_fechamento_mes_google(text)
//   CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_google(p_mes text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user RECORD;
//     v_count integer;
//   BEGIN
//     FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
//       IF EXISTS (
//         SELECT 1 FROM public.carteira_transacoes 
//         WHERE usuario_id = v_user.id 
//         AND mes_referencia = p_mes 
//         AND descricao = 'Adiantamento Google Avaliações (Meta 5)'
//       ) THEN
//         IF NOT EXISTS (
//           SELECT 1 FROM public.carteira_transacoes 
//           WHERE usuario_id = v_user.id 
//           AND mes_referencia = p_mes 
//           AND descricao = 'ESTORNO DE: "Adiantamento Google Avaliações (Meta 5)" por nao cumprimento do objetivo proposto'
//         ) THEN
//           SELECT COUNT(*) INTO v_count 
//           FROM public.performance_google_reviews 
//           WHERE usuario_id = v_user.id 
//             AND status = 'validado' 
//             AND mes_referencia = p_mes;
//             
//           IF v_count < 5 THEN
//             INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
//             VALUES (v_user.id, 'debito', 100, 'ESTORNO DE: "Adiantamento Google Avaliações (Meta 5)" por nao cumprimento do objetivo proposto', p_mes);
//           END IF;
//         END IF;
//       END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION processar_fechamento_mes_inovacao(text)
//   CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_inovacao(p_mes text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user RECORD;
//     v_count integer;
//   BEGIN
//     FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
//       IF EXISTS (
//         SELECT 1 FROM public.carteira_transacoes 
//         WHERE usuario_id = v_user.id 
//         AND mes_referencia = p_mes 
//         AND descricao = 'Adiantamento de Inovação'
//       ) THEN
//         IF NOT EXISTS (
//           SELECT 1 FROM public.carteira_transacoes 
//           WHERE usuario_id = v_user.id 
//           AND mes_referencia = p_mes 
//           AND descricao = 'ESTORNO DE: "Adiantamento de Inovação" por nao cumprimento do objetivo proposto'
//         ) THEN
//           SELECT COUNT(*) INTO v_count 
//           FROM public.performance_pp_pdm 
//           WHERE usuario_id = v_user.id 
//             AND inovacao_validada = true 
//             AND to_char(data_registro::date, 'YYYY-MM') = p_mes;
//             
//           IF v_count = 0 THEN
//             INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
//             VALUES (v_user.id, 'debito', 100, 'ESTORNO DE: "Adiantamento de Inovação" por nao cumprimento do objetivo proposto', p_mes);
//           END IF;
//         END IF;
//       END IF;
//     END LOOP;
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
//             AND descricao = 'ESTORNO DE: "Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)" por nao cumprimento do objetivo proposto'
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
//               VALUES (v_user.id, 'debito', v_valor_debito, 'ESTORNO DE: "Adiantamento de Meta (4 indicações - Programa Sorriso dos Sonhos)" por nao cumprimento do objetivo proposto', p_mes);
//             END IF;
//           END IF;
//         END IF;
//       END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION seed_tenant_defaults(uuid)
//   CREATE OR REPLACE FUNCTION public.seed_tenant_defaults(p_tenant_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       INSERT INTO public.configuracoes_acesso (tenant_id) VALUES (p_tenant_id)
//           ON CONFLICT DO NOTHING;
//       INSERT INTO public.configuracoes_negociacao (tenant_id) VALUES (p_tenant_id)
//           ON CONFLICT DO NOTHING;
//       INSERT INTO public.gestao_fiscal_config (
//           tenant_id, faturamento_previsto, pf_despesa, pf_receita, pf_imposto_perc,
//           pj1_titulo, pj1_despesa_folha, pj1_margem_perc, pj1_receita, pj1_imposto_perc,
//           pj2_titulo, pj2_imposto_perc
//       ) VALUES (p_tenant_id, 0, 0, 0, 0, 'PJ 01', 0, 30, 0, 0, 'EXCEDENTE (PJ 02)', 0)
//           ON CONFLICT DO NOTHING;
//       INSERT INTO public.sac_configuracoes (tenant_id) VALUES (p_tenant_id)
//           ON CONFLICT DO NOTHING;
//       INSERT INTO public.sorriso_dos_sonhos_config (tenant_id, valor_bonus, meta_indicacoes)
//           VALUES (p_tenant_id, 100, 2)
//           ON CONFLICT DO NOTHING;
//       INSERT INTO public.precificacao_globais (tenant_id, taxa_cartao, comissao, inadimplencia, imposto)
//           VALUES (p_tenant_id, 3, 5, 2, 6)
//           ON CONFLICT DO NOTHING;
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
//           v_qtd := COALESCE(v_item.qtd_comprada, 0) * COALESCE(v_item.itens_embalagem, 1);
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
//           v_qtd := COALESCE(v_item.qtd_comprada, 0) * COALESCE(v_item.itens_embalagem, 1);
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
//         v_qtd_adicionar_new := COALESCE(NEW.qtd_comprada, 0) * COALESCE(NEW.itens_embalagem, 1);
//       ELSE
//         v_qtd_adicionar_new := COALESCE(NEW.qtd_comprada, 0);
//       END IF;
//     END IF;
//   
//     IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
//       SELECT status INTO v_status FROM public.compras WHERE id = OLD.compra_id;
//       IF OLD.referencia_consumo = 'itens_embalagem' THEN
//         v_qtd_adicionar_old := COALESCE(OLD.qtd_comprada, 0) * COALESCE(OLD.itens_embalagem, 1);
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
//       SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + (COALESCE(NEW.quantidade_comprada, 0) * COALESCE(NEW.quantidade_embalagem, 1))
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
// FUNCTION trg_avaliacoes_to_funil()
//   CREATE OR REPLACE FUNCTION public.trg_avaliacoes_to_funil()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_lead_id uuid;
//     v_paciente RECORD;
//   BEGIN
//     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
//       IF NEW.origem_id IS NOT NULL THEN
//         
//         SELECT nome, telefone INTO v_paciente FROM public.pacientes WHERE id = NEW.paciente_id;
//         
//         SELECT id INTO v_lead_id FROM public.funil_leads 
//         WHERE avaliacao_id = NEW.id
//         LIMIT 1;
//   
//         -- Fallback to old logic for backward compatibility if it's an update and avaliacao_id was null
//         IF v_lead_id IS NULL AND TG_OP = 'UPDATE' THEN
//             SELECT id INTO v_lead_id FROM public.funil_leads 
//             WHERE (
//               (telefone IS NOT NULL AND telefone != '' AND telefone = v_paciente.telefone) OR
//               (lower(trim(nome)) = lower(trim(v_paciente.nome)))
//             )
//             ORDER BY criado_em DESC LIMIT 1;
//         END IF;
//   
//         IF v_lead_id IS NOT NULL THEN
//           UPDATE public.funil_leads 
//           SET status = CASE 
//                 WHEN status IN ('venda_concretizada', 'fechamento', 'venda-fechada') THEN status 
//                 ELSE 'atendido' 
//               END,
//               origem_id = NEW.origem_id,
//               data_avaliacao = COALESCE(NEW.data_avaliacao, data_avaliacao),
//               atualizado_em = NOW(),
//               avaliacao_id = NEW.id
//           WHERE id = v_lead_id;
//         ELSE
//           INSERT INTO public.funil_leads (
//             nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas, data_avaliacao, criado_em, avaliacao_id
//           ) VALUES (
//             trim(v_paciente.nome), v_paciente.telefone, NEW.origem_id, to_char(COALESCE(NEW.data_avaliacao, CURRENT_DATE)::date, 'YYYY-MM'), 'atendido', COALESCE(NEW.temperatura_lead, 'morno'), 1, 0, NEW.data_avaliacao, COALESCE(NEW.data_avaliacao, CURRENT_DATE), NEW.id
//           );
//         END IF;
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_garantir_avaliacao_para_venda()
//   CREATE OR REPLACE FUNCTION public.trg_garantir_avaliacao_para_venda()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_paciente_id uuid;
//   BEGIN
//     IF NEW.oportunidade_id IS NULL THEN
//       SELECT id INTO v_paciente_id FROM public.pacientes WHERE lower(trim(nome)) = lower(trim(NEW.paciente_nome)) LIMIT 1;
//       
//       IF v_paciente_id IS NULL THEN
//         v_paciente_id := gen_random_uuid();
//         INSERT INTO public.pacientes (id, nome, telefone, tenant_id) VALUES (v_paciente_id, trim(NEW.paciente_nome), NEW.telefone, NEW.tenant_id);
//       END IF;
//       
//       NEW.oportunidade_id := gen_random_uuid();
//       INSERT INTO public.avaliacoes (
//         id, paciente_id, dentista_avaliador_id, crc_comercial_id, 
//         data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, 
//         status, temperatura_lead, origem_id, destino_fiscal, tenant_id
//       ) VALUES (
//         NEW.oportunidade_id, v_paciente_id, NEW.dentista_avaliador, NEW.crc,
//         COALESCE(NEW.data_original, NEW.data_fechamento), NEW.data_fechamento, NEW.valor_tratamento, NEW.valor_entrada,
//         'venda_concretizada', 'quente', NEW.origem_id, NEW.destino_fiscal, NEW.tenant_id
//       );
//     END IF;
//     
//     NEW.paciente_nome := trim(NEW.paciente_nome);
//     
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_historico_compromissos()
//   CREATE OR REPLACE FUNCTION public.trg_historico_compromissos()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       IF NEW.resultado_acao IS NOT NULL AND NEW.resultado_acao <> '' AND (OLD.resultado_acao IS NULL OR NEW.resultado_acao <> OLD.resultado_acao) THEN
//         IF NEW.lead_id IS NOT NULL THEN
//           INSERT INTO public.funil_leads_historico (lead_id, usuario_id, acao, detalhes, tenant_id)
//           VALUES (NEW.lead_id, NEW.usuario_id, 'Atualização de Desfecho', NEW.resultado_acao, NEW.tenant_id);
//         END IF;
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_incrementa_status_funil()
//   CREATE OR REPLACE FUNCTION public.trg_incrementa_status_funil()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       IF OLD.status = 'faltou' AND NEW.status IN ('agendado', 'reagendado') THEN
//         NEW.qtd_agendamentos := COALESCE(OLD.qtd_agendamentos, 1) + 1;
//       END IF;
//       
//       IF OLD.status != 'faltou' AND NEW.status = 'faltou' THEN
//         NEW.qtd_faltas := COALESCE(OLD.qtd_faltas, 0) + 1;
//       END IF;
//     END IF;
//     
//     IF TG_OP = 'INSERT' THEN
//       IF NEW.status = 'faltou' THEN
//         NEW.qtd_faltas := COALESCE(NEW.qtd_faltas, 0) + 1;
//       END IF;
//     END IF;
//   
//     RETURN NEW;
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
// FUNCTION trg_sync_avaliacoes_to_vendas()
//   CREATE OR REPLACE FUNCTION public.trg_sync_avaliacoes_to_vendas()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF pg_trigger_depth() > 1 THEN
//       RETURN NEW;
//     END IF;
//   
//     IF TG_OP = 'UPDATE' THEN
//       UPDATE public.vendas_confirmadas SET
//         data_original = NEW.data_avaliacao,
//         data_fechamento = COALESCE(NEW.data_fechamento, data_fechamento),
//         valor_tratamento = COALESCE(NEW.valor_orcamento, valor_tratamento),
//         valor_entrada = COALESCE(NEW.valor_entrada, valor_entrada),
//         percentual_entrada = CASE 
//           WHEN COALESCE(NEW.valor_orcamento, valor_tratamento) > 0 
//           THEN (COALESCE(NEW.valor_entrada, valor_entrada) / COALESCE(NEW.valor_orcamento, valor_tratamento)) * 100 
//           ELSE 0 
//         END,
//         dentista_avaliador = NEW.dentista_avaliador_id,
//         crc = NEW.crc_comercial_id,
//         destino_fiscal = NEW.destino_fiscal,
//         origem_id = COALESCE(NEW.origem_id, origem_id)
//       WHERE oportunidade_id = NEW.id;
//     END IF;
//   
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
//     v_credito_existente boolean;
//     v_debito_existente boolean;
//   BEGIN
//     -- Verifica se o usuário possui carteira
//     SELECT possui_carteira INTO v_possui_carteira FROM public.usuarios WHERE id = NEW.usuario_id;
//     
//     IF COALESCE(v_possui_carteira, true) = false THEN
//       RETURN NEW;
//     END IF;
//   
//     -- Verifica se o crédito já existe
//     SELECT EXISTS (
//       SELECT 1 FROM public.carteira_transacoes 
//       WHERE origem_id = NEW.id AND tipo = 'credito'
//     ) INTO v_credito_existente;
//   
//     -- Insere o crédito apenas se não existir, evitando sobrescrever histórico
//     IF NOT v_credito_existente THEN
//       INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id, criado_em)
//       VALUES (
//         NEW.usuario_id, 
//         'credito', 
//         350, 
//         'Crédito: Bonificação Feijão com Arroz - ' || NEW.mes_referencia, 
//         NEW.mes_referencia, 
//         NEW.id,
//         CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
//       );
//     END IF;
//   
//     -- Gerencia o Débito
//     IF NEW.atingiu_meta THEN
//       -- Se atingiu a meta, remove qualquer débito existente (caso tenha sido gerado antes)
//       DELETE FROM public.carteira_transacoes 
//       WHERE origem_id = NEW.id AND tipo = 'debito';
//     ELSE
//       -- Adiciona o débito imediatamente
//       SELECT EXISTS (
//         SELECT 1 FROM public.carteira_transacoes 
//         WHERE origem_id = NEW.id AND tipo = 'debito'
//       ) INTO v_debito_existente;
//   
//       IF NOT v_debito_existente THEN
//         INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id, criado_em)
//         VALUES (
//           NEW.usuario_id, 
//           'debito', 
//           350, 
//           'ESTORNO DE: "Bonificação Feijão com Arroz" por nao cumprimento do objetivo proposto', 
//           NEW.mes_referencia, 
//           NEW.id,
//           CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
//         );
//       END IF;
//     END IF;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_sync_confirmadas_to_vendas_diarias()
//   CREATE OR REPLACE FUNCTION public.trg_sync_confirmadas_to_vendas_diarias()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       IF pg_trigger_depth() > 1 THEN
//           RETURN NEW;
//       END IF;
//   
//       IF TG_OP = 'UPDATE' THEN
//           UPDATE public.vendas_diarias SET
//               paciente_nome = NEW.paciente_nome,
//               data_venda = NEW.data_fechamento,
//               valor_tratamento = NEW.valor_tratamento,
//               valor = NEW.valor_entrada,
//               dentista_avaliador_id = NEW.dentista_avaliador,
//               crc_comercial_id = NEW.crc,
//               forma_pagamento = NEW.forma_pagamento,
//               destino_pagamento = NEW.destino_pagamento,
//               destino_fiscal = NEW.destino_fiscal,
//               origem_id = NEW.origem_id
//           WHERE id = NEW.id;
//       ELSIF TG_OP = 'DELETE' THEN
//           DELETE FROM public.vendas_diarias WHERE id = OLD.id;
//           RETURN OLD;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_sync_vendas_diarias_to_confirmadas()
//   CREATE OR REPLACE FUNCTION public.trg_sync_vendas_diarias_to_confirmadas()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       IF pg_trigger_depth() > 1 THEN
//           RETURN NEW;
//       END IF;
//       
//       IF TG_OP = 'INSERT' THEN
//           INSERT INTO public.vendas_confirmadas (
//               id,
//               paciente_nome,
//               data_fechamento,
//               valor_tratamento,
//               valor_entrada,
//               percentual_entrada,
//               dentista_avaliador,
//               crc,
//               tratamento,
//               forma_pagamento,
//               destino_pagamento,
//               destino_fiscal,
//               origem_id
//           ) VALUES (
//               NEW.id,
//               COALESCE(NEW.paciente_nome, 'Venda Avulsa'),
//               NEW.data_venda,
//               COALESCE(NEW.valor_tratamento, NEW.valor),
//               NEW.valor,
//               100,
//               NEW.dentista_avaliador_id,
//               NEW.crc_comercial_id,
//               'Venda Avulsa',
//               NEW.forma_pagamento,
//               NEW.destino_pagamento,
//               NEW.destino_fiscal,
//               NEW.origem_id
//           );
//       ELSIF TG_OP = 'UPDATE' THEN
//           UPDATE public.vendas_confirmadas SET
//               paciente_nome = COALESCE(NEW.paciente_nome, 'Venda Avulsa'),
//               data_fechamento = NEW.data_venda,
//               valor_tratamento = COALESCE(NEW.valor_tratamento, NEW.valor),
//               valor_entrada = NEW.valor,
//               dentista_avaliador = NEW.dentista_avaliador_id,
//               crc = NEW.crc_comercial_id,
//               forma_pagamento = NEW.forma_pagamento,
//               destino_pagamento = NEW.destino_pagamento,
//               destino_fiscal = NEW.destino_fiscal,
//               origem_id = NEW.origem_id
//           WHERE id = NEW.id;
//       ELSIF TG_OP = 'DELETE' THEN
//           DELETE FROM public.vendas_confirmadas WHERE id = OLD.id;
//           RETURN OLD;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_sync_vendas_to_avaliacoes()
//   CREATE OR REPLACE FUNCTION public.trg_sync_vendas_to_avaliacoes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF pg_trigger_depth() > 1 THEN
//       RETURN NEW;
//     END IF;
//   
//     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
//       IF NEW.oportunidade_id IS NOT NULL THEN
//         UPDATE public.avaliacoes SET
//           data_avaliacao = COALESCE(NEW.data_original, data_avaliacao),
//           data_fechamento = NEW.data_fechamento,
//           valor_orcamento = NEW.valor_tratamento,
//           valor_entrada = NEW.valor_entrada,
//           dentista_avaliador_id = NEW.dentista_avaliador,
//           crc_comercial_id = NEW.crc,
//           destino_fiscal = NEW.destino_fiscal,
//           origem_id = NEW.origem_id,
//           status = 'venda_concretizada'
//         WHERE id = NEW.oportunidade_id;
//       END IF;
//     END IF;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_update_funil_dados_mensais_from_leads()
//   CREATE OR REPLACE FUNCTION public.trg_update_funil_dados_mensais_from_leads()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_origem_id UUID;
//     v_mes_referencia TEXT;
//     v_old_mes TEXT;
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       v_old_mes := to_char(COALESCE(OLD.data_avaliacao, OLD.criado_em::date), 'YYYY-MM');
//       v_mes_referencia := to_char(COALESCE(NEW.data_avaliacao, NEW.criado_em::date), 'YYYY-MM');
//       
//       IF OLD.origem_id IS DISTINCT FROM NEW.origem_id OR v_old_mes IS DISTINCT FROM v_mes_referencia THEN
//         PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, v_old_mes);
//       END IF;
//     END IF;
//   
//     IF TG_OP = 'DELETE' THEN
//       v_origem_id := OLD.origem_id;
//       v_mes_referencia := to_char(COALESCE(OLD.data_avaliacao, OLD.criado_em::date), 'YYYY-MM');
//     ELSE
//       v_origem_id := NEW.origem_id;
//       v_mes_referencia := to_char(COALESCE(NEW.data_avaliacao, NEW.criado_em::date), 'YYYY-MM');
//     END IF;
//   
//     PERFORM public.atualizar_funil_dados_mensais(v_origem_id, v_mes_referencia);
//   
//     RETURN NULL;
//   END;
//   $function$
//   
// FUNCTION trg_vendas_confirmadas_to_funil()
//   CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_mes_referencia text;
//     v_data_avaliacao date;
//     v_lead_id uuid;
//   BEGIN
//     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
//       IF NEW.origem_id IS NOT NULL THEN
//         IF NEW.oportunidade_id IS NOT NULL THEN
//           SELECT to_char(data_avaliacao::date, 'YYYY-MM'), data_avaliacao 
//           INTO v_mes_referencia, v_data_avaliacao
//           FROM public.avaliacoes 
//           WHERE id = NEW.oportunidade_id;
//         END IF;
//   
//         IF v_mes_referencia IS NULL THEN
//           IF NEW.data_original IS NOT NULL THEN
//             v_mes_referencia := to_char(NEW.data_original::date, 'YYYY-MM');
//             v_data_avaliacao := NEW.data_original;
//           ELSE
//             v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
//             v_data_avaliacao := NEW.data_fechamento;
//           END IF;
//         END IF;
//         
//         IF NEW.oportunidade_id IS NOT NULL THEN
//             SELECT id INTO v_lead_id FROM public.funil_leads WHERE avaliacao_id = NEW.oportunidade_id LIMIT 1;
//         END IF;
//   
//         IF v_lead_id IS NULL THEN
//             SELECT id INTO v_lead_id FROM public.funil_leads 
//             WHERE (
//               (telefone IS NOT NULL AND telefone != '' AND telefone = NEW.telefone) OR
//               (lower(trim(nome)) = lower(trim(NEW.paciente_nome)))
//             )
//             ORDER BY criado_em DESC LIMIT 1;
//         END IF;
//   
//         IF v_lead_id IS NOT NULL THEN
//           UPDATE public.funil_leads 
//           SET status = 'venda_concretizada',
//               temperatura = 'quente',
//               origem_id = NEW.origem_id,
//               data_avaliacao = COALESCE(data_avaliacao, v_data_avaliacao),
//               atualizado_em = NOW()
//           WHERE id = v_lead_id;
//         ELSE
//           INSERT INTO public.funil_leads (
//             nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas, data_avaliacao, criado_em, avaliacao_id
//           ) VALUES (
//             trim(NEW.paciente_nome), NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0, v_data_avaliacao, COALESCE(v_data_avaliacao, NEW.data_fechamento), NEW.oportunidade_id
//           );
//         END IF;
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trg_vendas_confirmadas_update_funil()
//   CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_update_funil()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF TG_OP = 'UPDATE' THEN
//       IF OLD.valor_tratamento IS DISTINCT FROM NEW.valor_tratamento OR OLD.data_fechamento IS DISTINCT FROM NEW.data_fechamento OR OLD.origem_id IS DISTINCT FROM NEW.origem_id THEN
//         IF OLD.origem_id IS NOT NULL THEN
//           PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, to_char(OLD.data_fechamento::date, 'YYYY-MM'));
//           IF OLD.data_original IS NOT NULL THEN
//              PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, to_char(OLD.data_original::date, 'YYYY-MM'));
//           END IF;
//         END IF;
//         IF NEW.origem_id IS NOT NULL THEN
//           PERFORM public.atualizar_funil_dados_mensais(NEW.origem_id, to_char(NEW.data_fechamento::date, 'YYYY-MM'));
//           IF NEW.data_original IS NOT NULL THEN
//              PERFORM public.atualizar_funil_dados_mensais(NEW.origem_id, to_char(NEW.data_original::date, 'YYYY-MM'));
//           END IF;
//         END IF;
//       END IF;
//     ELSIF TG_OP = 'INSERT' THEN
//       IF NEW.origem_id IS NOT NULL THEN
//         PERFORM public.atualizar_funil_dados_mensais(NEW.origem_id, to_char(NEW.data_fechamento::date, 'YYYY-MM'));
//         IF NEW.data_original IS NOT NULL THEN
//            PERFORM public.atualizar_funil_dados_mensais(NEW.origem_id, to_char(NEW.data_original::date, 'YYYY-MM'));
//         END IF;
//       END IF;
//     ELSIF TG_OP = 'DELETE' THEN
//       IF OLD.origem_id IS NOT NULL THEN
//         PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, to_char(OLD.data_fechamento::date, 'YYYY-MM'));
//         IF OLD.data_original IS NOT NULL THEN
//            PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, to_char(OLD.data_original::date, 'YYYY-MM'));
//         END IF;
//       END IF;
//     END IF;
//     RETURN NULL;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: avaliacoes
//   sync_avaliacoes_to_vendas_trigger: CREATE TRIGGER sync_avaliacoes_to_vendas_trigger AFTER UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION trg_sync_avaliacoes_to_vendas()
//   trg_avaliacoes_to_funil_tg: CREATE TRIGGER trg_avaliacoes_to_funil_tg AFTER INSERT OR UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION trg_avaliacoes_to_funil()
// Table: compra_itens
//   after_compra_item_change: CREATE TRIGGER after_compra_item_change AFTER INSERT OR UPDATE ON public.compra_itens FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_compra_item()
//   before_compra_item_delete: CREATE TRIGGER before_compra_item_delete BEFORE DELETE ON public.compra_itens FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_compra_item()
// Table: compras
//   after_compra_status_change: CREATE TRIGGER after_compra_status_change AFTER UPDATE OF status ON public.compras FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_ao_finalizar_compra()
// Table: compromissos
//   trg_historico_compromissos_tg: CREATE TRIGGER trg_historico_compromissos_tg AFTER UPDATE ON public.compromissos FOR EACH ROW EXECUTE FUNCTION trg_historico_compromissos()
// Table: entrada_produtos
//   after_entrada_produto: CREATE TRIGGER after_entrada_produto AFTER INSERT ON public.entrada_produtos FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_entrada()
// Table: funil_leads
//   trg_incrementa_status_funil_tg: CREATE TRIGGER trg_incrementa_status_funil_tg BEFORE INSERT OR UPDATE ON public.funil_leads FOR EACH ROW EXECUTE FUNCTION trg_incrementa_status_funil()
//   trg_update_funil_dados_mensais_leads: CREATE TRIGGER trg_update_funil_dados_mensais_leads AFTER INSERT OR DELETE OR UPDATE ON public.funil_leads FOR EACH ROW EXECUTE FUNCTION trg_update_funil_dados_mensais_from_leads()
// Table: performance_bonificacao
//   sync_carteira_bonificacao_trigger: CREATE TRIGGER sync_carteira_bonificacao_trigger AFTER INSERT OR UPDATE ON public.performance_bonificacao FOR EACH ROW EXECUTE FUNCTION trg_sync_carteira_bonificacao()
// Table: saida_produtos
//   after_saida_produto_change: CREATE TRIGGER after_saida_produto_change AFTER INSERT OR DELETE OR UPDATE ON public.saida_produtos FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_saida()
// Table: sorriso_dos_sonhos_indicacoes
//   trg_sorriso_fechamento_after: CREATE TRIGGER trg_sorriso_fechamento_after AFTER UPDATE ON public.sorriso_dos_sonhos_indicacoes FOR EACH ROW EXECUTE FUNCTION trg_sorriso_fechamento()
// Table: usuarios
//   trg_ativar_cascata_dentista_avaliador_insert: CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_insert AFTER INSERT ON public.usuarios FOR EACH ROW EXECUTE FUNCTION ativar_cascata_dentista_avaliador()
//   trg_ativar_cascata_dentista_avaliador_update: CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_update AFTER UPDATE OF cargo_id, cargo_secundario_id, nome, email, status ON public.usuarios FOR EACH ROW EXECUTE FUNCTION ativar_cascata_dentista_avaliador()
// Table: vendas_confirmadas
//   sync_confirmadas_to_vendas_diarias_trigger: CREATE TRIGGER sync_confirmadas_to_vendas_diarias_trigger AFTER DELETE OR UPDATE ON public.vendas_confirmadas FOR EACH ROW EXECUTE FUNCTION trg_sync_confirmadas_to_vendas_diarias()
//   sync_vendas_to_avaliacoes_trigger: CREATE TRIGGER sync_vendas_to_avaliacoes_trigger AFTER UPDATE ON public.vendas_confirmadas FOR EACH ROW EXECUTE FUNCTION trg_sync_vendas_to_avaliacoes()
//   trg_garantir_avaliacao_para_venda_tg: CREATE TRIGGER trg_garantir_avaliacao_para_venda_tg BEFORE INSERT ON public.vendas_confirmadas FOR EACH ROW EXECUTE FUNCTION trg_garantir_avaliacao_para_venda()
//   trg_vendas_confirmadas_to_funil_tg: CREATE TRIGGER trg_vendas_confirmadas_to_funil_tg AFTER INSERT OR UPDATE ON public.vendas_confirmadas FOR EACH ROW EXECUTE FUNCTION trg_vendas_confirmadas_to_funil()
//   trg_vendas_confirmadas_update_funil_tg: CREATE TRIGGER trg_vendas_confirmadas_update_funil_tg AFTER INSERT OR DELETE OR UPDATE ON public.vendas_confirmadas FOR EACH ROW EXECUTE FUNCTION trg_vendas_confirmadas_update_funil()
// Table: vendas_diarias
//   sync_vendas_diarias: CREATE TRIGGER sync_vendas_diarias AFTER INSERT OR DELETE OR UPDATE ON public.vendas_diarias FOR EACH ROW EXECUTE FUNCTION trg_sync_vendas_diarias_to_confirmadas()

// --- INDEXES ---
// Table: auditoria_acesso
//   CREATE INDEX idx_auditoria_acesso_tabela ON public.auditoria_acesso USING btree (tenant_id, tabela_acessada)
//   CREATE INDEX idx_auditoria_acesso_tenant_criado ON public.auditoria_acesso USING btree (tenant_id, criado_em DESC)
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
// Table: carteira_transacoes
//   CREATE UNIQUE INDEX carteira_transacoes_transacao_original_id_idx ON public.carteira_transacoes USING btree (transacao_original_id) WHERE (transacao_original_id IS NOT NULL)
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
// Table: fluxo_caixa_categorias
//   CREATE UNIQUE INDEX fluxo_caixa_categorias_nome_key ON public.fluxo_caixa_categorias USING btree (nome)
// Table: fluxo_caixa_receitas
//   CREATE UNIQUE INDEX fluxo_caixa_receitas_mes_referencia_ciclo_key ON public.fluxo_caixa_receitas USING btree (mes_referencia, ciclo)
// Table: funil_dados_mensais
//   CREATE UNIQUE INDEX funil_dados_mensais_origem_id_mes_referencia_key ON public.funil_dados_mensais USING btree (origem_id, mes_referencia)
// Table: funil_etapas
//   CREATE UNIQUE INDEX funil_etapas_slug_key ON public.funil_etapas USING btree (slug)
// Table: funil_origens
//   CREATE UNIQUE INDEX funil_origens_nome_key ON public.funil_origens USING btree (nome)
// Table: funil_temperaturas
//   CREATE UNIQUE INDEX funil_temperaturas_slug_key ON public.funil_temperaturas USING btree (slug)
// Table: intranet_onboarding_progresso
//   CREATE UNIQUE INDEX intranet_onboarding_progresso_usuario_id_tarefa_id_key ON public.intranet_onboarding_progresso USING btree (usuario_id, tarefa_id)
// Table: intranet_treinamentos_progresso
//   CREATE UNIQUE INDEX intranet_treinamentos_progresso_usuario_id_modulo_id_key ON public.intranet_treinamentos_progresso USING btree (usuario_id, modulo_id)
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
//   CREATE UNIQUE INDEX permissoes_nome_tenant_key ON public.permissoes USING btree (nome, tenant_id)
// Table: precificacao_especialidades
//   CREATE UNIQUE INDEX precificacao_especialidades_nome_key ON public.precificacao_especialidades USING btree (nome)
// Table: precificacao_ocupacao_cadeiras
//   CREATE UNIQUE INDEX precificacao_ocupacao_cadeiras_consultorio_turno_dia_semana_sem ON public.precificacao_ocupacao_cadeiras USING btree (consultorio, turno, dia_semana, semana)
// Table: precificacao_ocupacao_config
//   CREATE UNIQUE INDEX precificacao_ocupacao_config_tipo_nome_idx ON public.precificacao_ocupacao_config USING btree (tipo, nome)
// Table: pro_agenda_tempos
//   CREATE UNIQUE INDEX pro_agenda_tempos_procedimento_id_dentista_id_key ON public.pro_agenda_tempos USING btree (procedimento_id, dentista_id)
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
// Table: tenants
//   CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug)
// Table: terceiros_categorias
//   CREATE UNIQUE INDEX terceiros_categorias_slug_tenant_key ON public.terceiros_categorias USING btree (slug, tenant_id)
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
// Table: vendas_confirmadas
//   CREATE INDEX vendas_confirmadas_oportunidade_id_idx ON public.vendas_confirmadas USING btree (oportunidade_id)

