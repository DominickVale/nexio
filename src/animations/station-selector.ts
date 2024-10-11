import { CONFIG } from '../config'
import { $ } from '../utils'
import gsap from 'gsap'

export default class StationSelector {
  currIdx: number
  links: HTMLElement[]
  wrapper: HTMLElement | null
  isMobile: boolean
  isDesktop: boolean
  reduceMotion: boolean
  shown: boolean
  mainButton: HTMLElement | null
  dropdown: HTMLElement | null

  constructor(isDesktop: boolean, isMobile: boolean, reduceMotion: boolean) {
    this.currIdx = 1
    this.links = []
    this.wrapper = null
    this.isDesktop = isDesktop
    this.isMobile = isMobile
    this.reduceMotion = reduceMotion
    this.shown = false
    this.mainButton = null
    this.dropdown = null
  }

  setup() {
    this.links = gsap.utils.toArray<HTMLElement>(CONFIG.selectors.stationLinks)
    this.wrapper = $(CONFIG.selectors.activeStationWrapper)
    this.mainButton = $(CONFIG.selectors.activeStationBtn)
    this.dropdown = $(CONFIG.selectors.activeStationDropdown)

    if (!this.wrapper || !this.mainButton || !this.dropdown) {
      console.error(this.wrapper, this.mainButton)
      throw Error('[NEXIO]: Elements not found')
    }

    this.links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault()
        this.handleClick(link, this.isDesktop)
      })
    })

    this.dropdown.addEventListener('mouseleave', () => this.handleMouseLeave())
    this.mainButton.addEventListener('click', () => this.open())
  }

  open() {
    gsap
      .timeline()
      .to(this.dropdown, {
        borderColor: 'white',
        duration: 0.2,
        ease: 'power4.out',
      })
      .to(this.dropdown, {
        height: 'auto',
        duration: CONFIG.animations.stationSelector.durationOpen,
        ease: CONFIG.animations.stationSelector.easeOpen,
        onComplete: () => {
          this.shown = true
        },
      }, "<")
  }

  close() {
    gsap.timeline()
      .to(this.dropdown, {
        height: 0,
        duration: CONFIG.animations.stationSelector.durationOpen,
        ease: CONFIG.animations.stationSelector.easeOpen,
        onComplete: () => {
          this.shown = false
        },
      })
      .to(this.dropdown, {
        borderColor: 'transparent',
        duration: CONFIG.animations.stationSelector.durationClose / 2,
        ease: 'power4.in',
      }, "<+=90%")
  }

  handleClick(link: HTMLElement, isDesktop: boolean) {
    const idx = Number(link.getAttribute('data-station'))
    const labelPos = window.app.mainTimeline.scrollTrigger!.labelToScroll(
      (idx - 1).toString(),
    )

    this.close()
    gsap.to(window, {
      scrollTo: labelPos,
      duration: 1,
      ease: 'power3.inOut',
    })
  }

  handleMouseLeave() {
    this.close()
  }
}
