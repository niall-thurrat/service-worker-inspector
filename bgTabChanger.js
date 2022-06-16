(() => {
  const urls = [
    'www.youtube.com',
    'www.tradera.com',
    'www.techopedia.com',
    'www.sverigeskalender.se',
    'www.reddit.com',
    'pattern.monster',
    'www.findpwa.com',
    'wheelcarnival.com',
    'vinyltap.co',
    'viblo.asia',
    'regex101.com',
    'phonograph.app',
    'llama.party',
    'forum.freecodecamp.org',
    'drive.google.com',
    'www.iheart.com/podcast',
    'developers.google.com',
    'codelabs.developers.google.com',
    'app.ft.com',
    '2048-opera-pwa.surge.sh',
    'anonace.com',
    'app.destinyitemmanager.com',
    'audiotube.epicweb.app',
    'aurora.lunarworks.co.uk',
    'beat-tap.firebaseapp.com',
    'bitcoinverter.herokuapp.com',
    'briefform.de',
    'calculator.iondrimbafilho.me',
    'calendo.dav-apps.tech',
    'canvas.apps.chrome',
    'coinhodler.io',
    'coinranking.com',
    'crossnote.app',
    'deckdeckgo.app',
    'encounters.heromuster.com',
    'epiconlineorchestra.com',
    'exiferaser.epicweb.app',
    'periodic-table.io',
    'soccer.coachaide.com',
    'webcodeditor.netlify.app'//,
    // 'www.basket.se',
    // 'en.wikipedia.org',
    // 'uppsalabasket.se',
    // 'basketlandslagen.se',
    // 'www.vibybasket.se',
    // 'www.flashscore.se',
    // 'www.aikbasket.se',
    // 'stockholmbasket.se',
    // 'www.jamtlandbasket.se',
    // 'www.svenskalag.se',
    // 'www.britannica.com',
    // 'www.svt.se',
    // 'www.ne.se',
    // 'www.svtplay.se',
    // 'www.newworldencyclopedia.org',
    // 'www.lg.com',
    // 'www.allente.se',
    // 'www.history.com',
    // 'www.tekniskamuseet.se',
    // 'www.elon.edu',
    // 'cafedelites.com',
    // 'www.bbcgoodfood.com',
    // 'www.healthline.com',
    // 'www.allrecipes.com',
    // 'foodnetwork.co.uk',
    // 'cooking.nytimes.com',
    // 'salmonbusiness.com',
    // 'www.zapmeta.ws',
    // 'zagseafood.com.au',
    // 'www.jamieoliver.com',
    // 'rentroutine.com',
    // 'store.steampowered.com',
    // 'dictionary.cambridge.org',
    // 'www.merriam-webster.com',
    // 'www.dictionary.com',
    // 'www.polygon.com',
    // 'www.collinsdictionary.com',
    // 'www.ldoceonline.com',
    // 'www.ign.com',
    // 'www.thefreedictionary.com'
  ]

  let index = 0
  const changeTab = setInterval(changeTabUrl, 6000)

  async function changeTabUrl () {
    try {
      const protocol = 'https://'
      const url = `${protocol}${urls[index]}/`

      await chrome.tabs.update({ url }, (tab) => {
        if (isExtensionUrl(tab.pendingUrl)) {
          const httpUrl = `http://${urls[index]}/`
          chrome.tabs.update({ httpUrl })
        }
      })
      index++

      if (index === urls.length) {
        clearInterval(changeTab)
      }
    } catch (err) {
      console.error(err)
    }
  }

  function isExtensionUrl (url) {
    return /^chrome-extension/.test(url)
  }
})()
