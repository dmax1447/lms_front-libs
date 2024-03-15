import { __service } from '../config.json'
export default {
  methods: {
    pageTitle() {
      return this.$t(`${__service}.pages.subservices.testing.${this.$route.name}.title`)
    },
  },
}
