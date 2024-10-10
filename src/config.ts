import { merge } from 'lodash'

const config = {
  debug: true,
  selectors: {
    box: '#draggable-box',
    boxes: '.draggable-boxes',
    cursor: "#custom-cursor",
    cursorHoverables: ['button', 'a', '#active-station-button'],
    boxClass: '.draggable-box',
    hero: '#hero',
    heroButton: '#hero-button',
    heroButtonMobile: '#hero-button-tablet',
    factoriesContainer: '#factories-animations-container',
    activeStationWrapper: '#station-selection',
    activeStationDropdown: '#stationLinks',
    activeStationBtn: '#active-station-button .station-selection-button',
    station: "#station",
    stationLinks: '#stationLinks > a',
    stationTitle: '#white-text-box',
    stationTitleClass: '.white-text-box',
    stationBoxes: '.station-boxes'
  },
  animations: {
    stations: {
      stationSelectorSnapThreshold: 0.1,
      boxesSnapThreshold: 0.06,
    }
  },
  heroData: [
    {
      name: 'Nexio Fridge v1.0',
      size: '80x80',
      gigs: 500,
    },
    {
      name: 'Nexio Fridge v2.0',
      size: '90x90',
      gigs: 750,
    },
    {
      name: 'Nexio Fridge v3.0',
      size: '85x85',
      gigs: 600,
    },
    {
      name: 'Nexio Fridge v4.0',
      size: '95x95',
      gigs: 1000,
    },
    {
      name: 'Nexio Fridge v5.0',
      size: '69x420',
      gigs: 1000,
    },
  ],
  stations: [
    'welcome to nexio',
    'scale with us',
    'start building',
    'docs & devnet',
    'join our community'
  ],
  typewriterChars: 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|\\:<>?,./`~;',
}
merge(config, window.NEXIO_CONFIG)

export const CONFIG: typeof config = config
