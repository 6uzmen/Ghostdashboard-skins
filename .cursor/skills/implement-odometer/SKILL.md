---
name: implement-odometer
description: Implements the total and trip odometer for Ghost Dashboard skins. Use when adding an odometer display, wiring up odoNow, using loadOdo or updateOdo, or handling the tKm base setting.
---

# Implement Odometer

## Two methods, two use cases

| Method | When to use |
|--------|-------------|
| `loadOdo(total, trip, value)` | On skin load — pass `0` to restore saved values |
| `updateOdo(total, trip, value)` | Inside the real-time loop — only updates when needed |

---

## On skin load

Call `loadOdo` once during initialization with `0` as value. This restores the previously saved total and trip odometer values:

```js
const kmTotal = document.getElementById('kmTotal')
const kmTrip = document.getElementById('kmTrip')

loadOdo(kmTotal, kmTrip, 0)
```

The user's `tKm` setting (base total km) is applied automatically — no need to handle it manually.

---

## In the real-time loop

Call `updateOdo` inside `bindRealtimeData`. It only triggers a DOM update when needed:

```js
const useCANForVSS = useCanChannel('sVss')

const bindRealtimeData = () => {
  updateOdo(kmTotal, kmTrip, useCANForVSS ? canData.odoNow : basicData.odoNow)
  requestAnimationFrame(bindRealtimeData)
}
```

- Use `canData.odoNow` when VSS source is CAN
- Use `basicData.odoNow` when VSS source is the internal module
- The value passed is the **increment** (km driven since last update), not the total

---

## How values are stored

Odometer state is saved in `localStorage` and persists across sessions. The trip odometer can be reset via the devkit's "Reset odometer" button, which sends an `odoreset` action to the skin.

---

## HTML structure (recommended)

```html
<span id="kmTotal">0</span>
<span id="kmTrip">0</span>
```

Fractional values are rounded to the nearest integer automatically.
