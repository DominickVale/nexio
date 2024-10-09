import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $ } from '../utils'
import { CONFIG } from '../config'

export function animateStationSection(
  currentLabel: number,
  labelToScroll: number,
  onComplete?: () => void,
) {
  const { selectors } = CONFIG
  const tl = gsap.timeline({
    onComplete,
  })

  if (currentLabel > 0) {
    // Fade out current box
    tl.to(`${selectors.box}-${currentLabel}`, {
      y:
        labelToScroll > currentLabel
          ? -window.innerHeight / 4
          : window.innerHeight / 4,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
    })
  }
  if (labelToScroll <= 5) {
    // Fade in new box
    const s = `${selectors.box}-${labelToScroll}`
    tl.fromTo(
      s,
      {
        y:
          labelToScroll > currentLabel
            ? window.innerHeight / 4
            : -window.innerHeight / 4,
        autoAlpha: 0,
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.5,
        ease: 'power3.out',
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
