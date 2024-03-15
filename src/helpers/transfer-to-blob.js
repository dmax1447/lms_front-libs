export default async function transferToBlob(files) {
  const newFiles = []
  for (const file of files) {
    try {
      const { link, name, id } = file
      const fileLink = await fetch(link)
      const blob = await fileLink.blob()
      const fileBlob = new File([blob], name)
      fileBlob && newFiles.push({ [id]: fileBlob })
    } catch (error) {
      this.$toast.error('Картинка не загрузилась')
    }
  }
  return newFiles
}
