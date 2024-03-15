import { mapActions, mapGetters } from 'vuex'
import { mapCustomAttributesToColumns } from '../helpers/column-sets-helper'
import CustomAttributesMixin from '../mixins/custom-attributes-mixin'
import { getSectionId } from '../helpers/get-section-id-helper'
import { __service } from '../config.json'
export default {
  data() {
    return {
      totalPages: null,
      // pagination: null,
      allColumns: [],
      defaultUrlTab: 'main_table_tab',
    }
  },

  mixins: [CustomAttributesMixin],

  watch: {
    '$route.query'() {
      if (this.fetchDataWithCustomParams && typeof this.fetchDataWithCustomParams === 'function') {
        this.fetchDataWithCustomParams()
      } else {
        this.fetchData()
      }
    },
  },

  async created() {
    if (this.fetchDataWithCustomParams && typeof this.fetchDataWithCustomParams === 'function') {
      await this.fetchDataWithCustomParams(this.$route.params.id)
    } else {
      await this.fetchData()
    }

    if (!this.dontLoadCustomAttributes) await this.fetchCustomAttributes()

    this.allColumns = this.attributes.concat(mapCustomAttributesToColumns(this.getCustomAttributes))
    this.Model && (await this.$loadAndSetColumnsSet(this.Model, null, __service))
  },

  methods: {
    ...mapActions(`${__service}/filter`, {
      loadSectionFilters: 'GET_ALL',
    }),

    getParamsForListApi() {
      const params = {}
      const allowedParams = ['sort_attribute', 'sort_order', 'per_page']
      const query = this.$route.query
      params.page = Number(query.page) > 0 ? query.page : 1
      params.per_page = query.per_page
      for (const param in query) {
        if ((param.startsWith('filter[') || allowedParams.includes(param)) && query[param]?.length > 0) {
          params[param] = query[param]
        }
      }
      return params
    },

    async fetchData(additionalParams, dataName) {
      this.$wait.start('fetchData')
      const params = this.getParamsForListApi()
      if (!this.$route.query[this.defaultUrlTab] && this.tabs?.[0]?.sortQuery && this.tabs?.[0]?.sortValue) {
        params[this.tabs[0].sortQuery] = this.tabs[0].sortValue
      }
      const isSorted = this.$route.query.sort_attribute
      const isOrdered = this.$route.query.sort_order
      const moduleName = this.type || this.Model.type || dataName
      try {
        await this.$store.dispatch(`${__service}/${moduleName}/GET_ALL`, {
          params,
          additionalParams,
          isSorted,
          isOrdered,
        })
      } catch (error) {
        if (error?.response?.status === 404) {
          this.$nuxt.error({statusCode: 404})
        }
      }

      this.$wait.end('fetchData')
    },

    async fetchFilters() {
      this.$wait.start('fetchFilters')
      try {
        await this.loadSectionFilters({
          section_type: this.filtersSection,
          section_id: getSectionId(this.filtersSection, this.$route.params.id),
        })
      } catch (err) {
        console.warn(err)
      }
      this.$wait.end('fetchFilters')
    },

    async reloadWithPerPage() {
      await this.fetchData()
    },
  },

  computed: {
    ...mapGetters({
      filters: `${__service}/filter/emptyNameFirst`,
    }),

    list() {
      return this.$store.state[__service][this.type || this.Model.type]?.list
    },
  },
}
