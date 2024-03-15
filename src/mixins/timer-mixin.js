import { timeFormatter } from '../helpers/time-helper'

export default {
  data() {
    return {
      timer: {},
      interval: null,
      timerPercent: 0,
    }
  },

  methods: {
    timeFormatter,

    /**
     * Сюда поступает длительность и дата начала, для вычисления даты окончания отностиельно текущего времени
     * @param  { string } created Дата и время начала
     * @param  { string } duration Длительность таймера
     */
    startRemainingTimer(created, _duration) {
      const end = Date.parse(created) + parseInt(_duration) * 1000
      this.interval = setInterval(() => {
        const timerStart = new Date(created)
        const timerEnd = new Date(created).getTime() + parseInt(_duration)
        const timerToday = new Date()
        const q = Math.abs(timerToday - timerStart)
        const d = Math.abs(timerEnd - timerStart)
        const duration = new Date(end) - new Date().getTime()
        this.timerPercent = +Math.round(q / d / 10)
        this.setTimer(duration)
      }, 1000)
    },

    /**
     * Выполняем расчет, возвращаем оставшееся время в виде object
     * @param  { date } duration Дата и Время окончания
     */
    calculateInterval(duration) {
      duration = parseInt(duration)
      const tick = {
        hours: Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((duration % (1000 * 60)) / 1000),
      }
      if (tick.seconds < 0) {
        this.resetTimer()
      }
      return tick
    },

    // Останавливаем таймер
    stopTimer() {
      clearInterval(this.interval)
      this.timerPercent = 0
      this.interval = null
    },

    // Обновляем таймер на странице
    setTimer(duration) {
      this.timer = this.calculateInterval(duration)
    },

    // Сбрасываем таймер
    resetTimer() {
      clearInterval(this.interval)
      this.stopTimer()
      this.timerPercent = 0
      this.timer = {
        hours: 0,
        minutes: 0,
        seconds: -1,
      }
      this.emit('timeOut')
    },
  },
}
