export default {
  all: (state) => state.list,
  pagination: (state) => state.pagination,
  getById: (state) => (id) => {
    if (!state.list) return null

    return state.list.find((resource) => resource.id === id)
  },
}
