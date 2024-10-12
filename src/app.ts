import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { CustomCursor } from './animations/cursor'
import { setupHomepage } from './animations/homepage'
import { CONFIG } from './config'
import { setupScrambles } from './animations/TextScramble'

export default class App {
  heroShown: boolean
  isHomepage: boolean
  cursor: CustomCursor

  constructor() {
    this.heroShown = true
    window.app = this
    this.cursor = new CustomCursor()
    this.isHomepage = window.location.pathname === "/"
    this.init()
  }

  init() {
    const mm = gsap.matchMedia(),
      breakpoint = CONFIG.breakpoints.maxMobile

    if (CONFIG.enableSmoothScroll) {
      const lenis = new Lenis()

      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(time => {
        lenis.raf(time * 1000)
      })

      gsap.ticker.lagSmoothing(0)
    }

    mm.add(
      {
        isDesktop: `(min-width: ${breakpoint}px)`,
        isMobile: `(max-width: ${breakpoint - 1}px)`,
        reduceMotion: `(prefers-reduced-motion: reduce)`,
      },
      context => {
        const { isDesktop, isMobile, reduceMotion } =
          context.conditions as gsap.Conditions

        // setupPreloader(isDesktop, isMobile, reduceMotion)
        console.log(window.location.pathname, window.location.pathname === '/')
        if (this.isHomepage) {
          setupScrambles()
          setupHomepage(isDesktop, isMobile, reduceMotion)
        }
      },
    )

    if (CONFIG.debug) {
      console.log('[NEXIO]: NEXIOS_CONFIG: ', CONFIG)
    }
  }
}
