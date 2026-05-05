import { useState, useEffect } from 'react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { FunilDashboard } from '@/components/comercial/funil/funil-dashboard'
import { GerenciarOrigensDialog } from '@/components/comercial/funil/gerenciar-origens-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Settings } from 'lucide-react'

export default function FunilVendas() {
  const [mesReferencia, setMesReferencia] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [origens, setOrigens] = useState<any[]>([])
  const [dadosMensais, setDadosMensais] = useState<any[]>([])

  const fetchData = async () => {
    setLoading(true)
    const { data: origensData } = await supabase.from('funil_origens').select('*').order('ordem')
    setOrigens(origensData || [])

    const { data: dadosData } = await supabase
      .from('funil_dados_mensais')
      .select('*')
      .eq('mes_referencia', mesReferencia)
    setDadosMensais(dadosData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [mesReferencia])

  const mesesOptions = Array.from({ length: 12 }).map((_, i) => {
    const date = subMonths(new Date(), i)
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR }).toUpperCase(),
    }
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Funil de Vendas</h2>
          <p className="text-slate-400">Análise e controle de captação de leads e conversão</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={mesReferencia} onValueChange={setMesReferencia}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800 text-white focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {mesesOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <GerenciarOrigensDialog origens={origens} onUpdate={fetchData}>
            <Button
              variant="outline"
              className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Origens
            </Button>
          </GerenciarOrigensDialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <FunilDashboard
          origens={origens}
          dados={dadosMensais}
          mesReferencia={mesReferencia}
          onUpdate={fetchData}
        />
      )}
    </div>
  )
}
