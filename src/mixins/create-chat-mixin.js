import { IM_ACTION_CREATE_CHAT, CHAT_CABLE_CHANNEL, IM_TYPE_CREATE_CHAT } from '../consts/socket-consts'
import imRequestIdMixin from './im-request-id-mixin'

export default {
  mixins: [imRequestIdMixin],

  data() {
    return {
      promiseResolve: null,
    }
  },

  methods: {
    createChat(userId) {
      const chatCreationPromise = new Promise((resolve) => {
        this.promiseResolve = resolve
      })

      this.$cable.perform({
        channel: CHAT_CABLE_CHANNEL,
        action: IM_ACTION_CREATE_CHAT,
        data: {
          chat_members: [userId],
          one_to_one: true,
          request_id: this.generateRequestId(IM_TYPE_CREATE_CHAT),
        },
      })

      return chatCreationPromise
    },
  },

  channels: {
    MessengerChannel: {
      received(data) {
        if (
          data.type === 'success' &&
          data.action === IM_ACTION_CREATE_CHAT &&
          data.request_id === this.getRequestId(IM_TYPE_CREATE_CHAT)
        ) {
          const chat = JSON.parse(data.chat)

          if (!this.promiseResolve) return

          this.promiseResolve(chat.id)
          this.promiseResolve = null
        }
      },
    },
  },
}
