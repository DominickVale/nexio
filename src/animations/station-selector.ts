import { CONFIG } from '../config'
import { $ } from '../utils'
import gsap from 'gsap'

export default class StationSelector {
  currIdx: number
  buttons: HTMLElement[]
  wrapper: HTMLElement | null
  isMobile: boolean
  isDesktop: boolean
  reduceMotion: boolean
  shown: boolean
  mainButton: HTMLElement | null
  dropdown: HTMLElement | null
  isOpen: boolean

  constructor(isDesktop: boolean, isMobile: boolean, reduceMotion: boolean) {
    this.currIdx = 1
    this.buttons = []
    this.wrapper = null
    this.isDesktop = isDesktop
    this.isMobile = isMobile
    this.reduceMotion = reduceMotion
    this.shown = false
    this.mainButton = null
    this.dropdown = null
    this.isOpen = false
  }

  setup() {
    const {
      stationSelection,
      activeStationBtn,
      activeStationDropdown,
      stationSelectionCopy,
    } = CONFIG.selectors
    this.buttons = gsap.utils.toArray<HTMLElement>(
      CONFIG.selectors.stationLinks,
    )
    this.wrapper = $(stationSelection)
    this.mainButton = $(activeStationBtn)
    this.dropdown = $(activeStationDropdown)
    if (!this.wrapper || !this.mainButton || !this.dropdown) {
      console.error(this.wrapper, this.mainButton)
      throw Error('[NEXIO]: Elements not found')
    }
    this.buttons.forEach((link, i) => {
      gsap.set($(CONFIG.selectors.stationSelectionCopy, link), { width: 0 })

      link.addEventListener('click', e => {
        e.preventDefault()
        this.handleClick(link, this.isDesktop)
      })
      link.addEventListener('mouseenter', this.handleButtonHover.bind(this))
      link.addEventListener('mouseout', this.handleButtonHoverOut.bind(this))
    })
    this.mainButton.addEventListener('click', () => {
      if (!this.isOpen) {
        this.open()
      } else {
        this.close()
      }
    })

    // Add event listeners for focus management
    document.addEventListener('click', this.handleOutsideClick.bind(this))
    this.wrapper.addEventListener('focusin', this.handleFocusIn.bind(this))
    this.wrapper.addEventListener('focusout', this.handleFocusOut.bind(this))
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  open() {
    console.log("OPENING")
    this.isOpen = true
    gsap
      .timeline()
      .to(this.dropdown, {
        borderColor: 'white',
        duration: 0.2,
        ease: 'power4.out',
      })
      .to(
        this.dropdown,
        {
          height: 'auto',
          duration: CONFIG.animations.stationSelector.durationOpen,
          ease: CONFIG.animations.stationSelector.easeOpen,
          onComplete: () => {
            this.shown = true
          },
        },
        '<',
      )
      .to(
        CONFIG.selectors.activeStationBtn,
        {
          borderStyle: 'solid',
          backgroundColor: 'white',
          duration: CONFIG.animations.stationSelector.durationOpen,
          ease: CONFIG.animations.stationSelector.easeOpen,
        },
        '<',
      )
  }

  close() {
    console.log("CLOSING")
    this.isOpen = false
    gsap
      .timeline()
      .to(this.dropdown, {
        height: 0,
        duration: CONFIG.animations.stationSelector.durationOpen,
        ease: CONFIG.animations.stationSelector.easeOpen,
        onComplete: () => {
          this.shown = false
        },
      })
      .to(
        this.dropdown,
        {
          borderColor: 'transparent',
          duration: CONFIG.animations.stationSelector.durationClose / 2,
          ease: 'power4.in',
        },
        '<+=90%',
      )

      .to(
        CONFIG.selectors.activeStationBtn,
        {
          borderStyle: 'dashed',
          backgroundColor: 'var(--primary)',
          duration: CONFIG.animations.stationSelector.durationOpen,
          ease: CONFIG.animations.stationSelector.easeOpen,
        },
        '<',
      )
  }

  handleButtonHover(e: MouseEvent) {
    const t = e.currentTarget as HTMLElement
    gsap
      .timeline()
      .to($(CONFIG.selectors.stationSelectionFridge, t), {
        backgroundColor:
          CONFIG.animations.stationSelector.fridgePreviewHoverColor,
      })
      .to(
        $(CONFIG.selectors.stationSelectionCopy, t),
        CONFIG.animations.stationSelector.hoverOpen,
        '<',
      )
  }

  handleButtonHoverOut(e: MouseEvent) {
    const t = e.currentTarget as HTMLElement
    gsap
      .timeline()
      .to($(CONFIG.selectors.stationSelectionFridge, t), {
        backgroundColor: 'transparent',
      })
      .to(
        $(CONFIG.selectors.stationSelectionCopy, t),
        CONFIG.animations.stationSelector.hoverClose,
        '<',
      )
  }

  handleClick(link: HTMLElement, isDesktop: boolean) {
    const idx = Number(link.getAttribute('data-station'))
    this.close()
    window.app.homePage?.triggerStationAnimation(idx)
  }

  handleOutsideClick(e: MouseEvent) {
    if (
      this.shown &&
      this.wrapper &&
      !this.wrapper.contains(e.target as Node)
    ) {
      this.close()
    }
  }

  handleFocusIn(e: FocusEvent) {
    if (!this.shown) {
      this.open()
    }
  }

  handleFocusOut(e: FocusEvent) {
    // Use a setTimeout to check if the new activeElement is outside the wrapper
    setTimeout(() => {
      if (!this.wrapper?.contains(document.activeElement)) {
        this.close()
      }
    }, 0)
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.shown) {
      this.close()
      this.mainButton?.focus() // Return focus to the main button
    }
  }
}
