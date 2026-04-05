import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { VendasFiltersState } from '../types'

interface Props {
  filters: VendasFiltersState
  setFilters: React.Dispatch<React.SetStateAction<VendasFiltersState>>
  dentistas: any[]
  crcs: any[]
}

export function VendasFiltros({ filters, setFilters, dentistas, crcs }: Props) {
  const updateFilter = (key: keyof VendasFiltersState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-muted/20 p-4 rounded-lg border">
      <div>
        <Label className="mb-2 block">Buscar Paciente</Label>
        <Input
          placeholder="Nome do paciente..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>
      <div>
        <Label className="mb-2 block">Período</Label>
        <Select value={filters.periodo} onValueChange={(v) => updateFilter('periodo', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tempos</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="ontem">Ontem</SelectItem>
            <SelectItem value="ultimos_7">Últimos 7 dias</SelectItem>
            <SelectItem value="ultimos_15">Últimos 15 dias</SelectItem>
            <SelectItem value="mes_atual">Mês Atual</SelectItem>
            <SelectItem value="personalizado">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        {filters.periodo === 'personalizado' && (
          <div className="flex gap-2 mt-2">
            <Input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => updateFilter('dataInicio', e.target.value)}
            />
            <Input
              type="date"
              value={filters.dataFim}
              onChange={(e) => updateFilter('dataFim', e.target.value)}
            />
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Status</Label>
        <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="avaliacao_realizada">Avaliação Realizada</SelectItem>
            <SelectItem value="em_negociacao">Em Negociação</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
            <SelectItem value="venda_concretizada">Venda Concretizada</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
            <SelectItem value="adiado">Adiado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Temperatura</Label>
        <Select value={filters.temperatura} onValueChange={(v) => updateFilter('temperatura', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Temperatura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="quente">Quente</SelectItem>
            <SelectItem value="morno">Morno</SelectItem>
            <SelectItem value="frio">Frio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Dentista Avaliador</Label>
        <Select value={filters.dentista} onValueChange={(v) => updateFilter('dentista', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Dentista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {dentistas.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">CRC Comercial</Label>
        <Select value={filters.crc} onValueChange={(v) => updateFilter('crc', v)}>
          <SelectTrigger>
            <SelectValue placeholder="CRC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {crcs.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Tratamento</Label>
        <Select value={filters.tratamento} onValueChange={(v) => updateFilter('tratamento', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Tratamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ortodontia">Ortodontia</SelectItem>
            <SelectItem value="implante">Implante</SelectItem>
            <SelectItem value="protese">Prótese</SelectItem>
            <SelectItem value="estetica">Estética</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col justify-center">
        <Label className="mb-4 block">
          Valor (até{' '}
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
          }).format(filters.valorRange[1])}
          )
        </Label>
        <div className="px-2">
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={filters.valorRange}
            onValueChange={(v) => updateFilter('valorRange', v)}
          />
        </div>
      </div>
    </div>
  )
}
