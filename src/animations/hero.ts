import gsap from 'gsap'
import { CONFIG } from '../config'
import { $ } from '../utils'

export function setupHeroAnimations(
  isDesktop: boolean,
  isMobile: boolean,
  reduceMotion: boolean,
) {
  const { selectors } = CONFIG
  function onClickHero(e: MouseEvent) {
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
          '--left': '300vw',
          '--max-left': '200vw',
          '--top': '100vh',
        },
        {
          '--left': isDesktop ? '100vw' : '115vw',
          '--max-left': isDesktop ? '35vw' : '40vw',
          '--top': isDesktop ? '-2vh' : '5vh',
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
  }

  $(selectors.heroButton)?.addEventListener('click', onClickHero)
  $(selectors.heroButton + '-mobile')?.addEventListener('click', onClickHero)
}
