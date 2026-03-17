---
name: bind-realtime-data
description: Connects a Ghost Dashboard skin to real-time hardware data streams. Use when implementing data binding, reading basicData or canData, handling RPM/speed/temperature updates, or setting up the openConnection callback in a skin's script.js.
---

# Bind Real-time Data

## Connection lifecycle

```js
// 1. Define the update loop
const bindRealtimeData = () => {
  // read data here...
  requestAnimationFrame(bindRealtimeData)
}

// 2. Open connection after animation completes
setTimeout(() => openConnection(bindRealtimeData), 5000)
```

`openConnection` adds the `connected` class to `container` and starts hydrating `basicData` and `canData`.

---

## Dual-source channels (CAN vs Basic)

RPM, VSS, and CLT can come from either source. Always check user settings:

```js
let [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [false, false, false, false]

const checkSource = () => [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [
  useCanChannel(),
  useCanChannel('sRpm'),
  useCanChannel('sVss'),
  useCanChannel('sClt'),
]

const bindRealtimeData = () => {
  // Re-check source only when it changes (cache-aware)
  if (!checkCache('useCAN', useCanChannel())) checkSource()

  updateRPM(useCANForRPM ? canData.rpm : safeReturn(basicData, 'rpm'))
  setKmh(useCANForVSS ? [canData.vss] : [basicData.kmh, basicData.kmhF])
  setText(cltElem, useCANForCLT ? canData.clt : zeroFixed(safeReturn(basicData, 'clt')))

  requestAnimationFrame(bindRealtimeData)
}
```

---

## CAN-only channels

Wrap CAN-only data in a `useCAN` guard:

```js
if (useCAN) {
  setText(gear, canData.gear)
  setText(mat, canData.mat)
  setText(mapBoost, mapFormat(canData.map))
  setText(oilPressure, canData.oilPress)
  setText(fuelPressure, canData.fuelPress)
  setText(battLevel, canData.batt)
  setText(lambda, canData.lambda)
}
```

Check `isECUOnline` if you need to know if the ECU is actively sending CAN data.

---

## Basic-only channels (signals & fuel level)

```js
if (isBasicOnline) {
  setText(fuelLevel, fuelLevelFormat(basicData, 'lvlFuel'))
  setFuelLevelBar(safeReturn(basicData, 'lvlFuel'))

  const signals = ['turnLeft', 'turnRight', 'battAlt', 'eBrake', 'highBeam', ...]
  for (let i = 0; i < signals.length; i++) {
    etoggle(elems[signals[i]], basicData[signals[i]])
  }
}
```

> Binary signals use **reverse logic**: `0` = ON, `1` = OFF.

---

## Key global objects

| Object | Source | Notes |
|--------|--------|-------|
| `basicData` | Always available | RPM, KMH, CLT, fuel level, signals |
| `canData` | CAN only | All performance channels |
| `DASH_OPTIONS` | Settings | User preferences |
| `COLORS` | Settings | Shorthand for `DASH_OPTIONS.theme.colors` |
| `isECUOnline` | CAN | `true` if ECU is sending data |
| `isBasicOnline` | Basic | `true` if basic module is connected |

For full channel lists, see the [README.md](../../README.md) data set section.
