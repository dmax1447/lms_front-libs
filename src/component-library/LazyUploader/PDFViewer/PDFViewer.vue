<template lang="pug">
.pdf-viewer.pdf-viewer_wrapper
  .pdf-viewer_header
    .file-info
      .file-info--title {{ file_name }}
      .file-info--size {{ file_size }}
      .file-info--actions
        .actions-btn.download-btn
          svg(
            width="24"
            height="24" viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            @click="onDownloadClick")
            path(
              d="M12 3V17M12 17L9 14M12 17L15 14M8 10H5C3.895 10 3 10.895 3 12V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V12C21 10.895 20.105 10 19 10H16"
              stroke="#707C8C"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round")
        .actions-btn.remove-btn(v-if="removable")
          svg(
            width="24"
            height="24" viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            @click="onRemoveClick")
            path(
              d="M18.5 6.5V19C18.5 19.5304 18.2893 20.0391 17.9142 20.4142C17.5391 20.7893 17.0304 21 16.5 21H7.5C6.96957 21 6.46086 20.7893 6.08579 20.4142C5.71071 20.0391 5.5 19.5304 5.5 19V6.5M9 17H15M9 13H15M8.5 6.5V4.5C8.5 4.10218 8.65804 3.72064 8.93934 3.43934C9.22064 3.15804 9.60218 3 10 3H14C14.3978 3 14.7794 3.15804 15.0607 3.43934C15.342 3.72064 15.5 4.10218 15.5 4.5V6.5M20 6.5H4"
              stroke="#707C8C"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round")
  .pdf-viewer_body
    .arrows.arrow_left.arrows_left-container
      slot(name="arrow_left")
        .arrow(v-if="current_page > 1" @click.stop="onLeftArrowClick")
          svg(width="24", height="24", viewBox="0 0 24 24", fill="none", xmlns="http://www.w3.org/2000/svg")
            g(clip-path="url(#clip0_6793_111685)")
              path(d="M16.495 21L7.5 11.973L16.5 3", stroke="currentColor", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round")
            defs
              clippath(id="clip0_6793_111685")
                rect(width="24", height="24", fill="white", transform="matrix(-1 0 0 -1 24 24)")
    .page-view-container(ref="page-view-container")
      .splider-container(v-if="loaded")
        Splide(
          ref="page-carousel"
          :has-slider-wrapper="true"
          :options="splide_options"
          :slides="docs"
          @splide:active="onSplideActive"
          @splide:move="onSlideMove"
        )
          template(v-for="(doc, index) in docs")
            template(v-if="getFileExtension(doc.name) === 'pdf'")
              SplideSlide(v-for="(page, page_index) in doc.attachments" :key="`${index}-${page_index}`" :data-slide-index="`${index}-${page_index}`" :style="{height: $refs['page-view-container'].clientHeight}")
                PDFPageViewer(
                  :page="page"
                  :scale="page.scale"
                  @page-rendered="onPageRendered"
                  @page-render-error="onPageRenderError"
                )
            template(v-else-if="imageFormats.includes(getFileExtension(doc.name))")
              SplideSlide(:key="index" :data-slide-index="index")
                .zoomer-container(style="width:100%;height:100%")
                  VZoomer.page-zoomer(
                    :ref="`img-zoomer-${index}`"
                    aspect-retio="1"
                    :double-click-to-zoom="false"
                    :zoomed.sync="zoomed"
                    :max-scale="10")
                      img( ref="image-viewer" loading="lazy" :src="doc.src" @load="onImageLoad(`img-zoomer-${index}`)")
            template(v-else)
              SplideSlide(:key="index" :data-slide-index="index")
                .plug
                  img.plug__icon(src="@/assets/images/bad-format.svg")
                  .plug__text К сожалению, просмотр некоторых форматов в данный момент недоступен. Вы можете скачать файл, чтобы просмотреть его содержимое.
      .preloader-container(v-if="!loaded")
        SPreloader
    .arrows.arrow_right.arrows_right-container
      slot(name="arrow_right")
        .arrow(v-if="current_page < total_pages" @click.stop="onRightArrowClick")
          svg(width="24", height="24", viewBox="0 0 24 24", fill="none", xmlns="http://www.w3.org/2000/svg")
            g(clip-path="url(#clip0_6793_111683)")
              path(d="M7.505 3L16.5 12.027L7.5 21", stroke="currentColor", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round")
            defs
              clippath(id="clip0_6793_111683")
                rect(width="24", height="24", fill="white")
  .pdf-viewer_footer
    slot(name="footer")
      .actions
        .download(@click="onDownloadClick")
            svg.download--icon(
              width="24" height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg")
              path(
                d="M12 3V17M12 17L9 14M12 17L15 14M8 10H5C3.895 10 3 10.895 3 12V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V12C21 10.895 20.105 10 19 10H16"
                stroke="#fff"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round")
            .download--title Скачать
        .zoom
          span.zoom-label Увеличение
          svg.zoom-in(@click="onZoomIn", width="28", height="28", viewBox="0 0 28 28", fill="none", xmlns="http://www.w3.org/2000/svg")
            g(clip-path="url(#clip0_7637_136940)")
              path(d="M20.9993 3.79297H6.99935C5.22694 3.79297 3.79102 5.22889 3.79102 7.0013V21.0013C3.79102 22.7737 5.22694 24.2096 6.99935 24.2096H20.9993C22.7717 24.2096 24.2077 22.7737 24.2077 21.0013V7.0013C24.2077 5.22889 22.7717 3.79297 20.9993 3.79297ZM6.99935 5.54297H20.9993C21.8053 5.54297 22.4577 6.19538 22.4577 7.0013V21.0013C22.4577 21.8072 21.8053 22.4596 20.9993 22.4596H6.99935C6.19343 22.4596 5.54102 21.8072 5.54102 21.0013V7.0013C5.54102 6.19538 6.19343 5.54297 6.99935 5.54297Z", fill="white")
              path(d="M14 8.45703C14.443 8.45703 14.8091 8.78621 14.8671 9.2133L14.875 9.33203V18.6654C14.875 19.1486 14.4832 19.5404 14 19.5404C13.557 19.5404 13.1909 19.2111 13.1329 18.7841L13.125 18.6654V9.33203C13.125 8.84879 13.5168 8.45703 14 8.45703Z", fill="white")
              path(d="M18.6673 13.125C19.1506 13.125 19.5423 13.5168 19.5423 14C19.5423 14.443 19.2131 14.8091 18.7861 14.8671L18.6673 14.875H9.33398C8.85074 14.875 8.45898 14.4832 8.45898 14C8.45898 13.557 8.78816 13.1909 9.21525 13.1329L9.33398 13.125H18.6673Z", fill="white")
            defs
              clippath(id="clip0_7637_136940")
                rect(width="28", height="28", fill="currentColor")
          svg.zoom-out(@click="onZoomOut", width="28", height="28", viewBox="0 0 28 28", fill="none", xmlns="http://www.w3.org/2000/svg")
            g(clip-path="url(#clip0_7637_136939)")
              path(d="M20.9994 23.3346H6.99935C5.71018 23.3346 4.66602 22.2905 4.66602 21.0013V7.0013C4.66602 5.71214 5.71018 4.66797 6.99935 4.66797H20.9994C22.2885 4.66797 23.3327 5.71214 23.3327 7.0013V21.0013C23.3327 22.2905 22.2885 23.3346 20.9994 23.3346Z", stroke="white", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round")
              path(d="M18.6673 14H9.33398", stroke="white", stroke-width="1.5", stroke-linecap="round", stroke-linejoin="round")
            defs
              clippath(id="clip0_7637_136939")
                rect(width="28", height="28", fill="white")
        .pages(:class='{padding: !removable}') {{ current_page }}/{{ total_pages }}
        .delete(v-if="removable" @click="onRemoveClick")
          svg.delete--icon(
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg")
            path(
              d="M18.5 6.5V19C18.5 19.5304 18.2893 20.0391 17.9142 20.4142C17.5391 20.7893 17.0304 21 16.5 21H7.5C6.96957 21 6.46086 20.7893 6.08579 20.4142C5.71071 20.0391 5.5 19.5304 5.5 19V6.5M9 17H15M9 13H15M8.5 6.5V4.5C8.5 4.10218 8.65804 3.72064 8.93934 3.43934C9.22064 3.15804 9.60218 3 10 3H14C14.3978 3 14.7794 3.15804 15.0607 3.43934C15.342 3.72064 15.5 4.10218 15.5 4.5V6.5M20 6.5H4"
              stroke="#fff"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round")
          .delete--title Удалить

</template>

<script>
import { Splide, SplideSlide } from '@splidejs/vue-splide'
import '@splidejs/splide/dist/css/splide.min.css'

import VueZoomer from 'vue-zoomer'

import * as pdfjs from 'pdfjs-dist/build/pdf.js'
import PDFPageViewer from './components/PDFPageViewer/PDFPageViewer.vue'
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry')
import { SPreloader } from '@synergy/lms-ui-kit'

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default {
  name: 'PDFViewer',
  components: {
    PDFPageViewer,
    VZoomer: VueZoomer.Zoomer,
    Splide,
    SplideSlide,
    SPreloader,
  },
  props: {
    files: {
      type: Array,
      required: false,
      default: () => [],
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
    removable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      pages: [],
      page: null,
      page_number: 0,
      pdfDocument: null,
      preloadedDocuments: {},
      current_page: 0,
      total_pages: 0,
      clientHeight: 0,
      doc_number: 0,
      scale: 1,
      loaded: false,
      file_name: '',
      file_size: '',
      zoomed: false,
      docs: [],
    }
  },
  computed: {
    // не используется
    defaultPageViewport() {
      return this.pdfDocument
    },
    // не используется
    isPortraitPageOrientation() {
      return true
    },
    // не используется
    is_pdf() {
      return !!this.current_document?.numPages
    },
    slide_number() {
      return [...this.docs].splice(0, this.fileIndex).reduce((acc, val) => {
        acc += val?.attachments?.length || 1
        return acc
      }, 0)
    },
    splide_options() {
      return {
        type: 'slide',
        width: '100%',
        start: this.slide_number,
        height: this.$refs?.['page-view-container']?.clientHeight,
        breakpoints: {
          744: {
            drag: true,
          },
        },
        perPage: 1,
        perMove: 1,
        pagination: false,
        arrows: false,
        drag: false,
        rewind: true,
      }
    },
  },
  watch: {
    files: {
      async handler(nv) {
        this.loaded = false
        this.docs = await this.preloadFiles(nv)
        this.loaded = true
      },
    },
  },
  methods: {
    getFileExtension(filename) {
      return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
    },
    async preloadFiles(files) {
      const docs = []
      try {
        for (const [index, file] of files.entries()) {
          const url = file.link || URL.createObjectURL(file)
          if (this.getFileExtension(file?.name) === 'pdf') {
            const preloaded_doc = await this.getPDFDocument(url)
            preloaded_doc.total_pages = preloaded_doc.numPages
            preloaded_doc.type = file.type
            preloaded_doc.src = url
            preloaded_doc.scale = 1
            preloaded_doc.size = file.size
            preloaded_doc.name = file.name
            preloaded_doc.attachments = await this.fetchDocumentPages(preloaded_doc)

            docs.push(preloaded_doc)
          } else {
            const preloaded_img = {
              type: file.type,
              name: file.name,
              total_pages: 1,
              size: file.size,
              src: url,
            }
            docs.push(preloaded_img)
          }
        }
        return docs
      } catch (e) {
        console.warn(e.message)
        return docs
      }
    },
    async getPDFDocument(url) {
      return await pdfjs.getDocument(url).promise
    },
    onSplideActive(splide) {
      this.updateInfo(splide)
    },
    setPreviousDocument() {
      return new Promise((resolve, reject) => {
        const [doc_index] = this.current_slide().slide.getAttribute('data-slide-index').split('-')
        if (doc_index > 0) {
          const slides = this.splide().Components.Elements.getSlides()
          const prev_doc = slides
            .filter((slide) => {
              const [index] = slide.slide.getAttribute('data-slide-index').split('-')
              return index < doc_index
            })
            .pop()
          this.$emit('file-index-changed', prev_doc.index)
        }
        resolve(doc_index)
      })
    },
    fetchDocumentPages(doc) {
      const _doc = doc || this.current_document
      return new Promise((resolve, reject) => {
        if (!_doc || !_doc?.numPages) resolve([])

        this.getPages(_doc, 1, _doc.numPages)
          .then((pages) => {
            const _pages = pages.map((item) => {
              item.scale = _doc.scale
              return item
            })
            resolve(_pages)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    getPages(pdfDoc, startPage = 0, endPage = 0) {
      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(pdfDoc.getPage(i))
      }
      return Promise.all(pages)
    },
    getFileSize(file) {
      const size = file?.size || 0
      return size >= 1e9
        ? (size / 1e9).toFixed(1) + ' ГБ'
        : size < 1e9 && size >= 1e6
          ? (size / 1e6).toFixed(1) + ' МБ'
          : (size / 1000).toFixed(0) + ' КБ'
    },
    onLeftArrowClick() {
      this.$refs['page-carousel'].go('<')
      this.$emit('file-index-changed', this.$refs['page-carousel'].index)
    },
    onRightArrowClick() {
      this.$refs['page-carousel'].go('>')
      this.$emit('file-index-changed', this.$refs['page-carousel'].index)
    },
    onResize() {
      if (this.$refs?.['page-carousel']?.splide?.options) {
        this.$refs['page-carousel'].splide.options = {
          height: `${this.$refs?.['page-view-container']?.clientHeight}px`,
        }
      }
    },
    onPageRendered(page_number) {
      this.$emit('page-rendered', page_number)
    },
    onPageRenderError(error) {
      this.$emit('page-rendered-error', error)
    },
    resetPageScale() {
      const slide = this.current_slide()
      const [doc_id, page_id] = slide.slide.getAttribute('data-slide-index').split('-')
      if (page_id) {
        const doc = this.docs[doc_id]
        const page = doc.attachments[page_id]
        page.scale !== 1 && (page.scale = 1)
      }
    },
    setPageScale(doc_id, page_id, zoom_in) {
      const doc = this.docs[doc_id]
      const page = doc.attachments[page_id]

      if (zoom_in && page.scale <= 10) {
        page.scale = page.scale + 0.25
      } else if (!zoom_in && page.scale > 1) {
        page.scale = page.scale - 0.25
      }
    },
    onZoomIn() {
      const slide = this.current_slide()
      const [doc_id, page_id] = slide.slide.getAttribute('data-slide-index').split('-')
      if (doc_id && page_id) {
        this.setPageScale(doc_id, page_id, true)
      } else {
        const _zoomer = this.$refs?.[`img-zoomer-${doc_id}`]?.[0] || null
        _zoomer && _zoomer.zoomIn()
        // this.$refs?.[`img-zoomer-${doc_id}`]?.zoomIn(0.5)
      }
    },
    onZoomOut() {
      const slide = this.current_slide()
      const [doc_id, page_id] = slide.slide.getAttribute('data-slide-index').split('-')
      if (doc_id && page_id) {
        this.setPageScale(doc_id, page_id, false)
      } else {
        const _zoomer = this.$refs?.[`img-zoomer-${doc_id}`]?.[0] || null
        _zoomer && _zoomer.zoomOut()
        // this.$refs?.[`img-zoomer-${doc_id}`]?.zoomOut(0.5)
      }
    },
    onSlideMove() {
      this.resetPageScale()
    },
    onDownloadClick() {
      try {
        const file = this.current_document()

        if (!file) return

        const base_uploader_anchor = document.createElement('a')

        base_uploader_anchor.href = file.src
        base_uploader_anchor.download = file.name

        document.body.appendChild(base_uploader_anchor)
        base_uploader_anchor.click()
        document.body.removeChild(base_uploader_anchor)
      } catch (error) {
        console.warn(error.message || error)
      }
    },
    onImageLoad(ref) {
      try {
        this.$refs[ref][0].onWindowResize()
      } catch (error) {
        console.warn(error.message)
      }
    },
    async onRemoveClick() {
      const del_doc_index = await this.setPreviousDocument()
      this.$emit('remove-file', del_doc_index)
    },
    splide() {
      return this.$refs?.['page-carousel']?.splide || null
    },
    current_slide() {
      const splide = this.splide()

      if (!splide) return null

      const id = splide.index
      return splide.Components.Elements.getSlide(id) || null
    },
    current_document() {
      const current_slide = this.current_slide()

      if (!current_slide) return null

      const [doc_index] = this.current_slide().slide.getAttribute('data-slide-index').split('-')
      return this.docs[doc_index]
    },
    updateInfo(splide) {
      const doc = this.current_document()
      this.file_name = doc?.name || null
      this.file_size = this.getFileSize(doc) || null
      this.total_pages = splide.length
      this.current_page = splide.index + 1
    },
  },
  async created() {
    this.docs = await this.preloadFiles(this.files)
    const doc = this.docs[this.fileIndex]
    this.file_name = doc?.name || ''
    this.file_size = this.getFileSize(doc)
    this.loaded = true
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    if (this.page) this.page._destroy()
    if (this.pdfDocument) this.pdfDocument.loadingTask.destroy()
    window.removeEventListener('resize', this.onResize)
  },
}
</script>

<style lang="scss" scoped>
.plug {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-top: 70px;
  &__icon {
    display: block;
    margin-bottom: 24px;
  }
  &__text {
    font-size: 16px;
    line-height: 22px;
    color: var(--color-text-primary);
    text-align: center;
    width: 400px;
  }
}
.pdf-viewer {
  position: relative;

  &_wrapper {
    display: flex;
    flex: 1 1 100%;
    overflow: hidden;
    flex-direction: column;
  }

  &_header {
    font-size: 16px;
    font-weight: 400;
    color: #0d1140;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 24px;
    padding: 0 40px;

    .file-info {
      display: flex;
      align-items: center;
      flex: 1 1 auto;
      overflow: hidden;

      &--title {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &--size {
        color: #6e708c;
      }

      &--actions {
        display: flex;
        height: 100%;
        align-items: center;
        .actions-btn {
          cursor: pointer;
          margin-left: 12px;
          margin-right: 12px;
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    @media (max-width: 743px) {
      padding: 0px 8px;
      margin-bottom: 17px;
      font-size: 15px;
      color: #6e708c;
      font-size: 14px;

      .actions-btn {
        display: none;
      }

      .file-info {
        &--size {
          font-size: 16px;
        }
      }
    }
  }

  &_body {
    display: flex;
    overflow: hidden;
    position: relative;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 0 40px;

    .page-view-container {
      width: 100%;
      height: 100%;

      .splider-container {
        width: 100%;
        height: calc(100%);
      }

      .preloader-container {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
      }

      .zoomer-container {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;

        .page-zoomer {
          width: 100%;
          height: 100%;
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 8px;
          }
        }
      }

      // img {
      //   max-width: 100%;
      //   max-height: 100%;
      //   align-self: center;
      //   border-radius: 8px;
      //   overflow: hidden;
      // }

      .image-viewer {
        border-radius: 8px;
        border: 1.7478px solid #d3d8e3;
        overflow: hidden;

        img {
          max-width: 100%;
          max-height: 100%;
        }
      }
    }

    .arrows {
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding: inherit;
      z-index: 2;

      &_left-container {
        left: 0;
      }

      &_right-container {
        right: 0;
      }

      .arrow {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 44px;
        height: 44px;
        border-radius: 100px;
        background-color: #f7f9fd;
        border: 1px solid #d3d8e3;
        cursor: pointer;

        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
      }
    }

    @media (max-width: 743px) {
      padding: 0 0;
    }
  }

  &_footer {
    display: flex;
    align-items: center;

    .actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding-left: 40px;
      padding-right: 40px;
      flex: 1 1 100%;
      background: #0d1140;
      color: #fff;
      font-size: 16px;
      font-weight: 400;

      .delete,
      .download {
        display: none;
      }

      .zoom {
        display: flex;
        justify-content: center;
        align-items: center;

        &-label {
          margin-right: 14px;
        }

        &-in,
        &-out {
          cursor: pointer;
          margin: 0 6px;
        }
      }

      @media (max-width: 743px) {
        padding: 8px 0;
        .zoom {
          display: none;
        }
        .delete,
        .download {
          display: flex;
          font-weight: 500;
          padding: 0 28px;
          &--icon {
            margin-right: 8px;
          }
        }
        .pages.padding {
          padding: 0 28px;
        }
      }
    }
  }
}
</style>
