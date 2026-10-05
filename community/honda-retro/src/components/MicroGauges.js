import './MicroGauges.css'

const GAUGES = [
  { id: 'battLevel',    label: 'BATT',   unit: 'V' },
  { id: 'fuelPressure', label: 'FUEL',   unit: 'BAR' },
  { id: 'lambda',       label: 'LAMBDA', unit: 'λ' },
  { id: 'mapBoost',     label: 'BOOST',  unit: 'BAR' },
  { id: 'oilPressure',  label: 'OIL',    unit: 'BAR' },
  { id: 'mat',          label: 'MAT',    unit: '°C' },
]

export function MicroGauges() {
  return `
    <div id="micro-gauges">
      ${GAUGES.map(({ id, label, unit }) => `
        <div class="micro-gauge">
          <div class="micro-label">${label}</div>
          <span id="${id}">0</span>
          <div class="micro-unit">${unit}</div>
        </div>
      `).join('')}
    </div>
  `
}
