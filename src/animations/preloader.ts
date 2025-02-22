import gsap from 'gsap'
import { $, $all } from '../utils'
import { CONFIG } from '../config'
import CustomEase from 'gsap/CustomEase'
import { Rive, Fit, Layout } from '@rive-app/webgl2'
import debounce from 'lodash/debounce'

// Preload WASM using the ?url suffix so Vite treats it as an asset URL.
import riveWASMResource from '@rive-app/canvas/rive.wasm?url'
import { RuntimeLoader } from '@rive-app/canvas'
RuntimeLoader.setWasmUrl(riveWASMResource)

class Preloader {
  private progressBar: HTMLElement
  private preloaderWrapper: HTMLElement
  private progressText: HTMLElement
  private borderElement: HTMLElement
  private images: HTMLImageElement[]
  private backgroundTiles: HTMLElement[]
  private totalImages: number
  private finished: boolean = false
  private endTL: gsap.core.Timeline
  private debouncedResize: () => void

  // Phase progress values (0 to 1)
  private wasmProgress = 0
  private riveProgress = 0
  private imagesProgress = 0

  // A helper property for animating the text display.
  private currentDisplayedProgress: number = 0

  // Store the last overall progress to prevent regressions.
  private lastOverallProgress: number = 0

  private overallProgress = 0

  constructor() {
    // Cache elements
    this.progressBar = $('#preloader-progress .inner-progress-bar') as HTMLElement
    this.preloaderWrapper = $('#preloader') as HTMLElement
    this.progressText = $('#preloader-text') as HTMLElement
    this.borderElement = $('#preloader-border') as HTMLElement
    this.images = Array.from($all('#preloader-fridges > img')) as HTMLImageElement[]
    this.backgroundTiles = Array.from($all('.background-tiles')) as HTMLElement[]
    this.totalImages = this.images.length

    this.progressBar.style.transformOrigin = 'left center'

    // Create timeline for preloader exit animations.
    this.endTL = gsap
      .timeline({
        paused: true,
        onComplete: () => {
          this.preloaderWrapper.style.display = 'none'
          console.log('[NEXIO]: Preload complete - calling window.app.onPreloadComplete()')
          window.app.onPreloadComplete()
        },
      })
      .to(this.images, CONFIG.animations.preloader.fridgesHide)
      .to(this.progressBar.parentElement, CONFIG.animations.preloader.progressFadeOut, '<')
      .to(this.progressText, CONFIG.animations.preloader.textFadeOut, '<')
      .to(this.borderElement, CONFIG.animations.preloader.border)
      .to(this.preloaderWrapper, CONFIG.animations.preloader.hide)

    this.debouncedResize = debounce(this.handleResize.bind(this), 200)
    window.addEventListener('resize', this.debouncedResize)

    this.init()
  }

  private async init(): Promise<void> {
    this.fadeInElements()
    // Phase 1: Load WASM first.
    console.log('[NEXIO]: Starting to load WASM')
    await this.loadWasm()
    console.log('[NEXIO]: WASM phase complete')

    // Phase 2: Then load Rive animations immediately.
    console.log('[NEXIO]: Starting to load Rive animations')
    await this.loadRiveAnimations()
    console.log('[NEXIO]: Rive animations phase complete')

    // Phase 3: Then load images.
    console.log('[NEXIO]: Starting to load images')
    await this.loadImages()
    console.log('[NEXIO]: Images phase complete')

    // When all phases are done, update progress one last time.
    this.updateProgress()
  }

  private fadeInElements(): void {
    gsap
      .timeline()
      .from(this.backgroundTiles, CONFIG.animations.preloader.bgTilesFadeIn)
      .fromTo(
        [this.progressBar.parentElement, this.borderElement],
        CONFIG.animations.preloader.barFadeIn.from,
        CONFIG.animations.preloader.barFadeIn.to,
        '<+50%'
      )
  }

