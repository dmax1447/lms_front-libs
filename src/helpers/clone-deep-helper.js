export default function cloneDeep(original) {
  const copy = Array.isArray(original) ? [] : {}

  Object.keys(original).forEach((key) => {
    copy[key] = typeof original[key] === 'object' && original[key] !== null ? cloneDeep(original[key]) : original[key]
  })

  return copy
}
