---
name: implement-gauges
description: Implements dynamic gauge elements for Ghost Dashboard skins, including bar gauges, rotary needles, RPM with selectable max, speedometer, MAP/boost and signal icons. Use when building or updating any gauge UI, setting CSS bar variables, or wiring gauges to real-time data.
---

# Implement Gauges

## Core methods (all from `client.js`, all cached)

| Method | What it really does |
|--------|---------------------|
| `setText(el, value)` | Sets `el.textContent` only if the value changed (cache keyed by `el.id`) |
| `setRootCSS(prop, value)` | Sets a CSS custom property on `:root` only if it changed |
| `set<Channel>Bar(value, asPercentage?)` | Sets `--<settingKey>-gauge-bar` to `value / max` (see table below) |
| `etoggle(el, signal)` | Sets `data-etoggle="1 - signal"`, so `"1"` = ON |
| `setIconOpacity(name, signal)` | Sets `--<name>-icon` to `1 - signal` |

Because they skip unchanged writes, they are safe to call every `requestAnimationFrame`. Elements passed to `setText`/`etoggle` **must have a unique `id`**.

### Avoid `setGaugeValue`

`setGaugeValue(el, value, barValue)` only works if `el.value` is itself a DOM node: it writes `el.value.textContent`. On a normal `<div>`/`<span>` `el.value` is `undefined` and the call does nothing. It also skips the bar when `barValue` is `0`. Use `setText` + `setRootCSS` instead:

```js
setText(speedo, zeroFixed(kmh))
setRootCSS('--speed-bar', kmh / DASH_OPTIONS.spdM)
```

---

## Bar gauges (scaleX / scaleY)

Set a CSS variable to a fraction (0–1) and apply it with a transform:

```js
setCLTBar(useCANForCLT ? canData.clt : safeReturn(basicData, 'clt'))  // → --clt-gauge-bar
```

```css
:root { --clt-gauge-bar: 0; }   /* default before data arrives */
#clt-bar {
  transform-origin: left;
  transform: scaleX(var(--clt-gauge-bar));
}
```

### Shorthand bar methods

They are pure math (value ÷ max) and work with **any** source, Basic or CAN (`base/` feeds `setCLTBar` and `setFuelLevelBar` from `basicData`). The CSS variable is named after the **settings key**, not the method:

| Method | CSS variable | Max used |
|--------|--------------|----------|
| `setCLTBar` | `--clt-gauge-bar` | `DASH_OPTIONS.clt` |
| `setMATBar` | `--mat-gauge-bar` | `DASH_OPTIONS.mat` |
| `setOilPressBar` | `--pOil-gauge-bar` | `DASH_OPTIONS.pOil` |
| `setFuelPressBar` | `--pFuel-gauge-bar` | `DASH_OPTIONS.pFuel` |
| `setBoostBar` | `--pBoost-gauge-bar` | `DASH_OPTIONS.pBoost` |
| `setOilTempBar` | `--tOil-gauge-bar` | `DASH_OPTIONS.tOil` |
| `setFuelLevelBar` | `--lFuel-gauge-bar` | 100 |
| `setBatteryBar` | `--batt-gauge-bar` | `DASH_OPTIONS.batt` |
| `setSpeedBar` | `--spdM-gauge-bar` | `DASH_OPTIONS.spdM` |
| `setRPMBar` | `--rpmM-gauge-bar` | `DASH_OPTIONS.rpmM * 1000` |
| `setTPSBar` | `--tps-gauge-bar` | 100 |
| `setAFRBar` | `--afr-gauge-bar` | 20 (no offset: subtract the 8 AFR floor yourself if needed) |
| `setLambdaBar` | `--lambda-gauge-bar` | 2 |

Values are not clamped: a reading above max gives a fraction > 1. Pass `true` as second argument to get an unrounded percentage string: `setMATBar(80, true)` → `"72.72727272727273%"` (with `mat` = 110).

