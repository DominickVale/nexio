import gsap from 'gsap'
import { CONFIG } from '../config'
import { $ } from '../utils'
import { animateStationSection } from './stations'

class FridgeHoverAnim {
  currIdx: number
  fridges: HTMLElement[]
  links: HTMLElement[]
  parentElement: HTMLElement | null
  specBox: HTMLElement | null
  isMobile: boolean
  isDesktop: boolean
  reduceMotion: boolean
  hexCodeEl: HTMLElement | null

  constructor(isDesktop: boolean, isMobile: boolean, reduceMotion: boolean) {
    this.currIdx = 1
    this.fridges = []
    this.links = []
    this.parentElement = null
    this.specBox = null
    this.hexCodeEl = null
    this.isDesktop = isDesktop
    this.isMobile = isMobile
    this.reduceMotion = reduceMotion
  }

  setup() {
    this.fridges = gsap.utils.toArray<HTMLElement>('.fridge-big-preview')
    this.links = gsap.utils.toArray<HTMLElement>('.station-nav-link')
    this.hexCodeEl = $('#hex-code')
    this.parentElement = $('.station-nav-list')
    this.specBox = $('.specification-box')

    this.fridges.forEach((fridge, index) => {
      if (index !== 0) {
        gsap.set(fridge, { autoAlpha: 0, y: 50 })
      }
    })

    this.links.forEach(link => {
      link.addEventListener('mouseenter', () =>
        this.handleHover(link, this.isDesktop),
      )
      link.addEventListener('click', () =>
        this.handleClick(link, this.isDesktop),
      )
    })

    this.hexCodeEl?.addEventListener('mouseenter', e => {
      gsap.to(e.target, {
        typewrite: {
          value: ' B  T  C    M  O  V  E ',
          speed: 0.5,
          maxScrambleChars: 2,
        },
        ease: 'power4.out',
      })
    })
    this.hexCodeEl?.addEventListener('mouseleave', e => {
      gsap.to(e.target, {
        typewrite: {
          value: '42 54 43 20 4D 4F 56 45',
          speed: 0.5,
          maxScrambleChars: 2,
        },
        ease: 'power4.out',
      })
    })

    if (this.parentElement) {
      this.parentElement.addEventListener('mouseleave', () =>
        this.handleMouseLeave(),
      )
    }
  }

  handleClick(link: HTMLElement, isDesktop: boolean) {
    const idx = Number(link.getAttribute('data-fridge-id'))
    const labelPos = window.app.mainTimeline.scrollTrigger!.labelToScroll(
      (idx - 1).toString(),
    )

    hideHero(isDesktop)
    gsap.to(window, {
      scrollTo: labelPos,
      duration: 1,
      ease: 'power3.inOut',
    })
    if (idx === 1) {
      animateStationSection(0, 1)
    }
  }

  handleHover(link: HTMLElement, isDesktop: boolean) {
    const newIdx = Number(link.getAttribute('data-fridge-id'))

    if (newIdx === this.currIdx) return

    const currentFridge = this.fridges[this.currIdx - 1]
    const newFridge = this.fridges[newIdx - 1]
    const direction = newIdx > this.currIdx ? 1 : -1

    const animHeight = window.innerHeight / 2

    // Force complete any ongoing animations
    gsap.killTweensOf([currentFridge, newFridge])

    gsap.to(currentFridge, {
      autoAlpha: 0,
      y: () => animHeight * direction,
      duration: 0.5,
      ease: 'power4.inOut',
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
        duration: 0.5,
        ease: 'power4.inOut',
        delay: 0.25,
      },
    )

    // this.updateSpecificationBox(newIdx)

    this.currIdx = newIdx
  }

  handleMouseLeave() {
    if (this.currIdx === 1) return

    const currentFridge = this.fridges[this.currIdx - 1]
    const firstFridge = this.fridges[0]
    const direction = 1

    const animHeight = window.innerHeight / 2

    // Force complete any ongoing animations
    gsap.killTweensOf([currentFridge, firstFridge])

    gsap.to(currentFridge, {
      autoAlpha: 0,
      y: () => animHeight * direction,
      duration: 0.5,
      ease: 'power4.inOut',
      onComplete: () => {
        gsap.set(currentFridge, { y: 50 })
      },
    })

    gsap.fromTo(
      firstFridge,
      { autoAlpha: 0, y: () => -animHeight * direction },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power4.inOut',
        delay: 0.25,
      },
    )

    // this.updateSpecificationBox(1)
    this.currIdx = 1
  }

  // updateSpecificationBox(index: number) {
  //   if (!this.specBox) return
  //
  //   const data = CONFIG.heroData[index - 1]
  //   if (!data) return
  //
  //   const nameElement = this.specBox.querySelector('.large-box .display')
  //   const sizeElement = this.specBox.querySelector('.small-box .display.small')
  //   const gigsElement = this.specBox.querySelector(
  //     '.small-box:last-child .display.small',
  //   )
  //
  //   if (nameElement) nameElement.textContent = data.name
  //   if (sizeElement) sizeElement.textContent = data.size
  //   if (gigsElement) gigsElement.textContent = `${data.gigs} gigs`
  // }
}

///////
//
//
//
export function setupHeroAnimations(
  isDesktop: boolean,
  isMobile: boolean,
  reduceMotion: boolean,
) {
  const { selectors } = CONFIG
  const fridgeHoverAnim = new FridgeHoverAnim(isDesktop, isMobile, reduceMotion)

  fridgeHoverAnim.setup()

  function onClickHero(e: MouseEvent) {
    e.preventDefault()
    hideHero(isDesktop)

    animateStationSection(0, 1)
  }

  $(selectors.heroButton)?.addEventListener('click', onClickHero)
  $(selectors.heroButton + '-mobile')?.addEventListener('click', onClickHero)
}

//
//
/////

export function hideHero(isDesktop: boolean) {
  const { selectors } = CONFIG
  gsap
    .timeline()
    .set('body', { overflow: 'auto' })
    .to(selectors.hero, {
      autoAlpha: 0,
      y: '-100vh',
      duration: 0.5,
      ease: 'power4.inOut',
    })
    .set(
      selectors.hero,
      {
        backgroundImage: 'none',
      },
      '<',
    )
    .fromTo(
      selectors.factoriesContainer,
      {
        '--left': '300vw',
        '--max-left': '200vw',
        '--top': '100vh',
      },
      {
        '--left': isDesktop ? '100vw' : '115vw',
        '--max-left': isDesktop ? '35vw' : '40vw',
        '--top': isDesktop ? '-2vh' : '5vh',
        duration: 1.5,
        ease: 'power3.out',
      },
      '<',
    )
}
