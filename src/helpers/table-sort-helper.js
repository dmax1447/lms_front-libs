export function DateTimeSort(tableSortDesc, colName, a, b) {
  const direction = tableSortDesc ? 1 : -1
  const dtCompare = (a, b) => this.$dayjs(b[colName]).diff(a[colName]) * direction
  return dtCompare(a, b)
}

export function TextSort(tableSortDesc, colName, a, b) {
  const direction = tableSortDesc ? 1 : -1
  return direction * new Intl.Collator(this.$i18n.locale).compare(a[colName].toLowerCase(), b[colName].toLowerCase())
}
