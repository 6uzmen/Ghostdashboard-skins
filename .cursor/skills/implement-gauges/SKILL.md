---
name: implement-gauges
description: Implements dynamic gauge elements for Ghost Dashboard skins, including bar gauges, rotary gauges, RPM, speedometer, MAP/boost, and signal icons. Use when building or updating any gauge UI element, setting CSS bar values, or wiring up gauge elements to real-time data.
---

# Implement Gauges

## Core methods

| Method | Use case |
|--------|----------|
| `setText(el, value)` | High-perf text update (e.g. speed number, RPM number) |
| `setRootCSS(prop, value)` | High-perf CSS var update (e.g. rotation, scale, bar width) |
| `setGaugeValue(el, value, barValue)` | Combines `setText` + `setRootCSS('--<id>-bar', barValue)` |
| `setIconOpacity(name, value)` | Toggle signal icons (turn, highBeam, eBrake, etc.) |

All methods are cache-aware — safe to call on every `requestAnimationFrame`.

---

## Bar gauges (scaleX/scaleY)

**Pattern:** set a CSS variable as a fraction (0–1), apply with `scaleX` or `scaleY` in CSS.

```js
// JS
setRootCSS('--clt-gauge-bar', canData.clt / DASH_OPTIONS.clt)
// or use shorthand (CAN required):
setCLTBar(canData.clt)
```

```css
/* CSS */
#clt-bar {
  transform-origin: left;
  transform: scaleX(var(--clt-gauge-bar, 0));
}
```

### Available shorthand bar methods (CAN only)
`setCLTBar` · `setMATBar` · `setOilPressBar` · `setFuelPressBar` · `setBoostBar` · `setOilTempBar` · `setFuelLevelBar` · `setBatteryBar` · `setSpeedBar` · `setRPMBar` · `setTPSBar` · `setAFRBar` · `setLambdaBar`

Pass `true` as second argument to get a percentage string instead of a fraction:
```js
setMATBar(80, true) // → "72.7%"
```

---

## Rotary gauges (rotate/deg)

```js
// RPM — sweep from 9° to 262° (253° range)
setRootCSS('--rpm-deg', `${9 + ((rpm / maxRpm) * 253)}deg`)

// Scale skin (linear bar style, right-to-left):
setRootCSS('--rpm-deg', `${294 - ((rpm / maxRpm) * 294)}px`)
```

Always define `maxRpm` from settings:
```js
const { rpmM } = DASH_OPTIONS
const maxRpm = rpmM * 1000
```

---

## MAP / Boost gauge

```js
setText(mapBoostElem, mapFormat(canData.map))   // e.g. "-.2" vacuum, "0.2" boost
setText(boostElem, boostFormat(canData.map))    // e.g. 0 (vacuum), 0.2 (boost)

// Combined bar (vacuum left, boost right)
setRootCSS('--map-gauge-bar', mapBarFormat(canData.mapbar))
```

```css
#map-bar {
  width: 300px;
  left: 50%;
  transform-origin: left;
  transform: scaleX(var(--map-gauge-bar, 0));
}
```

---

## Signal icons

```js
// Binary signals: 0 = ON, 1 = OFF (reverse logic)
etoggle(elems['turnLeft'], basicData.turnLeft)
etoggle(elems['eBrake'], basicData.eBrake)

// Or manually:
setIconOpacity('turnLeft', 1)  // visible
setIconOpacity('highBeam', 0)  // hidden
```

---

## RPM gauge with multiple image scales

The user can set max RPM from 6k to 10k. If using an image-based RPM gauge, provide 5 variants:

```js
const rpmGauge = document.getElementById(`rpm${rpmM}`) // rpm6, rpm7, rpm8...
rpmGauge.style.display = 'block'
```

See `community/simple/` for a complete implementation.

---

## Value formatting helpers

| Method | Output example |
|--------|---------------|
| `zeroFixed(120.5)` | `121` |
| `oneFixed(12.34)` | `12.3` |
| `twoFixed(12.345)` | `12.35` |
| `fuelLevelFormat(103)` | `100` (clamped 0–100) |
| `safeReturn(obj, key, default)` | Safe access on first data batch |
