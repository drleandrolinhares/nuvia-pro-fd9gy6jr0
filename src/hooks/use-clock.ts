import { useState, useEffect } from 'react'

const DAYS = [
  'DOMINGO',
  'SEGUNDA-FEIRA',
  'TERÇA-FEIRA',
  'QUARTA-FEIRA',
  'QUINTA-FEIRA',
  'SEXTA-FEIRA',
  'SÁBADO',
]
const MONTHS = [
  'JANEIRO',
  'FEVEREIRO',
  'MARÇO',
  'ABRIL',
  'MAIO',
  'JUNHO',
  'JULHO',
  'AGOSTO',
  'SETEMBRO',
  'OUTUBRO',
  'NOVEMBRO',
  'DEZEMBRO',
]

export function useClock() {
  const getBrtDate = () =>
    new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const [time, setTime] = useState(getBrtDate())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getBrtDate())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const dayOfWeek = DAYS[time.getDay()]
  const day = String(time.getDate()).padStart(2, '0')
  const month = MONTHS[time.getMonth()]
  const hours = String(time.getHours()).padStart(2, '0')
  const minutes = String(time.getMinutes()).padStart(2, '0')
  const seconds = String(time.getSeconds()).padStart(2, '0')

  return `${dayOfWeek}, ${day} DE ${month} • ${hours}:${minutes}:${seconds}`
}
