export function timeFormatter(data) {
  return data.toLocaleString(this.$i18n.locale, {
    minimumIntegerDigits: 2,
  })
}

/**
 * Convert string time to integer(seconds)
 *
 * @param duration
 * @return {number}
 */
export function stringToSeconds(duration) {
  if (!duration) return 0
  if (typeof duration === 'number') return duration

  return parseInt(
    duration.split(' ').reduce((time, value, i) => {
      return i === 0 ? +time + parseInt(value) * 3600 : +time + parseInt(value) * 60
    }, 0),
    10,
  )
}

export function fixDuration() {
  if (!isFinite(this.duration)) {
    this.currentTime = 1e101
    this.ontimeupdate = () => {
      this.ontimeupdate = () => {
        return null
      }
      this.currentTime = 0
      return null
    }
  }
}

export function durationToTime(value) {
  const date = new Date(0)
  date.setHours(0, 0, value, 0)
  if (date.getHours() > 0) {
    return date.toLocaleString(this.$i18n.locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
  } else {
    return date.toLocaleString(this.$i18n.locale, {
      minute: 'numeric',
      second: 'numeric',
    })
  }
}

export function durationToTimeWithZeroHour(value) {
  const date = new Date(0)
  date.setHours(0, 0, value, 0)
  return date.toLocaleString(this.$i18n.locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

export function convertDate(
  value,
  options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  },
) {
  if (!value) return ''

  const date = new Date(value)

  return date.toLocaleString(this.$i18n.locale, options)
}

export function convertDateAndTime(
  value,
  timeOptions = {
    minute: 'numeric',
    hour: 'numeric',
  },
  dateOptions = {
    month: 'numeric',
    day: 'numeric',
  },
) {
  if (!value) return ''

  const date = new Date(value)

  return `${date.toLocaleString(this.$i18n.locale, timeOptions)}, ${date.toLocaleString(
    this.$i18n.locale,
    dateOptions,
  )}`
}

/**
 * Если у start и end разный год - вернется строка в формате "21.12.2022-21.12.2023"
 * Если у start и end разные месяца (но один и тот же год) - вернется строка
 * в формате "21 декабря - 2 января".
 * Если у start и end разные дни (но один и тот же месяц) - вернется строка
 * в формате "21-23 декабря"
 * Если start и end равны, то вернется просто "21 декабря"
 */
export function formatDisplayedDate(start, end) {
  const sameMonth = this.$dayjs(start).isSame(this.$dayjs(end), 'month')
  const sameDay = this.$dayjs(start).isSame(this.$dayjs(end), 'day')
  const sameYear = this.$dayjs(start).isSame(this.$dayjs(end), 'year')

  const dateConstructor = (date, day, month, year) => {
    return new Date(date).toLocaleString(this.$i18n.locale, {
      day,
      month,
      year,
    })
  }

  if (!sameYear) {
    const startDate = dateConstructor(start, 'numeric', 'numeric', 'numeric')

    const endDate = dateConstructor(end, 'numeric', 'numeric', 'numeric')

    return `${startDate}-${endDate}`
  }

  if (!sameMonth) {
    const startDate = dateConstructor(start, 'numeric', 'long')

    const endDate = dateConstructor(end, 'numeric', 'long')

    return `${startDate}-${endDate}`
  }

  if (!sameDay) {
    const startDate = dateConstructor(start, 'numeric')

    const endDate = dateConstructor(end, 'numeric', 'long')

    return `${startDate}-${endDate}`
  }

  return dateConstructor(start, 'numeric', 'long')
}

export function isTodayInDatesRange(startDate, endDate) {
  return (
    (!startDate && !endDate) ||
    (this.$dayjs().diff(endDate) < 0 && this.$dayjs().diff(startDate) > 0) ||
    (!endDate && this.$dayjs().diff(startDate) > 0) ||
    (!startDate && this.$dayjs().diff(endDate) < 0)
  )
}
