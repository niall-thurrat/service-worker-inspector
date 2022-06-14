(() => {
  const urls = [
    'www.youtube.com',
    'www.tradera.com',
    'www.techopedia.com'
  ]
  const changeTab = setInterval(changeTabUrl, 10000)
  let index = 0

  async function changeTabUrl () {
    let protocol = 'https://'
    const url = `${protocol}${urls[index]}/`

    await chrome.tabs.update({ url }, (tab) => {
      if (tab.pendingUrl === url) {
        index++
      } else if (isExtensionUrl(tab.pendingUrl)) {
        protocol = 'http://'
      } else {
        index++
      }
    })

    if (index >= 10) {
      clearInterval(changeTab)
    }
  }

  function isExtensionUrl (url) {
    return /^chrome-extension/.test(url)
  }
})()
