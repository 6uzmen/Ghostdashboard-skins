import "./Odometer.css";

// Roller odometer: total (6 rollers) and trip (4 rollers).
// The SDK's loadOdo/updateOdo write the km into two hidden spans
// (#kmTotal, #kmTrip); the component reads them and rolls the drums only
// when a value changes.

const ROW = 21; // px, one digit cell
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]; // trailing 0 to roll 9 → 0 forward

const drums = (n) =>
  Array.from(
    { length: n },
    () => `
      <div class="odo__drum">
        <div class="odo__col">${DIGITS.map((d) => `<span>${d}</span>`).join("")}</div>
      </div>`,
  ).join("");

export function Odometer() {
  return `
    <div id="odometer" class="odo">
      <div class="odo__group">
        <span class="odo__label">ODO</span>
        <div class="odo__drums odo__drums--total">${drums(6)}</div>
      </div>
      <div class="odo__group">
        <span class="odo__label">TRIP</span>
        <div class="odo__drums odo__drums--trip">${drums(4)}</div>
      </div>
      <span id="kmTotal" class="odo__value">0</span>
      <span id="kmTrip" class="odo__value">0</span>
    </div>
  `;
}

const createRoller = (box, count) => {
  const cols = Array.from(box.querySelectorAll(".odo__col"));
  const shown = new Array(count).fill(null);
  let last = null;

  const place = (col, cell, instant) => {
    col.classList.toggle("is-instant", instant);
    col.style.transform = `translateY(${-ROW * cell}px)`;
  };

  return (value) => {
    const n = Math.max(0, Math.floor(Number(value) || 0)) % 10 ** count;
    if (n === last) return;
    const first = last === null;
    last = n;
    const text = String(n).padStart(count, "0");
    cols.forEach((col, i) => {
      const d = Number(text[i]);
      const prev = shown[i];
      shown[i] = d;
      if (prev === d) return;
      if (first) {
        place(col, d, true);
      } else if (prev === 9 && d === 0) {
        // Roll forward onto the trailing 0, then snap back to the top one
        place(col, 10, false);
        setTimeout(() => {
          if (shown[i] === 0) place(col, 0, true);
        }, 720);
      } else {
        place(col, d, false);
      }
    });
  };
};

/**
 * Call once after the HTML is mounted.
 * Returns { totalEl, tripEl, update() }: pass the elements to loadOdo /
 * updateOdo, and call update() in the RAF loop after updateOdo.
 */
export function createOdometerController() {
  const root = document.getElementById("odometer");
  const totalEl = document.getElementById("kmTotal");
  const tripEl = document.getElementById("kmTrip");
  const rollTotal = createRoller(root.querySelector(".odo__drums--total"), 6);
  const rollTrip = createRoller(root.querySelector(".odo__drums--trip"), 4);

  return {
    totalEl,
    tripEl,
    update() {
      rollTotal(totalEl.textContent);
      rollTrip(tripEl.textContent);
    },
  };
}
