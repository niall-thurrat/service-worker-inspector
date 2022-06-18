
const reportDiv = document.getElementById('report')

chrome.runtime.onMessage.addListener(
  async function (request, sender) {
    if (request.type === 'checkDone') {
      const currentDomain = await getCurrentDomain()
      const storageReqs = await getRequestsFromStorage(currentDomain)
      const reportStr = createReportString(storageReqs.report)

      reportDiv.innerHTML = reportStr
    }
  }
)

async function getCurrentDomain () {
  const tabUrl = await getTabUrl()
  const url = (new URL(tabUrl))
  const currentDomain = `${url.protocol}//${url.hostname}`

  return currentDomain
}

async function getTabUrl () {
  const options = { active: true, lastFocusedWindow: true }
  const [tab] = await chrome.tabs.query(options)

  return await tab.url
}

function getRequestsFromStorage (domain) {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get(domain, function (items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message)
        reject(chrome.runtime.lastError.message)
      } else {
        resolve(items[domain])
      }
    })
  })
}

function createReportString (report) {
  let reportStr = ''

  report.checks.forEach(check => {
    reportStr += createCheckString(check)
  })
  return (reportStr !== '')
    ? reportStr
    : 'No security report found.'
}

function createCheckString (check) {
  const name = check.type
  const result = (check.isPassing) ? 'pass' : 'fail'

  return `${name} security check: ${result}\n`
}
