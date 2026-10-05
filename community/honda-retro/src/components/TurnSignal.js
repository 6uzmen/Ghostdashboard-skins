import "./TurnSignal.css";

const signal = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35" fill="none">
<path class="arrow" d="M8.80768 3.84839L20.2032 16.0125L21.3555 17.2429L20.169 18.4402L8.4483 30.2761L7.20514 31.532L5.961 30.2761L3.68268 27.9744L2.46295 26.7429L3.68268 25.5115L11.9044 17.2087L3.68268 8.90601L2.46295 7.67456L3.68268 6.44312L6.28717 3.81323L7.56549 2.52222L8.80768 3.84839Z" stroke="red" stroke-width="3.5"/>
</svg>`;

export function TurnSignal(direction) {
  return `
    <div id="turn${direction}" class="turn-signal turn-${direction}">
      ${signal}
      ${signal}
      ${signal}
    </div>
  `;
}

/**
 * Call once after the HTML is mounted.
 * Returns an { update(isActive, now) } controller to use in the RAF loop.
 */
export function createTurnSignalController(direction) {
  const container = document.getElementById(`turn${direction}`);
  const arrows = container
    ? Array.from(container.querySelectorAll(".arrow"))
    : [];

  let step = 0;
  let lastTime = 0;
  const STEP_MS = 180; // ms between each arrow lighting up

  const reset = () => {
    step = 0;
    lastTime = 0;
    arrows.forEach((a) => {
      a.style.opacity = 0.4;
    });
  };

  return {
    update(isActive, now) {
      if (!isActive) {
        reset();
        return;
      }

      if (now - lastTime > STEP_MS) {
        step = (step + 1) % (arrows.length + 1); // 0 → 1 → 2 → 3 → 0
        lastTime = now;
      }

      // Light arrows sequentially: arrows[i] is on if i < step
      arrows.forEach((a, i) => {
        a.style.opacity = i < step ? 1 : 0.4;
      });
    },
  };
}
