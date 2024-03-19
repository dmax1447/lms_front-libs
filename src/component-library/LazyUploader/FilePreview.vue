<template>
  <div class="file-preview" :style="{width: sizes.width, height: sizes.height}">
    <svg :width="sizes.width" :height="sizes.height">
      <use :xlink:href="`#${this.getFileExtension}`" />
    </svg>
    <!--    <img v-else-if="isImageFile" :style="sizesWithPixels" :src="fileSrc" alt="" />-->
    <!--    <svg v-else :width="sizes.width" :height="sizes.height" viewBox="0 0 80 80">-->
    <!--      <use :xlink:href="hrefToSvg" />-->
    <!--    </svg>-->
    <div class="hover-overlay">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="eye-icon">
        <path
          d="M14.122 9.88C15.293 11.051 15.293 12.952 14.122 14.125C12.951 15.296 11.05 15.296 9.877 14.125C8.706 12.954 8.706 11.053 9.877 9.88C11.05 8.707 12.95 8.707 14.122 9.88Z"
          stroke="#FFF"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M3 12C3 11.341 3.152 10.689 3.446 10.088C4.961 6.991 8.309 5 12 5C15.691 5 19.039 6.991 20.554 10.088C20.848 10.689 21 11.341 21 12C21 12.659 20.848 13.311 20.554 13.912C19.039 17.009 15.691 19 12 19C8.309 19 4.961 17.009 3.446 13.912C3.152 13.311 3 12.659 3 12Z"
          stroke="#FFF"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>

</template>


<script>
export default {
  name: 'FilePreview',
  props: {
    file: {
      type: [Blob, Object],
      default: () => ({}),
    },
    existingIconFormats: {
      type: Array,
      default: () => [
        'doc',
        'docx',
        'txt',
        'rtf',
        'pdf',
        'odt',
        'html',
        'pptx',
        'ppt',
        'odp',
        'xls',
        'xlsx',
        'tif',
        'tiff',
        'psd',
        'apng',
        'gif',
        'ico',
        'cur',
        'jpg',
        'jpeg',
        'pjpeg',
        'pjp',
        'png',
        'svg',
        'webp',
        'bmp',
      ],
    },
    imageFormats: {
      type: Array,
      default: () => ['apng', 'gif', 'ico', 'cur', 'jpg', 'jpeg', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp'],
    },
    sizes: {
      type: Object,
      default: () => ({
        width: 80,
        height: 81,
      }),
    },
  },
  data() {
    return {}
  },
  computed: {
    getFileExtension() {
      return this.file?.name.slice(((this.file?.name.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
    },
    isIconFileExist() {
      const fileExtension = this.getFileExtension
      return this.existingIconFormats.includes(fileExtension)
    },
    isImageFile() {
      const fileExtension = this.getFileExtension
      return this.imageFormats.includes(fileExtension)
    },
    hrefToSvg() {
      if (this.isIconFileExist) {
        return `#${this.getFileExtension}`
      }
      return `#unknown`
    },
  },
}
</script>

<style scoped lang="scss">
.file-preview {
  border-radius: 4px;
  position: relative;
  cursor: default;
  overflow: hidden;

  img {
    background-size: contain;
  }

  &:hover {
    .hover-overlay {
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.5);
      cursor: pointer;
      //.eye-icon {
      //  width: 100%;
      //  height: 100%;
      //}
    }
  }
}
.hover-overlay {
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
