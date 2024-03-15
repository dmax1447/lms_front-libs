import Editor from '@tinymce/tinymce-vue'

export default {
  components: {
    Editor,
  },

  data() {
    return {
      isTinyLoader: true,
      tinyMCE: {
        key: this.$config.tinyMceKey,
        init: {
          init_instance_callback: () => {
            this.isTinyLoader = false
          },
          language: 'ru',
          menubar: false,
          toolbar:
            'undo redo | bold italic underline strikethrough | fontselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | charmap emoticons | link image anchor codesample',
          plugins: 'advlist lists checklist pagebreak anchor table autoresize wordcount code link charmap image',
          height: 350,
          max_height: Math.max(window.innerHeight - 100, 300),
          min_height: 350,
          valid_elements:
            'p[style],span[style],a[href|target=_blank],strong/b,em,i,' + // common
            'ul[style],li[style],ol[style],' + // lists
            'table[border|style],td[style],tr[style],' + // tables
            'h1[style],h2[style],h3[style],h4[style],h5[style],h6[style]', // headers
        },
      },
    }
  },
}
