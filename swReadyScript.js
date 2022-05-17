(() => {
  if (!('serviceWorker' in navigator)) {
    console.log('**** **** no service worker in navigator')
    return
  }

  navigator.serviceWorker.ready
    .then(swReg => {
      console.log('**** **** **** **** THE SEVICEWORKER.READY FIRED!')
      const scriptURL = swReg.active.scriptURL
      document.dispatchEvent(new CustomEvent('swReadyEvent', { detail: scriptURL }))
    })
})()
