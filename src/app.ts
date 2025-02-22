import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { CustomCursor } from './animations/cursor'
import { Homepage } from './animations/homepage'
import { CONFIG } from './config'
import { setupScrambles } from './animations/TextScramble'
import { setupPreloader } from './animations/preloader'
import { debounce } from 'lodash'
import { Rive } from '@rive-app/webgl2'

export default class App {
  heroShown: boolean
  isHomepage: boolean
  cursor: CustomCursor
  mainTimeline: gsap.core.Timeline
  homePage: Homepage | undefined
  lastWindowWidth: number = window.innerWidth
  riveAnims: { desktop: Rive | null; mobile: Rive | null } = {
    desktop: null,
    mobile: null,
  }
  debouncedOnResize: () => void

  constructor() {
    this.heroShown = true
    this.debouncedOnResize = debounce(() => {
      if (
        (this.lastWindowWidth < CONFIG.breakpoints.tablet &&
          window.innerWidth > CONFIG.breakpoints.tablet) ||
        (this.lastWindowWidth > CONFIG.breakpoints.tablet &&
          window.innerWidth < CONFIG.breakpoints.tablet)
      ) {
        window.location.reload()
      }
      this.lastWindowWidth = window.innerWidth
    }, 1000)
    if(window.app){
      //just to be sure
      //@ts-ignore
      delete window.app
    }
    window.app = this
    this.isHomepage = window.location.pathname === '/'
    this.mainTimeline = gsap.timeline()
    this.cursor = new CustomCursor()
    this.init()
  }

  init() {
    window.addEventListener('resize', this.debouncedOnResize)
    const mm = gsap.matchMedia()
    const br = CONFIG.breakpoints

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
        isMobile: `(max-width: ${br.mobile}px)`,
        isTablet: `(min-width: ${br.mobile + 1}px) and (max-aspect-ratio: 1/1)`,
        isDesktop: `(min-width: ${br.mobile + 1}px) and (min-aspect-ratio: 1/1)`,
        reduceMotion: `(prefers-reduced-motion: reduce)`,
      },
      context => {
        const breakpoints = context.conditions as gsap.Conditions
        if (CONFIG.debug) {
          console.log('[NEXIO]: BREAKPOINTS: ', breakpoints)
        }

        setupPreloader()
        if (this.isHomepage) {
          setupScrambles()
          this.homePage = new Homepage(breakpoints)
        }
      },
    )

    if (CONFIG.debug) {
      console.log('[NEXIO]: NEXIOS_CONFIG: ', CONFIG)
    }
  }
  onPreloadComplete() {
    if (this.isHomepage && this.homePage?.hero) {
      this.homePage.hero.animateIn()
    }
  }
}
