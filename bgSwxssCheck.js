// TEST REPORT MODEL
const reportModel = {
  domain: null,
  isSwReg: null,
  swUrl: null,
  isParamUrls: null,
  paramUrls: null,
  isDomainMatch: null,
  reqUrls: null
}

// TEST FUNCTION
async function sendTestReport (report) {
  try { // if (report.domain !== 'chrome://extensions')
    console.log(`FETCH report: ${JSON.stringify(report)}`)
    const response = await fetch('http://localhost:3000/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    })
    console.log('Fetch response: ', response)
  } catch (error) {
    console.error('Fetch error: ', error)
  }
}

// TEST FUNCTION - SETTING AN INITIAL 'NO SW' REPORT HERE
chrome.tabs.onUpdated.addListener(async function (tabId, info) {
  if (info.status === 'complete') {
    const url = await getCurrentDomain()
    const noSwReport = JSON.parse(JSON.stringify(reportModel))
    noSwReport.domain = url
    noSwReport.isSwReg = false
    await sendTestReport(noSwReport)
  }
})

// TEST FUNCTION
async function getCurrentDomain () {
  const tabUrl = await getTabUrl()
  const url = (new URL(tabUrl))
  const currentDomain = `${url.protocol}//${url.hostname}`

  return currentDomain
}

// TEST FUNCTION
async function getTabUrl () {
  const options = { active: true, lastFocusedWindow: true }
  const [tab] = await chrome.tabs.query(options)

  return await tab.url
}

chrome.runtime.onMessage.addListener(
  async function (request, sender) {
    if (request.type === 'scriptUrl') {
      // //////// DELETE - TEST CODE - RECORD SW REG URL HERE
      const url = await getCurrentDomain()
      const testReport = JSON.parse(JSON.stringify(reportModel))
      testReport.domain = url
      testReport.isSwReg = true
      testReport.swUrl = request.scriptUrl
      // //////////////////////////////////////////////////////

      const scriptUrl = (new URL(request.scriptUrl))
      await doSwxssCheck(scriptUrl, testReport) // DELETE testReport param
      sendCheckDoneMessage()
    }
    return true
  }
)

async function doSwxssCheck (url, testReport) { // DELETE testReport param
  const initiator = `${url.protocol}//${url.hostname}`
  const params = new URLSearchParams(url.search)
  const paramUrls = getUrlsFromParams(params)
  const storageReqs = await getRequestsFromStorage(initiator)
  let isPassing = true

  // //////// DELETE - TEST CODE - RECORD IF URL PARAMS FOUND HERE
  let isSent = false

  if (paramUrls.length > 0) {
    testReport.isParamUrls = true
    testReport.paramUrls = paramUrls
  } else {
    testReport.isParamUrls = false
    testReport.paramUrls = paramUrls
    await sendTestReport(testReport)
    isSent = true
  }
  // /////////////////////////////////////////////////////////////////

  if (paramUrls.length > 0 && storageReqs) {
    paramUrls.forEach(paramUrl => {
      if (isMatchInStorage(storageReqs, paramUrl)) {
        isPassing = false
      }
    })
  }
  const check = createCheck('sw-xss', isPassing)
  const report = createReport(initiator, storageReqs, check)
  setReport(initiator, storageReqs, report, testReport, isSent) // DELETE testReport, isSent params
}

function sendCheckDoneMessage () {
  chrome.runtime.sendMessage({ type: 'checkDone' })
}

function getUrlsFromParams (params) {
  const paramUrls = []

  for (const param of params.values()) {
    if (isValidHttpUrl(param)) {
      paramUrls.push(param)
    }
  }
  return paramUrls
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
    // TODO: match more than just protocol+host ??
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

async function setReport (initiator, storageReqs, report, testReport, isSent) { // DELETE testReport, isSent params
  // ////// DELETE - TEST CODE - RECORD REPORT RESULT AND CHECKED REQ URLS IN STORAGE
  if (!isSent) {
    testReport.isDomainMatch = !(report.checks[0].isPassing)
    testReport.reqUrls = storageReqs.urls
    await sendTestReport(testReport)
  }
  // /////////////////////////////////////////////////////////////////////////
  storageReqs.report = report
  chrome.storage.local.set({ [initiator]: storageReqs })
}

function updateReport (report, newCheck) {
  report.checks.map(check => {
    if (check.type === 'sw-xss') {
      return newCheck
    } else {
      return check
    }
  })
  return report
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
