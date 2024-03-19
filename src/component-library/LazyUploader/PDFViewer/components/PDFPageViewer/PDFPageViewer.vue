<template lang="pug">
.pdf-page-viewer.pdf-page-viewer_wrapper
  canvas.page-renderer#page-renderer(ref="page_renderer" v-bind="canvas_attrs")
</template>

<script>
export default {
  name: 'PDFPageViewer',
  props: {
    page: {
      type: Object,
      required: true,
    },
    scale: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      viewport: null,
      render_task: null,
    }
  },
  computed: {
    actualSizeViewport() {
      return this.viewport.clone({ scale: this.scale })
    },
    canvas_style() {
      const { width: actualWidth, height: actualHeight } = this.actualSizeViewport
      // const [pixelWidth, pixelHeight] = [actualWidth, actualHeight].map(dim => Math.ceil(dim/(window.devicePixelRatio || 1)))
      return this.scale === 1 ? 'height: 100%; width: 100%;' : `width: ${actualWidth}px; height: ${actualHeight}px;`
    },
    canvas_attrs() {
      const { width, height } = this.actualSizeViewport
      const style = this.canvas_style

      return {
        height,
        width,
        style,
      }
    },
  },
  watch: {
    scale: {
      handler(nv, ov) {
        this.renderPage()
      },
    },
    page: {
      handler(nP, oP) {
        this.destroyPage(oP)
        this.renderPage()
      },
    },
  },
  methods: {
    renderPage() {
      this.viewport = this.page.getViewport({ scale: this.scale })
      const canvasContext = this.$refs.page_renderer.getContext('2d')
      const renderContext = { canvasContext, viewport: this.viewport }

      if (this.render_task) this.render_task.cancel()

      this.render_task = this.page.render(renderContext)

      this.render_task.promise
        .then(() => {
          this.$emit('page-rendered', this.page.pageNumber)
        })
        .catch((error) => {
          this.$emit('page-render-error', error)
        })
    },
    destroyPage(page) {
      if (page) page._destroy()
    },
  },
  beforeDestroy() {
    if (this.page) this.page._destroy()
  },
  created() {
    this.viewport = this.page.getViewport({ scale: this.scale })
  },
  mounted() {
    this.renderPage()
  },
}
</script>

<style lang="scss" scoped>
.pdf-page-viewer {
  &_wrapper {
    display: flex;
    height: 100%;
    width: 100%;

    overflow: auto;
    @include scroll();

    .page-renderer {
      object-fit: contain;
      height: 100%;
      width: 100%;
      border-radius: 8px;
      border: 1.7478px solid #d3d8e3;
    }

    @media (max-width: 743px) {
      border: none;
      border-radius: 0;
      &::-webkit-scrollbar {
        display: none;
      }
      -ms-overflow-style: none;
      scrollbar-width: none;

      .page-renderer {
        border: none;
      }
    }
  }
}
</style>
