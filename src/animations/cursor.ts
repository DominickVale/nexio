import gsap from 'gsap'
import { $, $all } from '../utils'
import { CONFIG } from '../config'

interface CursorOptions {
  cursorId?: string
  hoverSelectors?: string[]
}

export class CustomCursor {
  private cursor: HTMLElement
  private mouseX: number = 0
  private mouseY: number = 0
  private setX: gsap.QuickToFunc
  private setY: gsap.QuickToFunc
  private states: Set<string> = new Set(['default'])
  private rafId: number | null = null

  constructor(options: CursorOptions = {}) {
    const { cursorId = '#custom-cursor', hoverSelectors = ['button', 'a'] } =
      options

    const cursor = $(cursorId)
    if (!cursor) throw new Error(`Cursor element with id ${cursorId} not found`)
    this.cursor = cursor as HTMLElement

    this.setX = gsap.quickTo(this.cursor, 'x', {
      duration: 0.25,
      ease: 'power3',
    })
    this.setY = gsap.quickTo(this.cursor, 'y', {
      duration: 0.25,
      ease: 'power3',
    })

    this.initializeCursor()
    this.initializeHoverElements(hoverSelectors)
  }

  private initializeCursor(): void {
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.updateCursorPosition()
  }

  private updateCursorPosition(): void {
    this.setX(this.mouseX)
    this.setY(this.mouseY)
    this.checkHeroState()
    this.rafId = requestAnimationFrame(this.updateCursorPosition.bind(this))
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX
    this.mouseY = e.clientY
  }

  private checkHeroState(): void {
    if (window.app.heroShown) {
      this.addState('blueprint')
    } else {
      this.removeState('blueprint')
    }
  }

  private initializeHoverElements(selectors: string[]): void {
    const elements = $all(selectors.join(', '))
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.addState('is-hovered')
      })
      element.addEventListener('mouseleave', () => {
        this.removeState('is-hovered')
      })
    })
  }

  public addState(state: string): void {
    this.states.add(state)
    this.updateCursorClasses()
  }

  public removeState(state: string): void {
    this.states.delete(state)
    this.updateCursorClasses()
  }

  private updateCursorClasses(): void {
    this.cursor.className = Array.from(this.states).join(' ')
  }

  public setState(state: 'default' | 'blueprint' | 'hover' | 'drag'): void {
    this.states.clear()
    this.states.add('default')
    if (state !== 'default') {
      this.states.add(state)
    }
    if (state === 'hover') {
      this.states.add('is-hovered')
    }
    this.updateCursorClasses()
  }

  public updateOptions(newOptions: Partial<CursorOptions>): void {
    if (newOptions.hoverSelectors) {
      this.initializeHoverElements(newOptions.hoverSelectors)
    }
  }

  public destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    window.removeEventListener('mousemove', this.onMouseMove)
  }
}

export function setupCustomCursor() {
  const cursor = new CustomCursor({
    cursorId: CONFIG.selectors.cursor,
    hoverSelectors: CONFIG.selectors.cursorHoverables,
  })
}
