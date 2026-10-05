import './Odometer.css'

export function Odometer() {
  return `
    <div id="odometer">
      <div class="odo-trip">TRIP <span id="kmTrip">0</span> km</div>
      <div class="odo-total">TOTAL <span id="kmTotal">0</span> km</div>
    </div>
  `
}
