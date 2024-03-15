export default {
  computed: {
    // Buttons which are used in many components
    mxMenuButtons() {
      return {
        // Menu item "Edit"
        edit: {
          btnClass: 'btn-success',
          hidden: true,
          name: 'edit',
          fn: () => {
            this.$router.push({
              path: this.editPath, // must be defined in component
              query: {
                active_attribute_group: this.$route.query.active_attribute_group,
              },
            })
          },
        },
      }
    },
  },
}
