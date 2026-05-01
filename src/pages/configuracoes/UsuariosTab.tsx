import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, UserPlus, Settings, CalendarClock } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useConfigData } from '@/hooks/use-config-data'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import { AusenciaTemporariaDialog } from '@/components/performance/ausencia-temporaria-dialog'

export function UsuariosTab() {
  const { usuarios, loading } = useConfigData()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showAusencia, setShowAusencia] = useState(false)

  const getDetalhes = (user: any) => {
    if (!user?.colaboradores_detalhes) return null
    return Array.isArray(user.colaboradores_detalhes)
      ? user.colaboradores_detalhes[0]
      : user.colaboradores_detalhes
  }

  const detalhes = getDetalhes(selectedUser)

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="uppercase tracking-wider">Gestão de Usuários e RH</CardTitle>
            <CardDescription>
              Gerencie os usuários, acessos e detalhes administrativos.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="uppercase tracking-wider text-xs font-bold"
              onClick={() => setShowAusencia(true)}
            >
              <CalendarClock className="size-4 mr-2" /> Ausência Temporária
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="uppercase tracking-wider text-xs font-bold"
              asChild
            >
              <Link to="/configuracoes/acesso">
                <Settings className="size-4 mr-2" /> Acessos
              </Link>
            </Button>
            <Button size="sm" className="uppercase tracking-wider text-xs font-bold" asChild>
              <Link to="/admin/registro">
                <UserPlus className="size-4 mr-2" /> Novo Usuário
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-amber-500/20 shadow-sm hidden sm:flex">
                            <AvatarFallback className="bg-slate-900 text-amber-500 text-xs font-bold uppercase">
                              {u.nome
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-sm uppercase tracking-wide">
                              {u.nome}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {u.email}
                            </div>
                            {u.cpf && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wider">
                                CPF: {u.cpf}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase tracking-wider text-[10px]">
                          {u.cargos?.nome || 'Sem Cargo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.status === 'ativo' ? 'default' : 'secondary'}
                          className="uppercase tracking-wider text-[10px]"
                        >
                          {u.status || 'Ativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(u)}
                          title="Ver Detalhes do RH"
                        >
                          <FileText className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AusenciaTemporariaDialog open={showAusencia} onOpenChange={setShowAusencia} />

      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="uppercase tracking-wider">Detalhes do Usuário</SheetTitle>
            <SheetDescription>
              Informações administrativas e de RH para {selectedUser?.nome}.
            </SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Nome Completo</Label>
                    <Input readOnly value={selectedUser.nome || ''} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">CPF</Label>
                    <Input readOnly value={selectedUser.cpf || ''} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Telefone</Label>
                    <Input readOnly value={selectedUser.telefone || ''} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Data Nasc.</Label>
                    <Input
                      readOnly
                      value={selectedUser.data_nascimento || ''}
                      type="date"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs uppercase">Endereço</Label>
                    <Input readOnly value={selectedUser.endereco || ''} className="h-8 text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Dados Contratuais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Cargo</Label>
                    <Input
                      readOnly
                      value={selectedUser.cargos?.nome || ''}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Status</Label>
                    <Input
                      readOnly
                      value={selectedUser.status || ''}
                      className="h-8 text-sm uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Admissão</Label>
                    <Input
                      readOnly
                      value={selectedUser.data_admissao || ''}
                      type="date"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Salário Base (R$)</Label>
                    <Input readOnly value={selectedUser.salario || ''} className="h-8 text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Dados Bancários & Documentos
                </h3>
                {detalhes ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase">Banco</Label>
                      <Input readOnly value={detalhes.banco || ''} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase">Agência / Conta</Label>
                      <Input
                        readOnly
                        value={`${detalhes.agencia || ''} / ${detalhes.conta || ''}`}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs uppercase">PIX</Label>
                      <Input readOnly value={detalhes.pix || ''} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase">CTPS</Label>
                      <Input readOnly value={detalhes.ctps || ''} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase">PIS</Label>
                      <Input readOnly value={detalhes.pis || ''} className="h-8 text-sm" />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Detalhes adicionais não cadastrados.
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Fechar
                </Button>
                <Button>Editar Informações</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
