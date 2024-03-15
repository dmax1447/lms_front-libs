import { TYPES_FOR_SECTION_ID } from '../consts/section-id-types-const'

export function getSectionId(type, id) {
  return TYPES_FOR_SECTION_ID.includes(type) ? id : null
}
