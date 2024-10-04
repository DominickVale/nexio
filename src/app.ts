import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import ScrollTrigger from 'gsap/ScrollTrigger'
// import Lenis from 'lenis'
// import Snap from 'lenis/snap'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(ScrollToPlugin)

// const lenis = new Lenis({
//   lerp: 0.035
// })
//
// lenis.on('scroll', ScrollTrigger.update)
//
// gsap.ticker.add(time => {
//   lenis.raf(time * 1000)
// })
//
// gsap.ticker.lagSmoothing(0)

// const snap = new Snap(lenis, {
//   velocityThreshold: 0.5,
//   lerp: 0.07,
// })

const mm = gsap.matchMedia(),
  breakpoint = 768

mm.add(
  {
    isDesktop: `(min-width: ${breakpoint}px)`,
    isMobile: `(max-width: ${breakpoint - 1}px)`,
    reduceMotion: `(prefers-reduced-motion: reduce)`,
  },
  context => {
    const { isDesktop, isMobile, reduceMotion } =
      context.conditions as gsap.Conditions

    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        start: 'top top',
        end: 'bottom top+=100%',
        scrub: 2,
        snap: {
          snapTo: 'labelsDirectional',
          duration: { min: 0.8, max: 1 },
          ease: 'power4.out',
          delay: 0,
          inertia: false,
        },
      },
    })

    // [x: () => x, yPercent] @todo: find ratios if video sizes will be same
    const positionsAnimations = isMobile
      ? [
          [() => -(window.innerHeight * 0.4), -25],
          [() => -(window.innerHeight * 0.9), -55],
          [() => -(window.innerHeight * 1.4), -85],
          [() => -(window.innerHeight * 1.9), -115],
          [() => -(window.innerHeight * 2.4), -145],
          [],
        ]
      : [
          [() => -(window.innerHeight * 0.83), -105],
          [() => -(window.innerHeight * 1.72), -215],
          [() => -(window.innerHeight * 2.57), -320],
          [() => -(window.innerHeight * 3.4), -425],
          [() => -(window.innerHeight * 5), -600],
          [],
        ]

    // build animations
    positionsAnimations.forEach((pos, i) => {
      const id = i + 1
      const boxId = '#dbox' + id
      const [x, yPercent] = pos
      if (x && yPercent) {
        // set box opacity
        console.log('setting ', boxId, 'opacity 0')
        gsap.set(boxId, {
          autoAlpha: 0,
          scale: 0.5,
        })

        const fTl = gsap.timeline().to('#animations', {
          x,
          yPercent,
        })

        mainTimeline.addLabel(id.toString()).add(fTl)
      } else {
        mainTimeline.addLabel(id.toString())
      }
    })

    // build snap points
    // positionsAnimations.forEach((_, i) => {
    //   const id = (i + 1).toString()
    //   const snapPos = mainTimeline.scrollTrigger!.labelToScroll(id)
    //   snap.add(snapPos)
    //   console.log(snapPos)
    // })

    // Box animations

    const boxAnim1 = gsap
      .timeline({
        scrollTrigger: {
          trigger: `#padding__1`,
          start: 'center 80%',
          end: 'center 45%',
          // markers: true,
          toggleActions: 'play reverse play reverse',
          preventOverlaps: true,
        },
      })
      .to('#dbox1', {
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1,0.3)',
      })
      .to(
        '#dbox1',
        {
          autoAlpha: 1,
          ease: 'power4.inOut',
        },
        '<',
      )

    const boxAnim2 = gsap
      .timeline({
        scrollTrigger: {
          trigger: `#padding__2`,
          start: 'center 80%',
          end: 'center 55%',
          // markers: true,
          toggleActions: 'play reverse play reverse',
          preventOverlaps: true,
        },
        onUpdate() {
          console.log('Changing opacity 2')
        },
      })
      .to('#dbox2', {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1,0.3)',
      })
      .to(
        '#dbox2',
        {
          autoAlpha: 1,
          ease: 'power4.inOut',
        },
        '<',
      )

    const boxAnim3 = gsap
      .timeline({
        scrollTrigger: {
          trigger: `#padding__3`,
          start: 'center bottom',
          end: 'center 85%',
          // markers: true,
          toggleActions: 'play reverse play reverse',
          preventOverlaps: true,
        },
      })
      .to('#dbox3', {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1,0.3)',
      })
      .to(
        '#dbox2',
        {
          autoAlpha: 1,
          ease: 'power4.inOut',
        },
        '<',
      )

    const boxAnim4 = gsap
      .timeline({
        scrollTrigger: {
          trigger: `#padding__4`,
          start: 'top center+=20%',
          end: 'top center',
          // markers: true,
          toggleActions: 'play reverse play reverse',
          preventOverlaps: true,
        },
      })
      .to('#dbox4', {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1,0.3)',
      })
      .to(
        '#dbox4',
        {
          autoAlpha: 1,
          ease: 'power4.inOut',
        },
        '<',
      )

    const boxAnim5 = gsap
      .timeline({
        scrollTrigger: {
          trigger: `#padding__5`,
          start: 'top bottom-=10%',
          end: 'top bottom-=40%',
          // markers: true,
          toggleActions: 'play reverse play reverse',
          preventOverlaps: true,
        },
      })
      .to('#dbox5', {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1,0.3)',
      })
      .to(
        '#dbox5',
        {
          autoAlpha: 1,
          ease: 'power4.inOut',
        },
        '<',
      )

    // nav buttons
    //
    gsap.utils.toArray('.navigation a').forEach(link => {
      const l = link as HTMLAnchorElement
      l.addEventListener('click', e => {
        e.preventDefault()
        const scrTo = l.getAttribute('data-scroll-to') || '0'
        const labelPos = mainTimeline.scrollTrigger!.labelToScroll(scrTo)

        // lenis.scrollTo(labelPos)
        console.log(labelPos)
        gsap.to(window, {
          scrollTo: labelPos,
          duration: 1,
          ease: 'power3.inOut',
        })
      })
    })
  },
)

console.log('\n\nTEST\n\n')
