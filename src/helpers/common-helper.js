export function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// export function cloneObject(obj) {
//   const cloneObj = {}
//   for (const i in obj) {
//     if (obj[i] instanceof Object && !Array.isArray(obj[i])) {
//       cloneObj[i] = cloneObject(obj[i])
//       continue
//     }
//     cloneObj[i] = obj[i]
//   }
//   return cloneObj
// }

export function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

/**
 * O(n) from
 *
 * @see https://stackoverflow.com/questions/34392741/best-way-to-get-intersection-of-keys-of-two-objects
 * @param {object} o1
 * @param {object} o2
 * @return {array}
 */
export function intersection(o1, o2) {
  return Object.keys(o1).filter({}.hasOwnProperty.bind(o2))
}

/**
 * Сверяет ключи одного объекта с ключами другого
 *
 * @param {object} o1
 * @param {object} o2
 * @return {boolean} true если ключи не совпадают
 */
export function objectsHasDifference(o1, o2) {
  const intersectionLength = intersection(o1, o2).length

  return Object.keys(o1).length !== intersectionLength || Object.keys(o2).length !== intersectionLength
}

/**
 * Находит уникальные значения в одном из двух массивов
 *
 * @param {array} arrayToCompare массив, с которым производится сравнение значений
 * @param {array} arrayToFind массив, в котором производится поиск
 * @return {array} массив с уникальными значениям
 */
export function findUniq(arrayToCompare, arrayToFind) {
  return arrayToFind.filter((i) => !arrayToCompare.includes(i))
}

/**
 * @param obj {object}
 * @param props {array}
 * @return {*}
 */
export function pickFromObject(obj, props) {
  if (obj) {
    return props.reduce((newObj, prop) => {
      if (obj[prop]) {
        newObj[prop] = obj[prop]
      }

      return newObj
    }, {})
  } else return {}
}

export function debounce(callback, ms = 500) {
  let timeout
  return function () {
    const callbackCall = () => {
      callback.apply(this, arguments)
    }
    clearTimeout(timeout)
    timeout = setTimeout(callbackCall, ms)
  }
}

export function syncValue(value, parent, validate = false) {
  if (typeof parent.syncValue !== 'function') return

  parent.syncValue(value)
  validate && parent.validate()
}
