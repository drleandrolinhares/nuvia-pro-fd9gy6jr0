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
      faixas_valores_parcelas: {
        Row: {
          criado_em: string
          id: string
          max_parcelas: number
          valor_maximo: number
          valor_minimo: number
        }
        Insert: {
          criado_em?: string
          id?: string
          max_parcelas?: number
          valor_maximo: number
          valor_minimo?: number
        }
        Update: {
          criado_em?: string
          id?: string
          max_parcelas?: number
          valor_maximo?: number
          valor_minimo?: number
        }
        Relationships: []
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
          cargo_id: string | null
          cpf: string | null
          criado_em: string | null
          data_admissao: string | null
          data_nascimento: string | null
          email: string
          endereco: string | null
          id: string
          nome: string
          role: string | null
          salario: number | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          cargo_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          id: string
          nome: string
          role?: string | null
          salario?: number | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          cargo_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          role?: string | null
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: { Args: { permission_name: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      referencia_consumo_enum: 'qtd_comprada' | 'itens_embalagem'
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
      referencia_consumo_enum: ['qtd_comprada', 'itens_embalagem'],
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
// Table: configuracoes_negociacao
//   id: uuid (not null, default: gen_random_uuid())
//   percentual_entrada_padrao: numeric (not null, default: 0)
//   criado_em: timestamp with time zone (not null, default: now())
//   atualizado_em: timestamp with time zone (not null, default: now())
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
// Table: faixas_valores_parcelas
//   id: uuid (not null, default: gen_random_uuid())
//   valor_minimo: numeric (not null, default: 0)
//   valor_maximo: numeric (not null)
//   max_parcelas: integer (not null, default: 1)
//   criado_em: timestamp with time zone (not null, default: now())
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
// Table: tamanhos_implante
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   data_criacao: timestamp with time zone (nullable, default: now())
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

// --- CONSTRAINTS ---
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
// Table: configuracoes_negociacao
//   PRIMARY KEY configuracoes_negociacao_pkey: PRIMARY KEY (id)
// Table: descontos_por_prazo
//   CHECK descontos_por_prazo_faixa_numero_check: CHECK (((faixa_numero >= 1) AND (faixa_numero <= 4)))
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
// Table: faixas_valores_parcelas
//   PRIMARY KEY faixas_valores_parcelas_pkey: PRIMARY KEY (id)
// Table: fornecedores
//   PRIMARY KEY fornecedores_pkey: PRIMARY KEY (id)
// Table: historico_compras
//   FOREIGN KEY historico_compras_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY historico_compras_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_compras_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
// Table: marcas_implante
//   UNIQUE marcas_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY marcas_implante_pkey: PRIMARY KEY (id)
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
// Table: saida_produtos
//   PRIMARY KEY saida_produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY saida_produtos_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
//   CHECK saida_produtos_tipo_saida_check: CHECK ((tipo_saida = ANY (ARRAY['definitiva'::text, 'parcial'::text])))
//   FOREIGN KEY saida_produtos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: salas
//   UNIQUE salas_nome_key: UNIQUE (nome)
//   PRIMARY KEY salas_pkey: PRIMARY KEY (id)
// Table: tamanhos_implante
//   UNIQUE tamanhos_implante_nome_key: UNIQUE (nome)
//   PRIMARY KEY tamanhos_implante_pkey: PRIMARY KEY (id)
// Table: usuario_permissoes
//   FOREIGN KEY usuario_permissoes_permissao_id_fkey: FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
//   PRIMARY KEY usuario_permissoes_pkey: PRIMARY KEY (usuario_id, permissao_id)
//   FOREIGN KEY usuario_permissoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE SET NULL
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
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
// Table: configuracoes_negociacao
//   Policy "configuracoes_negociacao_all" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: faixas_valores_parcelas
//   Policy "faixas_valores_parcelas_all" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: tamanhos_implante
//   Policy "tamanhos_implante_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR has_permission('Gerenciar Estoque'::text))
//   Policy "tamanhos_implante_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
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

// --- DATABASE FUNCTIONS ---
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
//     -- check cargo perms
//     SELECT EXISTS (
//       SELECT 1 FROM public.usuarios u
//       JOIN public.cargo_permissoes cp ON cp.cargo_id = u.cargo_id
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

// --- TRIGGERS ---
// Table: compra_itens
//   after_compra_item_change: CREATE TRIGGER after_compra_item_change AFTER INSERT OR UPDATE ON public.compra_itens FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_compra_item()
//   before_compra_item_delete: CREATE TRIGGER before_compra_item_delete BEFORE DELETE ON public.compra_itens FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_compra_item()
// Table: compras
//   after_compra_status_change: CREATE TRIGGER after_compra_status_change AFTER UPDATE OF status ON public.compras FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_ao_finalizar_compra()
// Table: entrada_produtos
//   after_entrada_produto: CREATE TRIGGER after_entrada_produto AFTER INSERT ON public.entrada_produtos FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_entrada()
// Table: saida_produtos
//   after_saida_produto_change: CREATE TRIGGER after_saida_produto_change AFTER INSERT OR DELETE OR UPDATE ON public.saida_produtos FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_saida()

// --- INDEXES ---
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
// Table: diametros_implante
//   CREATE UNIQUE INDEX diametros_implante_nome_key ON public.diametros_implante USING btree (nome)
// Table: embalagens
//   CREATE UNIQUE INDEX embalagens_nome_key ON public.embalagens USING btree (nome)
// Table: especialidades
//   CREATE UNIQUE INDEX especialidades_nome_key ON public.especialidades USING btree (nome)
// Table: marcas_implante
//   CREATE UNIQUE INDEX marcas_implante_nome_key ON public.marcas_implante USING btree (nome)
// Table: permissoes
//   CREATE UNIQUE INDEX permissoes_nome_key ON public.permissoes USING btree (nome)
// Table: produto_campos_valores
//   CREATE UNIQUE INDEX produto_campos_valores_produto_id_campo_id_key ON public.produto_campos_valores USING btree (produto_id, campo_id)
// Table: salas
//   CREATE UNIQUE INDEX salas_nome_key ON public.salas USING btree (nome)
// Table: tamanhos_implante
//   CREATE UNIQUE INDEX tamanhos_implante_nome_key ON public.tamanhos_implante USING btree (nome)
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
