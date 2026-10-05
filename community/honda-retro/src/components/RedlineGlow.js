import "./RedlineGlow.css";

// The dash edges redden from `from` RPM and keep growing until `to`:
// the near layer intensifies first, then the far layer reaches inward.
// See RedlineGlow.css for the look of each variant.

export const REDLINE_VARIANTS = ["vignette", "frame", "sides", "limiter"];

export function RedlineGlow({ variant = "vignette" } = {}) {
  return `
    <div id="redline-glow" class="redline-glow" data-variant="${variant}">
      <span class="redline-glow__flash"></span>
    </div>
  `;
}

/**
 * Call once after the HTML is mounted.
 * Returns an { update(rpm) } controller to use in the RAF loop.
 * `limitAt`: RPM where the "limiter" pulse starts; it is at full strength
 * by `limitFull`.
 */
export function createRedlineGlowController({
  from = 7000,
  to = 9000,
  limitAt = 8500,
  limitFull = 9200,
} = {}) {
  const el = document.getElementById("redline-glow");
  let last = -1;
  let lastFlash = -1;

  return {
    update(rawRpm) {
      const rpm = Number(rawRpm) || 0;
      const t = Math.max(0, Math.min(1, (rpm - from) / (to - from)));
      const step = Math.round(t * 50); // 2% steps: smooth, but few style writes
      if (step !== last) {
        last = step;
        const k = step / 50;
        el.style.setProperty("--redline-near", Math.min(1, k * 1.4).toFixed(3));
        el.style.setProperty("--redline-far", (k * k).toFixed(3));
      }
      const f = Math.max(0, Math.min(1, (rpm - limitAt) / (limitFull - limitAt)));
      const flashStep = Math.round(f * 25);
      if (flashStep !== lastFlash) {
        lastFlash = flashStep;
        el.style.setProperty("--redline-flash", (flashStep / 25).toFixed(2));
      }
    },
  };
}
