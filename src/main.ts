import App from './app'
import gsap from 'gsap'

import ScrollToPlugin from 'gsap/ScrollToPlugin'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Draggable from 'gsap/Draggable'
//@ts-expect-error 
import { TypewriterPlugin } from './animations/TypewriterPlugin'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(Draggable)
gsap.registerPlugin(ScrollToPlugin)
gsap.registerPlugin(TypewriterPlugin)

new App()

function fancyMotd() {
  console.log('\n\nLoaded javascript.\n\n')
}

;(() => {
  fancyMotd()
  return 0
})()
