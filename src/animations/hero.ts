import gsap from 'gsap'
import { CONFIG } from '../config'
import { $ } from '../utils'

const DATA = [
  {
    name: 'Nexio Fridge v1.0',
    size: '80x80',
    gigs: 500,
  },
  {
    name: 'CoolTech Refrigerator',
    size: '90x90',
    gigs: 750,
  },
  {
    name: 'FrostMaster 3000',
    size: '85x85',
    gigs: 600,
  },
  {
    name: 'IceCube Pro',
    size: '95x95',
    gigs: 1000,
  },
  {
    name: '2PAC Pro',
    size: '69x420',
    gigs: 1000,
  },
]

class FridgeHoverAnim {
  currIdx: number
  fridges: HTMLElement[]
  links: HTMLElement[]
  parentElement: HTMLElement | null
  specBox: HTMLElement | null
  isMobile: boolean
  isDesktop: boolean
  reduceMotion: boolean

  constructor(isDesktop: boolean, isMobile: boolean, reduceMotion: boolean) {
    this.currIdx = 1
    this.fridges = []
    this.links = []
    this.parentElement = null
    this.specBox = null
    this.isDesktop = isDesktop
    this.isMobile = isMobile
    this.reduceMotion = reduceMotion
  }

  setup() {
    this.fridges = gsap.utils.toArray<HTMLElement>('.fridge-big-preview')
    this.links = gsap.utils.toArray<HTMLElement>('.station-nav-link')
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

    if (this.parentElement) {
      this.parentElement.addEventListener('mouseleave', () =>
        this.handleMouseLeave(),
      )
    }
  }

  handleClick(link: HTMLElement, isDesktop: boolean) {
    const idx = Number(link.getAttribute('data-fridge-id')) || 1
    const labelPos = window.app.mainTimeline.scrollTrigger!.labelToScroll(
      (idx - 1).toString(),
    )

    hideHero(isDesktop)
    console.log(labelPos)
    gsap.to(window, {
      scrollTo: labelPos,
      duration: 1,
      ease: 'power3.inOut',
    })
  }

  handleHover(link: HTMLElement, isDesktop: boolean) {
    const newIdx = Number(link.getAttribute('data-fridge-id')) || 1

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

    this.updateSpecificationBox(newIdx)

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

    this.updateSpecificationBox(1)
    this.currIdx = 1
  }

  updateSpecificationBox(index: number) {
    if (!this.specBox) return

    const data = DATA[index]
    if (!data) return

    const nameElement = this.specBox.querySelector('.large-box .display')
    const sizeElement = this.specBox.querySelector('.small-box .display.small')
    const gigsElement = this.specBox.querySelector(
      '.small-box:last-child .display.small',
    )

    if (nameElement) nameElement.textContent = data.name
    if (sizeElement) sizeElement.textContent = data.size
    if (gigsElement) gigsElement.textContent = `${data.gigs} gigs`
  }
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
    .from(selectors.box + '-1', {
      autoAlpha: 0,
      y: () => window.innerHeight,
      duration: 1.5,
      ease: 'power3.out',
    })
}
