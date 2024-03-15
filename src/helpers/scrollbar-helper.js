export default {
  /**
   * Detect scrollbar Witdh
   *
   * @return ScroolBar Width
   */
  detectScrollbarWidth() {
    const outer = document.createElement('div')
    const inner = document.createElement('div')
    // Styling
    outer.style.visibility = 'hidden'
    outer.style.overflow = 'scroll'
    outer.style.msOverflowStyle = 'scrollbar'
    // Start Testing
    document.body.appendChild(outer)
    outer.appendChild(inner)
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
    outer.parentNode.removeChild(outer)
    return `${scrollbarWidth}px`
  },
}
