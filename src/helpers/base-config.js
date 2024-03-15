function baseConfig(params = {}) {
  return {
    placeholder: params.placeholder ?? '',
    isPassword: params.isPassword ?? false,
    mask: params.mask ?? '',
    label: params.label ?? '',
    name: params.name ?? '',
    type: params.type ?? 'text',
    validationRules: params.validationRules ?? {},
    rows: params.rows ?? 0,
    minHeight: params.minHeight ?? 0,
  }
}

// todo: допилить конфиг, в зависимости от того, что будет приходить с сервера в кастомные атрибуты
function selectConfig(params = {}) {
  return {
    validationRules: params.validationRules ?? {},
    label: params.label ?? '',
    className: params.className ?? '',
    searchable: params.searchable ?? false,
    internalSearch: params.internalSearch ?? false,
    placeholder: params.placeholder ?? '',
  }
}

export { baseConfig, selectConfig }