For non-linear or custom bars (e.g. stroke-dashoffset, px offsets), compute the value yourself and use `setRootCSS` (see `community/simple` and `community/scale`).

---

## Rotary gauges (needles)

```js
const maxRpm = DASH_OPTIONS.rpmM * 1000   // never hardcode 8000

// community/simple: 9° → 262° sweep (253° range)
setRootCSS('--rpm-deg', `${9 + ((rpm / maxRpm) * 253)}deg`)
```

```css
.rpm-needle {
  transform: rotate(var(--rpm-deg));
  will-change: transform;
}
```

Linear "fill" gauges can drive a translate instead (`community/scale` moves a mask by px: `${294 - (rpm / maxRpm) * 294}px`).

### Redline

`redline` is a string setting; compare with `+`:

```js
setRootCSS('--rpm-color', +rpm < +redline ? cRpm : cRed)
```

`sLigt` is the shift-light trigger RPM, also a string.

---

## RPM gauge with selectable max

The user picks `rpmM` = 6, 7, 8, 9 or 10 (×1000), and the skin must support all five. With generated scales, build the numbers from `rpmM` (`community/scale`). With images, ship five variants and show the matching one (`community/simple`):

```html
<div id="rpm6" class="rpm-scale"></div> ... <div id="rpm10" class="rpm-scale"></div>
```
```js
document.getElementById(`rpm${DASH_OPTIONS.rpmM}`).style.display = 'block'
```

---

## MAP / Boost

```js
setText(mapBoostElem, mapFormat(canData.map))   // map < 1 → "-" + decimals, e.g. 0.2 → "-.2"; map ≥ 1 → (map - 1).toFixed(2), e.g. 1.2 → "0.20"
setText(boostElem, boostFormat(canData.map))    // map < 1 → 0, else map - 1 rounded to 2 decimals
setRootCSS('--map-gauge-bar', mapBarFormat(canData.mapbar))  // vacuum −0.5..0, boost 0..0.5 (boost scaled by pBoost)
```

```css
#map-bar {
  width: 300px;
  left: 50%;
  transform-origin: left;
  transform: scaleX(var(--map-gauge-bar, 0));
}
```

Caveats verified against `client.js`:
- `mapFormat` below 1 bar keeps the absolute decimals with a minus sign (`0.2` → `"-.2"`, not `-0.8`).
- The devkit simulator does **not** emit `canData.mapbar`, so `mapBarFormat(canData.mapbar)` is `NaN` while testing locally. Guard it (`canData.mapbar ?? 0`) so the bar does not jump.

---

## Signal icons

Preferred, as in every bundled skin: one element per signal with `id` = signal name, toggled with `etoggle`:

```js
etoggle(elems.turnLeft, basicData.turnLeft)   // 0 (ON) → data-etoggle="1"
```
```css
#turnLeft { opacity: 0.15; }
#turnLeft[data-etoggle="1"] { opacity: 1; }
```

Alternative, with CSS variables: pass the **raw signal value**:

```js
setIconOpacity('highBeam', basicData.highBeam)   // signal 0 (ON) → --highBeam-icon: 1
```
```css
#highBeam { opacity: var(--highBeam-icon, 0); }
```

Passing `1` hides the icon and `0` shows it (`setIconOpacity('turnLeft', 1)` → opacity 0).

Color icons: when `DASH_OPTIONS.icon !== 1`, swap `assets/icons/` for `assets/icons_color/` (see the `icons_color` replace in `base/script.js`).

---

## Formatting helpers

| Call | Result |
|------|--------|
| `zeroFixed(120.5)` | `121` (number) |
| `oneFixed(12.34)` | `12.3` |
| `twoFixed(12.345)` | `12.35` |
| `fuelLevelFormat(basicData, 'lvlFuel')` | value clamped to 0–100 and rounded. Takes **object + key**, not a value: `fuelLevelFormat(103)` returns `0` |
| `safeReturn(obj, key, def = 0)` | `obj[key] \|\| def` |
