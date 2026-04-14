import { Evento, TipoEvento } from '../data/mock-eventos'
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
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TIPO_ICONES: Record<TipoEvento, React.ElementType> = {
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
  onEdit,
  onDelete,
}: {
  evento: Evento
  index: number
  onEdit: (e: Evento) => void
  onDelete: (id: string) => void
}) {
  const Icon = TIPO_ICONES[evento.tipo] || CalendarIcon
  const dInicio = parseISO(evento.dataInicio)
  const dFim = parseISO(evento.dataFim)
  const mesmaData = dInicio.getTime() === dFim.getTime()

  return (
    <div
      className={cn(
        'p-5 rounded-2xl border shadow-sm flex items-start gap-5 transition-all hover:shadow-md',
        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80',
      )}
    >
      <div className="p-3.5 bg-white border shadow-sm rounded-full text-slate-700 mt-1">
        <Icon className="w-6 h-6 text-amber-600" />
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-bold text-slate-800">{evento.colaborador}</h4>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mt-1.5">
              <Badge
                variant="secondary"
                className="font-semibold bg-slate-200/70 text-slate-700 hover:bg-slate-200"
              >
                {evento.tipo}
              </Badge>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                {format(dInicio, "dd 'de' MMM", { locale: ptBR })}
                {!mesmaData && ` a ${format(dFim, "dd 'de' MMM", { locale: ptBR })}`}
              </span>
              {!evento.diaInteiro && evento.horaInicio && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-md font-semibold border border-amber-100">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {evento.horaInicio} - {evento.horaFim}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-full"
              onClick={() => onEdit(evento)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full"
              onClick={() => onDelete(evento.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {evento.descricao && (
          <p className="text-sm text-slate-600 leading-relaxed pt-1 bg-white/50 p-3 rounded-lg border border-slate-100">
            {evento.descricao}
          </p>
        )}
      </div>
    </div>
  )
}
