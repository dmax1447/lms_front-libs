import { __service } from '../config.json'
import { debounce } from '../helpers/common-helper'
export default {
  data() {
    return {
      options: [],
      fullOptionsList: [],
      isOptionsLoading: false,
      customResource: null,
      cancelSource: null,
      debounceSearch: debounce((query) => {
        this.search(query)
      }, 300),
    }
  },

  watch: {
    'inputConfig.params'(val) {
      if (val.set) return
      this.setOptions(true)
    },

    // добавить для SpecialityProfileAttribute
    // 'inputConfig.dataUrl'() {
    //   this.setOptions(true)
    // },
  },

  mounted() {
    this.setOptions()
  },

  ///
  /// // ALL METHODS MUST BE REFACTORED (SPLIT TO MULTIPLE SIMPLE METHODS)
  ///
  methods: {
    search(query) {
      if (this.cancelSource) {
        this.cancelSource.cancel()
      }
      this.cancelSource = this.$axios.CancelToken.source()
      this.searchOption(query, this.cancelSource)
    },

    async setOptions(isChanging = false) {
      const config = this.inputConfigComputed || this.inputConfig
      if (config?.getOption) {
        const type = this.role
        const params = config.typeParams(type)
        const response = await this.$axios.get(config.dataUrl, {
          params,
        })
        this.options = response.data.data
        this.fullOptionsList = response.data.data
      } else if (config?.dataUrl) {
        const response = await this.$axios.get(config.dataUrl, {
          params: config.params,
        })

        this.options = isChanging ? response.data.data : this.options.concat(response.data.data)
        this.fullOptionsList = isChanging ? response.data.data : this.options
        this.setNoneOption()

        const emptyOption = this.options.find((option) => option.id === null)
        if (isChanging && emptyOption) {
          this.customResource = emptyOption
          this.changeAssociation && this.changeAssociation(emptyOption)
        }
      }

      if (this.$route.query[`${this.attributeName}_id`] && !isChanging) {
        this.customResource =
          this.options.find((option) => this.$route.query[`${this.attributeName}_id`] === option.id) ||
          (await this.$store.dispatch(`${this.inputConfig.module}/GET`, this.$route.query[`${this.attributeName}_id`]))
        this.$emit('update-resource', {
          [this.attributeName]: this.customResource,
        })
      }
    },

    async searchOption(query, token) {
      let searchLength = 0
      if (query.trim() === '') {
        this.isOptionsLoading = false
      }

      const config = this.inputConfigComputed || this.inputConfig
      if (!query) {
        if (config?.getOption) {
          const type = this.role
          const params = config.typeParams(type)
          const response = await this.$axios.get(config.dataUrl, {
            params,
          })
          this.options = response.data.data
        } else if (config?.dataUrl) {
          const response = await this.$axios.get(config.dataUrl, {
            params: config.params,
          })
          this.options = response.data.data
          this.setNoneOption()
        }
      }

      if (config?.searchLength) {
        searchLength = config.searchLength
      }

      if (query.length >= searchLength && query.trim() !== '' && config?.dataUrl) {
        if (config?.getOption) {
          this.isOptionsLoading = true
          const type = this.role
          const name = config.typeParams(type)
          const filter = config.dataParams(query.trim())
          const params = Object.assign(name, filter)
          const response = await this.$axios.get(config.dataUrl, {
            params,
          })
          this.options = response.data.data
          this.isOptionsLoading = false
        } else {
          this.isOptionsLoading = true
          const response = await this.$axios.get(config.dataUrl, {
            params: Object.assign(config.dataParams(query.trim()), config.params),
            cancelToken: token?.token,
          })
          this.options = response.data.data
          this.isOptionsLoading = false
        }
      }
    },

    setNoneOption() {
      if (this.options.find((option) => option.id === null)) return

      const config = this.inputConfigComputed || this.inputConfig
      if (!config?.resetOptionName) return

      const label = config.label ? this.inputConfig.label : 'name'
      const option = {
        id: null,
        [label]: this.$t(`${__service}.${config.resetOptionName}`),
      }

      if (config.currentUser) {
        option.first_name = ''
        option.last_name = this.$t(`${__service}.${config.resetOptionName}`)
      }
      if (config && config.currentSpeciality && this.resource[this.getAttrName] === undefined) {
        option.speciality = {
          id: null,
          name: this.$t(`${__service}.${config.resetOptionName}`),
        }
      }
      this.options.push(option)
    },
  },
}
