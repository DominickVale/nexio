import gsap from 'gsap'
import { $, $all } from '../utils'
import { CONFIG } from '../config'
import CustomEase from 'gsap/CustomEase'
import { Rive, Fit, Layout } from '@rive-app/webgl2'
import debounce from 'lodash/debounce'

class Preloader {
  private progressBar: HTMLElement
  private preloaderWrapper: HTMLElement
  private progressText: HTMLElement
  private borderElement: HTMLElement
  private images: NodeListOf<HTMLImageElement>
  private backgroundTiles: NodeListOf<HTMLElement>
  private totalImages: number
  private loadedImages: number = 0

  // Instead of a single boolean and instance, we now count the loaded rive animations.
  private loadedRives: number = 0
  finished: boolean
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
    this.backgroundTiles = $all('.background-tiles')
    this.totalImages = this.images.length
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
      .to(
        this.progressBar.parentNode,
        CONFIG.animations.preloader.progressFadeOut,
        '<',
      )
      .to(this.progressText, CONFIG.animations.preloader.textFadeOut, '<')
      .to(this.borderElement, CONFIG.animations.preloader.border)
      .to(this.preloaderWrapper, CONFIG.animations.preloader.hide)

    this.init()
  }

  private init(): void {
    this.fadeInElements()
    this.preloadImages()
    // Preload both Rive animations after a short delay.
    setTimeout(this.preloadRiveAnimations.bind(this), 1000)
    window.addEventListener('resize', this.handleResize.bind(this))
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
    let loadedImages = 0
    const checkAllImagesLoaded = () => {
      if (++loadedImages === this.totalImages) {
        this.loadedImages = loadedImages
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

    this.updateProgress()
  }

  private preloadRiveAnimations() {
    const isMobile =
      window.innerWidth / window.innerHeight < CONFIG.breakpoints.ratioDesktop
    // --- Desktop Rive Animation ---
    const desktopCanvas = $('#rive-canvas') as HTMLCanvasElement
    const desktopRive = new Rive({
      canvas: desktopCanvas,
      // Use your desktop artboard name (adjust the spelling if needed)
      artboard: CONFIG.riveAnims.desktop.artboard,
      autoplay: !isMobile,
      src: CONFIG.riveAnims.desktop.url,
      stateMachines: CONFIG.riveAnims.desktop.stateMachine,
      useOffscreenRenderer: true,
      layout: new Layout({
        fit: Fit.Cover,
      }),
      onLoad: () => {
        this.loadedRives += 1
        this.updateProgress()
        desktopRive.resizeDrawingSurfaceToCanvas()
        console.log('Loaded desktop rive animation')
      },
    })

    // --- Mobile Rive Animation ---
    // Create an offscreen canvas for preloading the mobile animation.
    const mobileCanvas = $('#rive-canvas-mobile') as HTMLCanvasElement
    const mobileRive = new Rive({
      canvas: mobileCanvas,
      artboard: CONFIG.riveAnims.mobile.artboard,
      autoplay: isMobile,
      src: CONFIG.riveAnims.mobile.url,
      stateMachines: CONFIG.riveAnims.mobile.stateMachine,
      useOffscreenRenderer: true,
      layout: new Layout({
        fit: Fit.Cover,
      }),
      onLoad: () => {
        this.loadedRives += 1
        this.updateProgress()
        mobileRive.resizeDrawingSurfaceToCanvas()
        console.log('Loaded mobile rive animation')
      },
    })

    // Store both animations on window.app.riveAnims for later access.
    window.app.riveAnims = {
      desktop: desktopRive,
      mobile: mobileRive,
    }
  }

  private updateProgress(): void {
    if (this.finished) return

    // Allocate 50% of progress to images and 50% to the two Rive animations (25% each)
    const imageProgress = (this.loadedImages / this.totalImages) * 50
    const riveProgress = (this.loadedRives / 2) * 50
    const overallProgress = imageProgress + riveProgress
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
    this.handleResize()
  }

  private getZoomValue(
    ratio: number,
    mapping: { [threshold: string]: number }
  ): number {
    // Convert mapping keys to numbers and sort descending.
    const thresholds = Object.keys(mapping)
      .map((key) => parseFloat(key))
      .sort((a, b) => b - a);

    // Iterate over thresholds: return the zoom for the first threshold met.
    for (const threshold of thresholds) {
      if (ratio >= threshold) {
        return mapping[threshold.toString()];
      }
    }
    // Fallback: return the zoom value of the smallest threshold.
    return mapping[thresholds[thresholds.length - 1].toString()];
  }

 private handleResize(): void {
    // Update both the desktop and mobile Rive animations.
    const riveAnims = window.app.riveAnims;
    if (!riveAnims) return;

    const ratio = window.innerWidth / window.innerHeight;
    const isDesktop = ratio >= CONFIG.breakpoints.ratioDesktop;
    console.log(
      'is desktop? :',
      isDesktop,
      ratio,
      CONFIG.breakpoints.ratioDesktop,
    );

    if (!isDesktop) {
      if (!riveAnims.mobile?.isPlaying) {
        riveAnims.mobile?.play();
        riveAnims.desktop?.stop();
      }

      // Mobile Rive
      if (riveAnims.mobile) {
        riveAnims.mobile.resizeDrawingSurfaceToCanvas();
        const zoomInput = riveAnims.mobile.stateMachineInputs(
          CONFIG.riveAnims.mobile.stateMachine,
        )[0];

        // Retrieve the mobile mapping and use the helper to determine the zoom value.
        const mobileMapping = CONFIG.riveAnims.mobile.ratioZoomMapping;
        zoomInput.value = this.getZoomValue(ratio, mobileMapping);
      }
    } else {
      if (!riveAnims.desktop?.isPlaying) {
        riveAnims.desktop?.play();
        riveAnims.mobile?.stop();
      }

      // Desktop Rive
      if (riveAnims.desktop) {
        riveAnims.desktop.resizeDrawingSurfaceToCanvas();
        const zoomInput = riveAnims.desktop.stateMachineInputs(
          CONFIG.riveAnims.desktop.stateMachine,
        )[0];

        // Retrieve the desktop mapping and determine the zoom value.
        const desktopMapping = CONFIG.riveAnims.desktop.ratioZoomMapping;
        zoomInput.value = this.getZoomValue(ratio, desktopMapping);
      }
    }
  }
}

export function setupPreloader(breakpoint: gsap.Conditions) {
  CustomEase.create('preloaderBorder', CONFIG.eases.preloaderBorder)
  new Preloader()
  if (CONFIG.debug) {
    console.log('[NEXIO]: preloader loaded')
  }
}
