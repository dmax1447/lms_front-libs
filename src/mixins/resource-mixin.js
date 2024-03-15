import { cloneObject } from '../helpers/common-helper'
import cloneDeep from '../helpers/clone-deep-helper'

export default {
  data() {
    return {
      resource: null,
    }
  },

  created() {
    // Ставим watch только на первое срабатывание
    this.unwatchResourceComputed = this.$watch('getResourceById', (newVal) => {
      this.initResource(newVal)
      if (newVal) {
        this.unwatchResourceComputed()
      }
    })
  },

  computed: {
    getResourceById() {
      const id = this.$route.params.result_id || this.$route.params.profileId || this.$route.params.id

      return this.getResource && this.getResource(id)
    },
  },

  watch: {
    getResourceById(newVal, hasMoreResources) {
      this.resource = null
      if (newVal && hasMoreResources) {
        const rights = this.resource?.access_rights || newVal.access_rights || null
        this.resource = cloneObject(newVal)
        this.resource.access_rights = rights
      }
    },
  },

  // TODO: избавиться от большого количества событий

  methods: {
    initResource(newVal) {
      const rights = this.resource?.access_rights || newVal?.access_rights || null
      this.resource = cloneObject(newVal) // Синхронизация полей и данных с бэка
      this.resource.access_rights = rights
    },

    /**
     * @param {object} inputsObject
     * @param type
     */
    mapInputs(inputsObject, type = 'main') {
      const CUSTOM_TYPE = 'custom'

      for (const key in inputsObject) {
        if (key === CUSTOM_TYPE) {
          this.mapInputs(inputsObject.custom, CUSTOM_TYPE)
        }

        if (inputsObject[key]?.type === 'file') {
          inputsObject[key] = this.mapFile(inputsObject[key], type)
        }

        if (inputsObject[key]?.dictionary_id) {
          inputsObject[key] = inputsObject[key].id
        }

        if (
          !Array.isArray(inputsObject[key]) &&
          inputsObject &&
          typeof inputsObject[key] === 'object' &&
          inputsObject[key] !== null &&
          (!Object.keys(inputsObject).length || !inputsObject[key] || !Object.keys(inputsObject[key]).length)
        ) {
          delete inputsObject[key]
        }

        if (inputsObject && Array.isArray(inputsObject[key]) && type === CUSTOM_TYPE) {
          inputsObject[key] = inputsObject[key].map((item) =>
            typeof item === 'object' && Object.hasOwnProperty.call(item, 'id') ? item.id : item,
          )
        }
      }
    },

    /**
     * @param file
     * @param type
     * @return {*[]|*}
     */
    mapFile(file, type) {
      if (!file.id) return []

      if (type === 'main') {
        return file.id
      } else if (Array.isArray(file)) {
        return file.push(file.id)
      } else {
        return [file.id]
      }
    },

    /**
     * @param resource
     * @return {*}
     */
    remapInputs(resource) {
      const cloned = cloneDeep(resource)
      this.mapInputs(cloned)
      return cloned
    },

    /**
     * @param payload
     */
    updateResource(payload) {
      if (payload.type === 'custom') {
        delete payload.type

        if (this.resource.custom) {
          this.resource.custom = Object.assign(this.resource.custom, payload)
        }
      } else if (payload.type === 'access_rights') {
        const group = payload.groupName
        delete payload.type
        delete payload.groupName

        if (this.resource.access_rights) {
          this.resource.access_rights[group] = Object.assign(this.resource.access_rights[group], payload)
        }
      } else if (payload.type === 'questions') {
        delete payload.type

        if (this.resource.questions) {
          this.resource.questions = Object.assign(this.resource.questions, payload)
        }
      } else {
        delete payload.type
        for (const payloadKey in payload) {
          this.$set(this.resource || {}, payloadKey, payload[payloadKey])
        }
      }
    },
  },
}
