import { merge } from 'lodash'

const config = {
  debug: true,
  enableSmoothScroll: false,
  breakpoints: {
    maxMobile: 768,
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
    logo: '#logo',
    orangeLogo: '#logo-orange',
  },
  animations: {
    default: {
      ease: 'power3.inOut',
      duration: 1,
    },
    cursor: {
      lagDuration: 0.1,
      lagEase: 'power3.out',
      transitionDuration: 0.3,
      transitionEase: 'power2.out',
      states: {
        default: {
          svg: { rotation: 0, scale: 1 },
          path: {
            fill: 'var(--secondary)',
            stroke: 'var(--tertiary)',
            strokeWidth: 1,
          },
        },
        defaultHover: {
          svg: { rotation: 60, scale: 1.5 },
          path: {
            fill: 'var(--secondary)',
            stroke: 'var(--secondary)',
            strokeWidth: 1,
          },
        },
        defaultDrag: {
          svg: { rotation: 0, scale: 1 },
          path: { fill: 'none', stroke: 'var(--tertiary)', strokeWidth: 1 },
        },
        defaultHoverDrag: {
          svg: { rotation: 60, scale: 1.2 },
          path: {
            fill: 'var(--secondary)',
            stroke: 'var(--tertiary)',
            strokeWidth: 1,
          },
        },
        blueprint: {
          svg: { rotation: 0, scale: 1 },
          path: { fill: 'none', stroke: 'white', strokeWidth: 1 },
        },
        blueprintHover: {
          svg: { rotation: 0, scale: 1.25 },
          path: { fill: 'white', stroke: 'transparent', strokeWidth: 1 },
        },
        blueprintDrag: {
          svg: { rotation: 0, scale: 1.1 },
          path: { fill: 'none', stroke: 'white', strokeWidth: 2 },
        },
        blueprintHoverDrag: {
          svg: { rotation: 0, scale: 1.3 },
          path: { fill: 'white', stroke: 'white', strokeWidth: 1 },
        },
      },
    },
    preloader: {
      bar: {
        duration: 0.5,
        ease: 'power1.out',
      },
      // FROM
      border: {
        scaleY: 0,
        duration: 0.5,
        ease: 'power1.out',
      },
      hide: {
        autoAlpha: 0,
        duration: 0.5,
        delay: 0.5,
        ease: 'power4.out',
      },
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
      // syntax:  [x, y]. if value is dynamic (changes on resize) use function
      // in this case x depends on the innerHeight, which is dynamic, so we use a function.
      // We use height for the x because the height of the stations is based on the height of the viewport.
      positionsMobile: [
        [0, 0], // no touchy
        [() => -(window.innerHeight * 0.4), -25],
        [() => -(window.innerHeight * 0.9), -55],
        [() => -(window.innerHeight * 1.4), -85],
        [() => -(window.innerHeight * 1.9), -115],
        [() => -(window.innerHeight * 3), -180],
        [], // no touchy
      ],
      positionsDesktop: [
        [0, 0], // no touchy
        [() => -(window.innerHeight * 0.83), -105],
        [() => -(window.innerHeight * 1.72), -215],
        [() => -(window.innerHeight * 2.57), -320],
        [() => -(window.innerHeight * 3.4), -425],
        [() => -(window.innerHeight * 5), -600],
        [], // no touchy
      ],
      finishThreshold: 1, //0.5 = halfway through the anim
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
      scrollScrub: 2,
    },
    footer: {
      reveal: {
        height: 0,
        duration: 1.5,
        ease: 'power4.out',
      },
      hide: {
        height: '100%',
        duration: 1,
        ease: 'power4.out',
      },
    },
    typewriter: {
      defaultDuration: 0.3,
      maxScrambleChars: 3,
      ease: 'power4.out',
      hexCodeDuration: 0.7,
      hexMaxScrambleChars: 2,
      hexEase: 'power4.out',
      chars:
        'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|\\:<>?,./`~;',
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
