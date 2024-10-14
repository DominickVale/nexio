import gsap from 'gsap'
import { debounce } from 'lodash'
import { CONFIG } from '../config'
import { $all } from '../utils'
import { setupHeroAnimations } from './hero'
import { setupStations } from './stations'
import Observer from 'gsap/Observer'

export class Homepage {
  videos: NodeListOf<HTMLVideoElement> | null
  isDesktop: boolean
  isMobile: boolean
  reduceMotion: boolean
  currentIndex: number
  currentAnimation: gsap.core.Timeline | undefined
  positionsAnimations: (number | (() => number))[][] | undefined
  isAnimating: boolean

  constructor(isDesktop: boolean, isMobile: boolean, reduceMotion: boolean) {
    this.videos = null

    this.currentIndex = 1
    this.isAnimating = false

    this.isDesktop = isDesktop
    this.isMobile = isMobile
    this.reduceMotion = reduceMotion
    this.setup()
  }

  setup() {
    const { selectors, animations } = CONFIG

    setupHeroAnimations(this.isDesktop, this.isMobile, this.reduceMotion)
    setupStations(this.isDesktop, this.isMobile, this.reduceMotion)

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
              maxScrambleChars: 3,
            },
            duration: CONFIG.animations.typewriter.defaultDuration / 2,
            ease: 'power4.out',
          })
          .to(
            '#active-station-button .title',
            {
              typewrite: {
                value: CONFIG.stations[label - 1],
                maxScrambleChars: CONFIG.animations.typewriter.maxScrambleChars,
              },
              duration: CONFIG.animations.typewriter.defaultDuration,
              ease: CONFIG.animations.typewriter.ease,
            },
            '<+30%',
          )
      },
      100,
      { trailing: true },
    )

    // Create the main timeline with ScrollTrigger
    window.app.mainTimeline = gsap.timeline({})

    this.positionsAnimations = this.isMobile
      ? animations.stations.positionsMobile
      : animations.stations.positionsDesktop

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
        console.log(this.positionsAnimations, this.currentIndex, this.isAnimating)
        if (this.currentIndex > 1 && !this.isAnimating) {
          this.triggerStationAnimation(this.currentIndex - 1)
        }
      },
      onUp: () => {
        console.log(this.positionsAnimations, this.currentIndex, this.isAnimating)
        if (
          this.currentIndex < this.positionsAnimations!.length - 1 &&
          !this.isAnimating
        ) {
          this.triggerStationAnimation(this.currentIndex + 1)
        }
      },
      tolerance: 10,
      preventDefault: true,
    })
  }

  public triggerStationAnimation(newStationNumber: number) {
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
      finishThreshold
    } = animations.stations

    const direction =
      newStationNumber === this.currentIndex
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
        if (this.progress() >= finishThreshold) {
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

      const [x, yPercent] = this.positionsAnimations[posId]
      console.log("New pos: ", x, yPercent)

      const isAnimatingFooterUp = newStationNumber === this.positionsAnimations.length - 2 && direction === 'up'
      this.isAnimating = true
      this.currentAnimation
        .set([oldStation, oldStationBoxes], { clearProps: 'zIndex' })
        .to(selectors.factoriesContainer, { x, yPercent }, isAnimatingFooterUp ? animations.footer.hide.duration / 2 : 0)
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

      if (newStationNumber === this.positionsAnimations.length - 1) {
        this.currentAnimation.to('.footer-mask', animations.footer.reveal, "<")
      } else if (isAnimatingFooterUp) {
        this.currentAnimation.to('.footer-mask', animations.footer.hide, "0")
      }
    }
    this.currentIndex = newStationNumber
  }
}
