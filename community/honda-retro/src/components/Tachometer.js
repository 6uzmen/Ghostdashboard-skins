import "./Tachometer.css";

// Bar-wave tachometer from Figma 485-7.
// - A row of bars whose "wave" (a bump) follows the RPM and grows as you rev.
// - One cell per 1000 RPM behind it, lighting up as the needle passes.
// - A base line that turns red past the redline (8000 RPM by default).

const WIDTH = 928; // px, drawing width of bars, cells and base line
const BARS = 53;
const BAR_MAX = 151; // px, tallest bar
const BAR_MIN = 12; // px, resting bar
// Height steps from the Figma frame: bars move in these increments,
// which gives the stepped, LED-like look of the design.
const STEPS = [12, 18.5, 34.2, 62.7, 85.5, 114, 138.7, 151];

// Horizontal color gradient across the bars (Figma stops)
const BAR_STOPS = [
  [0, [251, 253, 199]], // #fbfdc7
  [0.38, [255, 214, 102]], // #ffd666
  [0.7, [255, 156, 69]], // #ff9c45
  [1, [244, 33, 68]], // #f42144
];

const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const colorAt = (r) => {
  for (let i = 1; i < BAR_STOPS.length; i++) {
    const [p1, c1] = BAR_STOPS[i];
    if (r <= p1) {
      const [p0, c0] = BAR_STOPS[i - 1];
      return mix(c0, c1, (r - p0) / (p1 - p0));
    }
  }
  return BAR_STOPS[BAR_STOPS.length - 1][1];
};

const redlineFor = (rpmM, redline) =>
  Math.min(redline ?? 8000, (rpmM - 1) * 1000);

/**
 * @param {number} rpmM  max RPM in thousands (DASH_OPTIONS.rpmM, 6–10)
 * @param {number} [redline]  RPM where the base line turns red (default 8000)
 */
export function Tachometer({ rpmM = 8, redline } = {}) {
  const red = redlineFor(rpmM, redline);
  const redX = (red / (rpmM * 1000)) * WIDTH;

  // Cell k (1…rpmM) sits over the (k-1)000–k000 stretch of the bars and
  // lights up once the RPM passes k000, like a counter filling in
  const cells = Array.from({ length: rpmM }, (_, i) => {
    const inRed = (i + 1) * 1000 > red;
    return `
      <div class="tach__cell${inRed ? " tach__cell--red" : ""}"
        style="left:${(i / rpmM) * WIDTH}px;width:${WIDTH / rpmM - 7}px">
        <span class="tach__num">${i + 1}</span>
      </div>`;
  }).join("");

  const bars = Array.from({ length: BARS }, (_, i) => {
    const pitch = WIDTH / BARS;
    const rgb = colorAt(i / (BARS - 1)).join(",");
    return `<span class="tach__bar" style="left:${i * pitch + (pitch - 9.46) / 2}px;--bar-rgb:${rgb}"></span>`;
  }).join("");

  return `
    <div id="tachometer" class="tach" style="--tach-w:${WIDTH}px">
      <div class="tach__cells">${cells}</div>
      <div class="tach__bars">${bars}</div>
      <div class="tach__base">
        <span class="tach__base-line" style="width:${redX - 8}px"></span>
        <span class="tach__base-red" style="left:${redX}px"></span>
      </div>
    </div>
  `;
}

/**
 * Wave behaviours (option `wave`):
 * - "classic": a symmetric bump that chases the RPM with a little inertia.
 * - "trail":   steep leading edge and a long tail behind it that stretches
 *              while you accelerate, like a motion streak.
 * - "spring":  the crest is on a spring, so a hard rev overshoots a touch
 *              and settles, and the wave swells with its own speed.
 * - "pulse":   while accelerating, ripples peel off the crest and run
 *              backwards along the tail, like exhaust pulses.
 */
export const WAVES = ["classic", "trail", "spring", "pulse"];

/**
 * Call once after the HTML is mounted.
 * Returns an { update(rpm, now) } controller to use in the RAF loop.
 */
