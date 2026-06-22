const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatDate(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getDayOfWeek(date) {
  return toDate(date).getDay()
}

function isSameDay(a, b) {
  return formatDate(a) === formatDate(b)
}

function toDate(input) {
  return typeof input === 'string' ? parseDate(input) : new Date(input)
}

function addDays(date, days) {
  const d = toDate(date)
  d.setDate(d.getDate() + days)
  return d
}

function getWeekDates(baseDate) {
  const d = toDate(baseDate)
  const day = d.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = addDays(d, mondayOffset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

function getMonthLabel(date) {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function compareTime(a, b) {
  const [ah, am] = a.split(':').map(Number)
  const [bh, bm] = b.split(':').map(Number)
  return ah !== bh ? ah - bh : am - bm
}

function formatDateDisplay(dateStr) {
  const d = parseDate(dateStr)
  const today = formatDate(new Date())
  const tomorrow = formatDate(addDays(new Date(), 1))
  if (dateStr === today) return '今天'
  if (dateStr === tomorrow) return '明天'
  return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEKDAY_LABELS[d.getDay()]}`
}

function formatSlashDate(dateStr) {
  const d = parseDate(dateStr)
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

function formatFullSlashDate(dateStr) {
  const d = parseDate(dateStr)
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

function getRelativeDayLabel(dateStr) {
  const today = formatDate(new Date())
  const yesterday = formatDate(addDays(new Date(), -1))
  const tomorrow = formatDate(addDays(new Date(), 1))
  if (dateStr === today) return '今天'
  if (dateStr === yesterday) return '昨天'
  if (dateStr === tomorrow) return '明天'
  return ''
}

function getDurationDays(startStr, endStr) {
  if (!startStr || !endStr) return 0
  const start = parseDate(startStr)
  const end = parseDate(endStr)
  const diff = Math.round((end - start) / 86400000)
  return Math.max(0, diff)
}

function getWeekdayShort(dateStr) {
  const d = parseDate(dateStr)
  return `周${WEEKDAY_LABELS[d.getDay()]}`
}

export {
  WEEKDAY_LABELS,
  formatDate,
  parseDate,
  getDayOfWeek,
  isSameDay,
  addDays,
  getWeekDates,
  getWeekNumber,
  getMonthLabel,
  getGreeting,
  compareTime,
  formatDateDisplay,
  formatSlashDate,
  formatFullSlashDate,
  getRelativeDayLabel,
  getDurationDays,
  getWeekdayShort
}
