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
  const storageReqs = await getRequestsFromStorage(initiator)
  let isPassing = true

  if (paramUrls && storageReqs) {
    paramUrls.forEach(paramUrl => {
      if (isMatchInStorage(storageReqs, paramUrl)) {
        isPassing = false
      }
    })
  }
  const check = createCheck('sw-xss', isPassing)
  const report = createReport(initiator, storageReqs, check)
  setReport(initiator, storageReqs, report)

  // DELETE - code for testing
  // await chrome.storage.local.get(null, function (items) {
  //   console.log(`items: ${JSON.stringify(items)}`)
  //   console.log('----')
  // })
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

async function isMatchInStorage (storageReqs, paramUrl) {
  storageReqs.urls.forEach(async (url) => {
    const reqUrl = (new URL(url))
    // TODO: match more than just domains
    const reqDomain = `${reqUrl.protocol}//${reqUrl.hostname}`

    if (paramUrl === reqDomain) {
      return true
    }
  })
  return false
}

function createCheck (name, result) {
  return {
    type: name,
    isPassing: result
  }
}

function createReport (initiator, storageReqs, check) {
  let report = storageReqs.report

  if (report && report.checks) {
    report = updateReport(report, check)
  } else {
    report = createNewReport(check)
  }
  return report
}

function setReport (initiator, storageReqs, report) {
  storageReqs.report = report
  chrome.storage.local.set({ [initiator]: storageReqs })
}

function updateReport (report, newCheck) {
  return report.checks.map(check => {
    if (check.type === 'sw-xss') {
      return newCheck
    } else {
      return check
    }
  })
}

function createNewReport (check) {
  return {
    checks: [check]
  }
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
