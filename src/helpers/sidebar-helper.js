import { pageIsHidden } from './user-rights-helper'

/**
 * Удаляет нереализованные страницы
 *
 * @param menuItems
 * @param resolver
 * @return {*}
 */
export function removeUnimplementedPages(menuItems, resolver) {
  return menuItems
    .map((menuItem) => {
      return menuItem.submenu
        ? {
            ...menuItem,
            submenu: removeUnimplementedPages(menuItem.submenu, resolver),
          }
        : menuItem
    })
    .filter((menuItem) => {
      const hasSubmenu = checkHasSubmenu(menuItem)
      let implemented = true

      if (!hasSubmenu) {
        const { resolved } = resolver({ name: menuItem.route })
        implemented = !!resolved.matched.length
      }

      const notImplementedWithSubmenu = !implemented && hasSubmenu
      const pageHidden = pageIsHidden(menuItem.route)

      return (notImplementedWithSubmenu || implemented) && !pageHidden
    })
}

export function checkHasSubmenu(item) {
  return !!(item.submenu && item.submenu.length)
}
