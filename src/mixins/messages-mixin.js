export default {
  methods: {
    dateFormat(date, format1 = 'H:mm', format2 = 'H:mm, D MMM', format3 = 'H:mm, D MMM YYYY') {
      let format = format1
      if (this.diffDates(date).year > 0 || (format2 === 'dd' && this.diffDates(date).day > 6)) {
        format = format3
      } else if (this.$dayjs(date).isYesterday() || this.diffDates(date).day !== 0) {
        format = format2
      }

      return format
    },

    diffDates(date) {
      const currentDate = this.$dayjs()
      const messageDate = this.$dayjs(date)
      return {
        day: currentDate.diff(messageDate, 'day'),
        year: currentDate.diff(messageDate, 'year'),
      }
    },
  },
}
