import NoUserAvatar from '../assets/images/no-user-avatar.svg?inline'
import NoGroupAvatar from '../assets/images/no-group-avatar.svg?inline'

const DEFAULT_AVATAR_VARIANT = 100

function getURL(data) {
  if (!data) return

  return data.src || data?.avatar_variants?.[DEFAULT_AVATAR_VARIANT] || data.url
}

export function isNotDefaultAvatar(data) {
  const imgPattern = /([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif|svg))/i
  const url = getURL(data)
  return imgPattern.test(url) ? url : false
}

export function getColor(str = 'random') {
  if (!str.length) {
    return 'hsl(200, 80%, 40%)'
  }

  const hash = [...str].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  return `hsl(${hash % 360}, 80%, 40%)`
}

export function getAvatar(data, id, type = 'user', whiteBg = false) {
  if (isNotDefaultAvatar(data)) {
    return { src: getURL(data) }
  }

  if (type !== 'user' && type !== 'group') {
    return { src: '/no-data.svg' }
  }

  if (whiteBg) {
    return { src: '/no-user-avatar-white.svg' }
  }

  const component = type === 'user' ? NoUserAvatar : NoGroupAvatar

  if (!id) {
    return { component, color: getColor() }
  }

  return { component, color: getColor(id) }
}

export function getFullName({ first_name, middle_name, last_name }) {
  return [first_name, middle_name, last_name].filter(String).join(' ')
}

export function getFirstAndLastName({ first_name, last_name }) {
  return [first_name, last_name].filter(String).join(' ')
}
