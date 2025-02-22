import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { CONFIG } from '../config'
import { $ } from '../utils'
import { animateStationSection } from './stations'

export class Hero {
  currIdx: number
  fridges: HTMLElement[]
  links: HTMLElement[]
  parentElement: HTMLElement | null
  specBox: HTMLElement | null
  hexCodeEl: HTMLElement | null
  animateInTL: gsap.core.Timeline
  breakpoints: gsap.Conditions

  constructor(breakpoints: gsap.Conditions) {
    this.currIdx = CONFIG.animations.hero.defaultFridge
    this.fridges = []
    this.links = []
    this.parentElement = null
    this.specBox = null
    this.hexCodeEl = null
    this.breakpoints = breakpoints
    this.animateInTL = gsap.timeline()
  }

  setup() {
    this.fridges = gsap.utils.toArray<HTMLElement>('.fridge-big-preview')
    this.links = gsap.utils.toArray<HTMLElement>('.station-nav-link')
    this.hexCodeEl = $('#hex-code')
    this.parentElement = $('.station-nav-list')
    this.specBox = $('.specification-box')

    this.fridges.forEach((fridge, index) => {
      if (index !== 4) {
        gsap.set(fridge, { autoAlpha: 0, y: 50 })
      }
    })

    this.links.forEach(link => {
      link.addEventListener('mouseenter', () =>
        this.handleHover(link, this.breakpoints.isDesktop),
      )
      link.addEventListener('click', () => this.handleClick(link))
    })

    this.hexCodeEl?.addEventListener('mouseenter', e => {
      e.stopPropagation()
      e.preventDefault()
      gsap.to('#hex-code .hex', {
        typewrite: {
          value: ' B  T  C    M  O  V  E ',
          duration: CONFIG.animations.typewriter.hexCodeDuration,
          maxScrambleChars: CONFIG.animations.typewriter.hexMaxScrambleChars,
        },
        ease: CONFIG.animations.typewriter.hexEase,
      })
    })
    this.hexCodeEl?.addEventListener('mouseleave', e => {
      e.stopPropagation()
      e.preventDefault()
      gsap.to('#hex-code .hex', {
        typewrite: {
          value: '42 54 43 20 4D 4F 56 45',
          duration: CONFIG.animations.typewriter.hexCodeDuration,
          maxScrambleChars: CONFIG.animations.typewriter.hexMaxScrambleChars,
        },
        ease: CONFIG.animations.typewriter.hexEase,
      })
    })

    if (this.parentElement) {
      this.parentElement.addEventListener('mouseleave', () =>
        this.handleMouseLeave(),
      )
    }
    this.animateInTL = this.createAnimateInTL()
  }

  handleClick(link: HTMLElement) {
    const idx = Number(link.getAttribute('data-fridge-id'))
    window.app.homePage?.triggerStationAnimation(idx)

    hideHero(this.breakpoints)
  }

  animateFridges(
    currentFridge: HTMLElement,
    newFridge: HTMLElement,
    direction: number,
  ) {
    const {
      fridgeOutEase,
      fridgeOutDuration,
      fridgeInDuration,
      fridgeInEase,
      fridgeInDelay,
    } = CONFIG.animations.hero

    gsap.killTweensOf([currentFridge, newFridge])
    const animHeight = window.innerHeight / 2
    gsap.to(currentFridge, {
      autoAlpha: 0,
      y: () => animHeight * direction,
      duration: fridgeOutDuration,
      ease: fridgeOutEase,
      onComplete: () => {
        gsap.set(currentFridge, { y: 50 })
      },
    })

    gsap.fromTo(
      newFridge,
      { autoAlpha: 0, y: () => -animHeight * direction },
      {
        autoAlpha: 1,
        y: 0,
        duration: fridgeInDuration,
        ease: fridgeInEase,
        delay: fridgeInDelay,
      },
    )
  }

  handleHover(link: HTMLElement, isDesktop: boolean) {
    const newIdx = Number(link.getAttribute('data-fridge-id'))

    if (newIdx === this.currIdx) return

    const currentFridge = this.fridges[this.currIdx - 1]
    const newFridge = this.fridges[newIdx - 1]
    const direction = newIdx > this.currIdx ? 1 : -1

    this.animateFridges(currentFridge, newFridge, direction)
    this.currIdx = newIdx
  }

  handleMouseLeave() {
    const defaultFridgeIdx = CONFIG.animations.hero.defaultFridge
    if (this.currIdx === defaultFridgeIdx) return

    const currentFridge = this.fridges[this.currIdx - 1]
    const defaultFridge = this.fridges[defaultFridgeIdx - 1]
    const direction = 1

    this.animateFridges(currentFridge, defaultFridge, direction)
    this.currIdx = CONFIG.animations.hero.defaultFridge
  }

  createAnimateInTL() {
    const { animations, selectors } = CONFIG
    const { heroFridge, heroSpecificationBox, heroSidebar } = selectors
    console.log('animating in hero')
    return gsap
      .timeline({ paused: true })
      .from(
        heroFridge,
        this.breakpoints.isMobile
          ? animations.hero.bigBoxAppearFromMobile
          : animations.hero.bigBoxAppearFrom,
      )
      .from(
        heroSpecificationBox,
        this.breakpoints.isMobile
          ? animations.hero.specBoxAppearFromMobile
          : animations.hero.specBoxAppearFrom,
        '<',
      )
      .from(heroSidebar, animations.hero.sidebarAppearFrom, '<')
  }

  animateIn() {
    this.animateInTL.play()
  }
}

///////
//
//
//
export function setupHeroAnimations(breakpoints: gsap.Conditions) {
  const { selectors } = CONFIG
  const hero = new Hero(breakpoints)

  hero.setup()

  function onClickHero(e: MouseEvent) {
    e.preventDefault()
    ScrollTrigger.clearScrollMemory()
    ScrollTrigger.refresh()
    window.history.scrollRestoration = 'manual'
    console.log(breakpoints)
    hideHero(breakpoints)

    animateStationSection(1)
    // window.app.updateVideos('up', 1, 2)
  }

  $(selectors.heroButton)?.addEventListener('click', onClickHero)
  $(selectors.heroButtonMobile)?.addEventListener('click', onClickHero)
  return hero
}

//
//
/////

export function hideHero(breakpoints: gsap.Conditions) {
  const { selectors, animations } = CONFIG
  const { heroHideEase, heroHideDuration } = animations.hero
  window.app.heroShown = false
  window.app.cursor.setMode('default')
  // window.app.homePage?.animateStationSelectorImgs(1)

  gsap
    .timeline()
    .set('body', { overflow: 'hidden' })
    .to(selectors.hero, {
      autoAlpha: 0,
      y: '-100vh',
      duration: heroHideDuration,
      ease: heroHideEase,
    })
    .set(
      selectors.hero,
      {
        backgroundImage: 'none',
      },
      '<',
    )
    .to(
      selectors.navButton,
      {
        onStart: () => {
          gsap.set(selectors.navButton, { display: 'inline-flex' })
        },
        autoAlpha: 1,
        duration: animations.default.duration,
        ease: animations.default.ease,
      },
      '<',
    )
    .to(
      selectors.logoBlueprint,
      {
        autoAlpha: 0,
        duration: animations.default.duration,
        ease: animations.default.ease,
      },
      '<',
    )
    .to(
      selectors.logo,
      {
        autoAlpha: 1,
        duration: animations.default.duration,
        ease: animations.default.ease,
      },
      '<',
    )
}

//@ts-ignore just for debugging
window.hideHero = hideHero
