import { CONFIG } from '../config'
import { $, $all } from '../utils'

export default class TextScramble {
  static #elsIntervals: Record<string, any> = {}

  constructor() {
    TextScramble.init()
  }

  static onMouseHover(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement
    if (!el) return
    // el.setAttribute('data-text-scramble', el.innerText)
    const speed = el.getAttribute('data-text-scramble-speed')
    TextScramble.scramble(el, Number(speed) || undefined)
  }

  static initScrambleContainer(el: HTMLElement) {
    const textNode = Array.from(el.childNodes).find(
      node => node.nodeType === Node.TEXT_NODE,
    )
    const oldText = textNode?.textContent
    el.removeChild(textNode!)
    const oldHtml = el.innerHTML

    const scrambleHtml = `
<div class="scramble-container">
  <span class="shadow-text">${oldText || ''}</span>
  <span class="scramble-text">${oldText || ''}</span>
</div>
`
    el.innerHTML = oldHtml + scrambleHtml
    return $('.scramble-container .scramble-text', el)
  }

  static init() {
    $all('[data-text-scramble]').forEach((el, i) => {
      //this is going to be called on every transition, but identical event handlers are discarded
      //(only if the function is not anonymous)
      el.addEventListener('mouseover', TextScramble.onMouseHover)

      if (!$('.scramble-container', el)) {
        TextScramble.initScrambleContainer(el)
      }
    })
  }

  public reload() {
    TextScramble.init()
  }

  public static scramble(el: HTMLElement, speed: number = 45) {
    let target = $('.scramble-container .scramble-text', el)

    if (!target) {
      target = TextScramble.initScrambleContainer(el)
    }

    let originalText = el.getAttribute('data-text-scramble')
    if (!originalText) return

    const id =
      el.getAttribute('data-text-scramble-id') || Math.random().toString()
    el.setAttribute('data-text-scramble-id', id)

    if (TextScramble.#elsIntervals[id]) {
      clearInterval(TextScramble.#elsIntervals[id])
      delete TextScramble.#elsIntervals[id]
      el.removeAttribute('data-text-scramble-id')
      target!.innerText = originalText
    }

    let iteration = 0

    TextScramble.#elsIntervals[id] = setInterval(() => {
      target!.innerText = originalText
        .split('')
        .map((_, index) => {
          const ignoreRegex = /\s|\n/ // ignore spaces and newlines
          if (index < iteration || ignoreRegex.test(originalText[index])) {
            return originalText[index]
          }
          return CONFIG.animations.typewriter.chars[Math.floor(Math.random() * 39)]
        })
        .join('')

      if (iteration >= originalText.length || !TextScramble.#elsIntervals[id]) {
        clearInterval(TextScramble.#elsIntervals[id])
        delete TextScramble.#elsIntervals[id]
        el.removeAttribute('data-text-scramble-id')
        target!.innerText = originalText
      }

      iteration += 1 / 2
    }, speed)
  }
}

export function setupScrambles(){
  new TextScramble()
}
