import "./TurnSignal.css";

// Chevron outlines exported from Figma 395-2693, ordered inner → outer
const CHEVRONS = [
  "M6.28715 7.81329L3.68266 10.4432L2.46293 11.6746L3.68266 12.9061L11.9053 21.2088L3.68266 29.5115L2.46293 30.743L3.68266 31.9744L5.96098 34.2762L7.20512 35.532L8.44829 34.2762L20.169 22.4402L21.3555 21.243L20.2032 20.0125L8.80766 7.84845L7.56547 6.52228L6.28715 7.81329Z",
  "M25.2872 7.81329L22.6827 10.4432L21.4629 11.6746L22.6827 12.9061L30.9053 21.2088L22.6827 29.5115L21.4629 30.743L22.6827 31.9744L24.961 34.2762L26.2051 35.532L27.4483 34.2762L39.169 22.4402L40.3555 21.243L39.2032 20.0125L27.8077 7.84845L26.5655 6.52228L25.2872 7.81329Z",
  "M44.2872 7.81329L41.6827 10.4432L40.4629 11.6746L41.6827 12.9061L49.9053 21.2088L41.6827 29.5115L40.4629 30.743L41.6827 31.9744L43.961 34.2762L45.2051 35.532L46.4483 34.2762L58.169 22.4402L59.3555 21.243L58.2032 20.0125L46.8077 7.84845L45.5655 6.52228L44.2872 7.81329Z",
];

// Sequence timing (ms). One self-timed cycle ≈ 0.9 Hz.
// The third chevron lights at 2 × STEP_MS, so the sweep still completes
// within a typical ~400 ms flasher pulse.
const STEP_MS = 150; // delay between chevrons lighting up
const HOLD_MS = 350; // all lit, outer one leading
const OFF_MS = 400; // dark gap before the next sweep
const CYCLE_MS = STEP_MS * CHEVRONS.length + HOLD_MS + OFF_MS;

export function TurnSignal(direction) {
  const filterId = `turn-glow-${direction}`;
  return `
    <div id="turn${direction}" class="turn-signal turn-${direction}">
      <svg viewBox="0 0 65.7849 42.0188" fill="none" aria-hidden="true">
        <defs>
          <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%"
            color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        ${CHEVRONS.map(
          (d) => `
          <g class="chevron" data-level="0">
            <path class="glow" d="${d}" filter="url(#${filterId})" />
            <path class="core" d="${d}" />
          </g>`,
        ).join("")}
      </svg>
    </div>
  `;
}

/**
 * Level of each chevron (inner → outer) at `t` ms into a cycle.
 * The newest chevron leads (1); the ones behind it decay to 2 and 3.
 */
const levelsAt = (t) => {
  const lit = Math.min(CHEVRONS.length, Math.floor(t / STEP_MS) + 1);
  if (t >= CYCLE_MS - OFF_MS) return CHEVRONS.map(() => 0);
  return CHEVRONS.map((_, i) => (i < lit ? lit - i : 0));
};

/**
 * Call once after the HTML is mounted.
 * Returns an { update(signal, now) } controller to use in the RAF loop.
 * `signal` is the raw Ghost value: 0 = ON, 1 = OFF.
 * Each OFF → ON edge restarts the sweep, so it stays in sync with the
 * car's flasher; a steady ON keeps sweeping on its own cycle.
 */
export function createTurnSignalController(direction) {
  const container = document.getElementById(`turn${direction}`);
  const chevrons = container
    ? Array.from(container.querySelectorAll(".chevron"))
    : [];

  let start = null;
  let current = "";

  const apply = (levels) => {
    const key = levels.join("");
    if (key === current) return;
    current = key;
    chevrons.forEach((el, i) => {
      el.dataset.level = levels[i];
    });
  };

  return {
    update(signal, now) {
      if (Number(signal) !== 0) {
        start = null;
        apply(CHEVRONS.map(() => 0));
        return;
      }
      if (start === null) start = now;
      apply(levelsAt((now - start) % CYCLE_MS));
    },
  };
}
