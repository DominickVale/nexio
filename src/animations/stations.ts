import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $ } from '../utils'
import { CONFIG } from '../config'

function setupDraggableBoxes() {
  gsap.utils.toArray('.draggable-box').forEach((el, idx) => {
    const target = el as HTMLElement
    const button = target.querySelector('.drag-button');
    
    Draggable.create(target, {
      trigger: button,
      type: "x,y",
    });
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
