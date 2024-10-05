import gsap, { clamp } from 'gsap'
import { CONFIG } from '../config'

export function setupShowFactoriesAnimations(
  isDesktop: boolean,
  isMobile: boolean,
  reduceMotion: boolean,
) {
  const { selectors } = CONFIG
  const tl = gsap
    .timeline({
      scrollTrigger: {
        trigger: CONFIG.selectors.hero,
        start: 'bottom+10% top',
        end: 'bottom top',
      },
    })
    .fromTo(
      selectors.factoriesContainer,
      {
        '--left': '300vw',
        '--max-left': '200vw',
      },
      {
        '--left': '100vw',
        '--max-left': '35vw',
      },
    )
}
