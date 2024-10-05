
export const $ = (selector: string, parentElement: HTMLElement | Document = document.body): HTMLElement | null =>
  parentElement.querySelector(selector)

export const $all = (selector: string, parentElement: HTMLElement | Document = document.body): NodeListOf<HTMLElement> =>
  parentElement.querySelectorAll(selector)

