import "./SegmentGauge.css";
import tempIcon from "../../icons/gauge-temp.svg?raw";
import batteryIcon from "../../icons/gauge-battery.svg?raw";
import fuelIcon from "../../icons/gauge-fuel.svg?raw";
import lambdaIcon from "../../icons/gauge-lambda.svg?raw";
import oilIcon from "../../icons/gauge-oil.svg?raw";

// Vertical segmented gauge from Figma 484-6.
// One component, five modifiers: battery · temp · fuel on the right,
// lambda · oil on the left. Temp runs cold → hot; battery, fuel and oil
// share an empty → full ramp; lambda runs rich (blue) → lean (orange).

const SEGMENTS = 23;

// Color stops along the gauge's 0–1 ratio (temp modifier only): cold → hot
const TEMP_STOPS = [
  [0, [63, 123, 255]], // #3f7bff
  [0.45, [94, 200, 255]], // #5ec8ff
  [0.7, [255, 214, 102]], // #ffd666, normal operating temp
  [0.85, [255, 156, 69]], // #ff9c45
  [1, [255, 69, 69]], // #ff4545
];

// Shared by battery and fuel: empty → full, ending in an almost-white yellow
const LEVEL_STOPS = [
  [0, [255, 122, 61]], // #ff7a3d
  [0.2, [255, 156, 69]], // #ff9c45
  [0.45, [255, 214, 102]], // #ffd666, as in the Figma frame
  [0.9, [255, 243, 196]], // #fff3c4
  [1, [255, 251, 232]], // #fffbe8
];

// Lambda over 0.70–1.30: blue when rich, yellow around 1.00, orange when lean
const LAMBDA_STOPS = [
  [0, [63, 123, 255]], // #3f7bff
  [0.3, [94, 200, 255]], // #5ec8ff, 0.88
  [0.45, [255, 214, 102]], // #ffd666, 0.97–1.03
  [0.55, [255, 214, 102]],
  [0.75, [255, 156, 69]], // #ff9c45
  [1, [255, 122, 61]], // #ff7a3d
];

const ALERT_RGB = [255, 69, 69]; // #ff4545

// RICH / OK / LEAN pill under the lambda value
const lambdaState = (v, alert) => (v < 0.92 ? "rich" : v <= 1.06 ? "ok" : alert ? "bad" : "lean");
const LAMBDA_TAGS = { rich: "RICH", ok: "OK", lean: "LEAN", bad: "LEAN" };

// Each type can define:
//  alert(v, ctx)  red fill + pulsing icon (ctx carries { rpm, tps })
//  calm(v, ctx)   value in its normal range: the gauge is dimmed a little
//  peak           "high" | "low": hold the worst reading for PEAK_HOLD ms
const TYPES = {
  battery: {
    icon: batteryIcon,
    stops: LEVEL_STOPS,
    min: 10,
    max: 16,
    format: (v) => v.toFixed(1),
    calm: (v) => v >= 12.5 && v <= 14.8,
  },
  temp: {
    icon: tempIcon,
    stops: TEMP_STOPS,
    min: 0,
    max: 110,
    unit: "c",
    hotAt: 100,
    format: (v) => String(Math.round(v)),
    calm: (v) => v >= 70 && v < 100,
  },
  fuel: {
    icon: fuelIcon,
    stops: LEVEL_STOPS,
    min: 0,
    max: 100,
    lowAt: 20,
    format: (v) => `${Math.round(v)}%`,
    calm: (v) => v >= 20,
  },
  lambda: {
    icon: lambdaIcon,
    stops: LAMBDA_STOPS,
    min: 0.7,
    max: 1.3,
    format: (v) => v.toFixed(2),
    // Lean under load; the fuel cut on decel (TPS 0) reads lean but is fine
    alert: (v, { tps }) => v > 1.06 && tps > 50,
    peak: "high", // leanest reading
    tag: "state",
  },
  oil: {
    icon: oilIcon,
    stops: LEVEL_STOPS,
    min: 0,
    max: 10, // bar; main.js passes DASH_OPTIONS.pOil
    format: (v) => v.toFixed(1),
    alert: (v, { rpm }) => (rpm > 2500 && v < 1.0) || (rpm > 400 && v < 0.5),
    peak: "low", // lowest pressure
    tag: "BAR",
  },
};

const PEAK_HOLD = 2500;

const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));

const colorAt = (stops, ratio) => {
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i];
    if (ratio <= p1) {
      const [p0, c0] = stops[i - 1];
      return mix(c0, c1, (ratio - p0) / (p1 - p0));
    }
  }
  return stops[stops.length - 1][1];
};

