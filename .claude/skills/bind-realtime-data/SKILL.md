---
name: bind-realtime-data
description: Connects a Ghost Dashboard skin to real-time hardware data. Use when implementing data binding, reading basicData or canData, choosing between CAN and Basic sources, handling RPM/speed/temperature/signal updates, or setting up openConnection in a skin's script.js.
---

# Bind Real-time Data

## Connection lifecycle

```js
// 1. Define the update loop
const bindRealtimeData = () => {
  // read basicData / canData and write to the DOM here...
  requestAnimationFrame(bindRealtimeData)
}

// 2. Open the connection after the intro animation
setTimeout(() => openConnection(bindRealtimeData), 6500)
```

`openConnection(cb)` adds the `connected` class to `#container`, sets `isECUOnline` and `isBasicOnline` to `true`, and calls `cb` **once** on the next animation frame. Your loop keeps itself alive with `requestAnimationFrame`. From then on `basicData` and `canData` are hydrated with fresh data (in the devkit, by the built-in simulator).

`basicData` and `canData` are **reassigned** on every update, not mutated. Always read them through the global name inside the loop; never keep a reference to the object (`const d = canData` outside the loop goes stale).

---

## Dual-source channels (CAN vs Basic)

RPM, speed and coolant temperature can come from either source, depending on user settings `sRpm`, `sVss`, `sClt` (1 = Basic, 2 = CAN) and the global CAN switch `sCan` (1 = enabled, 2 = disabled). `useCanChannel(key)` returns `true` only when the ECU is online, CAN is enabled and that channel is set to CAN; `useCanChannel()` with no key tells you whether CAN is usable at all.

```js
let [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [false, false, false, false]

const checkSource = () => [useCAN, useCANForRPM, useCANForVSS, useCANForCLT] = [
  useCanChannel(),
  useCanChannel('sRpm'),
  useCanChannel('sVss'),
  useCanChannel('sClt'),
]

const bindRealtimeData = () => {
  // Re-evaluate the sources only when CAN availability changes
  if (!checkCache('useCAN', useCanChannel())) checkSource()

  updateRPM(useCANForRPM ? canData.rpm : safeReturn(basicData, 'rpm'))
  setKmhDeg(useCANForVSS ? [canData.vss] : [basicData.kmh, basicData.kmhF])
  setText(cltNow, useCANForCLT ? canData.clt : zeroFixed(safeReturn(basicData, 'clt')))
  updateOdo(kmTotal, kmTrip, useCANForVSS ? canData.odoNow : basicData.odoNow)

  requestAnimationFrame(bindRealtimeData)
}
```

`updateRPM` and `setKmhDeg` are **your own** wrappers (see `base/script.js`), not SDK functions.

### Speed: `kmh` vs `kmhF` and the `aSpd` setting

Basic gives two speeds: `kmh` (faster refresh, less accurate) and `kmhF` (slower refresh, more accurate). The user picks with `aSpd` (1 = higher accuracy, 2 = higher refresh rate):

```js
const { aSpd } = DASH_OPTIONS
const setKmhDeg = ([val, valf]) => {
  setText(speedo, zeroFixed(aSpd < 2 ? (valf || val) : val))
  // ...needle/bar from `val`
}
```

`community/simple/script.js` checks `rpmM < 2` here by mistake; copy the `base/` version instead.

---

## CAN-only channels

Guard them with `useCAN`:

```js
if (useCAN) {
  setText(gear, canData.gear)            // 'P' | 'N' | 'R' | 1..10
  setText(mat, canData.mat)
  setText(mapBoost, mapFormat(canData.map))
  setText(oilPressure, canData.oilPress)
  setText(fuelPressure, canData.fuelPress)
  setText(battLevel, canData.batt)
  setText(lambda, canData.lambda)
}
```

Other CAN channels: `tps`, `oilTemp`, `afr`, `boost`, `mapbar`, `odoNow`. `isECUOnline` tells you whether the ECU is sending data.

---

## Basic-only channels (signals and fuel level)

```js
const signals = [
  'turnLeft', 'turnRight', 'battAlt', 'eBrake', 'highBeam', 'parkLights',
  'fogLights', 'auxLights', 'openDoor', 'fan', 'oilSwitch', 'ECUErr'
] // also available: 'rearDefrost', 'airbag'

// Cache one element per signal, by id (do this once, outside the loop)
const elems = signals.reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {})

if (isBasicOnline) {
  setText(fuelLevel, fuelLevelFormat(basicData, 'lvlFuel'))
  setFuelLevelBar(safeReturn(basicData, 'lvlFuel'))

  for (let i = 0; i < signals.length; i++) {
    etoggle(elems[signals[i]], basicData[signals[i]])
  }
}
```

Binary signals use **reverse logic**: `0` = ON, `1` = OFF. `etoggle(el, value)` writes `data-etoggle="1 - value"` on the element, so **`data-etoggle="1"` means ON** in CSS:

```css
#top-info .icons span { opacity: 0.15; }
#top-info .icons span[data-etoggle="1"] { opacity: 1; }
```

---

## Key globals

| Global | Notes |
|--------|-------|
| `basicData` | Always available: `rpm`, `kmh`, `kmhF`, `clt`, `lvlFuel`, `lvlFuelF`, `odoNow`, binary signals |
| `canData` | Only with CAN: `rpm`, `vss`, `tps`, `map`, `clt`, `mat`, `oilPress`, `oilTemp`, `fuelPress`, `gear`, `lambda`, `afr`, `batt`, `boost`, `odoNow`, `mapbar` |
| `DASH_OPTIONS` | User settings (many values are strings) |
| `COLORS` | `DASH_OPTIONS.theme.colors` |
| `isECUOnline` | `true` while the ECU sends CAN data |
| `isBasicOnline` | `true` while the basic module is connected |

## Gotchas

- `safeReturn(obj, key, def = 0)` returns `obj[key] || def`, so any falsy value (including a real `0`) becomes `def`.
- `setText`, `etoggle` and `checkCache` cache by the element's **`id`**. Every element you pass must have a **unique id**; elements without an id share the same cache key (`"null"`) and will silently stop updating. Custom `checkCache('key', ...)` keys share that same cache, so don't reuse an element id as a custom key.

For units and ranges of every channel, see the data set section of the repo [README.md](../../../README.md).
