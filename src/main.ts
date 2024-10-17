import App from './app'
import gsap from 'gsap'

import ScrollToPlugin from 'gsap/ScrollToPlugin'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Draggable from 'gsap/Draggable'
import Observer from 'gsap/Observer'
import CustomEase from 'gsap/CustomEase'
//@ts-expect-error 
import { TypewriterPlugin } from './animations/TypewriterPlugin'
import './styles.css'

gsap.registerPlugin(Observer)
gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(Draggable)
gsap.registerPlugin(ScrollToPlugin)
gsap.registerPlugin(TypewriterPlugin)
gsap.registerPlugin(CustomEase)

new App()

function fancyMotd() {
  console.log('\n\nLoaded javascript.\n\n')
}

;(() => {
  fancyMotd()
  return 0
})()
