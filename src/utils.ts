
export const $ = (selector: string, parentElement: HTMLElement | Document = document.body): HTMLElement | null =>
  parentElement.querySelector(selector)

export const $all = (selector: string, parentElement: HTMLElement | Document = document.body): NodeListOf<HTMLElement> =>
  parentElement.querySelectorAll(selector)


export function deepKillTimeline(tl: TimelineMax) {
	tl.getChildren(true, true, true).forEach(animation => animation.kill());
	tl.kill();
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
