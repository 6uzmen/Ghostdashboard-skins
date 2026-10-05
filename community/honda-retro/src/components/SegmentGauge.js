import "./SegmentGauge.css";
import tempIcon from "../../icons/gauge-temp.svg?raw";
import batteryIcon from "../../icons/gauge-battery.svg?raw";
import fuelIcon from "../../icons/gauge-fuel.svg?raw";

// Vertical segmented gauge from Figma 484-6.
// One component, three modifiers: battery · temp · fuel.
// Temp runs cold → hot; battery and fuel share an empty → full ramp.

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

const TYPES = {
  battery: {
    icon: batteryIcon,
    stops: LEVEL_STOPS,
    min: 10,
    max: 16,
    format: (v) => v.toFixed(1),
  },
  temp: {
    icon: tempIcon,
    stops: TEMP_STOPS,
    min: 0,
    max: 110,
    unit: "c",
    hotAt: 100,
    format: (v) => String(Math.round(v)),
  },
  fuel: {
    icon: fuelIcon,
    stops: LEVEL_STOPS,
    min: 0,
    max: 100,
    lowAt: 20,
    format: (v) => `${Math.round(v)}%`,
  },
};

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
 * @param {"battery"|"temp"|"fuel"} type
 * @param {string} id  unique id for the gauge root (Ghost's setText caches by id)
 */
export function SegmentGauge(type, id = `gauge-${type}`) {
  const { icon, unit } = TYPES[type];
  const segments = Array.from(
    { length: SEGMENTS },
    () => `<span class="seg-gauge__seg" data-depth="off"></span>`,
  ).join("");

  return `
    <div id="${id}" class="seg-gauge seg-gauge--${type}">
      <div class="seg-gauge__icon">${icon}</div>
      <div class="seg-gauge__bar">${segments}</div>
      <div class="seg-gauge__value">
        <span class="seg-gauge__num">0</span>${unit ? `<span class="seg-gauge__unit">${unit}</span>` : ""}
      </div>
    </div>
  `;
}

/**
 * Call once after the HTML is mounted.
 * Returns an { update(value) } controller to use in the RAF loop.
 * Options override the type's range and alerts: { min, max, lowAt, hotAt }.
 */
export function createSegmentGaugeController(type, id = `gauge-${type}`, options = {}) {
  const conf = { ...TYPES[type], ...options };
  const root = document.getElementById(id);
  const segs = Array.from(root.querySelectorAll(".seg-gauge__seg")).reverse(); // bottom → top
  const num = root.querySelector(".seg-gauge__num");

  let lastKey = "";

  return {
    update(raw) {
      const value = Number(raw) || 0;
      const ratio = Math.min(1, Math.max(0, (value - conf.min) / (conf.max - conf.min)));
      const lit = Math.round(ratio * SEGMENTS);
      const low = conf.lowAt != null && value < conf.lowAt;
      const hot = conf.hotAt != null && value >= conf.hotAt;
      const text = conf.format(value);

      const key = `${lit}|${low}|${hot}|${text}|${Math.round(ratio * 100)}`;
      if (key === lastKey) return;
      lastKey = key;

      root.style.setProperty("--seg-rgb", colorAt(conf.stops, ratio).join(","));
      root.classList.toggle("is-low", low);
      root.classList.toggle("is-hot", hot);

      // Top lit segment is the bright "surface"; the ones below fade toward the base
      segs.forEach((el, i) => {
        const depth = lit - 1 - i; // 0 = top lit segment
        el.dataset.depth = i < lit ? Math.min(depth, 3) : "off";
        el.style.setProperty("--seg-fade", i < lit ? (i / Math.max(1, lit - 1)).toFixed(3) : 0);
      });

      num.textContent = text;
    },
  };
}
