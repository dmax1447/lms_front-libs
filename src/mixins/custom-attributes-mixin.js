import { mapGetters } from 'vuex'
import { __service } from '../config.json'
export default {
  computed: {
    ...mapGetters({
      getCustomAttributes: `${__service}/customAttribute/all`,
      getCustomAttributesGroups: `${__service}/customAttributesGroup/all`,
    }),
  },

  methods: {
    async fetchCustomAttributes() {
      await this.$store.dispatch(`${__service}/customAttribute/GET_ALL_FOR_CLASS`, this.ownerType)
    },
    async fetchCustomAttributesGroups() {
      await this.$store.dispatch(`${__service}/customAttributesGroup/GET_ALL_FOR_CLASS`, this.ownerType)
    },
  },
}
