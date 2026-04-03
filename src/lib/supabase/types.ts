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
      entrada_produtos: {
        Row: {
          criado_em: string | null
          data_entrada: string | null
          fornecedor_id: string | null
          id: string
          observacoes: string | null
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
          fornecedor_id?: string | null
          id?: string
          observacoes?: string | null
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
          fornecedor_id?: string | null
          id?: string
          observacoes?: string | null
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
      especialidades: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id?: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          cnpj: string | null
          criado_em: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
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
      produtos: {
        Row: {
          categoria: string | null
          codigo_barras: string | null
          custo_unitario: number | null
          data_criacao: string | null
          embalagem: string | null
          especialidade_id: string | null
          id: string
          lote: string | null
          marca: string | null
          nome: string
          quantidade_estoque: number | null
          quantidade_minima: number | null
          sala: string | null
          validade: string | null
          variacao: string | null
        }
        Insert: {
          categoria?: string | null
          codigo_barras?: string | null
          custo_unitario?: number | null
          data_criacao?: string | null
          embalagem?: string | null
          especialidade_id?: string | null
          id?: string
          lote?: string | null
          marca?: string | null
          nome: string
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          sala?: string | null
          validade?: string | null
          variacao?: string | null
        }
        Update: {
          categoria?: string | null
          codigo_barras?: string | null
          custo_unitario?: number | null
          data_criacao?: string | null
          embalagem?: string | null
          especialidade_id?: string | null
          id?: string
          lote?: string | null
          marca?: string | null
          nome?: string
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          sala?: string | null
          validade?: string | null
          variacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'produtos_especialidade_id_fkey'
            columns: ['especialidade_id']
            isOneToOne: false
            referencedRelation: 'especialidades'
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
      [_ in never]: never
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
    Enums: {},
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
// Table: especialidades
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
// Table: fornecedores
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   cnpj: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   endereco: text (nullable)
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: historico_compras
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (not null)
//   fornecedor_id: uuid (nullable)
//   preco_anterior: numeric (not null)
//   data_compra: timestamp with time zone (nullable, default: now())
//   criado_em: timestamp with time zone (nullable, default: now())
// Table: permissoes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   modulo: text (nullable)
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
// Table: cargo_permissoes
//   FOREIGN KEY cargo_permissoes_cargo_id_fkey: FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE
//   FOREIGN KEY cargo_permissoes_permissao_id_fkey: FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON DELETE CASCADE
//   PRIMARY KEY cargo_permissoes_pkey: PRIMARY KEY (cargo_id, permissao_id)
// Table: cargos
//   PRIMARY KEY cargos_pkey: PRIMARY KEY (id)
// Table: colaboradores_detalhes
//   PRIMARY KEY colaboradores_detalhes_pkey: PRIMARY KEY (usuario_id)
//   FOREIGN KEY colaboradores_detalhes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: entrada_produtos
//   FOREIGN KEY entrada_produtos_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY entrada_produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY entrada_produtos_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
// Table: especialidades
//   UNIQUE especialidades_nome_key: UNIQUE (nome)
//   PRIMARY KEY especialidades_pkey: PRIMARY KEY (id)
// Table: fornecedores
//   PRIMARY KEY fornecedores_pkey: PRIMARY KEY (id)
// Table: historico_compras
//   FOREIGN KEY historico_compras_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY historico_compras_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_compras_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
// Table: permissoes
//   UNIQUE permissoes_nome_key: UNIQUE (nome)
//   PRIMARY KEY permissoes_pkey: PRIMARY KEY (id)
// Table: produtos
//   FOREIGN KEY produtos_especialidade_id_fkey: FOREIGN KEY (especialidade_id) REFERENCES especialidades(id) ON DELETE SET NULL
//   PRIMARY KEY produtos_pkey: PRIMARY KEY (id)
// Table: saida_produtos
//   PRIMARY KEY saida_produtos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY saida_produtos_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
//   CHECK saida_produtos_tipo_saida_check: CHECK ((tipo_saida = ANY (ARRAY['definitiva'::text, 'parcial'::text])))
//   FOREIGN KEY saida_produtos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
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
// Table: especialidades
//   Policy "especialidades_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
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
// Table: permissoes
//   Policy "permissoes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "permissoes_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: produtos
//   Policy "produtos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "produtos_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "produtos_read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "produtos_update" (UPDATE, PERMISSIVE) roles={authenticated}
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
// FUNCTION trg_atualiza_estoque_saida()
//   CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_saida()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     -- Quando uma nova saída é registrada, reduz a quantidade no estoque do produto
//     UPDATE public.produtos
//     SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - NEW.quantidade
//     WHERE id = NEW.produto_id;
//
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: saida_produtos
//   after_saida_produto: CREATE TRIGGER after_saida_produto AFTER INSERT ON public.saida_produtos FOR EACH ROW EXECUTE FUNCTION trg_atualiza_estoque_saida()

// --- INDEXES ---
// Table: especialidades
//   CREATE UNIQUE INDEX especialidades_nome_key ON public.especialidades USING btree (nome)
// Table: permissoes
//   CREATE UNIQUE INDEX permissoes_nome_key ON public.permissoes USING btree (nome)
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
