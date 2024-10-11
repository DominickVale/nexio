import { merge } from 'lodash'

const config = {
  debug: true,
  breakpoints: {
    maxMobile: 768
  },
  selectors: {
    box: '#draggable-box',
    boxes: '.draggable-boxes',
    cursor: '#custom-cursor',
    cursorHoverables: ['button', 'a', '#active-station-button'],
    boxClass: '.draggable-box',
    hero: '#hero',
    heroButton: '#hero-button',
    heroButtonMobile: '#hero-button-tablet',
    factoriesContainer: '#factories-animations-container',
    activeStationWrapper: '#station-selection',
    activeStationDropdown: '#stationLinks',
    activeStationBtn: '#active-station-button .station-selection-button',
    station: '#station',
    stationLinks: '#stationLinks > a',
    stationTitle: '#white-text-box',
    stationTitleClass: '.white-text-box',
    stationBoxes: '.station-boxes',
    navButton: '#nav-button',
    logo: "#logo",
    orangeLogo: '#logo-orange'
  },
  animations: {
    default: {
      ease: "power3.inOut",
      duration: 1
    },
    cursor: {
      lagBehindDuration: 0.25,
      lagBehindEase: 'power3.out',
    },
    preloader: {
      barDuration: 0.3,
      barEase: "power1.out",
      borderDuration: 0.8,
      borderEase: "power2.inOut",
      hideDuration: 0.5,
      hideEase: "power4.inOut",
    },
    hero: {
      defaultFridge: 5,
      fridgeInDuration: 0.5,
      fridgeInEase: 'power4.inOut',
      fridgeInDelay: 0.25,
      fridgeOutDuration: 0.5,
      fridgeOutEase: 'power4.inOut',
      heroHideDuration: 0.5,
      heroHideEase: 'power4.inOut',
      factoriesInDuration: 1.5,
      factoriesInEase: 'power3.out',
    },
    stations: {
      boxesDuration: 1,
      boxesEase: 'power3.out',
      boxesStaggerIn: 0.1,
      boxesStaggerOut: 0.01,
      // how much to animate the boxes on the Y axis
      boxesYOffsetFactor: 4,
      snapDuration: {
        min: 0.8,
        max: 1,
      },
      snap: true, // enable snap
      snapEase: 'power2.out',
      // how long to lag behind between scrolls (simulates smooth scroll)
      scrollScrub: 2
    },
    typewriter: {
      defaultSpeed: 0.3,
      maxScrambleChars: 3,
      ease: 'power4.out',
      hexCodeDuration: 0.7,
      hexMaxScrambleChars: 2,
      hexEase: 'power4.out',
      chars: 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|\\:<>?,./`~;',
    },
    stationSelector: {
      durationOpen: 0.8,
      easeOpen: 'power3.out',
      durationClose: 1,
      easeClose: 'power3.in',
    },
  },
  stations: [
    'welcome to nexio',
    'scale with us',
    'start building',
    'docs & devnet',
    'join our community',
  ],
}
merge(config, window.NEXIO_CONFIG)

export const CONFIG: typeof config = config
