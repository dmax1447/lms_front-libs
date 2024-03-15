export default {
  computed: {
    getSrc() {
      return this.src || require('../assets/images/course/default-images/no-course-cover.jpg')
    },
  },
}
