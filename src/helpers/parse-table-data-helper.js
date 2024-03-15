/**
 * Создает клон колонки и пушит его в результативный массив по ссылке
 *
 * @param {object} srcColumn - исходные колонки
 * @param {array} resultColumns - итоговые колонки
 * @returns {*}
 */
function createColumnWithoutChildren(srcColumn, resultColumns) {
  const column = { ...srcColumn }
  column.children && delete column.children
  return column
}

/**
 * Парсит исходные колонки в колонки, необходимые для отрисовки шапки таблицы
 *
 * @param {array} srcColumns - исходный массив колонок, что может быть многоуровневым
 * 1) [{
 *    name: '',
 *    2) children: [
 *      {
 *        name: '',
 *        3) children: [
 *          {
 *           name: ''
 *    ...
 *
 * @param {number} parentColumnRow - насколько родительская колонка "объединяется" вниз,
 * позволяет вычислить уровень вложенности
 * @param {number} level - уровень вложенности(глубина рекурсии) от 0
 * @param {array} resultColumns
 * @returns {*[]} resultColumns - каждый внутренний массив - <tr у таблицы, а объект в этом массиве - <th
 * [
 *  1) [{},],
 *  2) [{},],
 *  3) []
 * ]
 */
export function parseHeadColumns(srcColumns = [], parentColumnRow, level = 0, resultColumns = []) {
  for (const srcColumn of srcColumns) {
    const nestingLevel = (parentColumnRow || 1) - 1 + level
    if (!resultColumns[nestingLevel]) {
      resultColumns[nestingLevel] = []
    }

    resultColumns[nestingLevel].push(createColumnWithoutChildren(srcColumn, resultColumns))

    if (srcColumn.children && srcColumn.children.length) {
      parseHeadColumns(srcColumn.children, srcColumn.row, level + 1, resultColumns)
    }
  }

  return resultColumns
}

/**
 * Парсит исходные колонки, чтобы получить плоский массив колонок,
 * по которым происходит рендер тела таблицы
 *
 * @param {array} srcColumns - исходный массив колонок, что может быть многоуровневым
 * 1) [{
 *    name: '',
 *    2) children: [
 *      {
 *        name: '',
 *        3) children: [
 *          {
 *           name: ''
 *    ...
 *
 * @param {array} resultColumns - результирующий, плосский массив колонок
 * [
 *   {
 *     name: 'name', // соответствует ключу с сервера
 *   },
 *   {
 *     ...
 *   }
 * ]
 * @returns {*[]} resultColumns
 */
export function parseResourceColumns(srcColumns, resultColumns = []) {
  for (const srcColumn of srcColumns) {
    if (!srcColumn.WITHOUT_RESOURCE) resultColumns.push(createColumnWithoutChildren(srcColumn, resultColumns))

    if (srcColumn.children && srcColumn.children.length) {
      parseResourceColumns(srcColumn.children, resultColumns)
    }
  }

  return resultColumns
}
