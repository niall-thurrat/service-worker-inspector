// credit to Rob W for help here
// https://stackoverflow.com/questions/9515704/use-a-content-script-to-access-the-page-context-variables-and-functions
// inject script to page context from file script.js (web-accessible-resource)
const script = document.createElement('script')
script.src = chrome.runtime.getURL('swReadyScript.js')
script.onload = function () {
  this.remove()
};
(document.head || document.documentElement).appendChild(script)

// listen to event from injected script in page context
document.addEventListener('swReadyEvent', function (event) {
  console.log('#### |||| **** event has landed in content script')
  console.log(`received e.detail: ${event.detail}`)
})
