import { showDependErrorToast } from '../helpers/toast-helper'

export default {
  mounted() {
    this.$nuxt.$on('removeElement', (event) => {
      this.deleteElement({
        id: event.id,
      })
        .then(() => {
          this.$toast.success('toasts.modal.deleted')
        })
        .catch((e) => {
          this.showDependErrorToast(e.response)
        })
    })
  },

  beforeDestroy() {
    this.$nuxt.$off('removeElement')
  },

  methods: {
    showDependErrorToast,

    async deleteElement(elementId) {
      await this.$store.dispatch(`${this.type}/DESTROY`, elementId)
    },
  },
}
