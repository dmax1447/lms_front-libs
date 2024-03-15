export function name(params = {}) {
  return {
    name: 'name',
    filterName: 'name',
    type: 'Text',
    isEditable: params.isEditable,
    fn: params.fn,
    isHTML: params.isHTML,
    cardRenderRules: {
      hidden: params.hidden,
    },
    inputConfig: {
      validationRules: params.validationRules,
      rows: params.rows ?? 1,
    },
    tableRenderRules: {
      isFilterable: params.isFilterable,
      type: 'Text',
      showByDefault: params.showByDefault,
      contentWidth: params.contentWidth,
    },
  }
}

export function title(params = {}) {
  return {
    name: 'title',
    filterName: 'title',
    type: 'Text',
    isEditable: params.isEditable,
    inputConfig: {
      validationRules: params.validationRules,
      name: params.name,
      rows: params.rows ?? 1,
    },
    tableRenderRules: {
      showByDefault: params.showByDefault,
      type: 'Text',
      isFilterable: params.isFilterable,
    },
  }
}

export function full_name(params = {}) {
  return {
    name: 'full_name',
    filterName: 'full_name',
    type: 'Text',
    fn: params.fn,
    inputConfig: {
      validationRules: params.validationRules,
    },
    cardRenderRules: {
      hidden: params.hidden,
    },
    tableRenderRules: {
      type: 'Text',
      showByDefault: params.showByDefault,
      isFilterable: params.isFilterable,
      isSortable: params.isSortable,
    },
    isEditable: params.isEditable,
  }
}

export function last_name(params = {}) {
  return {
    name: 'last_name',
    filterName: 'last_name',
    type: 'Text',
    fn: params.fn,
    inputConfig: {
      validationRules: params.validationRules,
    },
    cardRenderRules: {
      hidden: params.hidden,
    },
    tableRenderRules: {
      showByDefault: params.showByDefault,
      isFilterable: params.isFilterable,
      isSortable: params.isSortable,
    },
    isEditable: params.isEditable,
  }
}

export function first_name(params = {}) {
  return {
    name: 'first_name',
    filterName: 'first_name',
    type: 'Text',
    fn: params.fn,
    inputConfig: {
      validationRules: params.validationRules,
    },
    cardRenderRules: {
      hidden: params.hidden,
    },
    tableRenderRules: {
      showByDefault: params.showByDefault,
      isFilterable: params.isFilterable,
      isSortable: params.isSortable,
    },
    isEditable: params.isEditable,
  }
}

export function middle_name(params = {}) {
  return {
    name: 'middle_name',
    filterName: 'middle_name',
    type: 'Text',
    fn: params.fn,
    inputConfig: {
      validationRules: params.validationRules,
    },
    cardRenderRules: {
      hidden: params.hidden,
    },
    tableRenderRules: {
      showByDefault: params.showByDefault,
      isFilterable: params.isFilterable,
      isSortable: params.isSortable,
    },
    isEditable: params.isEditable,
  }
}

export function email(params = {}) {
  return {
    name: 'email',
    filterName: 'email',
    type: 'Email',
    fn: params.fn,
    inputConfig: {
      validationRules: params.validationRules,
    },
    cardRenderRules: {
      hidden: params.hidden,
    },
    tableRenderRules: {
      showByDefault: params.showByDefault,
      isFilterable: params.isFilterable,
      isSortable: params.isSortable,
    },
    isEditable: params.isEditable,
  }
}

export function birthdate(params = {}) {
  return {
    name: 'birthdate',
    filterName: 'birthdate',
    type: 'Birthdate',
    fn: params.fn,
    inputConfig: {
      validationRules: params.validationRules,
    },
    cardRenderRules: {
      hidden: params.hidden,
    },
    tableRenderRules: {
      showByDefault: params.showByDefault,
      isFilterable: params.isFilterable,
      isSortable: params.isSortable,
    },
    isEditable: params.isEditable,
  }
}

export function roles(role) {
  return {
    name: 'roles',
    filterName: 'roles_id',
    type: 'MultipleAssociation',
    role,
    fn() {
      return this.roles.map((r) => r.name).join(', ')
    },
    inputConfig: {
      validationRules: {
        required: true,
      },
      label: 'name',
      dataUrl: '/roles',
      getOption: true,
      multiple: true,
      typeParams(type) {
        return { 'filter[group_eq]': type }
      },
      dataParams(query) {
        return {
          'filter[name_cont]': query,
        }
      },
    },
    tableRenderRules: {
      isFilterable: true,
    },
    isEditable: true,
  }
}

export function branch(params = {}) {
  return {
    name: 'branch',
    filterName: 'branch_id',
    type: 'Association',
    fn() {
      return this.branch?.name || 'multiselect.branch.reset_option'
    },
    linkTo() {
      return this.branch?.id ? `/studio/branch-network/branches/${this.branch?.id}` : '0'
    },
    inputConfig: {
      store: 'branch',
      label: 'name',
      trackBy: 'id',
      dataUrl: '/branches',
      validationRules: params.validationRules,
      resetOptionName: 'multiselect.branch.reset_option',
      currentSpeciality: true,
      dataParams(query) {
        return {
          'filter[name_cont]': query,
        }
      },
    },
    isEditable: true,
    tableRenderRules: {
      showByDefault: true,
      isFilterable: true,
    },
  }
}

export function is_archived(params = {}) {
  return {
    name: 'is_archived',
    filterName: 'is_archived',
    type: 'Boolean',
    fn: params.fn,
    cardRenderRules: {
      hidden: params.hidden,
    },
    tableRenderRules: {
      hidden: params.hidden,
      isFilterable: params.isFilterable,
    },
  }
}

export function description(params = {}) {
  return {
    name: 'description',
    filterName: 'description',
    type: 'Text',
    isEditable: true,
    inputConfig: {
      name: params.name,
      validationRules: params.validationRules,
      rows: params.rows ?? 1,
    },
    tableRenderRules: {
      isFilterable: params.isFilterable,
      showByDefault: params.showByDefault,
    },
  }
}

export function discipline(params = {}) {
  return {
    name: 'discipline',
    type: 'Text',
    isEditable: params.isEditable,
    tableRenderRules: {
      type: 'Text',
      contentWidth: params.contentWidth,
    },
    fn: params.fn,
  }
}

export function points(params = {}) {
  return {
    name: 'points',
    type: 'Text',
    tableRenderRules: {
      contentWidth: params.contentWidth,
      showByDefault: params.showByDefault,
    },
  }
}

export function date(params = {}) {
  return {
    name: 'date',
    type: 'Text',
    fn() {
      return params.fn
    },
  }
}

export function created_at(params = {}) {
  return {
    name: 'created_at',
    filterName: 'created_at',
    type: 'DateTime',
    fn: params.fn,
    tableRenderRules: {
      showByDefault: params.showByDefault,
      isSortable: params.isSortable,
      isFilterable: params.isFilterable,
    },
  }
}

export function updated_at(params = {}) {
  return {
    name: 'updated_at',
    filterName: 'updated_at',
    type: 'DateTime',
    fn: params.fn,
    tableRenderRules: {
      showByDefault: params.showByDefault,
      isSortable: params.isSortable,
      isFilterable: params.isFilterable,
      hidden: params.hidden,
    },
  }
}
