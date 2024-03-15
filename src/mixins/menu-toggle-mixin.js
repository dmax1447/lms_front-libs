export default {
  methods: {
    toggleMenu() {
      document.getElementsByClassName('js-container')[0].classList.toggle('extended')
      document.getElementsByClassName('js-nav')[0].classList.toggle('extended')
      document.getElementsByClassName('js-sidebar-container')[0].classList.toggle('toggled')
    },

    closeMobileMenu() {
      document.getElementsByClassName('js-nav-link-menu')[0].classList.remove('active')
      document.getElementsByClassName('js-nav-secondary')[0].classList.remove('visible')
    },

    toggleMobileMenu() {
      document.getElementsByClassName('js-nav-link-menu')[0].classList.toggle('active')
      document.getElementsByClassName('js-nav-secondary')[0].classList.toggle('visible')
    },

    closeNewMenu() {
      document.getElementsByClassName('js-new')[0].classList.remove('open')
    },

    toggleNewMenu() {
      document.getElementsByClassName('js-new')[0].classList.toggle('open')
    },
  },
}
