export default {
  methods: {
    setDraggingItem(item) {
      this.$emit('update:dragging-item', item)
    },

    setIsOver(value) {
      this.isOver = value
    },

    dropHandler() {
      this.$emit('drop')
      this.setIsOver(false)
      this.setDraggingItem({})
    },
  },
}
