import { mapState } from 'vuex'
import { getFullName } from '../helpers/user-helper'

export default {
  props: {
    errorNames: {
      type: Object,
      default: () => {
        return {
          403: { name: '403: Rejected', message: 'Not Enough Rights' },
        }
      },
    },
  },
  computed: {
    ...mapState('auth', {
      user: (state) => state.user,
    }),
  },
  watch: {
    '$notifications.timestamp'() {
      this.notificationEngine(this.$notifications)
    },
  },
  methods: {
    notificationEngine(notification) {
      // Generating Error Data
      const metadata = {
        user_id: this.user.id,
        user_name: getFullName(this.user || {}),
        end_point: notification.data.config.url,
      }

      const error = new Error('access error')
      error.description = metadata
      if (notification.status === 403) {
        error.name = this.errorNames[notification.status].name
        error.message = this.errorNames[notification.status].message
        error.code = notification.status
        this.captureExceptions(error)
      }
    },

    captureExceptions(metadata) {
      this.$sentry.captureException(metadata)
      this.$toast.warning('toasts.rights.rejected')
    },
  },
}
