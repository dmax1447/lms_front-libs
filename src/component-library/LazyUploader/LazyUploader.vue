<template>
  <div class="base-uploader" @dragover.prevent @drop.prevent @submit.prevent>
    <p v-if="label" class="label">{{ label }}</p>
    <slot name="fileViewer" v-bind="this">
      <div v-if="files.length" class="uploader-file-viewer">
        <template v-if="!isPreviewMode">
          <div v-if="left_arrow_visibility" class="uploader-file-viewer__arrow uploader-file-viewer__arrow--left">
            <div class="arrow" @click.stop="onLeftArrowClick">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_6793_111685)">
                  <path
                    d="M16.495 21L7.5 11.973L16.5 3"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6793_111685">
                    <rect width="24" height="24" fill="white" transform="matrix(-1 0 0 -1 24 24)" />
                  </clipPath>
                </defs>
              </svg>
              <!--              <BaseIcon name="arrow_big_left"></BaseIcon>-->
            </div>
          </div>

          <div ref="files-scrollable-view" class="uploader-file-viewer__files">
            <Splide
              ref="carousel"
              class="carousel"
              :options="splideOptions"
              @splide:moved="refreshSpliderAfterMove"
              @splide:click="refreshSpliderAfterMove"
            >
              <SplideSlide v-if="desktop_preview" class="carousel-slide__btn" style="width: 39px; height: 80px">
                <div class="carousel-slide__btn--add" @click="onChooseFileClick">
                  <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6.90037 1.40395C8.10563 0.198685 10.0595 0.198685 11.2648 1.40395C12.4324 2.57155 12.4689 4.44173 11.3742 5.65324L11.2648 5.76837L6.44343 10.5897C5.6975 11.3356 4.48761 11.3356 3.74168 10.5897C3.02559 9.87363 2.99695 8.7299 3.65575 7.97963L3.74168 7.88797L7.39903 4.23061C7.5943 4.03535 7.91083 4.03535 8.1061 4.23061C8.28363 4.40812 8.29977 4.6859 8.1545 4.88164L8.1061 4.93772L4.44879 8.59503C4.09338 8.95043 4.09338 9.52723 4.44879 9.88263C4.7805 10.2143 5.30503 10.2364 5.66243 9.94897L5.73637 9.88263L10.5577 5.06128C11.3724 4.24654 11.3724 2.92579 10.5577 2.11105C9.7743 1.32765 8.52303 1.29752 7.70363 2.02066L7.60743 2.11105L2.78612 6.93236C1.51205 8.20643 1.51205 10.2712 2.78612 11.5453C4.02158 12.7808 6.0005 12.8182 7.28103 11.6576L7.39903 11.5453L10.325 8.6193C10.5203 8.42403 10.8368 8.42403 11.0321 8.6193C11.2096 8.79677 11.2258 9.07456 11.0805 9.2703L11.0321 9.32637L8.1061 12.2524C6.4415 13.917 3.74361 13.917 2.07901 12.2524C0.455019 10.6284 0.415406 8.02083 1.96019 6.3489L2.07901 6.2253L6.90037 1.40395Z"
                      fill="#fff"
                    />
                  </svg>
                  <!--                  <BaseIcon name="clip_attachment" color="white" size="tn"></BaseIcon>-->
                </div>
              </SplideSlide>

              <template v-for="(file, index) in files">
                <SplideSlide :key="`${file.name}-${index}`" style="width: 80px">
                  <div class="uploader-file-viewer__files--file">
                    <FilePreview
                      :file="file"
                      :sizes="{
                        height: 80,
                        width: 80,
                      }"
                      @click.native="onFileClick(file, index)"
                    />
                    <div class="file-trash">
                      <svg
                        @click="onRemoveIconClick(index)"
                        class="trash-icon"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.5 6.5V19C18.5 19.5304 18.2893 20.0391 17.9142 20.4142C17.5391 20.7893 17.0304 21 16.5 21H7.5C6.96957 21 6.46086 20.7893 6.08579 20.4142C5.71071 20.0391 5.5 19.5304 5.5 19V6.5M9 17H15M9 13H15M8.5 6.5V4.5C8.5 4.10218 8.65804 3.72064 8.93934 3.43934C9.22064 3.15804 9.60218 3 10 3H14C14.3978 3 14.7794 3.15804 15.0607 3.43934C15.342 3.72064 15.5 4.10218 15.5 4.5V6.5M20 6.5H4"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <!--                      <BaseIcon class="trash-icon" name="trash" @click="onRemoveIconClick(index)"></BaseIcon>-->
                    </div>
                  </div>
                </SplideSlide>
              </template>
            </Splide>
          </div>

          <div v-if="right_arrow_visibility" class="uploader-file-viewer__arrow uploader-file-viewer__arrow--right">
            <div class="arrow" @click.stop="onRightArrowClick">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_6793_111683)">
                  <path
                    d="M7.505 3L16.5 12.027L7.5 21"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6793_111683">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <!--              <BaseIcon name="arrow_big_right"></BaseIcon>-->
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="files.length" class="files__list">
            <div v-for="(file, index) in files" :key="`${file.name}-${index}`" class="file">
              <FilePreview
                :file="file"
                :sizes="{
                  height: 48,
                  width: 48,
                }"
                @click.native="onFileClick(file, index)"
              />
              <div class="file__description">
                <div class="file__description-name">{{ file.name }}</div>
                <div class="file__description-size">{{ formatFileSize(file.size) }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </slot>

    <slot name="dragNdrop" v-bind="this">
      <div
        v-if="!isPreviewMode && (!desktop_preview || (desktop_preview && files.length <= 0))"
        class="drag-n-drop-area"
        @drop.prevent="onDrop"
      >
        <div class="drag-n-drop-area--header">
          <div class="cloud-icon">
            <svg
              class="cloud-icon__component"
              width="121"
              height="121"
              viewBox="0 0 121 121"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_8231_10417)">
                <path
                  d="M32.12 45.84C19.925 47.505 10.5 57.85 10.5 70.5C10.5 84.305 21.695 95.5 35.5 95.5H90.5C101.545 95.5 110.5 86.545 110.5 75.5C110.5 64.455 101.545 55.5 90.5 55.5C90.5 38.93 77.07 25.5 60.5 25.5C47.315 25.5 36.145 34.015 32.12 45.84Z"
                  stroke="#9EA0B3"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M49.665 63.835L60.5 53L71.335 63.835"
                  stroke="#9EA0B3"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M60.5 78V53"
                  stroke="#9EA0B3"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_8231_10417">
                  <rect width="120" height="120" fill="white" transform="translate(0.5 0.5)" />
                </clipPath>
              </defs>
            </svg>
            <!--            <BaseIcon class="cloud-icon__component" size="full" name="loud-storage-upload-2"></BaseIcon>-->
          </div>
        </div>

        <div class="drag-n-drop-area--errors">
          <slot name="dragNdropErrors" v-bind="this"></slot>
        </div>
        <div class="drag-n-drop-area--body">
          <div class="title">Перетащите файл или выберите на компьютере</div>
          <div class="description" v-text="description"></div>
        </div>
        <SButton variant="secondary" size="small" @click="onChooseFileClick"> Выбрать файл </SButton>
      </div>
    </slot>

    <div v-if="uploader_modal_dialog_visibility" class="uploader-modal-dialog">
      <FileViewer
        :label="viewerTitle"
        :files="files"
        :removable="!isPreviewMode"
        :file-index="fileIndex"
        :image-formats="imageFormats"
        @hide-dialog="onHideModalDialog"
        @remove-file="onRemoveIconClick"
        @file-index-changed="onFileIndexChange"
      ></FileViewer>
    </div>

    <input
      v-show="false"
      :id="id"
      ref="base-uploader-input"
      type="file"
      class="file-input__control"
      :name="name"
      :accept="accept"
      :multiple="multiple"
      @change="onChange($event)"
    />
    <FilePlugSprite/>
  </div>
