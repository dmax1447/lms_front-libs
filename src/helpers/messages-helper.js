/**
 * @param date
 * @param format1
 * @param format2
 * @param format3
 * @return {string}
 */
export function dateFormat({ date, format1 = 'H:mm', format2 = 'H:mm, D MMM', format3 = 'H:mm, D MMM YYYY' }) {
  let format = format1
  if (this.diffDates(date).year > 0) {
    format = format3
  } else if (this.$dayjs(date).isYesterday() || this.diffDates(date).day !== 0) {
    format = format2
  }

  return format
}

export function diffDates(date) {
  const currentDate = this.$dayjs()
  const messageDate = this.$dayjs(date)

  return {
    day: currentDate.diff(messageDate, 'day'),
    year: currentDate.diff(messageDate, 'year'),
  }
}

export function generateRequestId() {
  return String(Date.now())
}
