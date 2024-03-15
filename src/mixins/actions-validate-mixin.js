export default {
  methods: {
    fn(action) {
      if (action.name !== 'save') {
        return action.fn
      }
      return async () => {
        if (this.validate) {
          const isValid = await this.validate()
          if (!isValid) return
        }
        action.fn()
      }
    },
  },
}
