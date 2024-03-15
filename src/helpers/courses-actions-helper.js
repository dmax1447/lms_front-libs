import { __service } from '../config.json'
import iconSrc from '~/subservices/courses/assets/icons/emoji/sad.png'
const serviceLink = __service.replaceAll('-', '/')
function getActions() {
  return {
    getViewParamsAction(getUrl) {
      return {
        name: 'view_params',
        fn: (e) => {
          this.$router.push(getUrl(e.id, this.Model.type))
        },
      }
    },
    deleteAction: {
      name: 'delete',
      isAvailable: ({ is_archived, disciplines }) => {
        return !is_archived && !disciplines
      },

      fn: async ({ id, name }) => {
        const { type } = this.Model
        const iconSrc = require('../assets/icons/emoji/sad.png')
        const modalParams = {
          header: 'Удаление курса',
          iconSrc,
          content: `Вы уверены, что хотите удалить курс <b>"${name}"</b>? После удаления его нельзя будет восстановить. `,
          actions: {
            cancel: 'Отменить',
            confirm: 'Удалить',
          },
        }
        this.$openModal('confirm_modal', modalParams)
          .then(() => {
            this.$wait.start(`delete_${id}`)
            return this.$store.dispatch(`${__service}/${type}/DELETE`, { id })
          })
          .then(() => this.fetchData())
          .then(() => this.$toast.success(`${__service}.toasts.modal.${type}_deleted`))
          .catch((err) => {
            const userReasons = ['cancel', 'closed']
            if (typeof err === 'string' && userReasons.includes(err)) return
            const errors = err.response?.data?.details
            if (Array.isArray(errors)) {
              errors.forEach((el) => {
                this.$toast.error(el.message)
              })
            } else {
              this.$toast.error(`${__service}.toasts.modal.failed_delete`)
            }
          })
          .finally(() => {
            this.$wait.end(`delete_${id}`)
          })
      },
    },
    cloneAction: {
      name: 'clone',
      fn: async (item) => {
        const iconSrc = require('../assets/icons/emoji/smile.png')
        const startText = this.$t(`${__service}.layout.table.actions.clone.text.start`)
        const endtText = this.$t(`${__service}.layout.table.actions.clone.text.end`)
        const name = item.name
        const modalParams = {
          header: this.$t(`${__service}.layout.table.actions.clone.title`),
          iconSrc,
          content: `${startText} <b>${name}</b> ${endtText}`,
          actions: {
            cancel: this.$t(`${__service}.layout.modal.actions.cancel`),
            confirm: this.$t(`${__service}.layout.table.actions.clone.submit_label`),
          },
        }
        this.$openModal('confirm_modal', modalParams)
          .then(async () => {
            this.$wait.start(`clone_${item.id}`)
            this.$store.dispatch(`${__service}/courses/DUPLICATE`, { id: item.id })
            this.$toast.success(`${__service}.toasts.modal.clone`)
              .catch((e) => {
                this.$toast.error(`${__service}.toasts.modal.failed_clone`)
              })
          })
          .finally(() => {
            this.$wait.end(`clone_${item.id}`)
          })
      },


    },
    archiveAction: {
      name: 'archive',
      action: 'emit',
      isAvailable: ({ is_published, is_archived }) => {
        return is_published && !is_archived
      },
      getModalConfig: (payload) => {
        const name = payload.item.name
        const startText = this.$t(`${__service}.layout.table.actions.archive.text.start`)
        const endtText = this.$t(`${__service}.layout.table.actions.archive.text.end`)
        const html = `${startText} <b>${name}</b> ${endtText}`
        return {
          header: this.$t(`${__service}.layout.table.actions.archive.title`),
          text: html,
          actionLabel: this.$t(`${__service}.layout.table.actions.archive.submit_label`),
        }
      },
      fn: async (payload) => {
        this.$wait.start(`archive_${payload.item.id}`)
        try {
          const { type } = this.Model
          await this.$store.dispatch(`${__service}/${type}/ARCHIVE`, { id: payload.item.id })
          // await this.getAllEntitiesAction()
          this.$toast.success(`${__service}.toasts.modal.archived`)
        } catch (e) {
          console.warn(e)
          this.$toast.error(`${__service}.toasts.modal.failed_archive`)
        }
        this.$wait.end(`archive_${payload.item.id}`)
      },
    },
    unarchiveAction: {
      name: 'unarchive',
      action: 'emit',
      isAvailable: ({ is_archived }) => {
        return is_archived
      },
      getModalConfig: (payload) => {
        const name = payload.item.name
        const startText = this.$t(`${__service}.layout.table.actions.unarchive.text.start`)
        const endtText = this.$t(`${__service}.layout.table.actions.unarchive.text.end`)
        const html = `${startText} <b>${name}</b> ${endtText}`
        return {
          header: this.$t(`${__service}.layout.table.actions.unarchive.title`),
          text: html,
          actionLabel: this.$t(`${__service}.layout.table.actions.unarchive.submit_label`),
        }
      },
      fn: async (payload) => {
        this.$wait.start(`unarchive_${payload.item.id}`)
        try {
          const { type } = this.Model
          await this.$store.dispatch(`${__service}/${type}/UNARCHIVE`, { id: payload.item.id })
          // await this.getAllEntitiesAction()
          this.$toast.success(`${__service}.toasts.modal.unarchive`)
        } catch (e) {
          console.warn(e)
          this.$toast.error(`${__service}.toasts.modal.unarchive_archive`)
        }
        this.$wait.end(`unarchive_${payload.item.id}`)
      },
    },
    publishAction: {
      name: 'publish',
      isAvailable: ({ is_published }) => {
        return !is_published
      },
      fn: async ({ id, name }) => {
        const iconSrc = require('../assets/icons/emoji/smile.png')
        const modalParams = {
          header: this.$t(`${__service}.layout.table.actions.publish.title`),
          iconSrc,
          content: this.$t(`${__service}.layout.table.actions.publish.text`, { name }),
          actions: {
            cancel: this.$t(`${__service}.layout.modal.actions.cancel`),
            confirm: this.$t(`${__service}.layout.table.actions.publish.submit_label`),
          },
        }

        this.$openModal('confirm_modal', modalParams)
          .then(async () => {
            this.$wait.start(`publish_${id}`)
            const iconSrc = require('../assets/icons/emoji/calm.png')
            this.$store
              .dispatch(`${__service}/courses/PUBLISH`, { id })
              .then(() => {
                this.fetchData()
                this.$toast.success('Курс опубликован')
              })
              .catch((e) => {
                const errorParams = {
                  header: this.$t(`${__service}.layout.table.actions.publish.error.header`),
                  iconSrc,
                  actions: {
                    cancel: this.$t(`${__service}.layout.table.actions.publish.action.cancel`),
                  },
                  columns: [
                    {
                      name: this.$t(`${__service}.layout.table.actions.publish.error.table_headers.element`),
                      value: 'attribute',
                    },
                    {
                      name: this.$t(`${__service}.layout.table.actions.publish.error.table_headers.number`),
                      value: 'name',
                      sorted: true,
                    },
                    {
                      name: this.$t(`${__service}.layout.table.actions.publish.error.table_headers.fixes`),
                      value: 'message',
                    },
                  ],
                }
                this.publishErrorsList = sortPublishErrors('asc', formatErrorPublishAnswer(e.response?.data?.details))
                this.$openModal('course-publish-errors', errorParams)
                  .then(() => {
                    if (this.publishErrorsSorting?.order === 'asc') return
                    this.publishErrorsSorting.order = 'asc'
                    this.publishErrorsList = sortPublishErrors('asc', [...this.publishErrorsList])
                  })
                  .catch((item) => {
                    if (this.publishErrorsSorting?.order !== 'asc') {
                      this.publishErrorsSorting.order = 'asc'
                      this.publishErrorsList = sortPublishErrors('asc', [...this.publishErrorsList])
                    }
                    if (!item) return
                    if (typeof item === 'string') return
                    this.$router.push({
                      path: `/subservices/${serviceLink}/course/${id}`,
                      query: {
                        id: item.id,
                        parent_id: item.parent_id,
                        isEditEnabled: true,
                      },
                    })
                  })
              })
          })
          .finally(() => {
            this.$wait.end(`publish_${id}`)
          })
      },
    },
    unpublishAction: {
      name: 'unpublish',
      isAvailable: ({ is_published, is_archived, disciplines }) => {
        return is_published && !is_archived && !disciplines
      },
      fn: async ({ name, id }) => {
        const iconSrc = require('../assets/icons/emoji/smile.png')
        const modalParams = {
          header: this.$t(`${__service}.layout.table.actions.unpublish.title`),
          iconSrc,
          content: this.$t(`${__service}.layout.table.actions.unpublish.text`, { name }),
          actions: {
            cancel: this.$t(`${__service}.layout.modal.actions.cancel`),
            confirm: this.$t(`${__service}.layout.table.actions.unpublish.submit_label`),
          },
        }
        this.confirmModalWidth = 460
        this.$openModal('confirm_modal', modalParams)
          .then(async () => {
            this.$wait.start(`unpublish_${id}`)
            this.$store
              .dispatch(`${__service}/courses/UNPUBLISHED`, { id })
              .then(() => {
                this.fetchData()
                this.$toast.success('Курс снят с публикации')
              })
              .catch((err) => {
              this.$toast.error(err?.response?.data?.details[0].message || 'Ошибка изменения публикации')
              })
              .finally(() => {
                this.$wait.end(`unpublish_${id}`)
              })
          })
          .finally(() => {
            this.confirmModalWidth = 400
          })
      },
    },
    sortPublishErrors: (order, errors) => sortPublishErrors(order, errors),
  }
}

