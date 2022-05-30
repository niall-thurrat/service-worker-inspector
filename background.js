chrome.webRequest.onSendHeaders.addListener(
  async function (details) {
    if (details.initiator && details.url && details.type) {
      // TODO: decide if I should only store scripts at this point
      const request = {
        [details.requestId]: {
          initiator: details.initiator,
          url: details.url,
          type: details.type
        }
      }
      // DELETE: code used for testing
      // console.log(JSON.stringify(request))
      // console.log('----')
      // const bytes = await chrome.storage.local.getBytesInUse()
      // console.log(`*** BYTES IN USE $$$ ${bytes}`)
      // chrome.storage.local.clear()

      chrome.storage.local.set(request)
      // TODO: check storage item amount and remove items when limit reached
      // TODO: should limit be 1000? how much storage would this use?

      // DELETE: code used for testing
      // chrome.storage.local.get(null, function (items) {
      //   const allKeys = Object.keys(items)
      //   console.log(`allKeys (count: ${allKeys.length}): ${allKeys}`)
      // })
    }
  },
  { urls: ['<all_urls>'] }
)

// TODO: add listener for swUrlFound message from contentscript, then:
//   - inspect SW url for a URL query parameter
//   - extract URL query parameter
//   - inspect storage to see if extracted URL is used as a 'requestUrl' to request a 'script' resource
//   - positive/negative results stored in report object for current domain
//   - previous report objects deleted
