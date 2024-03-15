import { __service } from '../config.json'
/**
 * Проверка на то были ли изменены настройки колонок
 *
 * @param {array} columns - предположительно измененные колонки
 * @param {object} oldColumns - исходные колонки
 * @return {Boolean}
 */
export function checkUpdates(columns = [], oldColumns = {}) {
  if (columns.length !== Object.keys(oldColumns).length) return true

  return columns.some((column) => oldColumns[column.code] !== column.position)
}

/**
 * Проверка на то является колонка скрытой в настройках tableRenderRules модели
 *
 * @param {array} attributes
 * @param {string} columnCode
 * @return {Boolean}
 */
export function isHiddenColumn(attributes, columnCode) {
  return !attributes.some(
    (attribute) => attribute.name === columnCode && (!attribute.tableRenderRules || !attribute.tableRenderRules.hidden),
  )
}

/**
 * Если колонку пометили скрытой, то все колонки, находящиеся ниже нее, сдвигаются на одну вверх
 *
 * @param {object} column
 * @param {array} columns
 */
export function removeColumn(column, columns) {
  columns.forEach((col) => {
    if (col.position <= getColumnPosition(column, columns)) return
    --col.position
  })

  column.position = null

  const colIndex = columns.findIndex((col) => col.code === column.code)
  columns.splice(colIndex, 1)
}

/**
 * Если колонку пометили видимой, то она добавляется в конец списка
 *
 * @param {object} column
 * @param {array} columns
 */
export function addColumn(column, columns) {
  column.position = columns.length + 1
  columns.push(column)
}

export function getColumnPosition(column, columns) {
  return columns.find((col) => col.code === column.code)?.position
}

export function sortByPosition(arr) {
  return [...arr].sort((a, b) => {
    if (a.position > b.position) return 1
    if (a.position < b.position) return -1
    return 0
  })
}

/**
 * Needs bind for using
 *
 * @param {{ name: string|undefined, code: string }} - column data
 * @param columnPosition {number}
 * @param isCustom
 * @return {{code, name, isVisible}}
 */
export function modalColumnMapper({ name = '', code }, columnPosition, isCustom = false) {
  return {
    code,
    position: columnPosition,
    isCustom,
    name: !isCustom ? this.$t(`${__service}.pages.subservices.testing.attributes.${this.resourceName}.${code}`) : name,
  }
}

/**
 * Needs bind for using
 *
 * @param columnsObject
 * @param customAttributes
 * @param columns
 * @return {*}
 */
export function convertColumnsObjectToArray(columnsObject, columns, customAttributes = []) {
  return columns.map((column) => {
    const columnCode = column.isCustom ? column.code : column.name

    const columnPosition = columnsObject[columnCode] || null

    const customAttribute = column.isCustom
      ? customAttributes.find((customAttribute) => customAttribute.key === columnCode)
      : null

    return modalColumnMapper.apply(this, [
      {
        code: columnCode,
        name: customAttribute ? customAttribute.name : '',
      },
      columnPosition,
      column.isCustom,
    ])
  })
}
