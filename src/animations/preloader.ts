import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import StationSelector from './station-selector'
import { $, $all } from '../utils'
import { CONFIG } from '../config'
import CustomEase from 'gsap/CustomEase'

class Preloader {
  private progressBar: HTMLElement
  private preloaderWrapper: HTMLElement
  private progressText: HTMLElement
  private borderElement: HTMLElement
  private videos: NodeListOf<HTMLVideoElement>
  private images: NodeListOf<HTMLImageElement>
  private backgroundTiles: NodeListOf<HTMLElement>
  private totalVideos: number
  private totalImages: number
  private loadedImages: number = 0
  private videoProgress: number[] = []
  finished: boolean
  loadedVideos: number
  endTL: gsap.core.Timeline

  constructor() {
    this.progressBar = $(
      '#preloader-progress .inner-progress-bar',
    ) as HTMLElement
    this.preloaderWrapper = $('#preloader') as HTMLElement
    this.progressText = $('#preloader-text') as HTMLElement
    this.borderElement = $('#preloader-border') as HTMLElement
    this.images = $all(
      '#preloader-fridges > img',
    ) as NodeListOf<HTMLImageElement>
    this.videos = $all('video') as NodeListOf<HTMLVideoElement>
    this.backgroundTiles = $all('.background-tiles')
    this.totalVideos = this.videos.length
    this.totalImages = this.images.length
    this.loadedVideos = 0
    this.finished = false
    this.endTL = gsap
      .timeline({
        paused: true,
        onComplete: () => {
          this.preloaderWrapper.style.display = 'none'
          window.app.onPreloadComplete()
        },
      })
      .to(this.images, CONFIG.animations.preloader.fridgesHide)
      .to(this.progressBar.parentNode, CONFIG.animations.preloader.progressFadeOut, "<")
      .to(this.progressText, CONFIG.animations.preloader.textFadeOut, "<")
      .to(this.borderElement, CONFIG.animations.preloader.border)
      .to(this.preloaderWrapper, CONFIG.animations.preloader.hide)

    this.init()
  }

  private init(): void {
    this.fadeInElements()
    this.preloadImages()
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

  private preloadImages(): void {
    if (this.totalImages === 0) {
      this.preloadVideos()
      return
    }

    let loadedImages = 0
    const checkAllImagesLoaded = () => {
      if (++loadedImages === this.totalImages) {
        this.loadedImages = loadedImages
        this.preloadVideos()
      } else {
        this.updateProgress()
      }
    }

    this.images.forEach(image => {
      if (image.complete) {
        checkAllImagesLoaded()
      } else {
        image.addEventListener('load', checkAllImagesLoaded)
        image.addEventListener('error', () => {
          console.error('Could not load image', image.src)
          checkAllImagesLoaded()
        })
      }
    })

    // Force progress update in case all images are already cached
    this.updateProgress()
  }

  private preloadVideos(): void {
    if (this.totalVideos === 0) {
      this.onLoadComplete()
      return
    }

    this.videoProgress = new Array(this.totalVideos).fill(0)

    let loadedVideos = 0
    const checkAllVideosLoaded = () => {
      if (++loadedVideos === this.totalVideos) {
        this.loadedVideos = loadedVideos
        this.onLoadComplete()
      } else {
        this.updateProgress()
      }
    }

    this.videos.forEach((video, index) => {
      if (video.readyState >= 4) {
        // HAVE_ENOUGH_DATA
        this.videoProgress[index] = 100
        checkAllVideosLoaded()
      } else {
        video.addEventListener('canplaythrough', () => {
          this.videoProgress[index] = 100
          checkAllVideosLoaded()
        })
        video.addEventListener('progress', () => {
          if (video.buffered.length > 0) {
            const progress = (video.buffered.end(0) / video.duration) * 100
            this.videoProgress[index] = progress
            this.updateProgress()
          }
        })
        // Force load for cached videos
        video.load()
      }
    })

    // Force progress update in case all videos are already cached
    this.updateProgress()
  }

  private updateProgress(): void {
    if (this.finished) return
    const imageProgress = (this.loadedImages / this.totalImages) * 50
    const videoProgress =
      (this.videoProgress.reduce((a, b) => a + b, 0) /
        (this.totalVideos * 100)) *
      50
    const overallProgress = imageProgress + videoProgress

    const combinedProgress = Math.min(overallProgress, 100)

    gsap.to(this.progressBar, {
      width: `${combinedProgress}%`,
      ...CONFIG.animations.preloader.bar,
    })

    if (CONFIG.debug)
      console.log(`[NEXIO]: Progress: ${combinedProgress.toFixed(2)}%`)
    this.progressText.textContent = `Loading ${Math.round(combinedProgress || 0)}%`

    if (combinedProgress >= 100) {
      this.onLoadComplete()
    }
  }

  private onLoadComplete(): void {
    this.finished = true
    this.progressText.textContent = 'Loading 100%'
    gsap.to(this.progressBar, {
      width: `100%`,
      ...CONFIG.animations.preloader.bar,
    })
    this.endTL.play()
  }
}

export function setupPreloader( breakpoint: gsap.Conditions) {
  CustomEase.create('preloaderBorder', CONFIG.eases.preloaderBorder)

  new Preloader()
  if (CONFIG.debug) {
    console.log('[NEXIO]: preloader loaded')
  }
}