</template>

<script>
import { Splide, SplideSlide } from '@splidejs/vue-splide'
import '@splidejs/splide/dist/css/splide.min.css'
import FileViewer from './FileViewer.vue'
import { SButton } from '@synergy/lms-ui-kit'
import FilePreview from './FilePreview.vue'
import FilePlugSprite from "./FilePlugSprite.vue";

export default {
  name: 'LazyUploader',
  components: {
    Splide,
    SplideSlide,
    FileViewer,
    SButton,
    FilePreview,
    FilePlugSprite
  },
  model: {
    prop: 'files',
    event: 'change',
  },
  props: {
    files: {
      type: Array,
      default: () => [],
      required: true,
    },
    isPreviewMode: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
    viewerTitle: {
      type: String,
      default: 'Договор',
    },
    label: {
      type: String,
      default: '',
      required: false,
    },
    name: {
      type: String,
      default: '',
      required: false,
    },
    accept: {
      type: String,
      default: '.jpeg,.jpg,.png,.pdf',
      required: false,
    },
    // не используется
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    removable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      imageFormats: ['apng', 'gif', 'ico', 'cur', 'jpg', 'jpeg', 'pjpeg', 'pjp', 'png', 'svg', 'webp', 'bmp'],
      // plugIconFormats: ['doc', 'docx', 'txt', 'rtf', 'pdf', 'odt', 'html', 'pptx', 'ppt', 'odp', 'xls', 'xlsx'],
      // не используется
      // fileName: '',
      // choose_file_dialog_visibility: false,
      // split_index: 0,
      // formattedSize: '',

      fileIndex: 0,
      desktop_preview: true,
      left_arrow_visibility: true,
      right_arrow_visibility: true,
      uploader_modal_dialog_visibility: false,
      id: '',
      splideOptions: {
        type: 'slide',
        width: '100%',
        autoWidth: true,
        perMove: 1,
        pagination: false,
        arrows: false,
        drag: false,
        breakpoints: {
          744: {
            drag: true,
          },
        },
        rewind: true,
        gap: '8px',
      },
    }
  },
  computed: {
    // TODO: оставить этот код, если потребуется в зависимости от формата смотреть или скачивать файл
    // viewerFormats() {
    //   return [...this.imageFormats, 'pdf']
    // },
    // filesViewerFormats() {
    //   return this.files.filter((item) => this.viewerFormats.includes(this.getFileExtension(item.name)))
    // },
  },
  watch: {
    files: {
      handler(nv) {
        if (!this.$refs['base-uploader-input']) {
          return
        }
        const fileItems = nv.filter((v) => v instanceof File)

        if (fileItems.length) {
          this.$refs['base-uploader-input'].files = this.FileList(fileItems)
        } else {
          this.$refs['base-uploader-input'].value = null
        }
      },
      //   filesViewerFormats(value) {
      //     if (!value.length) {
      //       this.onHideModalDialog()
      //     }
      //   },
    },
  },
  methods: {
    getFileExtension(filename) {
      return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
    },
    FileList(files) {
      const dt = new DataTransfer()
      for (const file of files) {
        dt.items.add(file)
      }
      return dt.files
    },
    fetchFiles(files) {
      return new Promise((resolve, reject) => {
        const _files = []

        for (const file of files) {
          _files.push(
            fetch(files.link, { credentials: 'include' })
              .then((res) => res.blob())
              .then((blob) => new File([blob], file.name)),
          )
        }

        Promise.all(_files).then((files) => {
          resolve(files)
        })
      })
    },
    formatFileSize(size) {
      return size >= 1e9
        ? (size / 1e9).toFixed(1) + ' ГБ'
        : size < 1e9 && size >= 1e6
          ? (size / 1e6).toFixed(1) + ' МБ'
          : (size / 1000).toFixed() + ' КБ'
    },
    onChange(event) {
      const res = this.multiple
        ? [...this.files, ...this.$refs['base-uploader-input'].files]
        : [...this.$refs['base-uploader-input'].files]
      this.$emit('change', res)

      this.refreshAndRemount()
      this.setArrowsVisibility()
    },
    onFileIndexChange(index) {
      this.fileIndex = index
    },
    refreshAndRemount() {
      this.$refs?.carousel?.splide?.refresh?.()
      this.$refs?.carousel?.remount?.()
    },
    onChooseFileClick() {
      this.$refs['base-uploader-input'].click()
    },
    onDrop(event) {
      if (!this.multiple && event?.dataTransfer?.files?.length > 1) return
      // ничего не меняется
      // this.choose_file_dialog_visibility = false

      const res = [
        ...Array.from(event.dataTransfer.files).filter((item) =>
          this.accept.split(',').includes(`.${this.getFileExtension(item.name)}`),
        ),
      ]
      this.$emit('change', this.multiple ? [...this.files, ...res] : [res[0]])
    },
    onHideModalDialog() {
      this.uploader_modal_dialog_visibility = false
    },
    async onDownloadClick(file) {
      try {
        if (!file) return
        let _blob
        if (file.link)
          _blob = await fetch(file?.link, {
            method: 'get',
            referrerPolicy: 'no-referrer',
          })
        file.link
          ? (_blob = await fetch(file?.link, {
              method: 'get',
              referrerPolicy: 'no-referrer',
            }))
          : (_blob = file)

        const href = URL.createObjectURL(_blob)
        const base_uploader_anchor = document.createElement('a')
        base_uploader_anchor.setAttribute('target', '_blank')
        base_uploader_anchor.setAttribute('download', file.name)
        base_uploader_anchor.href = href
        base_uploader_anchor.click()
        URL.revokeObjectURL(href)
      } catch (error) {
        console.warn(error.message || error)
      }
    },
    refreshSpliderAfterMove(splide) {
      splide.refresh()
    },
    onRemoveIconClick(index) {
      const _files = [...this.files]
      _files.splice(index, 1)
      this.$emit('file-removed', index)
      this.onFilesChanged(_files)
    },
    onFilesChanged(files) {
      this.$emit('change', files)
      this.refreshAndRemount()
      if (!files.length) this.uploader_modal_dialog_visibility = false
    },
    onFileClick(file, index) {
      this.$emit('file-click', { file, index })
      this.fileIndex = index
      this.uploader_modal_dialog_visibility = true
    },
    onResize() {
      if (window.innerWidth < 744) {
        this.desktop_preview = true
      } else {
        this.desktop_preview = false
      }
    },
    setArrowsVisibility() {
      this.right_arrow_visibility = this.$refs?.carousel?.index + 7 < this.$refs?.carousel?.length || false
      this.left_arrow_visibility = this.$refs?.carousel?.index > 0 || false
    },
    onRightArrowClick() {
      this.$refs.carousel.go('>')
      this.$refs.carousel.splide.refresh()
      this.setArrowsVisibility()
    },
    onLeftArrowClick() {
      this.$refs.carousel.go('<')
      this.$refs.carousel.splide.refresh()
      this.setArrowsVisibility()
    },
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },
  created() {
    this.id = `base-uploader_${Date.now().toString()}`
  },
  updated() {
    this.setArrowsVisibility()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
}
</script>

