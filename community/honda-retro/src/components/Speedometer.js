import './Speedometer.css'

// Lower bound (km/h) of each color tier, from Figma 472-2.
// 0: <50 dim, no glow · 1: white · 2: cream · 3: orange · 4: red · 5: red + pink glow
const TIERS = [0, 50, 100, 140, 180, 200]

const SLOTS = ['hundreds', 'tens', 'units']

export function Speedometer() {
  return `
    <div id="speedo" data-tier="0">
      ${SLOTS.map((slot) => `
        <div class="spd-digit ${slot}">
          <span class="spd-glow">0</span>
          <span class="spd-main">0</span>
        </div>
      `).join('')}
    </div>
  `
}

const tierFor = (speed) => {
  let tier = 0
  for (let i = 1; i < TIERS.length; i++) {
    if (speed >= TIERS[i]) tier = i
  }
  return tier
}

/**
 * Call once after the HTML is mounted.
 * Returns an { update(speed) } controller to use in the RAF loop.
 * Only touches the DOM when the displayed value changes.
 */
export function createSpeedometerController() {
  const root = document.getElementById('speedo')
  const digits = Array.from(root.querySelectorAll('.spd-digit')).map((el) => ({
    el,
    spans: el.querySelectorAll('span'),
  }))

  let last = -1

  return {
    update(speed) {
      const value = Math.min(999, Math.max(0, Math.round(speed ?? 0)))
      if (value === last) return
      last = value

      root.dataset.tier = tierFor(value)

      const text = String(value).padStart(3, '0')
      const firstLit = value === 0 ? 2 : 3 - String(value).length

      digits.forEach(({ el, spans }, i) => {
        spans[0].textContent = text[i]
        spans[1].textContent = text[i]
        el.classList.toggle('ghost', i < firstLit)
      })
    },
  }
}
