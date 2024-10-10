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

        let isAnimating = false
        let currentLabel = 1
        let lastTypewriterLabel = 1

        const animateBox = debounce(
          (labelToScroll: number) => {
            if (isAnimating || labelToScroll === currentLabel) return
            isAnimating = true

            if (this.videos) {
              console.log(
                'Played video:',
                labelToScroll - 1,
                this.videos[labelToScroll - 1],
              )

              // this.videos[labelToScroll - 1].play()
            }

            animateStationSection(currentLabel, labelToScroll, () => {
              isAnimating = false
              currentLabel = labelToScroll
            })
          },
          100,
          { trailing: true, leading: true },
        )

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
              const exactProgressForLabel = (labelToScroll - 1) / 5
              const distance = Math.abs(progress - exactProgressForLabel)

              const { boxesSnapThreshold, stationSelectorSnapThreshold } =
                CONFIG.animations.stations
              if (
                !isAnimating &&
                labelToScroll !== currentLabel &&
                distance < boxesSnapThreshold
              ) {
                animateBox(labelToScroll)
              }

              if (distance < stationSelectorSnapThreshold) {
                animateTypewriter(labelToScroll)
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
            gsap.set(`${selectors.station}-${id} ${selectors.stationBoxes} > *`, { autoAlpha: 0 })

            const fTl = gsap
              .timeline()
              .to(selectors.factoriesContainer, { x, yPercent })
            this.mainTimeline.addLabel(id.toString()).add(fTl)
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
}
