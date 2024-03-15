import { mapActions } from 'vuex'

export default {
  mounted() {
    this.fetchDictionaryItems()
  },

  computed: {
    linkedDictionaries() {
      const allDictionaries = this.customAttributes
        .filter((attr) => ['single_choice', 'multiple_choice'].includes(attr.kind) && attr.dictionary_id)
        .map((attr) => attr.dictionary_id)

      return [...new Set(allDictionaries)]
    },
  },

  watch: {
    linkedDictionaries: 'fetchDictionaryItems',
  },

  methods: {
    ...mapActions({
      loadDictionaryItems: 'dictionary_item/GET_ALL_APPEND',
    }),

    fetchDictionaryItems() {
      this.linkedDictionaries.forEach((objectId) => {
        if (objectId) {
          this.loadDictionaryItems({ objectId })
        } else {
          this.$toast.error('toasts.custom_attributes.dictionary_error')
        }
      })
    },
  },
}
