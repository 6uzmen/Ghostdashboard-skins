import "./SegmentGauge.css";
import tempIcon from "../../icons/gauge-temp.svg?raw";
import batteryIcon from "../../icons/gauge-battery.svg?raw";
import fuelIcon from "../../icons/gauge-fuel.svg?raw";

// Vertical segmented gauge from Figma 484-6.
// One component, three modifiers: battery · temp · fuel.

const SEGMENTS = 23;

// Color stops along the gauge's 0–1 ratio (temp modifier only): cold → hot
const TEMP_STOPS = [
  [0, [63, 123, 255]], // #3f7bff
  [0.45, [94, 200, 255]], // #5ec8ff
  [0.7, [255, 214, 102]], // #ffd666, normal operating temp
  [0.85, [255, 156, 69]], // #ff9c45
  [1, [255, 69, 69]], // #ff4545
];

const BASE_RGB = [255, 214, 102]; // #ffd666
const LOW_FUEL_RGB = [255, 156, 69]; // #ff9c45

const TYPES = {
  battery: {
    icon: batteryIcon,
    min: 10,
    max: 16,
    format: (v) => v.toFixed(1),
  },
  temp: {
    icon: tempIcon,
    min: 0,
    max: 110,
    unit: "c",
    format: (v) => String(Math.round(v)),
  },
  fuel: {
    icon: fuelIcon,
    min: 0,
    max: 100,
    lowAt: 20,
    format: (v) => `${Math.round(v)}%`,
  },
};

const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));

const tempColor = (ratio) => {
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    const [p1, c1] = TEMP_STOPS[i];
    if (ratio <= p1) {
      const [p0, c0] = TEMP_STOPS[i - 1];
      return mix(c0, c1, (ratio - p0) / (p1 - p0));
    }
  }
  return TEMP_STOPS[TEMP_STOPS.length - 1][1];
};

/**
 * @param {"battery"|"temp"|"fuel"} type
 * @param {string} id  unique id for the gauge root (Ghost's setText caches by id)
 */
export function SegmentGauge(type, id = `gauge-${type}`) {
  const { icon, unit } = TYPES[type];
  const segments = Array.from(
    { length: SEGMENTS },
    () => `<span class="seg-gauge__seg"></span>`,
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
 * Options override the type's range: { min, max, lowAt }.
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
      const text = conf.format(value);

      const key = `${lit}|${low}|${text}|${type === "temp" ? Math.round(ratio * 100) : ""}`;
      if (key === lastKey) return;
      lastKey = key;

      let rgb = BASE_RGB;
      if (type === "temp") rgb = tempColor(ratio);
      else if (low) rgb = LOW_FUEL_RGB;
      root.style.setProperty("--seg-rgb", rgb.join(","));
      root.classList.toggle("is-low", low);

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
