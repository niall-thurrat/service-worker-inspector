(() => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready
    .then(swReg => {
      const scriptURL = swReg.active.scriptURL
      document.dispatchEvent(new CustomEvent('swReadyEvent', { detail: scriptURL }))
    })
})()
