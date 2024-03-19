<template>
  <ValidationProvider #default="{ classes, errors }" :name="name" :rules="validationRules" tag="div">
    <BaseUploader
      ref="uploader"
      :files="value"
      :name="name"
      :label="label"
      :class="classes"
      :accept="accept"
      :multiple="multiple"
      :max-file-size-text="maxFileSizeText"
      @change="onInput"
      @file-removed="onFileRemove"
    />
    <p v-if="errors && errors.length" class="error font-body-xs-400">{{ errors[0] }}</p>
  </ValidationProvider>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import BaseUploader from './LazyUploader.vue'
export default {
  name: 'SUploaderM',
  components: {
    ValidationProvider,
    BaseUploader,
  },
  props: {
    accept: {
      type: String,
      default: '.jpeg,.jpg,.png,.pdf',
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    /**
     * текст в модалке про максимальный размер файла
     */
    maxFileSizeText: {
      type: String,
      default: '4 Гб',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },

    validationMode: {
      type: String,
      default: 'passive',
      validator(value) {
        return ['aggressive', 'passive', 'lazy', 'eager'].includes(value)
      },
    },
    validationRules: {
      type: [Object, null],
      default: () => ({}),
    },
    /**
     * принимает внешнее значение:
     * [ {name: 'cat.jpg', link: '/img/idontunderstand.jpg', size: 1000} ]
     * при выборе хранит массив объектов типа File
     */
    value: {
      type: [Array, null],
      default: () => [],
    },
  },
  methods: {
    onInput(val) {
      this.$emit('input', val)
    },
    onFileRemove(idx) {
      const { id } = this.value[idx]
      if (id) {
        this.$emit('deleteFile', id)
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
