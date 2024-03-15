export function splitText(text, textMaxLength, checkType = true) {
  if (!checkType && text.length > textMaxLength) {
    return `${text.split('.')[0].slice(0, textMaxLength)}...`
  }

  const type = text.split('.').pop()
  if (text.length - type?.length >= textMaxLength) {
    return `${text.split('.')[0].slice(0, textMaxLength)}....${type}`
  }
  return text
}
export function shortText(text = '', textMaxLength) {
  if (text.length > textMaxLength) {
    return `${text.slice(0, textMaxLength)}...`
  }
  return text
}
export function maxTextLengthInTable() {
  return 110
}
