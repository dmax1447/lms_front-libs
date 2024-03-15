import { __service } from '../config.json'
export default class TableActionsHelper {
  constructor({ context, params = {} }) {
    this.context = context
    this.params = params
  }

  async getAllEntitiesAction() {
    const params = {}
    const allowedParams = ['sort_attribute', 'sort_order', 'per_page']
    const query = this.context.$route.query
    params.page = Number(query.page) > 0 ? query.page : 1
    params.per_page = query.per_page
    for (const param in query) {
      if ((param.startsWith('filter[') || allowedParams.includes(param)) && query[param].length > 0) {
        params[param] = query[param]
      }
    }
    await this.context.$store.dispatch(`${__service}/${this.context.Model.type}/GET_ALL`, { params, ...this.params })
  }

  getEditAction(getUrl) {
    return {
      name: 'edit',
      fn: (e) => {
        this.context.$router.push(getUrl(e.id, this.context.Model.type))
      },
    }
  }

  getEditParamsAction(getUrl) {
    return {
      name: 'edit_params',
      fn: (e) => {
        this.context.$router.push(getUrl(e.id, this.context.Model.type))
      },
    }
  }
  getViewParamsAction(getUrl) {
    return {
      name: 'view_params',
      fn: (e) => {
        this.context.$router.push(getUrl(e.id, this.context.Model.type))
      },
    }
  }

  getCategoryEditAction() {
    return {
      name: 'edit',
      action: 'editElement',
      fn: (e) => {
        this.context.$nuxt.$emit('open-modal-update-category', e)
      },
    }
  }

  getDuplicateAction() {
    return {
      name: 'duplicate',
      action: 'emit',
      modalConfirmConfig: {
        header: this.context.$t(
          `${__service}.pages.subservices.testing.table.actions.duplicate-confirm.${this.context.Model.type}-header`,
        ),
        text: this.context.$t(
          `${__service}.pages.subservices.testing.table.actions.duplicate-confirm.${this.context.Model.type}-text`,
        ),
        actionLabel: this.context.$t(`${__service}.layout.card.actions.clone`),
      },
      fn: async (payload) => {
        this.context.$wait.start(`clone_${this.context.Model.type}`)
        try {
          await this.context.$store.dispatch(`${__service}/${this.context.Model.type}/publish`, payload.item)
          this.context.$toast.success(`${__service}.toasts.questions.publish`)
        } catch (e) {
          this.context.$toast.error(`${__service}.toasts.questions.generic_error`)
        }
        this.context.$wait.end(`clone_${this.context.Model.type}`)
      },
    }
  }

  getPublishAction() {
    return {
      name: 'publish',
      action: 'emit',
      getModalConfig: (payload) => {
        const name = payload.item.name
        const startText = this.context.$t(`${__service}.layout.table.actions.publish.text.start`)
        const endtText = this.context.$t(`${__service}.layout.table.actions.publish.text.end`)
        const html = `${startText} <b>${name}</b> ${endtText}`
        return {
          header: this.context.$t(`${__service}.layout.table.actions.publish.title`),
          text: html,
          actionLabel: this.context.$t(`${__service}.layout.card.actions.publish`),
        }
      },
      // modalConfirmConfig: {
      //   header: this.context.$t(
      //     `${__service}.pages.subservices.testing.table.actions.publish.${this.context.Model.type}.question-header`,
      //   ),
      //   text: this.context.$t(
      //     `${__service}.pages.subservices.testing.table.actions.publish.${this.context.Model.type}.question-text`,
      //   ),
      //   actionLabel: this.context.$t(`${__service}.layout.card.actions.publish`),
      // },
      fn: async (payload) => {
        this.context.$wait.start(`archive_${payload.item.id}`)
        try {
          const type = this.context.Model.type.includes('categories') ? 'categories' : this.context.Model.type
          await this.context.$store.dispatch(`${__service}/${type}/ARCHIVE`, payload.item.id)
          await this.getAllEntitiesAction()
          this.context.$toast.success(`${__service}.toasts.modal.archived`)
        } catch (e) {
          console.warn(e)
          this.context.$toast.error(`${__service}.toasts.modal.failed_archive`)
        }
        this.context.$wait.end(`archive_${payload.item.id}`)
      },
    }
  }

  getUnpublishAction() {}

