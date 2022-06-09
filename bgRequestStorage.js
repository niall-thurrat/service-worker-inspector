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

      // DELETE: code used for testing
      // await chrome.storage.local.get(null, function (items) {
      //   console.log(`items: ${JSON.stringify(items)}`)
      //   console.log('----')
      // })
      // chrome.storage.local.clear()

      // TODO: clear storage items somehow to prevent reaching storage capacity
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

chrome.runtime.onMessage.addListener(
  function (request, sender) {
    if (request.type === 'scriptUrl') {
      const scriptUrl = (new URL(request.scriptUrl))
      doSwxssCheck(scriptUrl)
    }
    return true
  }
)

async function doSwxssCheck (url) {
  const initiator = `${url.protocol}//${url.hostname}`
  const params = new URLSearchParams(url.search)
  const paramUrls = getUrlsFromParams(params)

  if (paramUrls) {
    const storageReqs = await getRequestsFromStorage(initiator)

    if (storageReqs) {
      paramUrls.forEach(paramUrl => {
        if (isMatchInStorage(storageReqs, paramUrl)) {
          const report = createReport('sw-xss', false)
          // TODO: handle if existing report with an addCheckToReport func
          addReportToStorage(initiator, storageReqs, report)
        }
      })
    } // TODO: else... handle if initiator key not found?
  }

  // DELETE - code for testing
  await chrome.storage.local.get(null, function (items) {
    console.log(`items: ${JSON.stringify(items)}`)
    console.log('----')
  })
  // chrome.storage.local.clear()
}

function getUrlsFromParams (params) {
  const paramUrls = []

  for (const param of params.values()) {
    if (isValidHttpUrl(param)) {
      paramUrls.push(param)
    }
  }
  return (paramUrls === []) ? null : paramUrls
}

async function isMatchInStorage (storageReqs, paramUrl) {
  storageReqs.urls.forEach(async (url) => {
    const reqUrl = (new URL(url))
    // TODO: match more than just domains
    const reqDomain = `${reqUrl.protocol}//${reqUrl.hostname}`

    if (paramUrl === reqDomain) return true
  })
  return false
}

function createReport (type, result) {
  // TODO: validation - type should be string, result should be boolean
  const report = {
    checks: [{
      type,
      isPassing: result
    }]
  }
  return report
}

function addReportToStorage (initiator, storageReqs, report) {
  storageReqs.report = report
  chrome.storage.local.set({ [initiator]: storageReqs })
}

// credit goes to Pavlo on StackOverflow for this function
// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function isValidHttpUrl (string) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

// DELETE ME! TEST CODE FOR THESIS STATISTICS
// (() => {
//   const urls = [
//     'https://vulnerable-dot-com.herokuapp.com/?resourceHost=https://attacker-dot-com.herokuapp.com',
//     'https://app.ft.com',
//     'https://vlc-media-player.en.softonic.com/articles/how-to-cast-a-video-to-your-tv-using-vlc-and-chromecast-in-3-easy-steps?utm_source=SEM&utm_medium=paid&utm_campaign=SE_Sweden_DSA_mobile&gclid=CjwKCAjwve2TBhByEiwAaktM1CSCAdd-HkSQqO_gBappNf0NATw7xEwHELC5QgK4hGcFPcB-0tJnDRoCBqgQAvD_BwE',
//     'https://www.ghacks.net',
//     'https://llama.party',
//     'https://soyguijarro.github.io/magic-web',
//     'https://phonograph.app',
//     'https://wheelcarnival.com',
//     'https://tetris.isthe.link',
//     'https://vinyltap.co'
//   ]
//   const changeTab = setInterval(changeTabUrl, 5000)
//   let index = 0

//   function changeTabUrl () {
//     console.log(urls[index])

//     chrome.tabs.update({ url: urls[index] })

//     index++
//     if (index >= 10) {
//       clearInterval(changeTab)
//     }
//   }
// })()
