import { mapMutations, mapGetters } from 'vuex'
import {
  CHAT_CABLE_CHANNEL,
  IM_ACTION_TOTAL_UNREAD,
  IM_TYPE_MESSAGE,
  IM_TYPE_MESSAGE_WAS_READ,
  IM_TYPE_TOTAL_UNREAD_MESSAGES_COUNT,
  IM_TYPE_UNREAD_MESSAGES_COUNT,
  STATE_OPEN,
  STATE_ERROR,
  STATE_CLOSED,
} from '../consts/socket-consts'

export default {
  data() {
    return {
      // AutoConnect
      mountOnStart: true,
    }
  },
  created() {
    if (this.mountOnStart) {
      this.connectWebSocket()
    }
  },

  computed: {
    ...mapGetters({
      getMessage: 'im/MESSAGE_BY_ID',
    }),
  },

  methods: {
    ...mapMutations({
      setUnreadMessages: 'im/SET_UNREAD_MESSAGES',
      setMessage: 'im/SET_MESSAGE',
      setLastMessage: 'im/SET_LAST_MESSAGE',
      setUnreadMessagesCount: 'im/SET_UNREAD_MESSAGES_COUNT',
      setRecipientLastReadMessage: 'im/SET_RECIPIENT_LAST_READ_MESSAGE',
    }),

    connectWebSocket() {
      this.$cable.connection.connect(`${this.$config.pegasusCableURL}?access_token=${this.$auth.getToken('local')}`)
      this.$cable.connection.connect()
      const settings = this.examLessonId
        ? { channel: this.wsChannel, exam_lesson_id: this.examLessonId }
        : { channel: this.wsChannel }
      this.$cable.subscribe(settings)
    },

    fetchTotalUnreadMessages() {
      this.$cable.perform({
        channel: CHAT_CABLE_CHANNEL,
        action: IM_ACTION_TOTAL_UNREAD,
      })
    },
  },

  channels: {
    computed: [
      {
        channelName() {
          return `${this.wsChannel}`
        },
        connected() {
          this.$webSockets.state = STATE_OPEN
          this.fetchTotalUnreadMessages()
        },
        rejected() {
          this.$webSockets.state = STATE_ERROR
        },
        received(data) {
          if (this.wsChannel === CHAT_CABLE_CHANNEL) {
            this.$nuxt.$emit('websocket-data', data)
            const actions = {
              [IM_TYPE_TOTAL_UNREAD_MESSAGES_COUNT]: () => {
                this.setUnreadMessages(data.unread_messages_count)
              },

              [IM_TYPE_UNREAD_MESSAGES_COUNT]: () => {
                this.setUnreadMessagesCount({ data })
              },

              [IM_TYPE_MESSAGE]: () => {
                this.setMessage(data)
                this.setLastMessage(data)

                if (data.author_id === this.$auth.user.id) return

                this.setUnreadMessagesCount({ data, increment: true })
                this.fetchTotalUnreadMessages()
              },

              /**
               * сообщение с типом 'message_was_read' приходит в ответ на сообщение 'read_message'.
               * оно приходит обоим - и автору сообщения, и прочитавшему.
               * поэтому здесь необходима проверка того, что автор прочитанного сообщения - текущий юзер, и если это так,
               * то устанавливаем это сообщение в качестве последнего прочитанного собеседником
               */
              [IM_TYPE_MESSAGE_WAS_READ]: () => {
                if (this.getMessage(data)?.author_id !== this.$auth.user.id) return
                this.setRecipientLastReadMessage({
                  chat_id: data.chat_id,
                  recipient_last_read_message_id: data.message_id,
                })
              },

              /**
               * сообщение с типом 'message_was_read' приходит в ответ на сообщение 'read_message'.
               * оно приходит обоим - и автору сообщения, и прочитавшему.
               * поэтому здесь необходима проверка того, что автор прочитанного сообщения - текущий юзер, и если это так,
               * то устанавливаем это сообщение в качестве последнего прочитанного собеседником
               */
              [IM_TYPE_MESSAGE_WAS_READ]: () => {
                if (this.getMessage(data)?.author_id !== this.$auth.user.id) return
                this.setRecipientLastReadMessage({
                  chat_id: data.chat_id,
                  recipient_last_read_message_id: data.message_id,
                })
              },
            }

            actions[data.type] && actions[data.type]()
          } else {
            this.$nuxt.$emit(
              `websocket-data-${this.wsChannel}${this.examLessonId ? `-${this.examLessonId}` : ''}`,
              data,
            )
          }
        },
        disconnected() {
          this.$webSockets.state = STATE_CLOSED
        },
      },
    ],
  },
}
