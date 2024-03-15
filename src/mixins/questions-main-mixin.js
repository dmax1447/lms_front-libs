import { mapGetters, mapMutations } from 'vuex'
import { PAIR_TYPES } from '../consts/test-types-consts'

// миксин для основных типов вопроса: single, multiple, pairs, sequence
export default {
  props: {
    question: {
      type: Object,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      questionText: this.question?.name || '',
      previewModalOpened: null,
      isDragModalOpen: false,
      pairTypes: PAIR_TYPES,
      fileFromDrop: null,
      validationRules: {
        required: true,
      },
    }
  },
  computed: {
    isNotTypeTextOrFormula() {
      return this.questionType !== this.pairTypes.TEXT && this.questionType !== this.pairTypes.FORMULA
    },
    allAnswers() {
      return this.answers.map((item) => item.value)
    },
    actionsAreVisible() {
      return this.answers.length > 2
    },
    isEdit() {
      return this.$route.name.includes('edit') || this.$route.name.includes('new')
    },
    toAbleToDragMedia() {
      const isCompleteMediaAnswers = this.answers.every((el) => el.url)

      return this.isNotTypeTextOrFormula && !isCompleteMediaAnswers
    },
    indexOptionToDropMedia() {
      return this.answers.findIndex((el) => !el.url)
    },
  },
  watch: {
    answers: {
      handler() {
        this.updateQuestion({
          answers: this.answers,
        })
      },
      deep: true,
    },
  },
  created() {
    if (this.question.answers?.length) {
      this.answers = this.question.answers
    }
    this.$nuxt.$on('dragenter', this.uploadFileDragenter)
    this.$nuxt.$on('dragleave', this.uploadFileDragleave)
    this.$nuxt.$on('drop', this.uploadFileDrop)
  },

  beforeDestroy() {
    this.$nuxt.$off('dragenter', this.uploadFileDragenter)
    this.$nuxt.$off('dragleave', this.uploadFileDragleave)
    this.$nuxt.$off('drop', this.uploadFileDrop)
    this.updateQuestion({ answers: null })
  },
  methods: {
    ...mapGetters({
      getAudio: 'audio/getAudio',
    }),
    ...mapMutations({
      setAudio: 'audio/setAudio',
    }),
    checkPlayingQuestion(playingTrackId) {
      return playingTrackId !== this.getAudio
    },
    togglePlay(playingTrackId) {
      this.setAudio(playingTrackId)
    },
    actionClickHandler(oIndex) {
      this.removeAnswer(oIndex)
    },
    uploadFileDragenter(event) {
      if (this.toAbleToDragMedia && event?.dataTransfer?.types[0] === 'Files') {
        this.isDragModalOpen = true
      }
    },

    uploadFileDragleave(event) {
      if (!event.clientX && !event.clientY) {
        this.isDragModalOpen = false
      }
    },
    uploadFileDrop(event) {
      event.preventDefault()

      if (this.toAbleToDragMedia) {
        this.fileFromDrop = event.dataTransfer
        this.isDragModalOpen = false
      }
    },

    stringWithoutTags(string) {
      if (string) {
        const regex = /( |<([^>]+)>)/gi
        return string.replace(regex, '')
      }
    },

    isUniqueValue() {
      const allValues = []
      this.answers.forEach((el) => {
        allValues.push(this.stringWithoutTags(el.value))
      })
    },

    addImage(e, index) {
      this.answers[index].original_file_id = e.id
      this.answers[index].url = e.url
      this.fileFromDrop = null
    },

    addAudio(e, oIndex) {
      this.answers[oIndex].original_file_id = e.id
      this.answers[oIndex].url = e.url
      this.fileFromDrop = null
    },
    updateQuestion(payload) {
      this.$emit('update-question', payload)
    },

    updateQuestionName() {
      this.$emit('update-question', {
        name: this.questionText,
      })
    },

    removeAnswer(index) {
      if (this.answers.length > 2) {
        this.answers.splice(index, 1)
      }
    },

    clearFile(ref, option) {
      if (ref) {
        ref.clearFile()
      }

      option.original_file_id = ''
      option.value = ''
      option.url = ''
    },
  },
}
