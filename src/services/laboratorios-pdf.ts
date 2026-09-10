import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LaboratorioTipo,
  LaboratorioTrabalho,
  LABORATORIOS_CONFIG,
  calcularDiasUteis,
  calcularDiasAtraso,
  calcularStatus,
} from '@/services/laboratorios'

export interface ExportarPdfOpcoes {
  trabalhos: LaboratorioTrabalho[]
  labFiltro: LaboratorioTipo | 'todos'
  sortColumnTitle?: string
  sortDirectionText?: string
}

function formatarDataVisual(dataStr: string | null | undefined): string {
  if (!dataStr) return '—'
  const parts = dataStr.split('-').map(Number)
  if (parts.length < 3) return dataStr
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  return format(d, 'dd/MM/yyyy')
}

function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function exportarLaboratoriosPdf({
  trabalhos,
  labFiltro,
  sortColumnTitle,
  sortDirectionText,
}: ExportarPdfOpcoes) {
  // Configuração documento A4 Paisagem (Landscape): 297mm largura x 210mm altura
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth() // 297mm
  const pageHeight = doc.internal.pageSize.getHeight() // 210mm
  const agora = new Date()
  const dataHoraGeracao = format(agora, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  const dataArquivo = format(agora, 'yyyy-MM-dd')

  // Identificação do Laboratório / Título
  let nomeLabTitulo = 'Todos os Laboratórios'
  let labSlug = 'todos-os-labs'
  if (labFiltro !== 'todos') {
    nomeLabTitulo = LABORATORIOS_CONFIG[labFiltro]?.label || labFiltro
    labSlug = gerarSlug(LABORATORIOS_CONFIG[labFiltro]?.shortLabel || labFiltro)
  }

  // Contadores globais dos dados enviados
  let totalTrabalhos = 0
  let noPrazo = 0
  let atrasados = 0
  let semData = 0

  trabalhos.forEach((t) => {
    totalTrabalhos++
    const st = calcularStatus(t.data_previsao_entrega, t.entregue, t.delivered_at)
    if (st === 'NO PRAZO') noPrazo++
    else if (st === 'ATRASADO') atrasados++
    else if (st === 'SEM DATA') semData++
  })

  // Cabeçalho da Primeira Página
  // Top Banner / Faixa escura com acento âmbar
  doc.setFillColor(15, 23, 42) // Slate-900
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Linha de acento âmbar no rodapé do cabeçalho
  doc.setFillColor(245, 158, 11) // Amber-500
  doc.rect(0, 27, pageWidth, 1.2, 'F')

  // Nome da clínica
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(245, 158, 11) // Amber-500
  doc.text('NUVIA ODONTOLOGIA', 14, 10)

  // Título do Relatório
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text(`RELATÓRIO DE TRABALHOS — ${nomeLabTitulo.toUpperCase()}`, 14, 18)

  // Subtítulo / Emissão
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(148, 163, 184) // Slate-400
  const emitidoTexto = `Gerado em: ${dataHoraGeracao}`
  doc.text(emitidoTexto, 14, 24)

  // Informação de ordenação à direita no topo
  if (sortColumnTitle) {
    const ordenacaoTexto = `Ordenado por: ${sortColumnTitle} (${sortDirectionText || 'Padrão'})`
    doc.text(ordenacaoTexto, pageWidth - 14, 24, { align: 'right' })
  }

  // Bloco de Métricas / Resumo (Cards)
  const resumoY = 32
  const cardW = (pageWidth - 28 - 9) / 4 // 4 cards com espaçamento de 3mm
  const cardH = 14

  const cards = [
    {
      label: 'TOTAL DE CASOS',
      val: totalTrabalhos.toString(),
      bg: [241, 245, 249],
      txt: [15, 23, 42],
      border: [203, 213, 225],
    },
    {
      label: 'NO PRAZO',
      val: noPrazo.toString(),
      bg: [236, 253, 245],
      txt: [5, 150, 105],
      border: [167, 243, 208],
    },
    {
      label: 'ATRASADOS',
      val: atrasados.toString(),
      bg: [254, 242, 242],
      txt: [220, 38, 38],
      border: [254, 202, 202],
    },
    {
      label: 'A CONFIRMAR / SEM DATA',
      val: semData.toString(),
      bg: [248, 250, 252],
      txt: [100, 116, 139],
      border: [226, 232, 240],
    },
  ]

  cards.forEach((c, i) => {
    const cardX = 14 + i * (cardW + 3)
    doc.setFillColor(c.bg[0], c.bg[1], c.bg[2])
    doc.setDrawColor(c.border[0], c.border[1], c.border[2])
    doc.roundedRect(cardX, resumoY, cardW, cardH, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(c.txt[0], c.txt[1], c.txt[2])
    doc.text(c.label, cardX + 4, resumoY + 4.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(c.val, cardX + 4, resumoY + 11.5)
  })

  // Divisão dos grupos:
  // Se labFiltro for 'todos', agrupar por laboratório (Studio Acrílico, Soluções Cerâmicas, etc.)
  // Dentro de cada laboratório ou em geral, separar os itens com data de previsão dos sem data ("A CONFIRMAR / SEM DATA")
  type GrupoTabela = {
    tituloSecao: string
    subtituloSecao?: string
    itens: LaboratorioTrabalho[]
    isSemData?: boolean
  }

  const gruposTabela: GrupoTabela[] = []

  if (labFiltro !== 'todos') {
    // Laboratório específico
    const comData = trabalhos.filter((t) => !!t.data_previsao_entrega)
    const semDataItens = trabalhos.filter((t) => !t.data_previsao_entrega)

    gruposTabela.push({
      tituloSecao: `TRABALHOS COM PREVISÃO DEFINIDA (${comData.length})`,
      itens: comData,
    })

    if (semDataItens.length > 0) {
      gruposTabela.push({
        tituloSecao: `A CONFIRMAR / SEM DATA (${semDataItens.length})`,
        subtituloSecao:
          'Trabalhos aguardando definição de prazo de entrega pelo laboratório parceiro.',
        itens: semDataItens,
        isSemData: true,
      })
    }
  } else {
    // Todos os Laboratórios: agrupar por cada laboratório
    // 1. Studio Acrílico
    const studioTodos = trabalhos.filter((t) => t.laboratorio === 'studio_acrilico')
    const studioComData = studioTodos.filter((t) => !!t.data_previsao_entrega)
    const studioSemData = studioTodos.filter((t) => !t.data_previsao_entrega)

    if (studioTodos.length > 0) {
      gruposTabela.push({
        tituloSecao: `STUDIO ACRÍLICO — PREVISÃO DEFINIDA (${studioComData.length})`,
        itens: studioComData,
      })
      if (studioSemData.length > 0) {
        gruposTabela.push({
          tituloSecao: `STUDIO ACRÍLICO — A CONFIRMAR / SEM DATA (${studioSemData.length})`,
          itens: studioSemData,
          isSemData: true,
        })
      }
    }

    // 2. Soluções Cerâmicas
    const ceramicasTodos = trabalhos.filter((t) => t.laboratorio === 'ceramicas')
    const ceramicasComData = ceramicasTodos.filter((t) => !!t.data_previsao_entrega)
    const ceramicasSemData = ceramicasTodos.filter((t) => !t.data_previsao_entrega)

    if (ceramicasTodos.length > 0) {
      gruposTabela.push({
        tituloSecao: `SOLUÇÕES CERÂMICAS — PREVISÃO DEFINIDA (${ceramicasComData.length})`,
        itens: ceramicasComData,
      })
      if (ceramicasSemData.length > 0) {
        gruposTabela.push({
          tituloSecao: `SOLUÇÕES CERÂMICAS — A CONFIRMAR / SEM DATA (${ceramicasSemData.length})`,
          itens: ceramicasSemData,
          isSemData: true,
        })
      }
    }
  }

  // Renderizar tabelas
  let startY = resumoY + cardH + 5
  let contadorGeral = 1

  gruposTabela.forEach((grupo, idx) => {
    if (grupo.itens.length === 0) return

    // Se o espaço restante na página for muito pequeno para o título + cabeçalho da tabela, quebrar página
    if (startY > pageHeight - 35) {
      doc.addPage()
      startY = 18
    }

    // Título da Seção
    doc.setFillColor(
      grupo.isSemData ? 241 : 245,
      grupo.isSemData ? 245 : 158,
      grupo.isSemData ? 249 : 11,
    )
    doc.rect(14, startY, 3, 5, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(30, 41, 59) // Slate-800
    doc.text(grupo.tituloSecao, 19, startY + 4)

    startY += 7

    // Preparar dados da tabela
    // Colunas: # | Laboratório (se todos) | Paciente | Trabalho | Data Envio | Previsão de Entrega | Dias Úteis | Status | Dias de Atraso
    const incluirColunaLab = labFiltro === 'todos'

    const tableHeaders = incluirColunaLab
      ? [
          '#',
          'LABORATÓRIO',
          'PACIENTE',
          'TRABALHO',
          'DATA ENVIO',
          'PREVISÃO DE ENTREGA',
          'DIAS ÚTEIS',
          'STATUS',
          'DIAS ATRASO',
        ]
      : [
          '#',
          'PACIENTE',
          'TRABALHO',
          'DATA ENVIO',
          'PREVISÃO DE ENTREGA',
          'DIAS ÚTEIS',
          'STATUS',
          'DIAS ATRASO',
        ]

    const tableRows = grupo.itens.map((item) => {
      const diasUteis = calcularDiasUteis(item.data_envio, item.data_previsao_entrega)
      const diasAtraso = calcularDiasAtraso(
        item.data_previsao_entrega,
        item.entregue,
        item.delivered_at,
      )
      const status = calcularStatus(item.data_previsao_entrega, item.entregue, item.delivered_at)

      let previsaoStr = 'A confirmar'
      if (item.data_previsao_entrega) {
        previsaoStr = formatarDataVisual(item.data_previsao_entrega)
        if (item.horario_previsto) {
          previsaoStr += ` às ${item.horario_previsto.substring(0, 5)}`
        }
      }

      let diasUteisStr = '—'
      if (diasUteis !== null) {
        diasUteisStr = `${diasUteis} ${diasUteis === 1 ? 'útil' : 'úteis'}`
      }

      const atrasoStr = diasAtraso > 0 ? `+${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}` : '0'

      let trabalhoDesc = item.trabalho.toUpperCase()
      if (item.observacoes) {
        trabalhoDesc += `\n(Obs: ${item.observacoes})`
      }

      const numLinha = contadorGeral++

      if (incluirColunaLab) {
        const labShort = LABORATORIOS_CONFIG[item.laboratorio]?.shortLabel || item.laboratorio
        return [
          numLinha.toString(),
          labShort,
          item.paciente.toUpperCase(),
          trabalhoDesc,
          formatarDataVisual(item.data_envio),
          previsaoStr,
          diasUteisStr,
          status,
          atrasoStr,
        ]
      }

      return [
        numLinha.toString(),
        item.paciente.toUpperCase(),
        trabalhoDesc,
        formatarDataVisual(item.data_envio),
        previsaoStr,
        diasUteisStr,
        status,
        atrasoStr,
      ]
    })

    // Larguras das colunas
    // Total landscape width: 297mm - 28mm (margins) = 269mm
    // Definimos columnStyles apropriados
    const columnStyles: Record<number, any> = incluirColunaLab
      ? {
          0: { cellWidth: 10, halign: 'center' }, // #
          1: { cellWidth: 32, fontStyle: 'bold' }, // Laboratório
          2: { cellWidth: 46, fontStyle: 'bold' }, // Paciente
          3: { cellWidth: 'auto' }, // Trabalho
          4: { cellWidth: 24, halign: 'center' }, // Data Envio
          5: { cellWidth: 35, halign: 'center' }, // Previsão
          6: { cellWidth: 22, halign: 'center' }, // Dias Úteis
          7: { cellWidth: 26, halign: 'center', fontStyle: 'bold' }, // Status
          8: { cellWidth: 22, halign: 'center' }, // Dias Atraso
        }
      : {
          0: { cellWidth: 10, halign: 'center' }, // #
          1: { cellWidth: 54, fontStyle: 'bold' }, // Paciente
          2: { cellWidth: 'auto' }, // Trabalho
          3: { cellWidth: 26, halign: 'center' }, // Data Envio
          4: { cellWidth: 38, halign: 'center' }, // Previsão
          5: { cellWidth: 24, halign: 'center' }, // Dias Úteis
          6: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }, // Status
          7: { cellWidth: 24, halign: 'center' }, // Dias Atraso
        }

    autoTable(doc, {
      startY,
      head: [tableHeaders],
      body: tableRows,
      margin: { left: 14, right: 14, bottom: 15 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59], // Slate-800
        lineColor: [226, 232, 240], // Slate-200
        lineWidth: 0.2,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [30, 41, 59], // Slate-800
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Slate-50
      },
      columnStyles,
      didParseCell: (data) => {
        // Estilizar coluna de STATUS com cores semânticas
        const statusColIdx = incluirColunaLab ? 7 : 6
        if (data.section === 'body' && data.column.index === statusColIdx) {
          const val = String(data.cell.raw).trim()
          if (val === 'NO PRAZO') {
            data.cell.styles.textColor = [5, 150, 105] // Verde Emerald-600
            data.cell.styles.fillColor = [236, 253, 245]
          } else if (val === 'ATRASADO') {
            data.cell.styles.textColor = [220, 38, 38] // Vermelho Red-600
            data.cell.styles.fillColor = [254, 242, 242]
          } else if (val === 'SEM DATA') {
            data.cell.styles.textColor = [100, 116, 139] // Slate-500
            data.cell.styles.fillColor = [241, 245, 249]
          } else if (val === 'ENTREGUE') {
            data.cell.styles.textColor = [2, 132, 199] // Sky-600
            data.cell.styles.fillColor = [240, 249, 255]
          }
        }

        // Estilizar dias de atraso se for > 0
        const atrasoColIdx = incluirColunaLab ? 8 : 7
        if (data.section === 'body' && data.column.index === atrasoColIdx) {
          const val = String(data.cell.raw).trim()
          if (val.startsWith('+')) {
            data.cell.styles.textColor = [220, 38, 38]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
    })

    // Atualiza startY para o próximo grupo
    const lastAutoTable = (doc as any).lastAutoTable
    startY = (lastAutoTable?.finalY ? lastAutoTable.finalY : startY) + 7
  })

  // Rodapé em todas as páginas com numeração de página "Página X de Y" e marca Nuvia
  const totalPages = (doc.internal as any).getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    // Linha sutil no rodapé
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10)

    // Texto rodapé
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184) // Slate-400
    doc.text(
      'NUVIA PRO — Sistema Integrado de Gestão Odontológica · Controle Operacional de Laboratórios',
      14,
      pageHeight - 6,
    )

    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 6, {
      align: 'right',
    })
  }

  // Nome do arquivo solicitado: "laboratorios-[slug-lab]-[data].pdf"
  const nomeArquivo = `laboratorios-${labSlug}-${dataArquivo}.pdf`
  doc.save(nomeArquivo)
}
