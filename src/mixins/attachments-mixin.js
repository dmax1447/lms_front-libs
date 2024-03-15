import { mapActions } from 'vuex'

import { splitText } from '../helpers/text-helper'

export default {
  props: {
    filenameLength: {
      type: Number,
      default: 21,
    },
  },

  data() {
    return {
      attachments: [],
    }
  },

  methods: {
    ...mapActions({
      getAttachment: 'attachment/GET_ATTACHMENT',
    }),

    deleteAttachment(id) {
      this.updateAttachments(this.attachments.filter((a) => a.id !== id))
    },

    updateAttachments(newAttachments) {
      this.attachments = newAttachments
      this.$emit('input', newAttachments)
    },

    splitFileName(attachment) {
      attachment.original_filename = splitText(attachment.original_filename, this.filenameLength)
      return attachment
    },

    async getAttachments(list) {
      this.attachments = []

      for (const index in list) {
        let info = await this.getAttachment(list[index]).catch(() => {
          this.$toast.error('toasts.files.errors.no_file_found')
        })
        if (info) {
          info = JSON.parse(JSON.stringify(info))
          info.original_filename = splitText(info.original_filename, this.filenameLength)
          this.attachments.push(info)
        }
      }
    },
  },
}
