import gsap from 'gsap'
import { CONFIG } from './config'
import './style.css'
import { setupStations } from './animations/stations'
import { setupHeroAnimations } from './animations/hero'
import { debounce } from 'lodash'
// import Lenis from 'lenis'
// import Snap from 'lenis/snap'

// const lenis = new Lenis({
//   lerp: 0.035
// })
//
// lenis.on('scroll', ScrollTrigger.update)
//
// gsap.ticker.add(time => {
//   lenis.raf(time * 1000)
// })
//
// gsap.ticker.lagSmoothing(0)

// const snap = new Snap(lenis, {
//   velocityThreshold: 0.5,
//   lerp: 0.07,
// })

interface BoxAnimation {
  label: number
  tl: gsap.core.Timeline
}
export default class App {
  heroShown: boolean
  mainTimeline: gsap.core.Timeline

  constructor() {
    this.heroShown = false
    this.mainTimeline = gsap.timeline()
    window.app = this
    this.init()
    this.setupEvents()
  }

  init() {
    const mm = gsap.matchMedia(),
      breakpoint = 768

    mm.add(
      {
        isDesktop: `(min-width: ${breakpoint}px)`,
        isMobile: `(max-width: ${breakpoint - 1}px)`,
        reduceMotion: `(prefers-reduced-motion: reduce)`,
      },
      context => {
        const { isDesktop, isMobile, reduceMotion } =
          context.conditions as gsap.Conditions
        const { selectors } = CONFIG

        // setupShowFactoriesAnimations(isDesktop, isMobile, reduceMotion)
        setupHeroAnimations(isDesktop, isMobile, reduceMotion)
        setupStations(isDesktop, isMobile, reduceMotion)

        const boxAnimations: BoxAnimation[] = []
        let currentAnimation: BoxAnimation | null = null
        let lastAnimatedLabel = 0
        const threshold = 0.001 // Adjust this value to control when the next box fades in

        const animateBox = (labelToScroll: number) => {
          const newAnimation = boxAnimations[labelToScroll - 1]

          if (
            newAnimation &&
            (labelToScroll !== lastAnimatedLabel ||
              newAnimation.tl.progress() === 0)
          ) {
            if (currentAnimation && currentAnimation !== newAnimation) {
              currentAnimation.tl.reverse()
            }

            if (
              newAnimation.tl.reversed() ||
              newAnimation.tl.progress() === 0
            ) {
              newAnimation.tl.play()
            }

            currentAnimation = newAnimation

            gsap
              .timeline()
              .to('#active-station-button .label', {
                typewrite: {
                  value: 'station ' + labelToScroll,
                  speed: 0.2,
                  maxScrambleChars: 3,
                },
                ease: 'power4.out',
              })
              .to(
                '#active-station-button .title',
                {
                  typewrite: {
                    value: CONFIG.stations[labelToScroll - 1],
                    speed: 0.3,
                    maxScrambleChars: 3,
                  },
                  ease: 'power4.out',
                },
                '<+30%',
              )

            lastAnimatedLabel = labelToScroll
          }
        }

        // Create the main timeline with ScrollTrigger
        this.mainTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '#station-1',
            endTrigger: '#station-5',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
            snap: {
              snapTo: 'labelsDirectional',
              duration: { min: 0.8, max: 1 },
              ease: 'power2.out',
              delay: 0,
              inertia: false,
              directional: false,
            },
            onUpdate: (self: ScrollTrigger) => {
              const progress = self.progress
              const labelToScroll = Math.round(progress * 5) + 1
              const distance = Math.abs(progress - (labelToScroll - 1) / 5)

              if (distance < threshold) {
                animateBox(labelToScroll)
              } else if (
                currentAnimation &&
                labelToScroll !== lastAnimatedLabel
              ) {
                // Reverse the current animation when scrolling away
                currentAnimation.tl.reverse()
                currentAnimation = null
              }
            },
          },
        })

        // [x: () => x, yPercent] @todo: find ratios if video sizes will be same
        const positionsAnimations = isMobile
          ? [
              [() => -(window.innerHeight * 0.4), -25],
              [() => -(window.innerHeight * 0.9), -55],
              [() => -(window.innerHeight * 1.4), -85],
              [() => -(window.innerHeight * 1.9), -115],
              [() => -(window.innerHeight * 3), -180],
              [],
            ]
          : [
              [() => -(window.innerHeight * 0.83), -105],
              [() => -(window.innerHeight * 1.72), -215],
              [() => -(window.innerHeight * 2.57), -320],
              [() => -(window.innerHeight * 3.4), -425],
              [() => -(window.innerHeight * 5), -600],
              [],
            ]

        positionsAnimations.forEach((pos, i) => {
          const id = i + 1
          const boxId = '#draggable-box-' + id
          const [x, yPercent] = pos
          if (x && yPercent) {
            gsap.set(boxId, { autoAlpha: 0 })

            const fTl = gsap
              .timeline()
              .to(selectors.factoriesContainer, { x, yPercent })
            this.mainTimeline.addLabel(id.toString()).add(fTl)

            const boxAnimation = gsap
              .timeline({ paused: true })
              .fromTo(
                `${selectors.box}-${id}`,
                { y: window.innerHeight / 3, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 1.3, ease: 'power3.inOut' },
              )
            boxAnimations.push({ label: id, tl: boxAnimation })
          } else {
            this.mainTimeline.addLabel(id.toString())
          }
        })
      },
    )

    if (CONFIG.debug) {
      console.log('[DEBUG]: NEXIOS_CONFIG: ', CONFIG)
    }
  }

  setupEvents() {}
}
