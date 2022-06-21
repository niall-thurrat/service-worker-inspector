chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    const reqInitiator = details.initiator
    const reqUrl = details.url
    const reqType = details.type

    if (reqInitiator && reqUrl && reqType === 'script') {
      const storageReqs = await getRequestsFromStorage(reqInitiator)

      if (storageReqs) {
        await addRequestUrlToStorageRequests(storageReqs, reqInitiator, reqUrl)
      } else {
        await setNewStorageRequest(reqInitiator, reqUrl)
      }
    }
  },
  { urls: ['<all_urls>'] }
)

function getRequestsFromStorage (initiator) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(initiator, function (items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message)
        reject(chrome.runtime.lastError.message)
      } else {
        resolve(items[initiator])
      }
    })
  })
}

function addRequestUrlToStorageRequests (storageReqs, reqInitiator, reqUrl) {
  if (!storageReqs.urls.includes(reqUrl)) {
    storageReqs.urls.push(reqUrl)
    chrome.storage.local.set({ [reqInitiator]: storageReqs })
  }
}

function setNewStorageRequest (reqInitiator, reqUrl) {
  const req = {
    [reqInitiator]: {
      urls: [reqUrl]
    }
  }
  chrome.storage.local.set(req)
}
