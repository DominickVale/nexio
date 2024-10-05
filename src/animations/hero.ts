import gsap from 'gsap'
import { CONFIG } from '../config'
import { $ } from '../utils'

export function setupHeroAnimations(
  isDesktop: boolean,
  isMobile: boolean,
  reduceMotion: boolean,
) {
  const { selectors } = CONFIG
  $(selectors.heroButton)?.addEventListener('click', e => {
    e.preventDefault()
    gsap
      .timeline()
      .set('body', { overflow: 'auto' })
      .to(selectors.hero, {
        autoAlpha: 0,
        y: '-100vh',
        duration: 0.5,
        ease: 'power4.inOut',
      })
      .set(
        selectors.hero,
        {
          backgroundImage: 'none',
        },
        '<',
      )
      .fromTo(
        selectors.factoriesContainer,
        {
          '--left': "300vw",
          '--max-left': "200vw",
          '--top': "100vh",
        },
        {
          '--left': "100vw",
          '--max-left': "35vw",
          '--top': "-2vh",
          duration: 1.5,
          ease: 'power3.out',
        },
        '<',
      )
      .from(selectors.box + '-1', {
        autoAlpha: 0,
        y: () => window.innerHeight,
        duration: 1.5,
        ease: 'power3.out',
      })
  })
}
