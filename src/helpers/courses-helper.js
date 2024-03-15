import { SORT_ATTRIBUTE_CREATED, SORT_ORDER_ASC } from '../consts/sort-consts'
import { cloneObject } from './common-helper'

export function getCourseAuthorName(author) {
  if (!author) return ''

  const { first_name = '', last_name = '' } = author
  return `${first_name} ${last_name}`
}

export function mapCourseItems(courses) {
  return courses.map((course) => ({
    course,
  }))
}

/**
 * @param {string} moduleName
 * @return {(function(*, *=): Promise<void>)|*}
 * @constructor
 */
export function GET_ALL(moduleName) {
  return async function ({ commit }, params = {}) {
    if (!params.courseId) return

    commit('CLEAR')
    const courseId = params.courseId
    const paramsCopyWithoutCourseId = cloneObject({
      ...params,
      courseId: undefined,
      per_page: 250,
    })

    const sort = {
      sort_attribute: SORT_ATTRIBUTE_CREATED,
      sort_order: SORT_ORDER_ASC,
    }
    const queryParams = params.isSorted ? paramsCopyWithoutCourseId : { ...paramsCopyWithoutCourseId, ...sort }

    const response = await this.$axios.get(`/courses/${courseId}/${moduleName}`, {
      params: queryParams,
    })

    commit('SET_PAGINATION_META', response.headers)
    commit('SET', response.data.data)

    if (moduleName !== 'users') {
      commit('SET_INITIAL_LIST')
    }
  }
}

/**
 * @param {string} type
 * @return {string}
 * @constructor
 */
export function iconSelector(type) {
  switch (type) {
    case 'Video':
      return 'play-circle'
    case 'Webinar':
      return 'camera-home'
    case 'Quiz':
      return 'file-check'
    case 'Assignment':
      return 'file-edit'
    default:
      return 'file-alt'
  }
}
