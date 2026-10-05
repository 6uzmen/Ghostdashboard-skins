import "./WarningLights.css";

// Warning-light panel from Figma 488-8: a grid of 26px tiles that light up
// with a soft glow when Ghost reports the signal ON (raw value 0 = ON).
// Turn signals are left out: they have their own component.

const SDK_ICONS = "../../assets/icons"; // resolved at runtime from the skin's index.html

// Color families. "amber" is the Figma tile; the rest follow the same recipe.
// Order matters for the grid: row 1 critical, row 2 engine/body, row 3 lights.
export const LAMPS = [
  { id: "oilSwitch", icon: "icons/lamp-oil.svg", tone: "amber", fit: "cover" },
  { id: "battAlt", icon: `${SDK_ICONS}/battery.svg`, tone: "red" },
  { id: "eBrake", icon: `${SDK_ICONS}/handbrake.svg`, tone: "red" },
  { id: "airbag", icon: `${SDK_ICONS}/alert.svg`, tone: "red" },
  { id: "ECUErr", icon: `${SDK_ICONS}/injection.svg`, tone: "amber" },
  { id: "fan", icon: `${SDK_ICONS}/fan.svg`, tone: "amber" },
  { id: "openDoor", icon: `${SDK_ICONS}/door.svg`, tone: "amber" },
  { id: "parkLights", icon: `${SDK_ICONS}/headlight.svg`, tone: "green" },
  { id: "fogLights", icon: `${SDK_ICONS}/milha.svg`, tone: "green" },
  { id: "auxLights", icon: `${SDK_ICONS}/neblina.svg`, tone: "green" },
  { id: "highBeam", icon: `${SDK_ICONS}/hheadlight.svg`, tone: "blue" },
];

/**
 * @param {object} [opts]
 * @param {number} [opts.columns=4]  tiles per row (Figma: 4)
 * @param {(lamp: object) => string} [opts.iconUrl]  override icon URLs (e.g. data URIs)
 */
export function WarningLights({ columns = 4, iconUrl = (lamp) => lamp.icon } = {}) {
  const tiles = LAMPS.map(
    (lamp, i) => `
      <div id="lamp-${lamp.id}" class="lamp lamp--${lamp.tone}${lamp.fit === "cover" ? " lamp--cover" : ""}" data-on="0"
        style="--lamp-phase:-${((i * 1.37) % 3.4).toFixed(2)}s">
        <span class="lamp__icon" style="--lamp-icon:url('${iconUrl(lamp)}')"></span>
      </div>`,
  ).join("");

  return `
    <div id="warning-lights" class="lamps" style="--lamp-cols:${columns}">
      ${tiles}
    </div>
  `;
}

/**
 * Call once after the HTML is mounted.
 * Returns an { update(basicData) } controller to use in the RAF loop.
 */
export function createWarningLightsController() {
  const tiles = LAMPS.map((lamp) => ({
    id: lamp.id,
    el: document.getElementById(`lamp-${lamp.id}`),
    on: null,
  }));

  return {
    update(data) {
      if (!data) return;
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const on = Number(data[t.id]) === 0; // Ghost signals are active-low
        if (on !== t.on) {
          t.on = on;
          t.el.dataset.on = on ? "1" : "0";
        }
      }
    },
  };
}
