import App from './app'
import gsap from 'gsap'

import ScrollToPlugin from 'gsap/ScrollToPlugin'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(ScrollToPlugin)

new App()

function fancyMotd() {
  console.log('\n\nLoaded javascript.\n\n')
}

;(() => {
  fancyMotd()
  return 0
})()
