import { SORT_ATTRIBUTE_CREATED, SORT_ORDER_DESC } from '../consts/sort-consts'

export default function fullparams(params) {
  if (Object.keys(params).length) {
    if (params.isSorted) {
      return Object.assign(params.params)
    } else {
      const sort = {
        sort_attribute: SORT_ATTRIBUTE_CREATED,
        sort_order: SORT_ORDER_DESC,
      }
      return Object.assign(params.params, sort)
    }
  } else {
    return (params = {})
  }
}
