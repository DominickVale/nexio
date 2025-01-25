import gsap from 'gsap'
import { $, $all } from '../utils'
import { CONFIG } from '../config'
import CustomEase from 'gsap/CustomEase'

class Preloader {
  private progressBar: HTMLElement
  private preloaderWrapper: HTMLElement
  private progressText: HTMLElement
  private borderElement: HTMLElement
  private backgroundTiles: NodeListOf<HTMLElement>
  //@ts-ignore
  private progressTimer: number
  endTL: gsap.core.Timeline

  constructor() {
    this.progressBar = $(
      '#preloader-progress .inner-progress-bar',
    ) as HTMLElement
    this.preloaderWrapper = $('#preloader') as HTMLElement
    this.progressText = $('#preloader-text') as HTMLElement
    this.borderElement = $('#preloader-border') as HTMLElement
    this.backgroundTiles = $all('.background-tiles')

    this.endTL = gsap
      .timeline({
        paused: true,
        onComplete: () => {
          this.preloaderWrapper.style.display = 'none'
          window.app.onPreloadComplete()
        },
      })
      .to(this.backgroundTiles, CONFIG.animations.preloader.fridgesHide)
      .to(this.progressBar.parentNode, CONFIG.animations.preloader.progressFadeOut, "<")
      .to(this.progressText, CONFIG.animations.preloader.textFadeOut, "<")
      .to(this.borderElement, CONFIG.animations.preloader.border)
      .to(this.preloaderWrapper, CONFIG.animations.preloader.hide)

    this.init()
  }

  private init(): void {
    this.fadeInElements()
    this.startProgressTimer()
  }

  private fadeInElements(): void {
    gsap
      .timeline()
      .from(this.backgroundTiles, CONFIG.animations.preloader.bgTilesFadeIn)
      .fromTo(
        [this.progressBar.parentElement, this.borderElement],
        CONFIG.animations.preloader.barFadeIn.from,
        CONFIG.animations.preloader.barFadeIn.to,
        '<+50%',
      )
  }

  private startProgressTimer(): void {
    let progress = 0;
    this.progressTimer = window.setInterval(() => {
      // Gradually increase progress, with some randomness to feel more natural
      progress += Math.random() * 5 + 2;
      
      if (progress >= 100) {
        clearInterval(this.progressTimer);
        this.onLoadComplete();
        return;
      }

      gsap.to(this.progressBar, {
        width: `${progress}%`,
        ...CONFIG.animations.preloader.bar,
      });

      this.progressText.textContent = `Loading ${Math.round(progress)}%`;
    }, 100);
  }

  private onLoadComplete(): void {
    this.progressText.textContent = 'Loading 100%'
    gsap.to(this.progressBar, {
      width: `100%`,
      ...CONFIG.animations.preloader.bar,
    })
    this.endTL.play()
  }
}

export function setupPreloader(breakpoint: gsap.Conditions) {
  CustomEase.create('preloaderBorder', CONFIG.eases.preloaderBorder)

  new Preloader()
  if (CONFIG.debug) {
    console.log('[NEXIO]: preloader loaded')
  }
}
