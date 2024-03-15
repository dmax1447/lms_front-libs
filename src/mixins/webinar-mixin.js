import { __service } from '../config.json'
import { WEBINAR_URI } from '../consts/webinar-consts'
import { convertDate } from '../helpers/time-helper'

export default {
  data() {
    return {
      starting_at: this.resource?.starting_at || this.webinar?.starting_at,
      duration: this.resource?.duration || this.webinar?.duration,
      streamUri: `${WEBINAR_URI}${
        this.resource?.provider_data.co_streamer_key || this.webinar?.provider_data?.viewer_key
      }?lms_token=${this.resource?.access_token || this.resource?.access_token}`,
    }
  },

  computed: {
    isStarted() {
      return new Date(this.starting_at).getTime() <= new Date().getTime()
    },

    isExpired() {
      return new Date(this.starting_at).getTime() + this.duration * 1000 < new Date().getTime()
    },

    info() {
      return this.isExpired
        ? this.$t(`${__service}.associations.webinar.webinar-expired`)
        : this.$t(`${__service}.associations.webinar.not-started`)
    },

    startDate() {
      return this.convertDate(this.starting_at, {
        hour: 'numeric',
        minute: 'numeric',

        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })
    },
  },

  methods: {
    convertDate,
  },
}
