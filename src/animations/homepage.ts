import gsap from 'gsap'
import { CONFIG } from '../config'
import { $, $all } from '../utils'
import { setupHeroAnimations } from './hero'
import { setupStations } from './stations'
import Observer from 'gsap/Observer'
import { type Hero } from './hero.ts'

export class Homepage {
  videos: NodeListOf<HTMLVideoElement> | null
  currentIndex: number
  currentAnimation: gsap.core.Timeline | undefined
  positionsAnimations: (number | (() => number))[][] | undefined
  isAnimating: boolean
  hero: Hero | undefined
  breakpoints: gsap.Conditions

  constructor(breakpoints: gsap.Conditions) {
    this.videos = null

    this.currentIndex = 1
    this.isAnimating = false

    this.breakpoints = breakpoints
    this.setup()
  }

  setup() {
    const { selectors, animations } = CONFIG

    this.hero = setupHeroAnimations(this.breakpoints)
    setupStations(this.breakpoints)

    this.videos = $all('video') as NodeListOf<HTMLVideoElement>
    gsap.set(selectors.canvasContainer, { pointerEvents: 'none' })
    gsap.set(`${CONFIG.selectors.activeStationBtn} img[data-id]`, { opacity: 0 })
    gsap.set(`${CONFIG.selectors.activeStationBtn} img[data-id="1"]:not([data-inverted])`, { opacity: 1 })

    // Create the main timeline with ScrollTrigger
    window.app.mainTimeline = gsap.timeline({})

    this.positionsAnimations = animations.stations.positionsMobile
    if (this.breakpoints.isTablet)
      this.positionsAnimations = animations.stations.positionsTablet
    if (this.breakpoints.isDesktop)
      this.positionsAnimations = animations.stations.positionsDesktop
    console.log('positions: ', this.positionsAnimations)

    this.positionsAnimations.forEach((pos, i) => {
      const id = i + 1

      const [x, yPercent] = pos
      if (x && yPercent) {
        gsap.set(`${selectors.station}-${id} ${selectors.stationBoxes} > *`, {
          autoAlpha: 0,
        })
      }
    })

    Observer.create({
      type: 'wheel,touch',
      wheelSpeed: -1,
      onDown: () => {
        if (
          this.currentIndex > 1 &&
          !this.isAnimating &&
          !window.app.heroShown
        ) {
          this.triggerStationAnimation(this.currentIndex - 1)
        }
      },
      onUp: () => {
        if (
          this.currentIndex < this.positionsAnimations!.length - 1 &&
          !this.isAnimating &&
          !window.app.heroShown
        ) {
          this.triggerStationAnimation(this.currentIndex + 1)
        }
      },
      tolerance: 10,
      preventDefault: true,
    })
    $(selectors.backToTop)!.addEventListener('click', () => {
      this.triggerStationAnimation(1, true)
    })
  }