  getArchiveAction() {
    return {
      name: 'archive',
      action: 'emit',
      isAvailable: ({ is_archived, parent, category }) => {
        let result = !is_archived
        if (parent?.is_archived && !is_archived) {
          result = !parent.is_archived
        }
        if (category?.is_archived || category?.parent?.is_archived) {
          const categoryIsArchived = category.is_archived || category.parent.is_archived
          result = !categoryIsArchived
        }
        return result
      },
      getModalConfig: (payload) => {
        const name = payload.item.name
        const startText = this.context.$t(`${__service}.layout.table.actions.archive.text.start`)
        const endtText = this.context.$t(`${__service}.layout.table.actions.archive.text.end`)
        const html = `${startText} <b>${name}</b> ${endtText}`
        return {
          header: this.context.$t(`${__service}.layout.table.actions.archive.title`),
          text: html,
          actionLabel: this.context.$t(`${__service}.layout.card.actions.archive`),
        }
      },
      // modalConfirmConfig: {
      //   header: this.context.$t(
      //     `${__service}.pages.subservices.testing.table.actions.archive.${this.context.Model.type}.question-header`,
      //   ),
      //   text: this.context.$t(
      //     `${__service}.pages.subservices.testing.table.actions.archive.${this.context.Model.type}.question-text`,
      //   ),
      //   actionLabel: this.context.$t(`${__service}.layout.card.actions.archive`),
      // },
      fn: async (payload) => {
        this.context.$wait.start(`archive_${payload.item.id}`)
        try {
          const type = this.context.Model.type.includes('categories') ? 'categories' : this.context.Model.type
          await this.context.$store.dispatch(`${__service}/${type}/ARCHIVE`, payload.item.id)
          await this.getAllEntitiesAction()
          this.context.$toast.success(`${__service}.toasts.modal.archived`)
        } catch (e) {
          console.warn(e)
          this.context.$toast.error(`${__service}.toasts.modal.failed_archive`)
        }
        this.context.$wait.end(`archive_${payload.item.id}`)
      },
    }
  }

  getUnArchiveAction() {
    return {
      name: 'unarchive',
      action: 'emit',
      isAvailable: ({ is_archived, parent, category }) => {
        let result = is_archived
        if (parent?.is_archived && !category) {
          result = !parent.is_archived
        }
        if (category?.is_archived || category?.parent?.is_archived) {
          const categoryIsArchived = category.is_archived || category.parent.is_archived
          result = !categoryIsArchived
        }
        return result
      },
      modalConfirmConfig: {
        header: this.context.$t(
          `${__service}.pages.subservices.testing.table.actions.unarchive.${this.context.Model.type}.question-header`,
        ),
        text: this.context.$t(
          `${__service}.pages.subservices.testing.table.actions.unarchive.${this.context.Model.type}.question-text`,
        ),
        actionLabel: this.context.$t(`${__service}.layout.card.actions.unarchive`),
      },
      fn: async (payload) => {
        this.context.$wait.start(`unarchive_${payload.item.id}`)
        try {
          const type = this.context.Model.type.includes('categories') ? 'categories' : this.context.Model.type
          await this.context.$store.dispatch(`${__service}/${type}/UNARCHIVE`, payload.item.id)
          await this.getAllEntitiesAction()
          this.context.$toast.success(`${__service}.toasts.modal.unarchived`)
        } catch (e) {
          console.warn(e)
          this.context.$toast.error(`${__service}.toasts.modal.failed_unarchive`)
        }
        this.context.$wait.end(`unarchive_${payload.item.id}`)
      },
    }
  }
  getDeleteAction() {
    return {
      name: 'trash',
      action: 'emit',
      modalConfirmConfig: {
        header: this.context.$t(
          `${__service}.pages.subservices.testing.actions.${this.context.Model.type}.deletion-confirm.${this.context.Model.type}-header`,
        ),
        text: this.context.$t(
          `${__service}.pages.subservices.testing.actions.${this.context.Model.type}.deletion-confirm.${this.context.Model.type}-text`,
        ),
        actionLabel: this.context.$t(`${__service}.layout.card.actions.trash`),
      },
      fn: async (payload) => {
        this.context.$wait.start(`delete_${this.context.Model.type}`)
        try {
          await this.context.$store.dispatch(`${__service}/${this.context.Model.type}/DESTROY`, payload.item)
          await this.getAllEntitiesAction()
          this.context.$toast.success('toasts.modal.deleted')
        } catch (e) {
          console.warn(e)
          this.context.$toast.error('toasts.modal.failed_deleted')
        }
        this.context.$wait.end(`delete_${this.context.Model.type}`)
      },
    }
  }
}