export function createTachometerController({ rpmM = 8, redline, wave = "classic" } = {}) {
  const root = document.getElementById("tachometer");
  const bars = Array.from(root.querySelectorAll(".tach__bar"));
  const cells = Array.from(root.querySelectorAll(".tach__cell"));
  const maxRpm = rpmM * 1000;
  const red = redlineFor(rpmM, redline);

  const barLevel = new Array(BARS).fill(-1);
  const levels = new Array(BARS).fill(0);
  const cellState = new Array(cells.length).fill("");
  let redOn = null;

  // Smoothed state: the wave chases the RPM with a little inertia,
  // and swells while you are accelerating.
  let pos = 0; // smoothed rpm ratio 0..1
  let vel = 0; // pos per ms (spring)
  let surge = 0; // 0..1, extra amplitude from acceleration
  let phase = 0; // ripple phase (pulse)
  let lastNow = null;
  let lastRpm = 0;

  const profile = (d, sigma, amp) => {
    // d: distance from the crest in bars (negative = behind it)
    if (wave === "trail") {
      const s = d < 0 ? sigma * (1.25 + 2.2 * surge) : sigma * 0.6;
      return amp * Math.exp(-0.5 * (d / s) ** 2);
    }
    const base = amp * Math.exp(-0.5 * (d / sigma) ** 2);
    if (wave === "pulse" && d < 0 && surge > 0.02) {
      // Ripples travelling backwards, fading with distance
      const ripple = Math.max(0, Math.cos((d + phase) * 0.85));
      return base + Math.min(1, surge * 1.4) * 0.55 * ripple ** 3 * Math.exp(d / 14);
    }
    return base;
  };

  return {
    update(rawRpm, now) {
      const rpm = Math.max(0, Math.min(maxRpm, Number(rawRpm) || 0));
      const target = rpm / maxRpm;
      const dt = lastNow === null ? 16 : Math.max(0, Math.min(100, now - lastNow));
      lastNow = now;

      if (wave === "spring") {
        // Under-damped spring, integrated in small steps for stability
        const w = 0.018; // rad/ms
        const zeta = 0.35;
        for (let t = dt; t > 0; t -= 8) {
          const h = Math.min(8, t);
          vel += (w * w * (target - pos) - 2 * zeta * w * vel) * h;
          pos += vel * h;
        }
      } else {
        // Rise fast, fall a bit slower: revving feels snappy, lifting off feels weighty
        const tau = target > pos ? 70 : 140;
        pos += (target - pos) * (1 - Math.exp(-dt / tau));
      }
      const p = Math.max(0, Math.min(1, pos));

      const accel = (rpm - lastRpm) / Math.max(1, dt); // rpm per ms
      lastRpm = rpm;
      const surgeTarget = Math.max(0, Math.min(1, accel / 8));
      surge += (surgeTarget - surge) * (1 - Math.exp(-dt / (surgeTarget > surge ? 60 : 260)));
      phase += dt * 0.012 * (1 + 2 * p);

      // Wave shape: grows taller and wider with RPM, plus the acceleration surge
      // Flat at 0 RPM; the base lift fades in over the first ~1200 RPM (idle shows a small wave)
      const lift = Math.min(1, p / 0.12);
      const swell = wave === "spring" ? Math.min(0.3, Math.abs(vel) * 400) : 0.15 * surge;
      const amp = Math.min(1, 0.25 * lift * lift * (3 - 2 * lift) + 0.95 * p + swell);
      // Narrow at low RPM so the wave reads as a peak, not a plateau
      const stretch = wave === "spring" ? Math.min(2, Math.abs(vel) * 3500) : 0;
      const sigma = 1.5 + 3.0 * p + 1.2 * surge + stretch; // in bars
      // Crest sits over the lit cell: cell k spans the k-th slot and lights
      // from k000 RPM, so the crest is one slot (1000 RPM) behind the raw ratio
      const center = (p - 1 / rpmM) * BARS - 0.5;

      for (let i = 0; i < BARS; i++) {
        const h = BAR_MIN + (BAR_MAX - BAR_MIN) * profile(i - center, sigma, amp);
        let level = 0;
        while (level < STEPS.length - 1 && STEPS[level + 1] <= h) level++;
        levels[i] = level;
      }
      // The bar at the crest always stands one step above its neighbours
      const crest = Math.round(center);
      const side = Math.max(levels[crest - 1] ?? 0, levels[crest + 1] ?? 0);
      if (levels[crest] > 0 && levels[crest] <= side && side < STEPS.length - 1) {
        levels[crest] = side + 1;
      }

      for (let i = 0; i < BARS; i++) {
        if (levels[i] !== barLevel[i]) {
          barLevel[i] = levels[i];
          bars[i].style.transform = `scaleY(${STEPS[levels[i]] / BAR_MAX})`;
        }
      }

      // Cells: the last thousand passed glows, the ones before it fade out behind
      const current = Math.floor(rpm / 1000); // 0 below 1000 RPM: nothing lit
      for (let i = 0; i < cells.length; i++) {
        const k = i + 1;
        const state =
          k === current ? "on" : k < current ? `t${Math.min(4, current - k)}` : "";
        if (state !== cellState[i]) {
          cellState[i] = state;
          cells[i].dataset.state = state;
        }
      }

      const on = rpm >= red;
      if (on !== redOn) {
        redOn = on;
        root.classList.toggle("is-redline", on);
      }
    },
  };
}
