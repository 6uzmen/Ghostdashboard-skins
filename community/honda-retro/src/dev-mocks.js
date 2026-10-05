/**
 * Mock globals for the Vite dev server (_dev.html).
 * In production, DASH_OPTIONS, basicData, canData, etc. are provided by
 * defaultSettings.js and client.js loaded by Ghost Dashboard.
 *
 * This module has no top-level side effects, so Rollup tree-shakes it
 * entirely from the production bundle when import.meta.env.DEV is false.
 */
export const setupDevMocks = () => {
  const colors = {
    cMain: "#cc0000",
    cSec: "#e8e8e8",
    cRed: "#b70000",
    cBg: "#111111",
    cRpm: "#cc0000",
  };

  window.DASH_OPTIONS = {
    rpmM: 8,
    sLigt: "5250",
    redline: "5500",
    icon: 1,
    clt: "110",
    aSpd: 1,
    sRpm: 2,
    sVss: 1,
    sClt: 2,
    sCan: 1,
    tKm: "0",
    kmTrip: 0,
    kmTotal: 0,
    theme: { colors, active: "honda-retro" },
  };

  window.COLORS = colors;

  window.basicData = {
    rpm: 3500,
    kmh: 85,
    kmhF: 85.4,
    odoNow: 0,
    lvlFuel: 65,
    clt: 88,
    turnLeft: 0,
    turnRight: 0,
    battAlt: 0,
    eBrake: 0,
    highBeam: 0,
    parkLights: 1,
    fogLights: 0,
    auxLights: 0,
    openDoor: 0,
    fan: 0,
    oilSwitch: 0,
    ECUErr: 0,
  };

  window.canData = {
    gear: "3",
    rpm: 3500,
    vss: 85,
    clt: 88,
    mat: 32,
    map: 1.2,
    fuelPress: 3.1,
    batt: 13.8,
    lambda: 1.01,
    oilPress: 4.2,
    odoNow: 0,
  };

  window.isBasicOnline = true;

  const _cache = {};
  window.setText = (el, val) => {
    if (el && el.textContent !== String(val)) el.textContent = val;
  };
  window.setRootCSS = (key, val) =>
    document.documentElement.style.setProperty(key, val);
  window.checkCache = (key, val) => {
    const same = _cache[key] === val;
    _cache[key] = val;
    return same;
  };
  window.safeReturn = (obj, key) =>
    obj != null && obj[key] != null ? obj[key] : 0;
  window.etoggle = (el, val) => {
    if (el) el.style.opacity = val ? "1" : "0.15";
  };
  window.zeroFixed = (v) => Math.round(v ?? 0);
  window.mapFormat = (v) => (v != null ? (v - 1).toFixed(2) : "0.00");
  window.fuelLevelFormat = (data, key) => Math.round((data && data[key]) ?? 0);
  window.useCanChannel = () => false;
  window.loadOdo = () => {};
  window.updateOdo = () => {};
  window.openConnection = (cb) => {
    cb();
    // Simulate turn signal toggling every 2s so styles are easy to inspect
    setInterval(() => {
      window.basicData.turnRight = window.basicData.turnRight ? 0 : 1;
      window.basicData.turnLeft = window.basicData.turnLeft ? 0 : 1;
    }, 2000);
  };
};
