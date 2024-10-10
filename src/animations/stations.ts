import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $ } from '../utils'
import { CONFIG } from '../config'

//@TODO: dry
export function animateStationSection(id: number, onComplete?: () => void) {
  const { selectors } = CONFIG
  const { boxesDuration, boxesStaggerIn } = CONFIG.animations.stations
  const station = `${selectors.station}-${id} ${selectors.stationBoxes} > *`

  const currentAnimation = gsap.timeline()

  currentAnimation.fromTo(
    station,
    {
      y: window.innerHeight / 4,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: boxesDuration,
      ease: 'power3.out',
      stagger: boxesStaggerIn,
      onComplete,
    },
  )
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
