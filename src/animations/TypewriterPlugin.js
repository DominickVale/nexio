
/*
 *  By Dominick Vale
 *  https://domenicovale.it
 *
 * */
import { TextPlugin, clamp } from 'gsap/all'
import { CONFIG } from '../config.ts'
const { splitInnerHTML } = TextPlugin

const CHARS = CONFIG.animations.typewriter.chars

let _tempDiv

//@TODO: Maybe make it a library or something? (Add back the support for rtl, classes etc.)
export const TypewriterPlugin = {
  version: '1.0.0',
  name: 'typewrite',
  init(target, props, tween) {
    typeof props !== 'object' && (props = { value: props })
    let data = this,
      delimiter = (data.delimiter = props.delimiter || ''),
      text

    data.target = target
    _tempDiv || (_tempDiv = document.createElement('div'))
    // using original content prevents the typewrite from using the progressing animation to set the text
    // as the next value when the animation is interrupted
    let originalContent = target.getAttribute('data-typewrite-content')
    if (!originalContent) {
      target.setAttribute('data-typewrite-content', target.innerHTML)
      originalContent = target.innerHTML
    }
    _tempDiv.innerHTML = (typeof props.value === 'string' ? props.value : originalContent || target.innerHTML).replace(/\n/g, '<br/>')
    text = splitInnerHTML(_tempDiv, delimiter, false, true)
    const newSpeed = Math.min((0.05 / props.speed) * text.length, props.maxDuration || 9999)
    props.speed && tween.duration(newSpeed)
    data.speed = newSpeed
    data.text = text
    data._props.push('text')
    data.maxScrambleChars = props.maxScrambleChars || 4
    data.charClass = props.charClass || "typewriter-char"
    data.duration = tween.vars.duration
    tween.typewriter = data // this is specific to the Typewriter.ts implementation
    const oldOnInterrupt = tween.vars.onInterrupt
    const oldOnComplete = tween.vars.onComplete

    if(!target.getAttribute('aria-label')){
      target.setAttribute('aria-label', originalContent)
    }
  },
  render(progress, data) {
    if (progress >= 1) {
      progress = 1
    } else if (progress < 0) {
      progress = 0
    }

    let { text, delimiter, target, fillChar, previousProgress, maxScrambleChars, charClass, speed, duration } = data,
      l = text.length,
      i = (progress * l + 0.5) | 0,
      str

    const dp = progress - previousProgress
    const dSpeed = Math.abs(dp)

    // Determine the number of characters to scramble based on delta speed
    const n = clamp(1, maxScrambleChars, Math.ceil(dSpeed * maxScrambleChars * 100))

    if (progress) {
      const randomChar = () => `<span class="${charClass}">${CHARS[Math.floor(Math.random() * CHARS.length)]}</span>`
      if (i === 0) {
        str = ' '
      } else if (i >= l) {
        str = text.join(delimiter)
      } else if ((speed || duration) * dp < 0.9) {
        const startScrambleIndex = Math.max(0, i - n)
        let scrambledPart = text
          .slice(startScrambleIndex, i)
          .map(() => randomChar())
          .join(delimiter)

        let nonScrambledPart = text.slice(0, startScrambleIndex).join(delimiter)

        str = nonScrambledPart + scrambledPart
      } else str = text.slice(0, i).join(delimiter)
    } else {
      str = ' '
    }
    data.previousProgress = progress
    target.innerHTML = fillChar === '&nbsp;' && ~str.indexOf('  ') ? str.split('  ').join('&nbsp;&nbsp;') : str
  },
}
