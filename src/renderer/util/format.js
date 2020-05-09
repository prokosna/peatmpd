export function formatSecond (s) {
  if (isNaN(s)) {
    return '00:00'
  }

  const day = Math.floor(s / (60 * 60 * 24))
  const hour = Math.floor((s % (60 * 60 * 24)) / (60 * 60))
  const min = Math.floor(((s % (60 * 60 * 24)) % (60 * 60)) / 60)
  const sec = Math.floor(((s % (60 * 60 * 24)) % (60 * 60)) % 60)

  return `${day ? String(day) + ':' : ''}${
    day || hour ? String(hour).padStart(2, '0') + ':' : ''
  }${min ? String(min).padStart(2, '0') : '00'}:${String(sec).padStart(2, '0')}`
}
