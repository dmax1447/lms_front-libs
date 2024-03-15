import { __service } from '../config.json'
import fullParams from './date-sort-helper'
import { envByServiceName } from '~/utils/utils'

/**
 * Генерирует объект с экшенами
 * @param {string} endpoint путь к API: students (запрос будет на /students)
 * @param {string} model_name имя модели: student
 */
export default (endpoint, model_name) => ({
  async GET_ALL({ commit }, params = {}) {
    commit('CLEAR')
    const response = await this.$axios.get(`${envByServiceName(this, __service).API_URL}/${endpoint}`, {
      params: fullParams(params),
    })
    commit('SET_PAGINATION_META', response.headers)
    commit('SET', response.data.data)

    return response.data.data
  },

  async GET({ commit }, objectId) {
    return await this.$axios
      .$get(`${envByServiceName(this, __service).API_URL}/${endpoint}/${objectId}`)
      .then((response) => {
        commit('ADD_OR_UPDATE', response.data)
        return response.data
      })
  },

  async CREATE({ commit }, object) {
    let response = {}
    await this.$axios
      .$post(`${envByServiceName(this, __service).API_URL}/${endpoint}`, { [model_name]: object })
      .then((r) => {
        response = r.data
        commit('ADD_OR_UPDATE', r.data)
      })
    return response
  },

  UPDATE({ commit }, object) {
    return this.$axios
      .$put(`${envByServiceName(this, __service).API_URL}/${endpoint}/${object.id}`, { [model_name]: object })
      .then((response) => {
        commit('ADD_OR_UPDATE', response.data)
      })
  },

  DESTROY({ commit }, object) {
    return this.$axios.$delete(`${envByServiceName(this, __service).API_URL}/${endpoint}/${object.id}`).then((r) => {
      commit('REMOVE', object)
    })
  },

  ARCHIVE({ commit }, id) {
    return this.$axios.$post(`${envByServiceName(this, __service).API_URL}/${endpoint}/${id}/archive`).then((r) => {
      return r
    })
  },

  UNARCHIVE({ commit }, id) {
    return this.$axios.$post(`${envByServiceName(this, __service).API_URL}/${endpoint}/${id}/unarchive`).then((r) => {
      return r
    })
  },
})
