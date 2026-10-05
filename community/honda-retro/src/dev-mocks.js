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
    rpmM: 10,
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
    kmTrip: 87,
    kmTotal: 99995,
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
    // Ghost signals are active-low: 0 = ON, 1 = OFF
    turnLeft: 1,
    turnRight: 1,
    battAlt: 1,
    eBrake: 1,
    highBeam: 1,
    parkLights: 0,
    fogLights: 1,
    auxLights: 1,
    openDoor: 1,
    fan: 1,
    oilSwitch: 1,
    ECUErr: 1,
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
  // CAN is "available" (battery comes from it) but RPM/speed/temp come from Basic
  window.useCanChannel = (key) => !key;
  // Same behaviour as the SDK: odoNow is a distance pulse, counted at most
  // once a second, added to the saved total and trip
  let odoBusy = false;
  window.loadOdo = (totalEl, tripEl, add) => {
    const o = window.DASH_OPTIONS;
    o.kmTrip += add;
    o.kmTotal += add;
    window.setText(tripEl, Math.round(o.kmTrip));
    window.setText(totalEl, Math.round(+o.tKm + o.kmTotal));
  };
  window.updateOdo = (totalEl, tripEl, odoNow) => {
    if (!odoNow || odoBusy || isNaN(odoNow)) return;
    odoBusy = true;
    window.loadOdo(totalEl, tripEl, odoNow);
    setTimeout(() => (odoBusy = false), 1000);
  };
  window.openConnection = (cb) => {
    requestAnimationFrame(cb);
    // Simulated drive: rev through the gears, signal now and then, fuel draining
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const d = window.basicData;
      // 14 s loop: stopped at idle (2 s), pull through 3 gears (9 s), brake to a stop (3 s)
      const c = t % 14;
      if (c < 2) {
        d.rpm = 900;
        d.kmh = d.kmhF = 0;
      } else if (c < 11) {
        const pull = (c - 2) / 9;
        d.rpm = 1200 + 8600 * ((pull * 3) % 1);
        d.kmh = d.kmhF = 200 * pull;
      } else {
        const brake = (c - 11) / 3;
        d.rpm = 2500 - 1600 * brake;
        d.kmh = d.kmhF = 200 * (1 - brake) ** 1.5;
      }
      d.clt = Math.min(104, 70 + t * 1.5);
      d.lvlFuel = Math.max(8, 70 - t * 1.2);
      window.canData.batt = 13.6 + 0.3 * Math.sin(t);
      const relay = Math.floor(t * 1.4) % 2; // ~0.7 Hz flasher
      d.turnLeft = t % 20 < 6 ? relay : 1;
      d.turnRight = t % 20 > 10 && t % 20 < 16 ? relay : 1;
      d.highBeam = t % 15 > 9 ? 0 : 1;
      // Fast-forward distance so the rollers visibly turn: 1 km per second while moving
      d.odoNow = d.kmh > 0 ? 1 : 0;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
};
