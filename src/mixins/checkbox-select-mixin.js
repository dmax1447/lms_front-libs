export default {
  created() {
    this.$nuxt.$on('toggleCheckbox', (event) => {
      this.toggleCheckbox(event)
    })
  },
}
