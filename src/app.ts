import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { debounce } from 'lodash'
import { CustomCursor } from './animations/cursor'
import { setupHeroAnimations } from './animations/hero'
import { setupStations } from './animations/stations'
import { CONFIG } from './config'
import { $all } from './utils'
import Lenis from 'lenis'

export default class App {
  heroShown: boolean
  mainTimeline: gsap.core.Timeline
  videos: NodeListOf<HTMLVideoElement> | null
  cursor: CustomCursor | null

  constructor() {
    this.heroShown = true
    this.mainTimeline = gsap.timeline()
    this.videos = null
    window.app = this
    this.cursor =
      window.innerWidth > CONFIG.breakpoints.maxMobile
        ? new CustomCursor({
            cursorId: CONFIG.selectors.cursor,
            hoverSelectors: CONFIG.selectors.cursorHoverables,
          })
        : null
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
        const { selectors } = CONFIG

        // setupPreloader(isDesktop, isMobile, reduceMotion)
        setupHeroAnimations(isDesktop, isMobile, reduceMotion)
        setupStations(isDesktop, isMobile, reduceMotion)

        this.videos = $all('video') as NodeListOf<HTMLVideoElement>

        this.videos.forEach(v => {
          v.pause()
        })
        console.log(this.videos)

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
                    speed: CONFIG.animations.typewriter.defaultSpeed,
                    maxScrambleChars:
                      CONFIG.animations.typewriter.maxScrambleChars,
                  },
                  ease: CONFIG.animations.typewriter.ease,
                },
                '<+30%',
              )
          },
          100,
          { trailing: true },
        )

        let currentActiveStation = 0
        let currentAnimation: gsap.core.Timeline | null = null
        let lastDirection: 'up' | 'down' = 'down'

        console.log('snap eanbled? ', CONFIG.animations.stations.snap)
        // Create the main timeline with ScrollTrigger
        this.mainTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '#station-1',
            endTrigger: '#station-5',
            start: 'top top',
            end: 'bottom top',
            scrub: CONFIG.animations.stations.scrollScrub,
            snap: CONFIG.animations.stations.snap
              ? {
                  snapTo: 'labelsDirectional',
                  duration: CONFIG.animations.stations.snapDuration,
                  ease: CONFIG.animations.stations.snapEase,
                  delay: 0,
                  inertia: false,
                  directional: false,
                }
              : undefined,
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

              if (
                targetSection >= 0 &&
                targetSection <= positionsAnimations.length
              ) {
                const newStationNumber = targetSection + 1
                lastDirection =
                  newStationNumber > currentActiveStation ? 'down' : 'up'
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

        const triggerStationAnimation = (newStationNumber: number) => {
          const oldStation = `${selectors.station}-${currentActiveStation}`
          const newStation = `${selectors.station}-${newStationNumber}`
          const oldStationBoxes = `${oldStation} ${selectors.stationBoxes} > *`
          const newStationBoxes = `${newStation} ${selectors.stationBoxes} > *`
          const {
            boxesDuration,
            boxesStaggerIn,
            boxesStaggerOut,
            boxesEase,
            boxesYOffsetFactor,
          } = CONFIG.animations.stations

          if (currentAnimation) {
            currentAnimation.progress(1).kill()
          }

          currentAnimation = gsap.timeline()
          if (CONFIG.debug)
            console.log(
              '[NEXIO]: oldStation: ',
              currentActiveStation,
              'newStation: ',
              newStationNumber,
            )

          if (currentActiveStation) {
            currentAnimation
              .set([oldStation, oldStationBoxes], { clearProps: 'zIndex' })
              .to(oldStationBoxes, {
                y:
                  newStationNumber > currentActiveStation
                    ? -window.innerHeight / boxesYOffsetFactor
                    : window.innerHeight / boxesYOffsetFactor,
                autoAlpha: 0,
                duration: boxesDuration,
                ease: boxesEase,
                stagger: boxesStaggerOut,
              })
              .set([newStation, newStationBoxes], { zIndex: 20 })
              .fromTo(
                newStationBoxes,
                {
                  y:
                    newStationNumber > currentActiveStation
                      ? window.innerHeight / boxesYOffsetFactor
                      : -window.innerHeight / boxesYOffsetFactor,
                  autoAlpha: 0,
                },
                {
                  y: (_, t) => t.style.getPropertyValue('--drag-y'),
                  x: (_, t) => t.style.getPropertyValue('--drag-x'),
                  autoAlpha: 1,
                  duration: boxesDuration,
                  ease: boxesEase,
                  stagger: boxesStaggerIn,
                },
                currentActiveStation ? '>-0.25' : 0,
              )
          }
          this.updateVideos(
            lastDirection,
            newStationNumber,
            currentActiveStation,
          )
          currentActiveStation = newStationNumber
        }
      },
    )

    if (CONFIG.debug) {
      console.log('[NEXIO]: NEXIOS_CONFIG: ', CONFIG)
    }
  }

  updateVideos(direction: 'up' | 'down', newId: number, currIdx: number) {
    gsap.utils.toArray<HTMLVideoElement>('video').forEach((v, i) => {
      const idx = i + 1
      const prev = direction === 'up' ? newId : currIdx
      const next = direction === 'down' ? newId : newId - 1

      if (idx === prev || idx === next) {
        v.play()
        v.loop = true
      } else {
        v.currentTime = 0
        v.pause()
      }
    })
  }
}
