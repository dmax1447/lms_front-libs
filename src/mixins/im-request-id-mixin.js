import { mapGetters, mapMutations } from 'vuex'
import { generateRequestId } from '../helpers/messages-helper'

export default {
  computed: {
    ...mapGetters({
      getRequestId: 'im/GET_REQUEST_ID',
    }),
  },

  methods: {
    ...mapMutations({
      setRequestId: 'im/SET_REQUEST_ID',
      deleteRequestId: 'im/DELETE_REQUEST_ID',
    }),

    /**
     * @param {string} key
     */
    generateRequestId(key) {
      const requestId = generateRequestId()
      this.setRequestId({ key, value: requestId })
      return requestId
    },
  },
}