function formatErrorPublishAnswer(details) {
  const errors = []
  details.forEach((detail) => {
    switch (detail.attribute) {
      case 'lessons':
        if (detail.type === 'empty') {
          errors.push({
            attribute: 'content',
            message: 'Содержание курса пустое',
          })
        }
        if (detail.type === 'invalid_content') {
          errors.push({
            attribute: 'content',
            message: 'Курс не содержит теста или задания',
          })
        }
        if (detail.type === 'name') {
          detail.options.ids.forEach((id) => {
            errors.push({
              attribute: 'lessons',
              message: 'Отсутствует название занятия',
              name: id.name,
              id: id.id,
              parent_id: id.parent_id,
            })
          })
        }
        if (detail.type === 'content') {
          detail.options.ids.forEach((id) => {
            errors.push({
              name: id.name,
              attribute: 'lessons',
              message: 'Не прикреплен контент',
              id: id.id,
              parent_id: id.parent_id,
            })
          })
        }
        break
      case 'points':
        if (detail.type === 'limit')
          errors.push({
            attribute: 'points',
            message: detail.message,
          })
        break
      case 'items':
        if (detail.type === 'without_lesson')
          detail.options.ids.forEach((id) => {
            errors.push({
              message: 'Не содержит занятие',
              attribute: 'items',
              name: id.name.split(' ')[1],
              id: id.id,
            })
          })
        break
      default:
        break
    }
  })
  return errors
}
function sortPublishErrors(order, errors) {
  const compare = (a, b) => {
    const numA = typeof a.name === 'number' ? [a.name] : a.name?.split('.').map(Number) || []
    const numB = typeof b.name === 'number' ? [b.name] : b.name?.split('.').map(Number) || []

    const maxLength = Math.max(numA.length, numB.length)
    for (let i = 0; i < maxLength; i++) {
      if ((numA[i] || 0) < (numB[i] || 0)) return -1
      if ((numA[i] || 0) > (numB[i] || 0)) return 1
    }
    return 0
  }
  const sorted = errors.filter((error) => error.name).sort((a, b) => (order === 'asc' ? compare(a, b) : -compare(a, b)))

  return errors.map((error) => (!error.name ? error : sorted.shift()))
}

export { getActions }
