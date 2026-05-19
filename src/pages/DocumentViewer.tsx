import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, FileWarning } from 'lucide-react'

export default function DocumentViewer() {
  const [searchParams] = useSearchParams()
  const url = searchParams.get('url')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) {
      setError(true)
      setLoading(false)
      return
    }

    const scriptId = 'pdfjs-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    const renderPdf = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

        const supabaseUrl =
          import.meta.env.VITE_SUPABASE_URL || 'https://jblynykmltyvseugkvkk.supabase.co'
        const proxyUrl = `${supabaseUrl}/functions/v1/proxy-document?url=${encodeURIComponent(url)}`

        const loadingTask = pdfjsLib.getDocument(proxyUrl)
        const pdf = await loadingTask.promise

        const container = document.getElementById('pdf-container')
        if (!container) return

        const availableWidth = container.clientWidth || window.innerWidth

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)

          const unscaledViewport = page.getViewport({ scale: 1.0 })

          // Calculate scale to fit available width
          const scale = availableWidth / unscaledViewport.width

          // Limit maximum render scale to avoid browser crash, but display full width
          const dpr = window.devicePixelRatio || 1
          const renderScale = Math.min(scale * dpr, 3.0)

          const renderViewport = page.getViewport({ scale: renderScale })

          const canvas = document.createElement('canvas')
          canvas.className = 'mb-1 bg-white mx-auto block !w-full !max-w-none !px-0'
          canvas.style.width = '100%'
          canvas.style.height = 'auto'

          const context = canvas.getContext('2d')

          if (context) {
            canvas.height = renderViewport.height
            canvas.width = renderViewport.width

            const renderContext = {
              canvasContext: context,
              viewport: renderViewport,
            }
            await page.render(renderContext).promise
          }
          container.appendChild(canvas)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error rendering PDF:', err)
        setError(true)
        setLoading(false)
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = renderPdf
      document.head.appendChild(script)
    } else {
      if ((window as any).pdfjsLib) {
        renderPdf()
      } else {
        script.addEventListener('load', renderPdf)
      }
    }

    return () => {
      const container = document.getElementById('pdf-container')
      if (container) container.innerHTML = ''
    }
  }, [url])

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center">
        <FileWarning className="w-12 h-12 text-rose-500 mb-4 opacity-80" />
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Erro ao carregar documento</h3>
        <p className="max-w-md text-sm text-slate-400 mb-6">
          Ocorreu um problema ao tentar processar o arquivo. Isso pode acontecer devido a proteções
          de segurança ou o arquivo pode estar corrompido.
        </p>
        <a
          href={url || '#'}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium rounded-lg transition-colors shadow-sm"
        >
          Tentar abrir em nova aba
        </a>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center p-0 m-0 overflow-y-auto custom-scrollbar">
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 transition-all duration-300">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-200 font-medium tracking-wide">Renderizando documento...</p>
            <p className="text-slate-500 text-sm mt-1">
              Preparando visualização otimizada (Tela Cheia)
            </p>
          </div>
        </div>
      )}
      <div id="pdf-container" className="flex flex-col items-center w-full !max-w-none p-0 m-0">
        {/* Os canvases das páginas do PDF serão injetados aqui */}
      </div>
    </div>
  )
}
