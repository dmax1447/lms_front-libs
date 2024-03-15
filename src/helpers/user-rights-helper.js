import defaultRoleRights from '../data/roles-default-rights.json'
import hiddenPagesList from '../data/hidden-pages.json'
import rightsMap from '../data/authorization-rights-map.json'

const ADMIN_ACCESS_KEY = 'manage.all'
const itemNameDelimiter = '-'
const makeUniqueArr = (arr) => [...new Set(arr)]

/**
 * Получает список прав для списка ролей
 *
 * @param userType {string}
 * @param roleRights
 * @returns {*}
 */
export function getDefaultRightsByUserType(userType, roleRights = defaultRoleRights) {
  return roleRights[userType] || []
}

/**
 * Получает список прав пользователя, пришедших с бэка
 *
 * @param authData
 * @returns {*[]|*}
 */
export function getUserRightsFromBackend(authData) {
  try {
    return authData.user.roles.flatMap((r) => r.access_rights)
  } catch (e) {
    return []
  }
}

/**
 * Является ли пользователь администратором
 *
 * @param rights
 * @returns {*}
 */
export function userIsAdmin(rights) {
  return rights.includes(ADMIN_ACCESS_KEY)
}

/**
 * Миксует доступы по умолчанию для определенных типов пользователей и доступы с бэка
 *
 * @param authData
 * @returns {*[]}
 */
export function getUserRights(authData) {
  const defaultRights = authData.user ? getDefaultRightsByUserType(authData.user.type) : []
  return [...defaultRights, ...getUserRightsFromBackend(authData)]
}

/**
 * Возвращает субсистему к которой принадлежит раздел
 *
 * @return {string}
 * @param routeName {string}
 * @param flatRightsList {object}
 */
export function getSubsystemByRouteName(routeName, flatRightsList) {
  return flatRightsList[routeName] ? flatRightsList[routeName].subsystem : ''
}

/**
 * Возвращает список доступных пользователю субсистем
 *
 * @param userRights {string[]} права пользователя
 * @param flatRightsList
 * @returns {string[]} ['connect', 'erp']
 */
export function getAvailableSubsystems(userRights, flatRightsList) {
  const availableSubsystemsObject = Object.entries(flatRightsList).reduce((subsystems, [, page]) => {
    if (page.rights && page.rights.find((pageRight) => userRights.includes(pageRight)) && page.subsystem) {
      subsystems[page.subsystem] = true
    }
    return subsystems
  }, {})

  return Object.keys(availableSubsystemsObject)
}

/**
 * Рекурсивно перебирает все элементы меню и удаляет недоступные
 *
 * @param menuItems {array} все элементы меню
 * @param userRights {array} права пользователя
 * @param flatRightsList {object} карта прав
 * @returns {*}
 */
export function filterMenuByRights(menuItems, userRights, flatRightsList) {
  return menuItems
    .map((item) => ({
      ...item,
      submenu: item.submenu && item.submenu.length ? filterMenuByRights(item.submenu, userRights, flatRightsList) : [],
    }))
    .filter((item) => {
      const pageRights = flatRightsList[item.route]
      const userHasAccessToPage =
        pageRights && pageRights.rights && !!pageRights.rights.find((rightAccess) => userRights.includes(rightAccess))

      return (item.submenu && item.submenu.length) || (item.route && userHasAccessToPage)
    })
}

/**
 * Делает мапу прав плоской
 *
 * @param parsedRules
 * @return {*}
 */
export function flattenRules(parsedRules) {
  return parsedRules.reduce((rules, parsedRule) => {
    if (parsedRule.children) {
      rules = { ...rules, ...flattenRules(parsedRule.children) }
      delete parsedRule.children
    }

    rules[parsedRule.name] = parsedRule
    delete parsedRule.name
    return rules
  }, {})
}

/**
 * Рекурсивно парсит мапу авторизации
 *
 * @param authorizationItem {object}
 * @param parent {object}
 * @param commonRights {string[]}
 * @param userType
 * @return {[string, unknown]}
 */
export function parseAuthorizationItem(authorizationItem, parent = {}, commonRights = [], userType = 'Employee') {
  const parsedItem = {}

  if (
    (authorizationItem.onlyFor && authorizationItem.onlyFor !== userType) ||
    (authorizationItem.notFor && authorizationItem.notFor === userType)
  ) {
    return parsedItem
  }

  parsedItem.name = parent.name ? `${parent.name}${itemNameDelimiter}${authorizationItem.name}` : authorizationItem.name

  if (authorizationItem.subsystem || parent.subsystem) {
    parsedItem.subsystem = authorizationItem.subsystem || parent.subsystem
  }

  if (authorizationItem.commonRights) {
    commonRights = commonRights.concat(authorizationItem.commonRights)
  }

  parsedItem.rights = makeUniqueArr(commonRights.concat(authorizationItem.rights || []))

  if (authorizationItem.children && authorizationItem.children.length) {
    parsedItem.children = authorizationItem.children.reduce((parsedItems, item) => {
      return parsedItems.concat(
        parseAuthorizationItem(
          item,
          {
            ...authorizationItem,
            name: parsedItem.name,
            subsystem: parsedItem.subsystem,
          },
          commonRights,
          userType,
        ),
      )
    }, [])

    parsedItem.children = parsedItem.children.filter((child) => Object.keys(child).length)

    if (parsedItem.children.length) {
      // connect children rights to parent
      parsedItem.rights = makeUniqueArr(parsedItem.rights.concat(parsedItem.children.flatMap((child) => child.rights)))
    }
  }

  return parsedItem
}

/**
 * Парсит мапу и делает ее плоской
 *
 * @param authorizationRightsMap {object} { erp: { index: ['read.students'] }}
 * @param userType
 * @return {object} { erp: ['read.students'], erp-index: ['read.students'] }
 */
export function calculateFlatRightsList(authorizationRightsMap = rightsMap, userType = 'Employee') {
  const parsedItems = parseAuthorizationItem(
    {
      name: '',
      children: authorizationRightsMap,
    },
    {},
    [],
    userType,
  ).children

  return flattenRules(parsedItems)
}

/**
 * Проверяет, имеет ли пользователь доступ к странице
 *
 * @param pageName {string} проверяемая страница
 * @param userRights {array} права пользователя
 * @param userRole {string} роль пользователя
 * @param flatRightsList {object} сопоставление страниц и прав
 * @return {boolean}
 */
export function userHasAccessToPage(pageName, userRights, flatRightsList, userRole) {
  const freeAccessPages = ['sign-in', 'reset-password', 'sign-up']
  let forItRole = true
  let pageRights = []

  if (flatRightsList[pageName]) {
    pageRights = flatRightsList[pageName].rights

    if (flatRightsList[pageName].onlyFor) {
      forItRole = flatRightsList[pageName].onlyFor === userRole
    }
  }

  if (!pageRights) return false

  const hasAccess = pageRights.some((pageRight) => {
    const allModuleRight = pageRight.match(/^\*\.([\w]*)/)
    if (allModuleRight) {
      // eslint-disable-next-line no-useless-escape
      const reg = new RegExp(`[\w]*.${allModuleRight[1]}`)
      return userRights.some((userRight) => reg.test(userRight))
    } else {
      return userRights.includes(pageRight)
    }
  })

  return forItRole && (hasAccess || freeAccessPages.includes(pageName))
}

/**
 * @param routeName
 * @param hiddenPages
 * @return {*}
 */
export function pageIsHidden(routeName, hiddenPages = hiddenPagesList) {
  return hiddenPages.some((hiddenRouteNameRegex) => new RegExp(hiddenRouteNameRegex).test(routeName))
}
