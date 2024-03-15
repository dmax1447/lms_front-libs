/**
 * Как пользоваться?
 *
 * - подключаем миксин
 * - устанавливаем метод для получения дефолтной табы:
 * getDefaultTab() {
 *    return this.groups[0]?.id
 * },
 * - инициализируем в created
 * await this.tabMixinSetInitTab('active_attribute_group')
 * - юзаем tabMixinActiveTab для получения активной вкладки
 * - юзаем tabMixinSwitchTab для переключения вкладок
 */
export default {
  data() {
    return {
      tabMixinActiveTab: '',
      _queryId: '',
      _sortQuery: '',
      _sortValue: '',
    }
  },

  watch: {
    '$route.query'(val) {
      this._setActiveTabOrDefault(val[this._queryId])
    },
  },

  methods: {
    _setQuery(val, tab) {
      if (this.$route.query[this._queryId] === val) return

      const to = {
        query: { ...this.$route.query, [this._queryId]: val },
      }

      if (tab) {
        delete to.query[this._sortQuery]
        this._sortQuery = tab.sortQuery || ''
        this._sortValue = tab.sortValue || ''
        if (this._sortQuery) to.query[this._sortQuery] = this._sortValue
      }

      return this.$route.query[this._queryId] ? this.$router.replace(to) : this.$router.push(to)
    },

    /**
     * Получает дефолтное значение у родителя, если нет, то вставляем свое
     *
     * @return {string}
     * @private
     */
    _getDefaultTab() {
      return this.getDefaultTab && typeof this.getDefaultTab === 'function' ? this.getDefaultTab() : 'general'
    },

    _setActiveTabOrDefault(val, tab) {
      this.tabMixinActiveTab = val || this._getDefaultTab()
      this._sortQuery = tab?.sortQuery || this._sortQuery || ''
      this._sortValue = tab?.sortValue || this._sortValue || ''
    },

    tabMixinSetInitTab(queryId, tabs) {
      this._queryId = queryId
      const { [this._queryId]: val } = this.$route.query
      let tab = null
      if (val && tabs) {
        tab = tabs.find((tab) => tab.value === val)
      }
      this._setActiveTabOrDefault(val, tab)

      if (this._sortQuery && !this.$route.query[this._sortQuery]) {
        this.tabMixinSwitchTab(val, tab)
      }
    },

    tabMixinSwitchTab(val, tab) {
      return this._setQuery(val, tab)
    },
  },
}
