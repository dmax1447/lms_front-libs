import { ROLES_FULL_ACCESS } from '../consts/roles-consts'

/**
 * Конвертирует массив доступов в объект доступов
 * если есть полный доступ, то ко всем ставит значение true
 *
 * @param {array} accesses - список возможных прав
 * @param {string} rightName
 * @param {array} currentRights
 * @return {*}
 */
function getConvertedRightAccesses(accesses, rightName, currentRights) {
  return accesses.reduce((result, accessName) => {
    result[accessName] = rightName === ROLES_FULL_ACCESS ? true : currentRights.includes(`${accessName}.${rightName}`)
    return result
  }, {})
}

/**
 * Мультиплексирует права для рендеринга
 *
 * @param {object} allRights - список всех прав
 *   e.g. {
 *     "books": [
 *       "read",
 *       "create",
 *     ]
 *   }
 * @param {array|object} currentRights - список установленных прав
 *   e.g: ["books.read",...]
 * @return {*}
 *   e.g: {
 *     "books": {
 *       read: true,
 *       create: false,
 *     }
 *   }
 */
export function getMultiplexedRights(allRights, currentRights) {
  if (!Array.isArray(currentRights)) {
    currentRights = []
  }

  return Object.entries(allRights).reduce((rights, [rightName, rightAccesses]) => {
    rights[rightName] =
      rightName === ROLES_FULL_ACCESS
        ? { manage: currentRights.includes('manage.all') }
        : getConvertedRightAccesses(rightAccesses, rightName, currentRights)
    return rights
  }, {})
}
