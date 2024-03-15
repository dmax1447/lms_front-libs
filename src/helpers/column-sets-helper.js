import { attributeTypesMap } from '../data/settings-attribute-types-data'

export function checkDifference(columns, oldColumns) {
  return columns.some((column) =>
    oldColumns.some((oldColumn) => oldColumn.code === column.code && oldColumn.position !== column.position),
  )
}

/**
 * Проверка на то, приходит ли в loadedUserColumnSets хотя бы одна колонка,
 * соответствующая имеющимся атрибутам
 *
 * @param {array<{ name: string }>} attributes - локальные атрибуты(в модели)
 * @param {array<{ name: string }>} customAttributes - кастомные атрибуты
 * @param {object} loadedUserColumnSets - уже сохраненные пользовательские колонки
 * @return {boolean}
 */
function isAnyExistingColumnSelected(attributes, customAttributes, loadedUserColumnSets) {
  return Object.keys(loadedUserColumnSets).some((key) => {
    const attributeNames = [...customAttributes, ...attributes].map((attr) => attr.name)
    return attributeNames.includes(key)
  })
}

/**
 * @param {array} columnsSets
 * @param {number} userId
 * @return {object|undefined}
 */
export function getUserColumnsSet(columnsSets, userId) {
  return columnsSets.find((columnsSet) => columnsSet.user_id === userId)
}

/**
 * Возвращает только пользовательские колонки секции
 *
 * @param {array} sectionColumnSets все наборы колонок определенной секции
 * @param {string} userId
 * @return {*}
 */
export function getUserColumns(sectionColumnSets, userId) {
  return sectionColumnSets.reduce((columns, columnSet) => {
    if (columnSet.user_id === userId) {
      columns = { ...columns, ...columnSet.columns }
    }

    return columns
  }, {})
}

/**
 * Есть ли атрибут с таким ключом
 *
 * @param {array<{ name: string }>} attributes
 * @param {string} key
 * @return {boolean}
 */
export function existInAttributes(attributes, key) {
  return attributes.some((a) => a.name === key)
}

/**
 * Возвращает колонки которые загружены, но их нет локально
 *
 * @param {{ [key:string]: number }} columnSets - {}
 * @param {array<{ name: string }>} attributes - локальные колонки
 * @return {array<string>}
 */
export function getRemovedAttributes(columnSets, attributes) {
  return Object.keys(columnSets).filter((columnKey) => !existInAttributes(attributes, columnKey))
}

/**
 * Мапит локальные атрибуты
 *
 * @param attributes - локальные атрибуты(в модели)
 * @param {{ [key:string]: number }} loadedColumnSets - загруженные колонки
 * @param {boolean} addDefault
 * @return {{ [key: string]: number }}
 */
export function mapLocalAttributesForCreating({ attributes, loadedColumnSets, addDefault = false }) {
  const removedAttributeNames = getRemovedAttributes(loadedColumnSets, attributes)

  let position = 0

  return attributes.reduce((columnSet, attribute) => {
    const loadedColumnPosition = loadedColumnSets[attribute.name]

    if (removedAttributeNames.includes(attribute.name)) return columnSet

    // display default columns if no columns selected
    if (loadedColumnPosition === undefined && attribute.tableRenderRules?.showByDefault && addDefault) {
      columnSet[attribute.name] = ++position
    }

    if (loadedColumnPosition !== undefined) {
      columnSet[attribute.name] = loadedColumnPosition
    }

    return columnSet
  }, {})
}

/**
 * Мапит кастомные атрибуты
 *
 * @param {array<{ name: string }>}customAttributes
 * @param {{ [key:string]: number }} loadedColumnSets - загруженные колонки
 * @return {{ [key: string]: number }}
 */
export function mapCustomAttributesForCreating(customAttributes, loadedColumnSets) {
  return customAttributes.reduce((columnSet, attribute) => {
    let loadedColumnPosition
    if (attribute.is_visible) {
      loadedColumnPosition = loadedColumnSets[attribute.name]
    }

    if (loadedColumnPosition) {
      columnSet[attribute.name] = loadedColumnPosition
    }

    return columnSet
  }, {})
}

/**
 * Собирает в кучу отмапенные кастомные и локальные атрибуты
 *
 * @param {array<{ name: string }>} localAttributes
 * @param {array<{ name: string }>} customAttributes
 * @param {{ [key:string]: number }} loadedColumnSets - загруженные колонки
 * @return {{ [key: string]: number }}
 */
export function mapAttributesForCreating(localAttributes, customAttributes, loadedColumnSets) {
  const addDefault = !isAnyExistingColumnSelected(localAttributes, customAttributes, loadedColumnSets)
  return {
    ...mapLocalAttributesForCreating({
      attributes: localAttributes,
      loadedColumnSets,
      addDefault,
    }),
    ...mapCustomAttributesForCreating(customAttributes, loadedColumnSets),
  }
}

/**
 * Маппинг атрибутов в { name: key }
 *
 * @param {array<object>} customAttributes - кастомные атрибуты
 * @return {array<{ name: string }>}
 */
export function mapCustomAttributesToColumnsObject(customAttributes) {
  return customAttributes.map(({ key, is_visible }) => ({
    name: key,
    is_visible,
  }))
}

export function mapCustomAttributesToColumns(customAttributes) {
  return customAttributes
    .filter((e) => e.is_visible === true)
    .map(({ name, kind, key, is_visible }) => ({
      name,
      type: attributeTypesMap[kind],
      isCustom: true,
      code: key,
    }))
}
