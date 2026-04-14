import { Compromisso } from '@/services/compromissos'
import {
  Stethoscope,
  Plane,
  Briefcase,
  Users,
  GraduationCap,
  Coffee,
  BookOpen,
  MapPin,
  Clock,
  Edit,
  Trash2,
  CalendarIcon,
  Archive,
  Copy,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const TIPO_MAPPING: Record<string, string> = {
  consulta: 'Consulta',
  viagem_pessoal: 'Viagem Pessoal',
  viagem_trabalho: 'Viagem a Trabalho',
  reuniao: 'Reunião',
  congresso: 'Congresso',
  folga_ferias: 'Folga/Férias',
  treinamento: 'Treinamento',
  atendimento_externo: 'Atendimento Externo',
}

const TIPO_ICONES: Record<string, React.ElementType> = {
  Consulta: Stethoscope,
  'Viagem Pessoal': Plane,
  'Viagem a Trabalho': Briefcase,
  Reunião: Users,
  Congresso: GraduationCap,
  'Folga/Férias': Coffee,
  Treinamento: BookOpen,
  'Atendimento Externo': MapPin,
}

export function EventoCard({
  evento,
  index,
  dataInstancia,
  isArquivado,
  canModify,
  onEdit,
  onDelete,
}: {
  evento: Compromisso
  index: number
  dataInstancia?: Date
  isArquivado?: boolean
  canModify?: boolean
  onEdit: (e: Compromisso) => void
  onDelete: (id: string) => void
  onDuplicate: (e: Compromisso) => void
}) {
  const tipoLabel = TIPO_MAPPING[evento.tipo_compromisso] || evento.tipo_compromisso
  const Icon = TIPO_ICONES[tipoLabel] || CalendarIcon

  const dInicio = new Date(evento.data_inicio + 'T12:00:00')
  const dFim = new Date(evento.data_fim + 'T12:00:00')
  const mesmaData = dInicio.getTime() === dFim.getTime()
  const displayDate = dataInstancia || dInicio

  return (
    <div
      className={cn(
        'p-5 rounded-2xl border shadow-sm flex items-start gap-5 transition-all hover:shadow-md relative',
        isArquivado
          ? 'bg-slate-100/50 border-slate-200'
          : index % 2 === 0
            ? 'bg-white'
            : 'bg-slate-50/80',
      )}
    >
      <div
        className={cn(
          'p-3.5 border shadow-sm rounded-full mt-1',
          isArquivado
            ? 'bg-slate-200/50 text-slate-500 border-slate-200'
            : 'bg-white text-slate-700',
        )}
      >
        <Icon className={cn('w-6 h-6', isArquivado ? 'text-slate-500' : 'text-amber-600')} />
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between items-start">
          <div>
            <h4
              className={cn('text-lg font-bold', isArquivado ? 'text-slate-600' : 'text-slate-800')}
            >
              {evento.usuario?.nome || 'Colaborador não encontrado'}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mt-1.5">
              <Badge
                variant="secondary"
                className={cn(
                  'font-semibold',
                  isArquivado
                    ? 'bg-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200',
                )}
              >
                {tipoLabel}
              </Badge>
              {isArquivado && (
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-500 border-slate-200 flex gap-1 items-center px-1.5 py-0"
                >
                  <Archive className="w-3 h-3" /> Expirado
                </Badge>
              )}
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                {format(displayDate, "dd 'de' MMM", { locale: ptBR })}
                {!mesmaData && (
                  <span className="text-xs text-slate-500 font-normal ml-1">
                    (Período: {format(dInicio, 'dd/MM')} a {format(dFim, 'dd/MM')})
                  </span>
                )}
              </span>
              {!evento.eh_dia_inteiro && evento.hora_inicio && (
                <>
                  <span className="text-slate-300">•</span>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold border',
                      isArquivado
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-amber-50 text-amber-700 border-amber-100',
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {evento.hora_inicio.substring(0, 5)} -{' '}
                      {evento.hora_fim ? evento.hora_fim.substring(0, 5) : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          {canModify && (
            <div className="flex gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                title="Duplicar"
                className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-full"
                onClick={() => onDuplicate(evento)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Editar"
                className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-full"
                onClick={() => onEdit(evento)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Excluir"
                className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full"
                onClick={() => onDelete(evento.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {evento.descricao && (
          <p
            className={cn(
              'text-sm leading-relaxed pt-1 p-3 rounded-lg border',
              isArquivado
                ? 'text-slate-500 bg-slate-50/50 border-slate-100'
                : 'text-slate-600 bg-white/50 border-slate-100',
            )}
          >
            {evento.descricao}
          </p>
        )}
      </div>
    </div>
  )
}