  // Phase 1: Load WASM sequentially.
  private loadWasm(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.simulatePhaseProgress('wasm')
      fetch(riveWASMResource)
        .then(response => response.arrayBuffer())
        .then(() => {
          console.log('[NEXIO]: WASM loaded successfully')
          this.wasmProgress = 1
          this.updateProgress()
          resolve()
        })
        .catch(err => {
          console.error('[NEXIO]: Error loading WASM:', err)
          reject(err)
        })
    })
  }

  // Phase 2: Load both Rive animations sequentially.
  private loadRiveAnimations(): Promise<void> {
    return new Promise(resolve => {
      // Start simulation for Rive phase.
      this.simulatePhaseProgress('rive')

      const isMobile = window.innerWidth / window.innerHeight < CONFIG.breakpoints.ratioDesktop
      let desktopLoaded = false
      let mobileLoaded = false

      const updateRiveProgress = () => {
        if (desktopLoaded && mobileLoaded) {
          this.riveProgress = 1
        } else if (desktopLoaded || mobileLoaded) {
          this.riveProgress = 0.5
        }
        this.updateProgress()
      }

      // Desktop Rive
      const desktopCanvas = $('#rive-canvas') as HTMLCanvasElement
      const desktopRive = new Rive({
        canvas: desktopCanvas,
        artboard: CONFIG.riveAnims.desktop.artboard,
        autoplay: !isMobile,
        src: CONFIG.riveAnims.desktop.url,
        stateMachines: CONFIG.riveAnims.desktop.stateMachine,
        useOffscreenRenderer: true,
        layout: new Layout({ fit: Fit.Cover }),
        onLoad: () => {
          console.log('[NEXIO]: Desktop Rive loaded')
          desktopLoaded = true
          updateRiveProgress()
          desktopRive.resizeDrawingSurfaceToCanvas()
        },
      })

      // Mobile Rive
      const mobileCanvas = $('#rive-canvas-mobile') as HTMLCanvasElement
      const mobileRive = new Rive({
        canvas: mobileCanvas,
        artboard: CONFIG.riveAnims.mobile.artboard,
        autoplay: isMobile,
        src: CONFIG.riveAnims.mobile.url,
        stateMachines: CONFIG.riveAnims.mobile.stateMachine,
        useOffscreenRenderer: true,
        layout: new Layout({ fit: Fit.Cover }),
        onLoad: () => {
          console.log('[NEXIO]: Mobile Rive loaded')
          mobileLoaded = true
          updateRiveProgress()
          mobileRive.resizeDrawingSurfaceToCanvas()
        },
      })

      window.app.riveAnims.desktop = desktopRive
      window.app.riveAnims.mobile = mobileRive

      // Periodically check if both are loaded.
      const interval = setInterval(() => {
        if (desktopLoaded && mobileLoaded) {
          clearInterval(interval)
          this.riveProgress = 1
          this.updateProgress()
          resolve()
        }
      }, 100)
    })
  }

  // Phase 3: Preload images sequentially with a fallback to force completion.
  private loadImages(): Promise<void> {
    return new Promise(resolve => {
      this.simulatePhaseProgress('images')
      let loadedCount = 0
      let resolved = false

      if (this.totalImages === 0) {
        this.imagesProgress = 1
        this.updateProgress()
        resolve()
        return
      }

      const handleImageLoad = (img: HTMLImageElement) => {
        loadedCount++
        console.log(`[NEXIO]: Image loaded (${loadedCount}/${this.totalImages}) - ${img.src}`)
        this.imagesProgress = loadedCount / this.totalImages
        this.updateProgress()
        if (loadedCount === this.totalImages && !resolved) {
          resolved = true
          // Force images progress to 100%.
          this.imagesProgress = 1
          this.updateProgress()
          resolve()
        }
      }

      this.images.forEach(image => {
        if (image.complete) {
          console.log(`[NEXIO]: Image already complete: ${image.src}`)
          handleImageLoad(image)
        } else {
          image.addEventListener('load', () => handleImageLoad(image), { once: true })
          image.addEventListener(
            'error',
            () => {
              console.error(`[NEXIO]: Could not load image: ${image.src}`)
              handleImageLoad(image)
            },
            { once: true }
          )
        }
      })

      // Fallback: after 5 seconds, force images progress to complete.
      setTimeout(() => {
        if (!resolved) {
          // console.log('[NEXIO]: Forcing images progress to complete due to timeout.')
          this.imagesProgress = 1
          this.updateProgress()
          resolved = true
          resolve()
        }
      }, 5000)
    })
  }

  // Helper: Simulate incremental progress for a given phase.
  private simulatePhaseProgress(phase: 'wasm' | 'rive' | 'images'): void {
    const tick = () => {
      if (phase === 'wasm' && this.wasmProgress < 0.99) {
        this.wasmProgress = Math.min(this.wasmProgress + 0.01, 0.99)
      } else if (phase === 'rive' && this.riveProgress < 0.99) {
        this.riveProgress = Math.min(this.riveProgress + 0.01, 0.99)
      } else if (phase === 'images' && this.imagesProgress < 0.99) {
        this.imagesProgress = Math.min(this.imagesProgress + 0.01, 0.99)
      }
      this.updateProgress()
      if (
        (phase === 'wasm' && this.wasmProgress < 0.99) ||
        (phase === 'rive' && this.riveProgress < 0.99) ||
        (phase === 'images' && this.imagesProgress < 0.99)
      ) {
        setTimeout(
          tick,
          this.overallProgress < 50 ? Math.random() * 200 : 10 + Math.random() * 500
        )
      }
    }
    tick()
  }

  // Compute overall progress and animate both the bar and text.
  private updateProgress(): void {
    if (this.finished) return
    let overall = 0
    if (this.wasmProgress < 1) {
      overall = (this.wasmProgress / 3) * 100
    } else if (this.riveProgress < 1) {
      overall = ((1 + this.riveProgress) / 3) * 100
    } else {
      overall = ((2 + this.imagesProgress) / 3) * 100
    }
    // If all phases are complete, force overall to 100.
    if (this.wasmProgress === 1 && this.riveProgress === 1 && this.imagesProgress === 1) {
      overall = 100
    }
    overall = Math.max(overall, this.lastOverallProgress)
    this.lastOverallProgress = overall
    this.overallProgress = overall

    // Animate the progress bar.
    gsap.to(this.progressBar, {
      scaleX: overall / 100,
      ...CONFIG.animations.preloader.bar,
      overwrite: 'auto',
    })

    // console.log(
    //   `[NEXIO]: Overall Progress: ${overall.toFixed(2)}% (WASM: ${(this.wasmProgress * 100).toFixed(0)}%, Rive: ${(this.riveProgress * 100).toFixed(0)}%, Images: ${(this.imagesProgress * 100).toFixed(0)}%)`
    // )

    // Animate the text value using GSAP so it always eases toward the target.
    let target = Math.round(overall)
    // Calculate a dynamic duration based on the difference (minimum 0.5 sec).
    let diff = Math.abs(target - this.currentDisplayedProgress)
    let duration = diff < 0.1 ? 0.3 : Math.max(0.5, diff / 30)

    if (target < 100) {
      gsap.to(this, {
        currentDisplayedProgress: target,
        duration: duration,
        ease: 'power1.out',
        onUpdate: () => {
          this.progressText.textContent = `Loading ${Math.round(this.currentDisplayedProgress)}%`
        },
      })
    } else {
      // Even if the overall value jumps to 100, animate the text to 100.
      gsap.to(this, {
        currentDisplayedProgress: 100,
        duration: duration,
        ease: 'power1.out',
        onUpdate: () => {
          this.progressText.textContent = `Loading ${Math.round(this.currentDisplayedProgress)}%`
        },
        onComplete: () => {
          // Always wait 1 second after reaching 100 before calling onLoadComplete.
          setTimeout(() => {
            this.onLoadComplete()
          }, 1000)
        },
      })
    }
  }

  private onLoadComplete(): void {
    this.finished = true
    gsap.to(this.progressBar, {
      scaleX: 1,
      ...CONFIG.animations.preloader.bar,
      overwrite: 'auto',
    })
    this.endTL.play()
    this.handleResize()
  }

  private getZoomValue(ratio: number, mapping: Record<string, number>): number {
    const thresholds = Object.keys(mapping)
      .map(Number)
      .sort((a, b) => b - a)
    for (const threshold of thresholds) {
      if (ratio >= threshold) {
        return mapping[threshold.toString()]
      }
    }
    return mapping[thresholds[thresholds.length - 1].toString()]
  }

  private handleResize(): void {
    const riveAnims = window.app.riveAnims
    if (!riveAnims) return
    const ratio = window.innerWidth / window.innerHeight
    const isDesktop = ratio >= CONFIG.breakpoints.ratioDesktop
    console.log('[NEXIO]: Resize event', {
      isDesktop,
      ratio,
      desktopBreakpoint: CONFIG.breakpoints.ratioDesktop,
    })
    if (!isDesktop) {
      if (!riveAnims.mobile?.isPlaying) {
        riveAnims.mobile?.play()
        riveAnims.desktop?.stop()
      }
      if (riveAnims.mobile) {
        riveAnims.mobile.resizeDrawingSurfaceToCanvas()
        const zoomInput = riveAnims.mobile.stateMachineInputs(CONFIG.riveAnims.mobile.stateMachine)[0]
        zoomInput.value = this.getZoomValue(ratio, CONFIG.riveAnims.mobile.ratioZoomMapping)
      }
    } else {
      if (!riveAnims.desktop?.isPlaying) {
        riveAnims.desktop?.play()
        riveAnims.mobile?.stop()
      }
      if (riveAnims.desktop) {
        riveAnims.desktop.resizeDrawingSurfaceToCanvas()
        const zoomInput = riveAnims.desktop.stateMachineInputs(CONFIG.riveAnims.desktop.stateMachine)[0]
        zoomInput.value = this.getZoomValue(ratio, CONFIG.riveAnims.desktop.ratioZoomMapping)
      }
    }
  }
}

export function setupPreloader(): void {
  CustomEase.create('preloaderBorder', CONFIG.eases.preloaderBorder)
  new Preloader()
  if (CONFIG.debug) {
    console.log('[NEXIO]: preloader loaded')
  }
}