  public triggerStationAnimation(
    newStationNumber: number,
    fromBottomToTop?: boolean,
  ) {
    const { selectors, animations } = CONFIG
    const oldStation = `${selectors.station}-${this.currentIndex}`
    const newStation = `${selectors.station}-${newStationNumber}`

    const oldStationBoxes = `${oldStation} ${selectors.stationBoxes} > *`
    const newStationBoxes = `${newStation} ${selectors.stationBoxes} > *`
    const {
      boxesDuration,
      boxesStaggerIn,
      boxesStaggerOut,
      boxesEase,
      boxesYOffsetFactor,
      finishThresholdDesktop,
      finishThresholdMobile,
      factoriesScrollDuration,
      factoriesScrollEase,
    } = animations.stations

    const direction = fromBottomToTop
      ? 'up'
      : newStationNumber === this.currentIndex
        ? 'same'
        : newStationNumber > this.currentIndex
          ? 'down'
          : 'up'

    if (this.currentAnimation) {
      this.currentAnimation.progress(1).kill()
    }

    const that = this
    this.currentAnimation = gsap.timeline({
      onUpdate() {
        const threshold = that.breakpoints.isTablet
          ? finishThresholdMobile
          : finishThresholdDesktop
        if (this.progress() >= threshold) {
          that.isAnimating = false
        }
      },
    })
    if (CONFIG.debug)
      console.log(
        '[NEXIO]: oldStation: ',
        this.currentIndex,
        'newStation: ',
        newStationNumber,
      )

    if (
      this.positionsAnimations &&
      newStationNumber < this.positionsAnimations.length
    ) {
      const posId =
        direction === 'down' || direction === 'same'
          ? newStationNumber - 1
          : this.currentIndex - 2

      const isAnimatingFooterUp =
        fromBottomToTop ||
        (newStationNumber === this.positionsAnimations.length - 2 &&
          direction === 'up')
      this.isAnimating = true
      if (window.innerWidth <= CONFIG.breakpoints.tablet) {
        window.app.riveAnims.mobile?.setNumberStateAtPath(
          CONFIG.riveAnims.stationInput,
          newStationNumber,
          CONFIG.riveAnims.mobile.inputPath,
        )
      } else {
        window.app.riveAnims.desktop?.setNumberStateAtPath(
          CONFIG.riveAnims.stationInput,
          newStationNumber,
          CONFIG.riveAnims.desktop.inputPath,
        )
      }
      this.currentAnimation
        .set([oldStation, oldStationBoxes], { clearProps: 'zIndex' })
        .to(
          oldStationBoxes,
          {
            y:
              newStationNumber > this.currentIndex
                ? -window.innerHeight / boxesYOffsetFactor
                : window.innerHeight / boxesYOffsetFactor,
            autoAlpha: 0,
            duration: boxesDuration,
            ease: boxesEase,
            stagger: boxesStaggerOut,
          },
          '<',
        )
        .set([newStation, newStationBoxes], { zIndex: 20 })
        .fromTo(
          newStationBoxes,
          {
            y:
              newStationNumber > this.currentIndex
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
          this.currentIndex ? '>-0.25' : 0,
        )

      if (newStationNumber < this.positionsAnimations.length - 1) {
        gsap
          .timeline()
          .to(
            '#active-station-button .label',
            {
              typewrite: {
                value: 'station ' + newStationNumber,
                maxScrambleChars: 3,
              },
              ...CONFIG.animations.stationSelector.typewriter,
            },
            '<',
          )
          .to(
            '#active-station-button .title',
            {
              typewrite: {
                value: CONFIG.stations[newStationNumber - 1],
                maxScrambleChars: CONFIG.animations.typewriter.maxScrambleChars,
              },
              ...CONFIG.animations.stationSelector.typewriter,
            },
            '<+30%',
          )
          .add(this.animateStationSelectorImgs(newStationNumber), '<')
      }

      // REVEAL FOOTER
      if (newStationNumber === this.positionsAnimations.length - 1) {
        this.currentAnimation
          .set(selectors.stationBoxes, { pointerEvents: 'none' }, '<')
          .set(selectors.canvasContainer, { pointerEvents: 'auto' }, '<')
          .to('.footer-mask', animations.footer.reveal, '<')
          .to(
            selectors.stationSelection,
            {
              y: () => -window.innerHeight,
              duration: animations.footer.reveal.duration,
              ease: animations.footer.reveal.ease,
            },
            '<-20%',
          )
        // HIDE FOOTER
      } else if (isAnimatingFooterUp) {
        this.currentAnimation
          .set(selectors.stationBoxes, { pointerEvents: 'auto' }, "<")
          .set(selectors.canvasContainer, { pointerEvents: 'none' }, '<')
          .to('.footer-mask', animations.footer.hide, '0')
          .to(
            selectors.stationSelection,
            {
              y: 0,
              duration: animations.footer.reveal.duration,
              ease: animations.footer.reveal.ease,
            },
            '<',
          )
      }
    }
    this.currentIndex = newStationNumber
  }

  animateStationSelectorImgs(stationId: number) {
    const tl = gsap.timeline()
    const images = `${CONFIG.selectors.activeStationBtn} img[data-id]`
    const activeImg = `${CONFIG.selectors.activeStationBtn} img[data-id="${stationId}"]:not([data-inverted])`

    const { buttonImageAppear, buttonImageHide } =
      CONFIG.animations.stationSelector

    tl.to(images, buttonImageHide)
      .set(activeImg, {
        zIndex: 10,
      })
      .to(activeImg, buttonImageAppear)
      .set(images, {
        zIndex: 1,
      })

    return tl
  }
}
