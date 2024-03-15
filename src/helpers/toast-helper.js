export function withDefaultToasts(fn, type) {
  const result = fn
  result
    .then(() => {
      this.$toast.success(type === 'create' ? 'toasts.forms.created' : 'toasts.forms.updated', 'toasts.ok')
    })
    .catch(() => {
      this.$toast.error(type === 'create' ? 'toasts.forms.create_failed' : 'toasts.forms.update_failed', 'toasts.error')
    })
  return result
}

export function hasDependentError(response) {
  return response.data?.errors?.base?.some((i) => i.includes('dependent'))
}

export function showDependErrorToast(response) {
  if (hasDependentError(response)) {
    this.$toast.error('toasts.modal.notice', true, 'toasts.modal.failed_deleted')
    return
  }
  this.$toast.error('toasts.modal.failed_deleted')
}
