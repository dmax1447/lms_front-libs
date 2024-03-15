import { mapActions, mapGetters } from 'vuex'
import { showDependErrorToast } from '../helpers/toast-helper'
import { calculateNewPositionsAndReOrder, getAttributesPositions } from '../helpers/positioning-order-helper'

export default {
  computed: {
    ...mapGetters({
      customAttributes: 'custom_attribute/byGroupId',
      customAttrGroup: 'custom_attributes_group/getById',
    }),
  },
  methods: {
    ...mapActions({
      deleteAttributeGroup: 'custom_attributes_group/DESTROY',
      updateAttributeGroup: 'custom_attributes_group/UPDATE',
      deleteAttribute: 'custom_attribute/DESTROY',
      updateAttribute: 'custom_attribute/UPDATE',
    }),

    showDependErrorToast,

    canMoveUp(attribute) {
      return attribute.position !== this.draggingItem.position + 1
    },

    canMoveAttribute(attribute) {
      return !!(
        this.draggingItem !== attribute &&
        this.draggingItem.custom_attributes_group_id &&
        this.draggingItem.custom_attributes_group_id === attribute.custom_attributes_group_id
      )
    },

    canMoveDown(attribute, isLast) {
      return !!(isLast && this.canMoveAttribute(attribute))
    },

    canMoveDownGroup(attribute, isLast) {
      return !!(isLast && this.canMoveGroup(attribute))
    },

    canMoveGroup(attribute) {
      return this.draggingItem !== attribute && !this.draggingItem.custom_attributes_group_id
    },

    canMoveUpGroup(attribute) {
      return !!(this.canMoveGroup(attribute) && this.canMoveUp(attribute))
    },

    canMoveUpAttribute(attribute) {
      return !!(this.canMoveUp(attribute) && this.canMoveAttribute(attribute))
    },

    changeAttributePosition(attribute, attributes, isLast) {
      if (!this.canMoveAttribute(attribute)) return

      const updatedAttributes = calculateNewPositionsAndReOrder({
        from: this.draggingItem,
        to: attribute,
        elementsList: attributes,
        toAttributeIsLast: isLast,
      })

      const positionsForRequest = getAttributesPositions(updatedAttributes)
      updatedAttributes.forEach((attribute) => this.updateAttributeInStore(attribute))
      this.updateAttributePositions(positionsForRequest)
    },

    isLastAttribute(index, attributes) {
      return index === attributes.length - 1
    },

    changeAttributeGroupPosition(attribute, isLast) {
      const updatedAttributeGroups = calculateNewPositionsAndReOrder({
        from: this.draggingItem,
        to: attribute,
        elementsList: this.attributeGroups,
        toAttributeIsLast: isLast,
      })
      const positionsForRequest = getAttributesPositions(updatedAttributeGroups)
      updatedAttributeGroups.forEach((group) => this.updateAttributeGroupInStore(group))
      this.updatePositions(positionsForRequest)
      if (
        this.draggingItem.placing &&
        !this.$route.name.includes('dictionaries') &&
        this.draggingItem.placing !== this.side
      ) {
        this.updateGroupInfo({ ...this.draggingItem, placing: this.side })
      }
    },

    addChildren(attribute) {
      if (!this.canAddChildren(attribute)) return

      this.updateAttribute({
        ...this.draggingItem,
        custom_attributes_group_id: attribute.id,
      })
    },

    canAddChildren(attribute) {
      return !!(
        this.draggingItem.custom_attributes_group_id &&
        this.draggingItem !== attribute &&
        this.draggingItem.custom_attributes_group_id !== attribute.id
      )
    },

    async hideAttributeGroupHandler(object) {
      const custAttrs = this.customAttributes(object.id)
      const payload = {
        id: object.id,
        is_visible: !object.is_visible,
      }
      try {
        await this.updateAttributeGroup(payload)
        await custAttrs.forEach((e) => {
          const custAttrPayload = {
            id: e.id,
            is_visible: !object.is_visible,
          }
          this.updateAttribute(custAttrPayload)
        })
        this.$toast.success(`toasts.modal.${object.is_visible ? 'hidden' : 'visible'}`)
      } catch (e) {
        this.showDependErrorToast(e.response)
      }
    },

    async hideAttributeHandler(object) {
      const custAttrGroup = this.customAttrGroup(object.custom_attributes_group_id)
      const payload = {
        id: object.id,
        is_visible: !object.is_visible,
      }
      try {
        if (!custAttrGroup.is_visible) {
          const custAttrGroupPayload = {
            id: object.custom_attributes_group_id,
            is_visible: true,
          }
          await this.updateAttributeGroup(custAttrGroupPayload)
        }
        await this.updateAttribute(payload)
        this.$toast.success(`toasts.modal.${object.is_visible ? 'hidden' : 'visible'}`)
      } catch (e) {
        this.showDependErrorToast(e.response)
      }
    },

    async deleteAttributeGroupHandler(object, group) {
      await this.$nuxt.$emit('open-modal-confirmation-modal', async () => {
        if (group.length > 0) {
          for (const index in group) {
            try {
              await this.deleteAttribute(group[index])
            } catch (e) {}
          }
        }
        try {
          await this.deleteAttributeGroup(object)
          this.$toast.success('toasts.modal.deleted')
        } catch (e) {
          this.showDependErrorToast(e.response)
        }
      })
    },

    async deleteAttributeHandler(object, silent = false) {
      await this.$nuxt.$emit('open-modal-confirmation-modal', async () => {
        try {
          await this.deleteAttribute(object)
          !silent ? this.$toast.success('toasts.modal.deleted') : null
        } catch (e) {
          !silent ? this.showDependErrorToast(e.response) : null
        }
      })
    },
  },
}
