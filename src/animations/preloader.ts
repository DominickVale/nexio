import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $, $all } from '../utils'
import { CONFIG } from '../config'

class Preloader {
  private progressBar: HTMLElement
  private preloaderWrapper: HTMLElement
  private progressText: HTMLElement
  private borderElement: HTMLElement
  private videos: NodeListOf<HTMLVideoElement>
  private totalVideos: number
  private loadedVideos: number = 0
  private totalProgress: number = 0
  private isCached: boolean = true

  constructor(
    preloaderWrapper: HTMLElement,
    progressBar: HTMLElement,
    progressText: HTMLElement,
    borderElement: HTMLElement,
    videos: NodeListOf<HTMLVideoElement>,
  ) {
    this.preloaderWrapper = preloaderWrapper
    this.progressBar = progressBar
    this.progressText = progressText
    this.borderElement = borderElement
    this.videos = videos

    this.totalVideos = this.videos.length

    this.init()
  }

  private init(): void {
    this.videos.forEach(video => {
      if (video.readyState === 4) {
        this.onVideoLoaded()
      } else {
        this.isCached = false
        video.addEventListener('loadedmetadata', this.onVideoLoaded.bind(this))
        video.addEventListener('progress', this.onVideoProgress.bind(this))
      }
    })

    if (this.isCached) {
      this.simulateCachedProgress()
    }
  }

  private simulateCachedProgress(): void {
    gsap.to(this, {
      totalProgress: 100,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => this.updateProgress(),
    })
  }

  private onVideoLoaded(): void {
    this.loadedVideos++
    this.updateProgress()
  }

  private onVideoProgress(event: Event): void {
    const video = event.target as HTMLVideoElement
    if (video.buffered.length > 0) {
      const progress = (video.buffered.end(0) / video.duration) * 100
      this.totalProgress += progress - this.totalProgress / this.totalVideos
      this.updateProgress()
    }
  }

  private updateProgress(): void {
    const overallProgress = (this.loadedVideos / this.totalVideos) * 100
    const combinedProgress = this.isCached ? this.totalProgress : (overallProgress + this.totalProgress) / 2

    gsap.to(this.progressBar, {
      width: `${combinedProgress}%`,
      ...CONFIG.animations.preloader.bar,
    })

    this.progressText.textContent = `${Math.min(Math.round(combinedProgress), 100)}%`

    if (combinedProgress >= 100) {
      this.onLoadComplete()
    }
  }

  private onLoadComplete(): void {
    gsap.from(this.borderElement, CONFIG.animations.preloader.border)

    gsap.to(this.preloaderWrapper, {
      ...CONFIG.animations.preloader.hide,
      onComplete: () => {
        this.preloaderWrapper.style.display = 'none'
      },
    })
  }
}

export function setupPreloader(
  isDesktop: boolean,
  isMobile: boolean,
  reduceMotion: boolean,
) {
  const progressBar = $(
    '#preloader-progress .inner-progress-bar',
  ) as HTMLElement
  const preloaderWrapper = $('#preloader') as HTMLElement
  const progressText = $('#preloader-text') as HTMLElement
  const borderElement = $('#preloader-border') as HTMLElement
  const videos = $all('video') as NodeListOf<HTMLVideoElement>

  if (progressBar && progressText && borderElement && videos.length > 0) {
    new Preloader(
      preloaderWrapper,
      progressBar,
      progressText,
      borderElement,
      videos,
    )
    if (CONFIG.debug) {
      console.log('[NEXIO]: preloader loaded')
    }
  }
}
