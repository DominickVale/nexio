import { gsap } from 'gsap'
import { CONFIG } from '../config'
import { $, $all } from '../utils'

interface CursorState {
  mode: 'blueprint' | 'default'
  isHovered: boolean
  isDragging: boolean
}

interface CursorStateConfig {
  svg: {
    [key: string]: any
  }
  path: {
    [key: string]: any
  }
}

export class CustomCursor {
  private cursor: HTMLElement
  private cursorSvg: SVGElement
  private cursorPath: SVGPathElement
  private state: CursorState = {
    mode: 'default',
    isHovered: false,
    isDragging: false,
  }
  private hoverableElements: NodeListOf<Element>
  private mouseX = 0
  private mouseY = 0
  private cursorX = 0
  private cursorY = 0
  private xSet: gsap.QuickToFunc
  private ySet: gsap.QuickToFunc

  constructor() {
    this.cursor = $('#custom-cursor') as HTMLElement
    this.cursorSvg = $('svg', this.cursor) as unknown as SVGElement
    this.cursorPath = $('svg path', this.cursor) as unknown as SVGPathElement
    this.hoverableElements = $all('button, a, #active-station-button')

    const { lagDuration, lagEase } = CONFIG.animations.cursor

    this.xSet = gsap.quickTo(this.cursor, 'x', {
      duration: lagDuration,
      ease: lagEase,
    })
    this.ySet = gsap.quickTo(this.cursor, 'y', {
      duration: lagDuration,
      ease: lagEase,
    })

    this.xSet = gsap.quickTo(this.cursor, 'x', {
      duration: lagDuration,
      ease: lagEase,
    })
    this.ySet = gsap.quickTo(this.cursor, 'y', {
      duration: lagDuration,
      ease: lagEase,
    })

    this.init()
    this.setMode(window.app.isHomepage ? 'blueprint' : 'default')
  }

  private init(): void {
    this.addEventListeners()
    this.animate()
  }

  private addEventListeners(): void {
    document.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.hoverableElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.setHovered(true))
      el.addEventListener('mouseleave', () => this.setHovered(false))
    })
  }

  public onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX
    this.mouseY = e.clientY
  }

  private animate(): void {
    if(window.innerWidth <= CONFIG.breakpoints.maxMobile) {
      return
    }
    this.cursorX += (this.mouseX - this.cursorX)
    this.cursorY += (this.mouseY - this.cursorY)

    this.xSet(this.cursorX)
    this.ySet(this.cursorY)

    requestAnimationFrame(this.animate.bind(this))
  }

  private updateCursorState(): void {
    const { mode, isHovered, isDragging } = this.state
    let stateKey = mode

    if (isHovered) stateKey += 'Hover'
    if (isDragging) stateKey += 'Drag'

    //@ts-ignore
    const stateConfig = CONFIG.animations.cursor.states[stateKey]

    if (!stateConfig) {
      console.warn(`No configuration found for cursor state: ${stateKey}`)
      return
    }

    this.animateCursor(stateConfig)
  }

  private animateCursor(stateConfig: CursorStateConfig): void {
    gsap.to(this.cursorSvg, {
      ...stateConfig.svg,
      duration: CONFIG.animations.cursor.transitionDuration,
      ease: CONFIG.animations.cursor.transitionEase,
    })

    gsap.to(this.cursorPath, {
      ...stateConfig.path,
      duration: CONFIG.animations.cursor.transitionDuration,
      ease: CONFIG.animations.cursor.transitionEase,
    })
  }

  public setMode(mode: CursorState['mode']): void {
    //@ts-ignore
    if (!CONFIG.animations.cursor.states[mode]) {
      console.warn(`Invalid cursor mode: ${mode}`)
      return
    }
    this.state.mode = mode
    this.updateCursorState()
  }

  public setHovered(isHovered: boolean): void {
    this.state.isHovered = isHovered
    this.updateCursorState()
  }

  public setDragging(isDragging: boolean): void {
    this.state.isDragging = isDragging
    this.updateCursorState()
  }
}
