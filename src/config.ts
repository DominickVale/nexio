import { merge } from 'lodash'

const config = {
  debug: true,
  selectors: {
    box: '#draggable-box',
    hero: '#hero',
    heroButton: '#hero-button',
    factoriesContainer: '#factories-animations-container',
  },
}
merge(config, window.NEXIO_CONFIG)

export const CONFIG: typeof config = config
