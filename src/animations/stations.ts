import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $ } from '../utils'
import { CONFIG } from '../config'

//@TODO: dry
export function animateStationSection(id: number, onComplete?: () => void) {
  const { selectors } = CONFIG
  const { boxesDuration, boxesStaggerIn, boxesEase, boxesYOffsetFactor } =
    CONFIG.animations.stations
  const station = `${selectors.station}-${id} ${selectors.stationBoxes} > *`

  const currentAnimation = gsap.timeline()

  currentAnimation.fromTo(
    station,
    {
      y: window.innerHeight / boxesYOffsetFactor,
      autoAlpha: 0,
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: boxesDuration,
      ease: boxesEase,
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
      cursor: 'none',
      onDragStart: () => window.app.cursor?.setDragging(true),
      onDrag: function (e) {
        target.style.setProperty('--drag-x', `${this.x}px`)
        target.style.setProperty('--drag-y', `${this.y}px`)
        window.app.cursor?.onMouseMove(e)
      },
      onDragEnd: () => window.app.cursor?.setDragging(false),
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
