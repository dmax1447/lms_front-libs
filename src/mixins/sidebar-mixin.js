export default {
  data() {
    return {
      isMinimized: localStorage.getItem('minimized') === 'true',
    }
  },

  created() {
    this.$nuxt.$on('minimizemenu', this.setIsMinimized)
  },

  beforeDestroy() {
    this.$nuxt.$off('minimizemenu', this.setIsMinimized)
  },

  methods: {
    setIsMinimized(event) {
      this.isMinimized = event
    },

    toggleMenu() {
      localStorage.setItem('minimized', !this.isMinimized)
      this.$nuxt.$emit('minimizemenu', !this.isMinimized)
    },
  },
}
