import { __service } from '../config.json'
import TYPES_FILTERS from '../consts/filter-consts'

const getFilterConfig = (context) => {
  const commonPart = {
    name: {
      options: [],
      label: context.$t(`${__service}.filters.name`),
      type: TYPES_FILTERS.MULTI_SELECT,
      filterLabel: 'name',
      filterKey: 'id',
      buildQuery(options) {
        const values = options.map((v) => v.id)
        return { id_in: values }
      },
      fetchOptions: context.getCoursesBrief,
    },
    language: {
      options: [],
      label: context.$t(`${__service}.filters.course_language`),
      type: TYPES_FILTERS.MULTI_SELECT,
      filterLabel: 'full_name',
      filterKey: 'id',
      buildQuery(options) {
        const values = options.map((v) => v.id)
        return { language_id_in: values }
      },
      fetchOptions: context.getFilterDictionaryFetcher('languages'),
    },
    level: {
      options: [],
      filterLabel: 'full_name',
      filterKey: 'id',
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const values = options.map((v) => v.id)
        return { level_id_in: values }
      },
      label: context.$t(`${__service}.filters.education_level`),
      fetchOptions: context.getFilterDictionaryFetcher('levels'),
    },
    subdivisions: {
      options: [],
      notSpecifiedOption: {
        id: null,
        name_with_parents: 'Без подразделения',
      },
      filterLabel: 'name_with_parents',
      filterKey: 'id',
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const hasNotSpecified = options.some((v) => v.id === null)
        const values = options.map((v) => v.id).filter((v) => v !== null)
        if (!hasNotSpecified) return { subdivisions_id_in: values }
        if (hasNotSpecified && !values.length) return { subdivisions_id_null: true }
        return { subdivisions_id_in_or_null: values }
      },
      label: context.$t(`${__service}.filters.subdivisions`),
      fetchOptions: context.getFilterDictionaryFetcher('custom_subdivisions', 'name_with_parents_i_cont'),
    },
    speciality: {
      options: [],
      notSpecifiedOption: {
        id: null,
        full_name: 'Без специальности',
      },
      filterLabel: 'full_name',
      filterKey: 'id',
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const hasNotSpecified = options.some((v) => v.id === null)
        const values = options.map((v) => v.id).filter((v) => v !== null)
        if (!hasNotSpecified) return { specialities_id_in: values }
        if (hasNotSpecified && !values.length) return { specialities_id_null: true }
        return { specialities_id_in_or_null: values.filter((v) => v !== null) }
      },
      label: context.$t(`${__service}.filters.specialities`),
      fetchOptions: context.getFilterDictionaryFetcher('custom_specialities'),
    },
    specialization: {
      options: [],
      notSpecifiedOption: {
        id: null,
        name_with_speciality: 'Без специализации',
      },
      filterLabel: 'name_with_speciality',
      filterKey: 'id',
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const hasNotSpecified = options.some((v) => v.id === null)
        const values = options.map((v) => v.id).filter((v) => v !== null)
        if (values.length && !hasNotSpecified) {
          return { specializations_id_in: values }
        }
        if (hasNotSpecified && !values.length) {
          return { without_specializations_id_or_specializations_id_null: true }
        }
        return { without_specializations_id_or_specializations_id_in: values }
      },
      label: context.$t(`${__service}.filters.specializations`),
      fetchOptions: context.getFilterDictionaryFetcher('custom_specializations'),
    },
    status: {
      options: [
        { id: 'in work', name: 'В работе' },
        { id: 'draft', name: 'Черновик' },
        { id: 'ready', name: 'Готов' },
      ],
      filterLabel: 'name',
      filterKey: 'id',
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const values = options.map((v) => v.id)
        return { status_in: values }
      },
      label: context.$t(`${__service}.filters.status`),
    },
    is_published: {
      options: [
        { id: 1, value: true, name: 'Опубликовано' },
        { id: 2, value: false, name: 'Не опубликовано' },
      ],
      filterLabel: 'name',
      filterKey: 'value',
      type: TYPES_FILTERS.SELECT,
      buildQuery(option) {
        return { is_published_eq: option.id }
      },
      label: context.$t(`${__service}.filters.is_published`),
    },
    created_at: {
      type: TYPES_FILTERS.RANGE,
      buildQuery(options) {
        const query = {}
        if (options[0]) query.created_date_gteq = options[0]
        if (options[1]) query.created_date_lteq = options[1]
        return query
      },
      label: context.$t(`${__service}.filters.created_date`),
    },
    updated_at: {
      type: TYPES_FILTERS.RANGE,
      buildQuery(options) {
        const query = {}
        if (options[0]) query.updated_date_gteq = options[0]
        if (options[1]) query.updated_date_lteq = options[1]
        return query
      },
      label: context.$t(`${__service}.filters.updated_date`),
    },
    disciplines: {
      options: [
        { id: 1, value: false, name: 'Привязан' },
        { id: 2, value: true, name: 'Нет привязки' },
      ],
      filterLabel: 'name',
      filterKey: 'value',
      type: TYPES_FILTERS.SELECT,
      buildQuery(option) {
        return { disciplines_id_null: option.value }
      },
      label: context.$t(`${__service}.filters.disciplines`),
    },
  }

  return {
    'my-courses': {
      ...commonPart,
    },
    'all-courses': {
      ...commonPart,
      author: {
        options: [],
        filterLabel: 'fio',
        filterKey: 'id',
        type: TYPES_FILTERS.MULTI_SELECT,
        buildQuery(options) {
          const values = options.map((v) => v.id)
          return { author_id_in: values }
        },
        label: context.$t(`${__service}.filters.author`),
        fetchOptions: context.getAuthors,
      },
    },
    'archive-courses': {
      ...commonPart,
      author: {
        options: [],
        filterLabel: 'fio',
        filterKey: 'id',
        type: TYPES_FILTERS.MULTI_SELECT,
        buildQuery(options) {
          const values = options.map((v) => v.id)
          return { author_id_in: values }
        },
        label: context.$t(`${__service}.filters.author`),
        fetchOptions: context.getAuthors,
      },
    },
  }
}

export { getFilterConfig }
