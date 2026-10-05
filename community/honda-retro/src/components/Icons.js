import './Icons.css'

// turnLeft and turnRight are handled by TurnSignal component
export const SIGNAL_IDS = [
  'battAlt', 'eBrake',
  'highBeam', 'parkLights', 'fogLights', 'auxLights',
  'openDoor', 'fan', 'oilSwitch', 'ECUErr',
]

const ICON_DEFS = [
  { id: 'ECUErr',     file: 'injection' },
  { id: 'battAlt',    file: 'battery' },
  { id: 'eBrake',     file: 'handbrake' },
  { id: 'oilSwitch',  file: 'oil' },
  { id: 'highBeam',   file: 'hheadlight' },
  { id: 'parkLights', file: 'headlight' },
  { id: 'fogLights',  file: 'milha' },
  { id: 'auxLights',  file: 'neblina' },
  { id: 'fan',        file: 'fan' },
  { id: 'openDoor',   file: 'door' },
]

export function Icons({ icon = 1 } = {}) {
  const folder = icon === 1 ? 'icons' : 'icons_color'
  const basePath = `../../assets/${folder}`

  return `
    <section id="top-icons" class="icons">
      ${ICON_DEFS.map(({ id, file }) => `
        <span id="${id}">
          <img src="${basePath}/${file}.svg" alt="${id}" />
        </span>
      `).join('')}
    </section>
  `
}
