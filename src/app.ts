import gsap from 'gsap'
import { CONFIG } from './config'
import './style.css'
import { animateStationSection, setupStations } from './animations/stations'
import { setupHeroAnimations } from './animations/hero'
import { debounce } from 'lodash'
import { $, $all } from './utils'
import { setupPreloader } from './animations/preloader'
import { setupCustomCursor } from './animations/cursor'
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

export default class App {
  heroShown: boolean
  mainTimeline: gsap.core.Timeline
  videos: NodeListOf<HTMLVideoElement> | null

  constructor() {
    this.heroShown = true
    this.mainTimeline = gsap.timeline()
    this.videos = null
    window.app = this
    this.init()
  }

  init() {
    const mm = gsap.matchMedia(),
      breakpoint = 768
    console.log(this.videos)

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

        // setupPreloader(isDesktop, isMobile, reduceMotion)
        setupHeroAnimations(isDesktop, isMobile, reduceMotion)
        setupStations(isDesktop, isMobile, reduceMotion)
        setupCustomCursor()

        this.videos = $all('video') as NodeListOf<HTMLVideoElement>

        let lastTypewriterLabel = 1

        const animateTypewriter = debounce(
          (label: number) => {
            if (label === lastTypewriterLabel) return

            lastTypewriterLabel = label
            gsap
              .timeline()
              .to('#active-station-button .label', {
                typewrite: {
                  value: 'station ' + label,
                  speed: 0.2,
                  maxScrambleChars: 3,
                },
                ease: 'power4.out',
              })
              .to(
                '#active-station-button .title',
                {
                  typewrite: {
                    value: CONFIG.stations[label - 1],
                    speed: 0.3,
                    maxScrambleChars: 3,
                  },
                  ease: 'power4.out',
                },
                '<+30%',
              )
          },
          100,
          { trailing: true },
        )

        let currentActiveStation = 0
        let currentAnimation: gsap.core.Timeline | null = null

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
            onUpdate: self => {
              const progress = self.progress * 5 
              const currentSection = Math.floor(progress)
              const sectionProgress = progress - currentSection

              let targetSection
              if (self.getVelocity() > 0) {
                targetSection =
                  sectionProgress >= 0.5 ? currentSection + 1 : currentSection
              } else {
                targetSection =
                  sectionProgress <= 0.5 ? currentSection : currentSection + 1
              }

              if (targetSection >= 0 && targetSection <= positionsAnimations.length) {
                const newStationNumber = targetSection + 1
                if (currentActiveStation !== newStationNumber) {
                  triggerStationAnimation(newStationNumber)
                  animateTypewriter(newStationNumber)
                }
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

          const [x, yPercent] = pos
          if (x && yPercent) {
            gsap.set(
              `${selectors.station}-${id} ${selectors.stationBoxes} > *`,
              { autoAlpha: 0 },
            )

            const fTl = gsap
              .timeline()
              .to(selectors.factoriesContainer, { x, yPercent })
            this.mainTimeline.addLabel(id.toString()).add(fTl)
          } else {
            this.mainTimeline.addLabel(id.toString())
          }
        })

        function triggerStationAnimation(newStationNumber: number) {
          const oldStation = `${selectors.station}-${currentActiveStation} ${selectors.stationBoxes} > *`
          const newStation = `${selectors.station}-${newStationNumber} ${selectors.stationBoxes} > *`
          const { boxesDuration, boxesStaggerIn, boxesStaggerOut } = CONFIG.animations.stations

          if (currentAnimation) {
            currentAnimation.progress(1).kill()
          }

          currentAnimation = gsap.timeline()

          if (currentActiveStation) {
            currentAnimation.to(oldStation, {
              y:
                newStationNumber > currentActiveStation
                  ? -window.innerHeight / 4
                  : window.innerHeight / 4,
              autoAlpha: 0,
              duration: boxesDuration,
              ease: 'power3.out',
              stagger: boxesStaggerOut,
            })
          }

          currentAnimation.fromTo(
            newStation,
            {
              y:
                newStationNumber > currentActiveStation
                  ? window.innerHeight / 4
                  : -window.innerHeight / 4,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: boxesDuration,
              ease: 'power3.out',
              stagger: boxesStaggerIn,
            },
            currentActiveStation ? '>-0.25' : 0,
          )

          currentActiveStation = newStationNumber
        }
      },
    )

    if (CONFIG.debug) {
      console.log('[DEBUG]: NEXIOS_CONFIG: ', CONFIG)
    }
  }
}
