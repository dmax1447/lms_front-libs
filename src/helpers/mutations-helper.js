import { set } from 'vue'
export default {
  ADD(state, data) {
    state.list.push(data)
  },

  SET(state, data) {
    state.list = data
  },

  CLEAR(state) {
    state.list = []
    state.pagination = {}
  },

  SET_PAGINATION_META(state, headers) {
    set(state.pagination, 'page', parseInt(headers['x-page']))
    set(state.pagination, 'perPage', parseInt(headers['x-per-page']))
    set(state.pagination, 'total', parseInt(headers['x-total']))
    set(state.pagination, 'totalPages', parseInt(headers['x-total-pages']))
  },

  APPEND(state, data) {
    state.list = [...state.list, ...data]
  },

  APPEND_IF_NOT_EXISTS(state, data) {
    data.forEach((element) => {
      if (!state.list.find((item) => item.id === element.id)) {
        state.list.push(element)
      }
    })
  },

  // You could specify affecting list via adding data.list value
  ADD_OR_UPDATE(state, data) {
    let isUpdated = false

    let defaultList = 'list'

    if (data.list) {
      defaultList = data.list
    }

    delete data.list

    let list = []

    list = state[defaultList].map((item) => {
      if (item.id === data.id) {
        item = Object.assign({}, data)
        isUpdated = true
      }
      return item
    })

    if (isUpdated) {
      state[defaultList] = list
      return
    }

    state.list.push(data)
  },

  ADD_OR_UPDATE_UNSHIFT(state, data) {
    let isUpdated = false

    let defaultList = 'list'

    if (data.list) {
      defaultList = data.list
    }

    delete data.list

    let list = []

    list = state[defaultList].map((item) => {
      if (item.id === data.id) {
        item = Object.assign({}, data)
        isUpdated = true
      }
      return item
    })

    if (isUpdated) {
      state[defaultList] = list
      return
    }

    state.list.unshift(data)
  },

  UNSHIFT(state, data) {
    state.list.unshift(data)
  },

  REMOVE(state, data) {
    const index = state.list.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      state.list.splice(index, 1)
    }
    if (state.pagination?.page !== undefined)
      state.pagination = {
        page: state.pagination.page,
        perPage: state.pagination.perPage,
        total: state.pagination.total - 1,
        totalPages: Math.ceil(state.pagination.total / state.pagination.perPage),
      }
  },

  SORT_BY_PROP(state, prop) {
    state.list.sort((a, b) => a[prop] - b[prop])
  },

  SORT_BY_NAME(state, prop) {
    state.list.sort((a, b) => a[prop].localeCompare(b[prop]))
  },
}
