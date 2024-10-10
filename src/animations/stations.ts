import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $ } from '../utils'
import { CONFIG } from '../config'

// @TODO: optimize, get gsap animations out of evt handlers
export function animateStationSection(
  currentID: number,
  newStationID: number,
  onComplete?: () => void,
) {
  const { selectors } = CONFIG
  const tl = gsap.timeline({
    onComplete,
  })
  console.log('Animating: ', currentID, newStationID)

  const oldStation = `${selectors.station}-${currentID} ${selectors.stationBoxes} > *`
  const newStation = `${selectors.station}-${newStationID} ${selectors.stationBoxes} > *`

  if (currentID > 0) {
    // Animaions out
    tl.to(oldStation, {
      y:
        newStationID > currentID
          ? -window.innerHeight / 4
          : window.innerHeight / 4,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.1
    })
  }

  if (newStationID <= 5) {
    // Animations In

    tl.fromTo(
      newStation,
      {
        y:
          newStationID > currentID
            ? window.innerHeight / 4
            : -window.innerHeight / 4,
        autoAlpha: 0,
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.2,
      },
    )
  }
}

function setupDraggableBoxes() {
  gsap.utils.toArray('.draggable-box').forEach((el, idx) => {
    const target = el as HTMLElement
    const button = target.querySelector('.drag-button')

    Draggable.create(target, {
      trigger: button,
      type: 'x,y',
    })
  })
}

export function setupStations(
  isDesktop: boolean,
  isMobile: boolean,
  reduceMotion: boolean,
) {
  const stationSelector = new StationSelector(isDesktop, isMobile, reduceMotion)
  stationSelector.setup()
  setupDraggableBoxes()
}
