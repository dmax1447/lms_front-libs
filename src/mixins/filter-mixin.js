import TYPES_FILTERS from '../consts/filter-consts'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'

export default {
  data() {
    return {
      filterState: {}, // внешнее состояние фильтра, на странице
      currentFilterState: {}, // внеутренее состояние фильтра, в компоненте
      config: {},
      isFilterVisible: false,
    }
  },
  methods: {
    async downloadFilters(params = {}) {
      const { shouldFetchOnlyEmpty } = params
      this.$wait.start('fetchFiltersInitial')
      let filtersWithOptions = Object.entries(this.config).filter(([_, objValues]) => {
        return objValues.fetchOptions
      })
      if (shouldFetchOnlyEmpty) {
        filtersWithOptions = filtersWithOptions.filter(([name, config]) => config.options.length === 0)
      }
      await Promise.allSettled(
        filtersWithOptions.map(([filterName]) => this.updateFilterOptions({ selectedFilterName: filterName })),
      )
      this.$wait.end('fetchFiltersInitial')
    },
    updateFilterOptions({ selectedFilterName, payload }) {
      const filter = this.config[selectedFilterName]
      return filter
        .fetchOptions(payload)
        .then((fetchedOptions) => {
          const options = filter.notSpecifiedOption ? [filter.notSpecifiedOption, ...fetchedOptions] : fetchedOptions
          this.$set(filter, 'options', options)
        })
        .catch(() => {
          this.$toast.warning('Не загружен справочник')
        })
    },
    getApiFilterQueries(filterParams) {
      const query = {}
      for (let key in filterParams) {
        const { buildQuery, type } = this.config[key]
        if (!buildQuery) continue
        const filterParamValues = filterParams[key]
        if (isEmpty(filterParamValues)) continue
        const queryObject = buildQuery(filterParamValues)
        for (const predicate in queryObject) {
          if (type === TYPES_FILTERS.MULTI_SELECT && Object.hasOwn(query, predicate)) {
            query[predicate] = [...query[predicate], ...queryObject[predicate]]
            continue
          }
          query[predicate] = queryObject[predicate]
        }
      }
      return query
    },
    countActive(filterState) {
      return Object.entries(filterState).reduce((acc, item) => {
        const [filterName, filterValue] = item
        const config = this.config[filterName]
        switch (config.type) {
          case TYPES_FILTERS.SELECT:
            return filterValue.id ? acc + 1 : acc
          case TYPES_FILTERS.MULTI_SELECT:
            return acc + filterValue.length
          case TYPES_FILTERS.DATE:
            return filterValue ? acc + 1 : acc
          case TYPES_FILTERS.SEPARATED:
          case TYPES_FILTERS.RANGE:
            return acc + filterValue.filter((v) => !!v).length
        }
      }, 0)
    },
    closeFilters() {
      this.isFilterVisible = false
    },
    getDefaultState(filterConfig) {
      const defaultState = {}
      Object.entries(filterConfig).forEach(([key, value]) => {
        switch (value.type) {
          case TYPES_FILTERS.SELECT:
            defaultState[key] = {}
            break
          case TYPES_FILTERS.MULTI_SELECT:
            defaultState[key] = []
            break
          case TYPES_FILTERS.DATE:
            defaultState[key] = ''
            break
          case TYPES_FILTERS.SEPARATED:
          case TYPES_FILTERS.RANGE:
            defaultState[key] = ['', '']
            break
        }
      })
      return defaultState
    },
    updateFilter({ nameFilter, newValue }) {
      this.$set(this.currentFilterState, nameFilter, newValue)
    },
    async setupFilter(filterConfigPropertyName) {
      this.config = this[filterConfigPropertyName]
      this.$watch(filterConfigPropertyName, (newVal) => {
        this.config = newVal
        this.initFilter()
      })
      await this.initFilter()
    },
    resetFilterState() {
      this.currentFilterState = this.getDefaultState(this.config)
      this.filterState = cloneDeep(this.currentFilterState)
    },
    async initFilter() {
      this.resetFilterState()
      await this.downloadFilters()
    },
  },
}
