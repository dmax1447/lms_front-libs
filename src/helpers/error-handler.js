export const errorState = () => ({
  error: null,
  errorData: null,
})

export const errorMutations = () => {
  return {
    SET_ERROR(state, payload) {
      state.error = payload
    },
    CLEAR_ERROR(state) {
      state.error = null
      state.errorData = null
    },
    SET_ERROR_DATA(state, payload) {
      state.errorData = payload
    },
  }
}
