import gsap from 'gsap'
import { CONFIG } from './config'
import './style.css'
import { setupShowFactoriesAnimations } from './animations/show-factories'
import { setupHeroAnimations } from './animations/hero'
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

        this.mainTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '#station-1',
            endTrigger: '#station-5',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
            // markers: true,
            snap: {
              snapTo: 'labelsDirectional',
              duration: { min: 0.8, max: 1 },
              ease: 'power4.out',
              delay: 0,
              inertia: false,
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

        // build animations
        positionsAnimations.forEach((pos, i) => {
          const id = i + 1
          const boxId = '#draggable-box-' + id
          const [x, yPercent] = pos
          if (x && yPercent) {
            // set box opacity
            console.log('setting ', boxId, 'opacity 0')
            gsap.set(boxId, {
              autoAlpha: 0,
            })

            // scrolling animation (factories)
            const fTl = gsap.timeline().to(selectors.factoriesContainer, {
              x,
              yPercent,
            })

            this.mainTimeline.addLabel(id.toString()).add(fTl)

            // draggable boxes animations
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: `#station-${id}`,
                  start: 'center 80%',
                  end: 'center 40%',
                  // markers: true,
                  toggleActions: 'play reverse play reverse',
                  preventOverlaps: true,
                },
              })
              .from(`${selectors.box}-${id}`, {
                y: () => window.innerHeight,
                duration: 1.2,
                ease: 'power4.inOut',
              })
              .to(
                `${selectors.box}-${id}`,
                {
                  autoAlpha: 1,
                  ease: 'power4.inOut',
                },
                '<',
              )
          } else {
            this.mainTimeline.addLabel(id.toString())
          }
        })

        // build snap points
        // positionsAnimations.forEach((_, i) => {
        //   const id = (i + 1).toString()
        //   const snapPos = mainTimeline.scrollTrigger!.labelToScroll(id)
        //   snap.add(snapPos)
        //   console.log(snapPos)
        // })

        // nav buttons
        //
        // gsap.utils.toArray('.navigation a').forEach(link => {
        //   const l = link as HTMLAnchorElement
        //   l.addEventListener('click', e => {
        //     e.preventDefault()
        //     const scrTo = l.getAttribute('data-scroll-to') || '0'
        //     const labelPos = mainTimeline.scrollTrigger!.labelToScroll(scrTo)
        //
        //     // lenis.scrollTo(labelPos)
        //     console.log(labelPos)
        //     gsap.to(window, {
        //       scrollTo: labelPos,
        //       duration: 1,
        //       ease: 'power3.inOut',
        //     })
        //   })
        // })
      },
    )

    if (CONFIG.debug) {
      console.log('[DEBUG]: NEXIOS_CONFIG: ', CONFIG)
    }
  }

  setupEvents() {}
}
