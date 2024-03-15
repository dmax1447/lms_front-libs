import { __service } from '../config.json'
import TYPES_FILTERS from '../consts/filter-consts'

const getFilterConfig = (context) => {
  const commonPart = {
    author: {
      options: [],
      filterLabel: 'fio',
      filterKey: 'id',
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const values = options.map((v) => v.id).filter((v) => v !== null)
        return { author_id_in: values }
      },
      label: context.$t(`${__service}.filters.author`),
      fetchOptions: context.getAuthors,
    },
    language: {
      options: [],
      label: context.$t(`${__service}.filters.course_language`),
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const values = options.map((v) => v.id)
        return { language_id_in: values }
      },
      filterLabel: 'full_name',
      filterKey: 'id',
      fetchOptions: context.getFilterDictionaryFetcher('languages'),
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
      fetchOptions: context.getFilterDictionaryFetcher('custom_subdivisions'),
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
    specialities: {
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
    specializations: {
      options: [],
      notSpecifiedOption: {
        id: null,
        name_with_speciality: 'Без специализации',
      },
      filterLabel: 'name_with_speciality',
      filterKey: 'id',
      type: TYPES_FILTERS.MULTI_SELECT,
      buildQuery(options) {
        const hasNotSpecified = options.some((v) => v.id === null) // выбрана опция без специализации
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

    created_at: {
      type: TYPES_FILTERS.RANGE,
      buildQuery(options) {
        const values = options.filter((v) => !!v)
        if (!values.length) return {}
        return {
          created_date_gteq: values[0],
          created_date_lteq: values[1],
        }
      },
      label: context.$t(`${__service}.filters.created_date`),
    },
    updated_at: {
      type: TYPES_FILTERS.RANGE,
      label: context.$t(`${__service}.filters.updated_date`),
      buildQuery(options) {
        const values = options.filter((v) => !!v)
        if (!values.length) return {}
        return {
          updated_date_gteq: values[0],
          updated_date_lteq: values[1],
        }
      },
    },
  }

  switch (context.Model.type) {
    case 'lectures':
      return {
        category: {
          options: [],
          label: context.$t(`${__service}.filters.category`),
          type: TYPES_FILTERS.MULTI_SELECT,
          filterLabel: 'name',
          filterKey: 'id',
          buildQuery(options) {
            const values = options.map((v) => v.id)
            return { category_id_or_category_parent_id_in: values }
          },
          fetchOptions: context.getCategories,
        },
        subcategory: {
          options: [],
          label: context.$t(`${__service}.filters.subcategory`),
          type: TYPES_FILTERS.MULTI_SELECT,
          filterLabel: 'name',
          filterKey: 'id',
          buildQuery(options) {
            const values = options.map((v) => v.id)
            return { category_id_in: values }
          },
          fetchOptions: context.getSubcategories,
        },
        type: {
          options: [
            { id: 'text', name: 'Текст' },
            { id: 'video', name: 'Видео' },
          ],
          label: context.$t(`${__service}.filters.type`),
          type: TYPES_FILTERS.SELECT,
          buildQuery(option) {
            return { lecture_type_eq: option.id }
          },
          filterLabel: 'name',
          filterKey: 'id',
        },
        ...commonPart,
      }
    case 'assignments':
      return {
        category: {
          options: [],
          label: context.$t(`${__service}.filters.category`),
          type: TYPES_FILTERS.MULTI_SELECT,
          filterLabel: 'name',
          filterKey: 'id',
          buildQuery(options) {
            const values = options.map((v) => v.id)
            return { category_id_or_category_parent_id_in: values }
          },
          fetchOptions: context.getCategories,
        },
        subcategory: {
          options: [],
          label: context.$t(`${__service}.filters.subcategory`),
          type: TYPES_FILTERS.MULTI_SELECT,
          filterLabel: 'name',
          filterKey: 'id',
          buildQuery(options) {
            const values = options.map((v) => v.id)
            return { category_id_in: values }
          },
          fetchOptions: context.getSubcategories,
        },
        ...commonPart,
      }

    default:
      return {
        ...commonPart,
      }
  }
}
export { getFilterConfig }
