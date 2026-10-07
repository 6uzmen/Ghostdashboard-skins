/* global DASH_OPTIONS, basicData, canData, openConnection, useCanChannel,
   checkCache, safeReturn, isBasicOnline, loadOdo, updateOdo */

import "./style/base.css";
import "./style/layout.css";

import { TurnSignal, createTurnSignalController } from "./components/TurnSignal.js";
import { Speedometer, createSpeedometerController } from "./components/Speedometer.js";
import { Tachometer, createTachometerController } from "./components/Tachometer.js";
import { SegmentGauge, createSegmentGaugeController } from "./components/SegmentGauge.js";
import { WarningLights, createWarningLightsController } from "./components/WarningLights.js";
import { RedlineGlow, createRedlineGlowController } from "./components/RedlineGlow.js";
import { Odometer, createOdometerController } from "./components/Odometer.js";

// Tree-shaken in production: Vite replaces import.meta.env.DEV with false
// and Rollup removes the dead branch + the unused import entirely.
import { setupDevMocks } from "./dev-mocks.js";
if (import.meta.env.DEV) {
  setupDevMocks();
}

const callback = () => {
  const { aSpd, clt: cltMax } = DASH_OPTIONS;
  // RPM scale (in thousands) from the dash settings; 10k when it's not set
  const rpmM = +DASH_OPTIONS.rpmM || 10;

  // --- Mount: each part sits in its own slot of the 1280×480 layout ---
  document.getElementById("container").innerHTML = `
    <div class="slot slot--turn-left">${TurnSignal("left")}</div>
    <div class="slot slot--logo"><img src="icons/honda-logo.svg" alt="" onerror="this.parentNode.remove()" /><span class="logo-sheen"></span></div>
    <div class="slot slot--turn-right">${TurnSignal("right")}</div>
    <div class="slot slot--left-gauges">
      ${SegmentGauge("lambda")}
      ${SegmentGauge("oil")}
    </div>
    <div class="slot slot--tach">${Tachometer({ rpmM })}</div>
    <div class="slot slot--gauges">
      ${SegmentGauge("temp")}
      ${SegmentGauge("battery")}
      ${SegmentGauge("fuel")}
    </div>
    <div class="slot slot--lamps">${WarningLights()}</div>
    <div class="slot slot--odo">${Odometer()}</div>
    ${RedlineGlow({ variant: "limiter" })}
    <div class="slot slot--speed">
      ${Speedometer()}
      <span class="speed-unit">km/h</span>
    </div>
  `;

  // --- Controllers (DOM refs cached once, never queried inside the loop) ---
  const turnLeft = createTurnSignalController("left");
  const turnRight = createTurnSignalController("right");
  const speedometer = createSpeedometerController();
  const tach = createTachometerController({ rpmM });
  const temp = createSegmentGaugeController("temp", "gauge-temp", { max: +cltMax || 110 });
  const battery = createSegmentGaugeController("battery");
  const fuel = createSegmentGaugeController("fuel");
  const lambda = createSegmentGaugeController("lambda");
  const oil = createSegmentGaugeController("oil", "gauge-oil", { max: +DASH_OPTIONS.pOil || 10 });
  const lamps = createWarningLightsController();
  const redlineGlow = createRedlineGlowController({ from: 7000, to: 9000, limitAt: 8500 });
  const odometer = createOdometerController();

  // Restore the saved km (total + trip) before the first frame
  loadOdo(odometer.totalEl, odometer.tripEl, 0);
  odometer.update();

  let [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [false, false, false, false];
  const checkSource = () => {
    [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [
      useCanChannel(),
      useCanChannel("sRpm"),
      useCanChannel("sVss"),
      useCanChannel("sClt"),
    ];
  };

  // --- RAF loop: lightweight reads + writes only ---
  const bindRealtimeData = (now) => {
    if (!checkCache("useCAN", useCanChannel())) checkSource();

    const rpm = useCANForRPM ? canData.rpm : safeReturn(basicData, "rpm");
    // TPS only exists on the CAN side; without it the wave follows RPM alone
    tach.update(rpm, now, useCAN ? canData.tps : null);
    redlineGlow.update(rpm);
    speedometer.update(
      useCANForVSS ? canData.vss : aSpd < 2 ? (basicData.kmhF ?? basicData.kmh) : basicData.kmh,
    );
    temp.update(useCANForCLT ? canData.clt : safeReturn(basicData, "clt"));
    if (useCAN) {
      battery.update(canData.batt);
      // Lambda and oil pressure only come over CAN; without it they stay empty
      lambda.update(canData.lambda, { tps: canData.tps });
      oil.update(canData.oilPress, { rpm });
    }

    // No guard: updateOdo also reflects a trip reset from the settings
    updateOdo(odometer.totalEl, odometer.tripEl, useCANForVSS ? canData.odoNow : basicData.odoNow);
    odometer.update();

    if (isBasicOnline) {
      fuel.update(safeReturn(basicData, "lvlFuel"));
      lamps.update(basicData);
      turnLeft.update(basicData.turnLeft, now);
      turnRight.update(basicData.turnRight, now);
    }

    requestAnimationFrame(bindRealtimeData);
  };

  setTimeout(() => openConnection(bindRealtimeData), 5000);
  document.getElementById("container").classList.add("anim-in");
};

// Module scripts are deferred — DOM is ready, but window.load may not have fired yet
if (document.readyState === "complete") {
  callback();
} else {
  window.addEventListener("load", callback);
}