<style lang="scss" scoped>
.invalid,
.failed {
  color: var(--color-text-accent);
}
.base-uploader {
  width: 100%;
  //width: 672px;
  display: flex;
  flex-direction: column;
  background-color: transparent;

  .drag-n-drop-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px var(--stroke-cards) dashed;
    border-radius: 8px;
    padding: 16px 32px 32px;
    background-color: var(--color-bg-primary);
    font-size: 14px;
    &--header {
      margin-bottom: 4px;
      .cloud-icon {
        display: flex;
        margin-bottom: 8px;
        &__component {
          height: 100px;
          width: 100px;
        }
      }
      @media (max-width: 743px) {
        display: none;
      }
    }
    &--errors {
      font-size: 14px;
      line-height: 20px;
      color: var(--color-text-accent);
      margin-bottom: 8px;
    }
    &--body {
      margin-bottom: 16px;
      text-align: center;
      .title {
        font-size: 14px;
        line-height: 20px;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
        @media (max-width: 743px) {
          font-size: 12px;
          line-height: 16px;
        }
      }
      .description {
        font-size: 12px;
        line-height: 16px;
        color: var(--color-text-secondary);
      }
    }
  }

  &-input {
    &__wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      cursor: pointer;

      &--icon {
        flex: 0 0 auto;
        margin-right: 12px;
      }
    }
  }

  .uploader-file-viewer {
    display: flex;
    position: relative;
    margin-bottom: 12px;
    width: 100%;
    overflow: hidden;

    .file {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      gap: 12px;
      &__description {
        &-name {
          color: var(--color-text-primary);
          font-size: 16px;
          line-height: 22px;
        }
        &-size {
          color: var(--color-text-secondary);
          font-size: 14px;
          line-height: 20px;
        }
      }
    }

    &__arrow {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding-bottom: 24px;

      &--left {
        width: 52px;
        margin-right: 12px;
        align-items: flex-start;
      }

      &--right {
        width: 52px;
        margin-left: 12px;
        align-items: flex-end;
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

    &__files {
      width: 100%;
      position: relative;
      overflow: scroll;

      .splide__track .splide__list {
        .carousel-slide__btn {
          // display: none;
          &--add {
            background: var(--color-icon-primary);
            border-radius: 4px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      &::-webkit-scrollbar {
        display: none;
      }
      -ms-overflow-style: none;
      scrollbar-width: none;

      &--file {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 8px;

        .file-trash {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 24px;

          .trash-icon {
            display: none;
          }
        }

        .file-info {
          display: flex;
          align-items: center;
          flex: 1;
          width: calc(100% - 48px - 12px);

          &__description {
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            overflow: hidden;

            &--title {
              font-weight: 400;
              flex: 1;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

            &--subtitle {
              flex: 1;
              color: #707c8c;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }

          &__properties {
            flex: 0 0 auto;
            display: flex;

            &--size {
              display: flex;
              justify-content: center;
              align-items: center;
              color: #707c8c;
            }
          }

          &__actions {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            flex-direction: row;
            gap: 12px;

            .base-uploader-download-btn,
            .base-uploader-delete-btn {
              cursor: pointer;
            }
          }

          @media (max-width: 375px) {
            flex-wrap: wrap;
            justify-content: space-between;

            &__description {
              flex: 1 0 100%;

              &--title {
                font-size: 14px;
              }

              &--subtitle {
                font-size: 12px;
              }
            }

            &__properties {
              &--size {
                font-size: 12px;
              }
            }
          }

          @media (min-width: 376px) {
            &__description {
              &--title {
                font-size: 16px;
              }

              &--subtitle {
                font-size: 14px;
              }
            }

            &__properties {
              padding: 0 12px;
              &--size {
                font-size: 16px;
              }
            }
          }
        }

        &:hover {
          .file-trash {
            cursor: pointer;
            .trash-icon {
              display: block;
            }
          }

          .file-view {
            cursor: default;

            &--hover {
              display: flex;
              position: absolute;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;

              .eye-icon {
                cursor: pointer;
              }
            }
          }

          @media (max-width: 743px) {
            .file-view {
              cursor: pointer;
              &--hover {
                display: none;
              }
            }
          }
        }

        @media (max-width: 743px) {
          .file-trash {
            display: none;
          }
        }
      }
    }

    @media (max-width: 743px) {
      &__arrow {
        display: none;
      }

      &__files {
        display: flex;

        // .splide__track .splide__list {
        //   .carousel-slide__btn {
        //     display: list-item;

        //     &--add {
        //       background: #fee1e1;
        //       border-radius: 4px;
        //       height: calc(100% - 8px);
        //       display: flex;
        //       justify-content: center;
        //       align-items: center;
        //     }
        //   }
        // }
      }
    }

    // @media (min-width: 376px) {
    //   &__arrow {
    //     display: flex;
    //     flex-direction: column;
    //     justify-content: center;
    //     height: 100%;

    //     &--left {
    //       position: absolute;
    //       margin-left: 0;
    //       top: 0;
    //       left: 0;
    //       z-index: 20;
    //     }

    //     &--right {
    //       width: 52px;
    //       margin-left: 12px;
    //       align-items: flex-end;
    //     }

    //     .arrow {
    //       display: flex;
    //       justify-content: center;
    //       align-items: center;
    //       width: 44px;
    //       height: 44px;
    //       border-radius: 100px;
    //       background-color: #f7f9fd;
    //       border: 1px solid #d3d8e3;
    //       cursor: pointer;

    //       user-select: none;
    //       -moz-user-select: none;
    //       -webkit-user-select: none;
    //       -ms-user-select: none;
    //     }

    //     .arrow-left {
    //       position: fixed;
    //       left: 0;
    //       top: 0;
    //     }
    //   }

    //   &__files {
    //     max-width: 100%;
    //     max-height: 80px;

    //     &--file {
    //       max-width: 100%;
    //       height: 100%;
    //       .file-view {
    //         margin-right: 12px;
    //       }
    //     }
    //   }
    // }
  }

  .uploader-modal-dialog {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: calc(100% - 3.5rem);
    left: 0px;
    bottom: 0px;
    z-index: 201;
  }

  @media (max-width: 743px) {
    width: 100%;
  }
}
.base-uploader .file-input {
  position: relative;
  padding-bottom: 1rem;

  &__anchor {
    display: none;
  }

  &__wrap {
    display: inline-block;
    position: relative;
  }

  &__label {
    color: var(--color-text-primary);

    margin-bottom: 0;
  }
  &__filename {
    font-size: 16px;
    line-height: 22px;
    font-weight: 400;
    color: var(--color-text-secondary);
    padding-left: 32px;
  }

  &__btn {
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
      color: var(--color-text-accent);
    }
  }
  &__btn-text {
    font-size: 16px;
    line-height: 22px;
    font-weight: 400;
  }

  &__btn-icon {
    font-size: 0;
    margin-right: 8px;
  }
  &__error {
    color: var(--color-text-error);
    position: absolute;
    left: 0;
    bottom: 0;
  }
  &__btn-delete {
    @include button-reset;
    margin-left: 16px;
  }
  &__file-wrap {
    display: flex;
    align-items: center;
  }
}
.label {
  font-size: 18px;
  line-height: 1.3;
  margin-bottom: 18px;
}
</style>
