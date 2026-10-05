/* global COLORS, DASH_OPTIONS, basicData, canData, openConnection,
   loadOdo, updateOdo, setText, setRootCSS, useCanChannel,
   checkCache, safeReturn, etoggle, zeroFixed, mapFormat,
   fuelLevelFormat, isBasicOnline */

import "./style/base.css";

import { Icons, SIGNAL_IDS } from "./components/Icons.js";
import { TopGauges } from "./components/TopGauges.js";
import {
  MainGauges,
  initRPMNumbers,
  initSpeedNumbers,
} from "./components/MainGauges.js";
import { MicroGauges } from "./components/MicroGauges.js";
import { Odometer } from "./components/Odometer.js";
import {
  TurnSignal,
  createTurnSignalController,
} from "./components/TurnSignal.js";

// Tree-shaken in production: Vite replaces import.meta.env.DEV with false
// and Rollup removes the dead branch + the unused import entirely.
import { setupDevMocks } from "./dev-mocks.js";
if (import.meta.env.DEV) {
  setupDevMocks();
}

const callback = () => {
  const { cMain, cSec } = COLORS;
  const { rpmM, aSpd, clt: cltMax, icon } = DASH_OPTIONS;
  const maxRpm = rpmM * 1000;

  // --- Mount HTML structure ---
  document.getElementById("container").innerHTML = `
    ${TopGauges()}
    ${MainGauges({ rpmM })}
    ${MicroGauges()}
    ${Odometer()}
  `;

  // --- One-time setup (before RAF loop) ---
  setRootCSS("--main-color", cMain);
  setRootCSS("--second-color", cSec);

  initRPMNumbers(rpmM);
  initSpeedNumbers();

  const turnLeft = createTurnSignalController("left");
  const turnRight = createTurnSignalController("right");

  // Cache all DOM refs once — never query inside the loop
  const signals = SIGNAL_IDS;
  const elems = [
    ...signals,
    "container",
    "speedo",
    "kmTrip",
    "kmTotal",
    "fuelLevel",
    "cltNow",
    "gear",
    "battLevel",
    "fuelPressure",
    "lambda",
    "oilPressure",
    "mapBoost",
    "mat",
  ].reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

  const {
    container,
    speedo,
    kmTrip,
    kmTotal,
    gear,
    mat,
    battLevel,
    fuelPressure,
    lambda,
    oilPressure,
    mapBoost,
    fuelLevel,
    cltNow,
  } = elems;

  loadOdo(kmTotal, kmTrip, 0);

  let [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [
    false,
    false,
    false,
    false,
  ];

  const checkSource = () => {
    [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [
      useCanChannel(),
      useCanChannel("sRpm"),
      useCanChannel("sVss"),
      useCanChannel("sClt"),
    ];
  };

  const updateRPM = (rpm) => {
    setRootCSS("--rpm-bar", `${294 - ((rpm ?? 0) / maxRpm) * 294}px`);
  };

  const updateSpeed = (val, valf) => {
    setText(speedo, zeroFixed(aSpd < 2 ? (valf ?? val) : val));
    let bar = 0;
    if (val <= 60) bar = (val / 60) * 125;
    else if (val <= 140) bar = 125 + ((val - 60) / 80) * 83;
    else if (val <= 260) bar = 208 + ((val - 140) / 120) * 86;
    setRootCSS("--kmh-bar", `${294 - bar}px`);
  };

  // --- RAF loop: lightweight reads + writes only ---
  const bindRealtimeData = (now) => {
    if (!checkCache("useCAN", useCanChannel())) checkSource();

    if (useCAN) {
      setText(gear, canData.gear);
      setText(mat, canData.mat);
      setText(mapBoost, mapFormat(canData.map));
      setText(fuelPressure, canData.fuelPress);
      setText(battLevel, canData.batt);
      setText(lambda, canData.lambda);
      setText(oilPressure, canData.oilPress);
    }

    if (isBasicOnline) {
      setText(fuelLevel, fuelLevelFormat(basicData, "lvlFuel"));
      setRootCSS("--fuel-bar", `${1 - safeReturn(basicData, "lvlFuel") / 100}`);
      for (let i = 0; i < signals.length; i++) {
        etoggle(elems[signals[i]], basicData[signals[i]]);
      }
      turnLeft.update(basicData.turnLeft, now);
      turnRight.update(basicData.turnRight, now);
    }

    updateRPM(useCANForRPM ? canData.rpm : safeReturn(basicData, "rpm"));
    updateSpeed(
      ...(useCANForVSS ? [canData.vss] : [basicData.kmh, basicData.kmhF]),
    );

    const rawClt = useCANForCLT ? canData.clt : safeReturn(basicData, "clt");
    setRootCSS("--clt-bar", `${rawClt / cltMax}`);
    setText(cltNow, zeroFixed(rawClt));

    updateOdo(
      kmTotal,
      kmTrip,
      useCANForVSS ? canData.odoNow : basicData.odoNow,
    );

    requestAnimationFrame(bindRealtimeData);
  };

  setTimeout(() => openConnection(bindRealtimeData), 5000);
  container.classList.add("anim-in");
};

// Module scripts are deferred — DOM is ready, but window.load may not have fired yet
if (document.readyState === "complete") {
  callback();
} else {
  window.addEventListener("load", callback);
}