/**
 * @param {"battery"|"temp"|"fuel"|"lambda"|"oil"} type
 * @param {string} id  unique id for the gauge root (Ghost's setText caches by id)
 */
export function SegmentGauge(type, id = `gauge-${type}`) {
  const { icon, unit, tag, format, min } = TYPES[type];
  const segments = Array.from(
    { length: SEGMENTS },
    () => `<span class="seg-gauge__seg" data-depth="off"></span>`,
  ).join("");

  return `
    <div id="${id}" class="seg-gauge seg-gauge--${type}">
      <div class="seg-gauge__icon">${icon}</div>
      <div class="seg-gauge__bar">${segments}</div>
      <div class="seg-gauge__value">
        <span class="seg-gauge__num">${tag ? format(Math.max(0, min)) : "0"}</span>${unit ? `<span class="seg-gauge__unit">${unit}</span>` : ""}
      </div>
      ${tag === "state" ? `<b class="seg-gauge__tag" data-s=""></b>` : tag ? `<span class="seg-gauge__tag seg-gauge__tag--unit">${tag}</span>` : ""}
    </div>
  `;
}

/**
 * Call once after the HTML is mounted.
 * Returns an { update(value, ctx) } controller to use in the RAF loop;
 * ctx ({ rpm, tps }) feeds the lambda and oil alerts.
 * Options override the type's range and alerts: { min, max, lowAt, hotAt }.
 */
export function createSegmentGaugeController(type, id = `gauge-${type}`, options = {}) {
  const conf = { ...TYPES[type], ...options };
  const root = document.getElementById(id);
  const segs = Array.from(root.querySelectorAll(".seg-gauge__seg")).reverse(); // bottom → top
  const num = root.querySelector(".seg-gauge__num");
  const tagEl = conf.tag === "state" ? root.querySelector(".seg-gauge__tag") : null;

  let lastKey = "";
  let peak = -1;
  let peakAt = 0;

  return {
    update(raw, ctx = {}) {
      const value = Number(raw) || 0;
      const ratio = Math.min(1, Math.max(0, (value - conf.min) / (conf.max - conf.min)));
      const lit = Math.round(ratio * SEGMENTS);
      const low = conf.lowAt != null && value < conf.lowAt;
      const hot = conf.hotAt != null && value >= conf.hotAt;
      const alert = !!conf.alert && conf.alert(value, { rpm: +ctx.rpm || 0, tps: +ctx.tps || 0 });
      const calm = conf.calm ? conf.calm(value) : !!conf.alert && !alert;
      const state = tagEl ? lambdaState(value, alert) : "";
      const text = conf.format(value);

      // Peak memory: the worst reading (leanest lambda, lowest oil) stays marked a moment
      let showPeak = false;
      if (conf.peak) {
        const now = performance.now();
        const worse = conf.peak === "low" ? lit < peak : lit > peak;
        if (peak < 0 || worse || now - peakAt > PEAK_HOLD) {
          peak = lit;
          peakAt = now;
        }
        // Only worth showing when it sits clear of the fill's surface
        showPeak = conf.peak === "low" ? peak < lit - 1 : peak > lit + 1;
      }

      const key = `${lit}|${low}|${hot}|${alert}|${calm}|${text}|${Math.round(ratio * 100)}|${showPeak && peak}`;
      if (key === lastKey) return;
      lastKey = key;

      root.style.setProperty("--seg-rgb", (alert ? ALERT_RGB : colorAt(conf.stops, ratio)).join(","));
      root.style.setProperty("--seg-level", ratio.toFixed(2));
      root.classList.toggle("is-low", low);
      root.classList.toggle("is-hot", hot);
      root.classList.toggle("is-alert", alert);
      root.classList.toggle("is-calm", calm);

      // Top lit segment is the bright "surface"; the ones below fade toward the base
      segs.forEach((el, i) => {
        const depth = lit - 1 - i; // 0 = top lit segment
        el.dataset.depth = i < lit ? Math.min(depth, 3) : "off";
        el.style.setProperty("--seg-fade", i < lit ? (i / Math.max(1, lit - 1)).toFixed(3) : 0);
        if (conf.peak) el.classList.toggle("is-peak", showPeak && i === peak - 1);
      });

      num.textContent = text;
      if (tagEl && tagEl.dataset.s !== state) {
        tagEl.dataset.s = state;
        tagEl.textContent = LAMBDA_TAGS[state];
      }
    },
  };
}
