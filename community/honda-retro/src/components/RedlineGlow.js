import "./RedlineGlow.css";

// The dash edges redden from `from` RPM and keep growing until `to`:
// the rim intensifies first, then the glow spreads toward the center.

export function RedlineGlow() {
  return `<div id="redline-glow" class="redline-glow"></div>`;
}

/**
 * Call once after the HTML is mounted.
 * Returns an { update(rpm) } controller to use in the RAF loop.
 */
export function createRedlineGlowController({ from = 7000, to = 9000 } = {}) {
  const el = document.getElementById("redline-glow");
  let last = -1;

  return {
    update(rawRpm) {
      const t = Math.max(0, Math.min(1, ((Number(rawRpm) || 0) - from) / (to - from)));
      const step = Math.round(t * 50); // 2% steps: smooth, but few style writes
      if (step === last) return;
      last = step;
      const k = step / 50;
      el.style.setProperty("--redline-edge", Math.min(1, k * 1.4).toFixed(3));
      el.style.setProperty("--redline-spread", (k * k).toFixed(3));
    },
  };
}
