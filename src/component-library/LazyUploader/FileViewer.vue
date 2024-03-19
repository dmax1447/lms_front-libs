<template lang="pug">
.file-viewer.file-viewer_wrapper
  .file-viewer_header
    .title {{ label }}
    .close-icon
      svg.icon(@click="onCloseClick", width="24", height="24", viewBox="0 0 24 24", fill="none", xmlns="http://www.w3.org/2000/svg")
        g(clip-path="url(#clip0_1555_25197)")
          path(d="M18 6.35645L6 18.3564M18 18.3564L6 6.35645", stroke="currentColor", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round")
        defs
          clippath(id="clip0_1555_25197")
            rect(width="24", height="24", fill="white")
  .file-viewer_info
  .file-viewer_pdf-container
    PDFViewer(:files="files" :image-formats="imageFormats" :file-index="fileIndex" :removable="removable" @remove-file="onRemoveFile" @file-index-changed="onFileIndexChange")
</template>

<script>
import PDFViewer from './PDFViewer/PDFViewer.vue'
export default {
  name: 'FileViewer',
  components:{
    PDFViewer
  },
  props: {
    files: {
      type: Array,
      required: true,
    },
    fileIndex: {
      type: Number,
      required: false,
      default: 0,
    },
    imageFormats: {
      type: Array,
      default: () => ['apng', 'gif', 'ico', 'cur', 'jpg', 'jpeg', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp'],
    },
    label: {
      type: String,
      required: false,
      default: 'Договор',
    },
    removable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {}
  },
  computed: {},
  methods: {
    onCloseClick() {
      this.$emit('hide-dialog')
    },
    onRemoveFile(index) {
      this.$emit('remove-file', index)
    },
    onFileIndexChange(index) {
      this.$emit('file-index-changed', index)
    },
  },
  async created() {
    try {
      const orientation_lock_answer = await screen.orientation.lock('portrait')
    } catch (error) {
      console.warn(error)
    }
  },
  beforeDestroy() {},
}
</script>

<style lang="scss" scoped>
.file-viewer {
  max-height: 800px;
  max-width: 800px;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;

  &_wrapper {
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;
    background-color: #fff;
  }

  &_header {
    display: flex;
    justify-content: space-between;
    font-size: 24px;
    font-weight: 500;
    max-width: 100%;
    padding: 24px 40px 0 40px;
    margin-bottom: 24px;

    @media (max-width: 743px) {
      padding: 24px 8px 0 8px;
      margin-bottom: 17px;
      font-size: 20px;
    }

    .close-icon {
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        cursor: pointer;
      }
    }
  }

  &_footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    background-color: #0d1140;
    font-size: 16px;
    padding-left: 40px;
    padding-right: 40px;
    font-weight: 400;
    max-width: 100%;
    color: #fff;
  }

  &_pdf-container {
    display: flex;
    flex: 1 1 100%;
    overflow: hidden;
  }

  @media (max-width: 743px) {
    max-height: 100%;
    border-radius: 0;
  }
}
</style>
