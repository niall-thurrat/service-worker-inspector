(async () => {
  const dataUrl = chrome.runtime.getURL('data.csv')
  const response = await fetch(dataUrl)
  const urlsText = await response.text()
  const urls = urlsText
    .split('\n')
    .map(e => e.trim())
    .map(e => e.split(',').map(e => e.trim()))

  let index = 0
  const changeTab = setInterval(changeTabUrl, 20000)

  async function changeTabUrl () {
    try {
      const url = `https://${urls[index]}/`

      await chrome.tabs.update({ url }, (tab) => {
        if (isExtensionUrl(tab.pendingUrl)) {
          const httpUrl = `http://${urls[index]}/`
          chrome.tabs.update({ httpUrl })
        }
      })
      index++

      if (index === urls.length) {
        clearInterval(changeTab)
      }
    } catch (err) {
      console.error(err)
    }
  }

  function isExtensionUrl (url) {
    return /^chrome/.test(url)
  }
})()
