import { debounce } from '../helpers/common-helper.js'
import TYPES_FILTERS from '../consts/filter-consts'
import { __service } from '../config.json'
import { envByServiceName } from '~/utils/utils'
import { getApiMethods } from '../services/data-service'

export default {
  data() {
    return {
      filterTabState: {},
      filterState: {},
      currentFilterState: {},
      debounceSearch: debounce(async (query, filter) => {
        await this.downloadFilterLocal(query, filter)
      }, 300),
      isFilterVisible: false,
    }
  },
  computed: {
    pagination() {
      return this.$store.state[__service]?.[this.Model.type]?.pagination
    },
    list() {
      return this.$store.state[__service]?.[this.Model.type]?.list
    },
    selectedFiltersNumb() {
      const mapTypeCount = (type, value) => {
        switch (type) {
          case TYPES_FILTERS.SELECT:
            return Object.keys(value).length ? 1 : 0
          case TYPES_FILTERS.DATE:
            return value ? 1 : 0
          case TYPES_FILTERS.MULTI_SELECT:
            return value.length || 0
          case TYPES_FILTERS.SEPARATED:
          case TYPES_FILTERS.RANGE:
            return value.filter((item) => item).length ? 1 : 0
        }
      }
      return Object.entries(this.filterState)
        .map(([nameFilter, value]) => {
          const { type } = this.filterConfig[nameFilter]
          return mapTypeCount(type, value)
        })
        .reduce((acc, rec) => acc + rec, 0)
    },
    filledFilters() {
      const asArray = Object.entries(this.filterState)
      const changeValueByType = (type, key, value) => {
        switch (type) {
          case TYPES_FILTERS.DATE:
            return value
          case TYPES_FILTERS.SEPARATED:
          case TYPES_FILTERS.RANGE:
            return value.filter((item) => item).length ? value : ''
          case TYPES_FILTERS.MULTI_SELECT:
            return value.length ? value.map((item) => item.id) : ''
          case TYPES_FILTERS.SELECT:
            return Object.keys(value)?.length ? value[key] : ''
        }
      }
      const filtered = asArray
        .map(([nameFilter, value]) => [
          nameFilter,
          changeValueByType(this.config[nameFilter]?.type, this.config[nameFilter]?.filterKey, value),
        ])
        .filter(([_, value]) => value)
      Object.entries(this.filterTabState).forEach(([key, value]) => {
        value && filtered.push([key, value])
      })
      return Object.fromEntries(filtered)
    },
  },
  watch: {
    filterState() {
      this.currentFilterState = structuredClone(this.filterState)
    },
    '$route.query'() {
      this.fetchData()
      if (this.currentFilter) {
        const filterOptionsAreLoaded = Object.values(this.currentFilter).some((el) => {
          return el.options?.length
        })
        if (!filterOptionsAreLoaded) {
          this.downloadFilters()
        }
      }
    },
    filledFilters() {
      this.fetchData()
    },
  },
  async created() {
    this.setDefaultState()
    if (this.tabConfig && Object.keys(this.tabConfig).length) {
      const emptyState = {}
      Object.entries(this.tabConfig).forEach(([key, value]) => {
        emptyState[key] = value?.query
      })
      this.filterTabState = emptyState
    }
    await this.downloadFilters()
  },
  methods: {
    ...getApiMethods.call(this, ['fetchDictionary', 'fetchAuthors']),
    getDictionaryFetcher(dictionaryName) {
      return () => this.fetchDictionary(dictionaryName)
    },
    async downloadMoreCards() {
      if (this.pagination.total - this.pagination.perPage * this.pagination.page > 0) {
        this.$wait.start('downloadMoreCards')
        await this.fetchData(true)
        this.$wait.end('downloadMoreCards')
      }
    },
    async fetchData(isAddPage = false) {
      this.$wait.start('fetchData')
      let params = this.getParamsForList()
      const formData = new FormData()
      if (isAddPage) {
        params = { ...params, page: this.pagination.page + 1, isAddPage: true }
      }
      if (!this.$route.query.main_table_tab && this.tabConfig) {
        formData.append(this.tabConfig[0].sortQuery, this.$auth.user.sub)
      }
      for (let key in params) {
        const value = params[key]
        if (Array.isArray(value)) {
          value.forEach((el) => {
            formData.append(`${key}[]`, el)
          })
        } else {
          value && formData.append(key, value)
        }
      }
      console.log(params, 'params')
      await this.$store.dispatch(`${__service}/${this.Model.type}/GET_ALL`, formData)
      this.$wait.end('fetchData')
    },
    getParamsForList() {
      const params = {}
      // const allowedParams = [
      //   'sort_attribute',
      //   'sort_order',
      //   'per_page',
      //   'filter[author_id_eq]',
      //   'filter[is_archived_eq]',
      //   'filter[name_i_cont]',
      // ]
      // const alowedFilterParams = [
      //   'author_id_eq',
      //   'is_archived_eq'
      // ]
      const query = this.$route.query
      params.page = Number(query.page) > 0 ? query.page : 1
      params.per_page = query.per_page ?? 25
      Object.entries(query).forEach(([key, value]) => {
        // if (allowedParams.includes(key)) {
        params[key] = value
        // }
      })
      Object.entries(this.filledFilters).forEach(([key, value]) => {
        if (value) params[key] = value
      })
      return params
    },
    async downloadFilters() {
      this.$wait.start('fetchFiltersInitial')
      const filtersWithOptions = Object.entries(this.config).filter(([_, objValues]) => {
        return objValues.fetchOptions
      })
      await Promise.allSettled(
        filtersWithOptions.map(([filterName]) => this.downloadFilterLocal({ selectedFilterName: filterName })),
      )
      this.$wait.end('fetchFiltersInitial')
    },
    async downloadFilterLocal({ selectedFilterName, payload = '' }) {
      const filter = this.config[selectedFilterName]
      const params = {
        sort_attribute: filter.sort_attribute || filter.filterLabel || null,
        sort_order: 'asc',
        per_page: 100,
      }
      if (payload) params[`filter[${filter.filterQuery}]`] = payload
      filter.fetchOptions()
        .then(options => {
          this.$set(filter, 'options', options)
        })
        .catch(e => {
          this.$toast.warning('Не загружен справочник')
        })
    },

    closeFilters() {
      this.isFilterVisible = false
    },
    updateFilterTab(payload, nameFilter) {
      this.$set(this.filterTabState, nameFilter, payload)
    },
    setDefaultState() {
      if (Object.keys(this.filterConfig).length) {
        const emptyState = {}
        Object.entries(this.config).forEach(([key, value]) => {
          switch (value.type) {
            case TYPES_FILTERS.SELECT:
              emptyState[key] = {}
              break
            case TYPES_FILTERS.MULTI_SELECT:
              emptyState[key] = []
              break
            case TYPES_FILTERS.DATE:
              emptyState[key] = ''
              break
            case TYPES_FILTERS.SEPARATED:
            case TYPES_FILTERS.RANGE:
              emptyState[key] = ['', '']
              break
          }
        })
        this.filterState = emptyState
      }
    },
    updateFilter({ nameFilter, newValue }) {
      this.$set(this.currentFilterState, nameFilter, newValue)
    },
    updateAllFilters() {
      this.filterState = this.currentFilterState
    },
  },
}
