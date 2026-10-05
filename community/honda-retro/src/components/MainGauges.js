import './MainGauges.css'

export function MainGauges({ rpmM = 8 } = {}) {
  return `
    <div id="main-gauges">
      <div id="rpm-gauge" class="gauge-circle">
        <div id="rpmnumbers" class="gauge-numbers rpm-max-${rpmM}"></div>
        <div id="gear" class="gauge-center">N</div>
        <div class="gauge-arc-clip">
          <div class="gauge-arc-fill rpm-fill"></div>
        </div>
      </div>

      <div id="speed-gauge" class="gauge-circle">
        <div id="kmhnumbers" class="gauge-numbers"></div>
        <div id="speedo" class="gauge-center">0</div>
        <div class="gauge-arc-clip">
          <div class="gauge-arc-fill kmh-fill"></div>
        </div>
      </div>
    </div>
  `
}

export function initRPMNumbers(rpmM) {
  const holder = document.getElementById('rpmnumbers')
  if (!holder) return
  for (let i = rpmM; i >= 0; i--) {
    const div = document.createElement('div')
    div.style.cssText = `
      animation-delay: ${(i + 15) * 0.2}s;
      transform: translateX(${(i / rpmM) * -180}px);
    `
    div.textContent = i
    holder.appendChild(div)
  }
}

export function initSpeedNumbers() {
  const items = [0, 20, 40, 60, 100, 140, 200, 260]
  const holder = document.getElementById('kmhnumbers')
  if (!holder) return
  for (let i = items.length - 1; i >= 0; i--) {
    const div = document.createElement('div')
    div.style.cssText = `
      animation-delay: ${(i + 15) * 0.2}s;
      transform: translateX(${(i / (items.length - 1)) * 180}px);
    `
    div.textContent = items[i]
    holder.appendChild(div)
  }
}
