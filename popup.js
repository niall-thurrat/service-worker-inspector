
const testDiv = document.getElementById('getScriptURL')

chrome.runtime.onMessage.addListener(
  function (request, sender) {
    if (request.type === 'scriptURL') {
      testDiv.innerHTML = request.scriptURL
    }
    return true
  }
)
