---
name: implement-odometer
description: Implements the total and trip odometer for Ghost Dashboard skins. Use when adding an odometer display, wiring up odoNow, using loadOdo or updateOdo, handling trip reset, or the tKm base setting.
---

# Implement Odometer

## Two methods, two moments

| Method | When |
|--------|------|
| `loadOdo(totalEl, tripEl, 0)` | Once, on skin load, to show the saved values |
| `updateOdo(totalEl, tripEl, increment)` | Every frame inside the real-time loop |

## On skin load

```html
<span id="kmTotal">0</span>
<span id="kmTrip">0</span>
```

```js
const kmTotal = document.getElementById('kmTotal')
const kmTrip = document.getElementById('kmTrip')

loadOdo(kmTotal, kmTrip, 0)
```

The displayed total is `tKm + kmTotal` (the user's base km setting plus the km counted by the dashboard), so `tKm` needs no extra handling. Both values are rounded to integers. The elements need unique ids because `setText` caches by id.

## In the real-time loop

```js
const bindRealtimeData = () => {
  // useCANForVSS = useCanChannel('sVss'), refreshed by checkSource()
  updateOdo(kmTotal, kmTrip, useCANForVSS ? canData.odoNow : basicData.odoNow)
  requestAnimationFrame(bindRealtimeData)
}
```

- Take `odoNow` from the same source as the speed: `canData` when `sVss` is CAN, `basicData` otherwise.
- `odoNow` is an **increment** (km since the last report), not a total.
- `updateOdo` ignores `0` and `NaN`, adds the increment to both counters, saves them and refreshes the text. It is **debounced for 1 s**: a second non-zero increment within a second of the previous one is dropped.

## Persistence and trip reset

The counters live in `DASH_OPTIONS.kmTotal` / `DASH_OPTIONS.kmTrip`, saved in localStorage (key `config`) together with the other settings. The devkit's **Reset odometer** button (and the hardware) send an `odoreset` message that sets `kmTrip` to 0; `updateOdo` then writes `0` to the trip element on the next frame. Calling `updateOdo` every frame is what makes the reset show up, so don't put it behind a guard such as `if (useCAN)`. To reset from skin code, use `resetOdo()`.

**Reset settings** in the devkit wipes all settings, odometer included.
