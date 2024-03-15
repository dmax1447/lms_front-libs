/**
 * Get attributes for request to update positions
 *
 * @param attributes
 * @returns {*}
 */
export function getAttributesPositions(attributes) {
  return attributes.reduce((attributes, attribute) => {
    attributes[attribute.id] = attribute.position
    return attributes
  }, {})
}

/**
 * fix position for all attributes
 *
 * @param attributes
 * @returns {*}
 */
function recalculatePositions(attributes) {
  return attributes.map((attribute, index) => ({
    ...attribute,
    position: index + 1,
  }))
}

/**
 * Вычисляет позицию нового атрибута и меняет его, если она изменилась
 *
 * @param {object} from - attribute from placed
 * @param {object} to - attribute to placed
 * @param {array} srcAttributes - source attributes
 * @param {boolean} toAttributeIsLast - target attribute is last
 * @param {string} identifier - identifier that use for comparison
 * @returns {array} replaced and ordered attributes
 */
export function calculateNewPositionsAndReOrder({
  from,
  to,
  elementsList,
  toAttributeIsLast = false,
  identifier = 'id',
}) {
  let toIndex = elementsList.indexOf(to)
  toIndex = toAttributeIsLast ? toIndex + 1 : toIndex

  const attributes = JSON.parse(JSON.stringify(elementsList))

  // add attribute to new position
  attributes.splice(toIndex, 0, { ...from, position: to.position })

  let afterPosition = 1
  for (const attributeIndex in attributes) {
    const iterationAttribute = attributes[attributeIndex]
    // remove attribute from old position
    if (iterationAttribute[identifier] === from[identifier] && iterationAttribute.position === from.position) {
      attributes.splice(attributeIndex, 1)
      continue
    }

    if (attributeIndex < toIndex + 1) continue

    attributes.splice(attributeIndex, 1, {
      ...iterationAttribute,
      position: afterPosition + to.position,
    })
    afterPosition++
  }

  return recalculatePositions(attributes)
}
