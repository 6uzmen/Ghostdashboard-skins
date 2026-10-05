---
name: skin-performance
description: Applies performance best practices for Ghost Dashboard skins on the target ARM hardware (quad-core 1.44GHz, 512MB RAM). Use when optimizing a skin, reducing CPU/memory use, smoothing animations, or reviewing a skin's code for performance issues.
---

# Skin Performance

## Hardware

- Quad-core ARM @ 1.44 GHz, 512 MB RAM for the UI (video memory managed automatically).
- Canvas 1280×480 px, rendered at 1x, 1.5x or 2x depending on the screen.
- Target: smooth 60 fps.

---

## Rules

### 1. Drive the UI with `requestAnimationFrame`

```js
const bindRealtimeData = () => {
  // update UI...
  requestAnimationFrame(bindRealtimeData)   // ✅
}
// ❌ never setInterval for the render loop
```

### 2. Cache DOM elements once, outside the loop

```js
// ✅ once, at the start of callback()
const speedo = document.getElementById('speedo')

const bindRealtimeData = () => {
  // ❌ no getElementById / querySelector here
  setText(speedo, zeroFixed(canData.vss))
  requestAnimationFrame(bindRealtimeData)
}
```

### 3. Write through the SDK's cached setters

`setText`, `setRootCSS`, `etoggle` and the `set<Channel>Bar` methods skip the DOM write when the value hasn't changed. Make that cache effective:
- Give every element you update a **unique `id`** (the cache key; id-less elements collide on one key).
- Round before writing (`zeroFixed`, `oneFixed`) so tiny fluctuations don't produce a new value, and a new DOM write, every frame.
- Use `checkCache('key', value)` to skip your own work when an input hasn't changed:
  ```js
  if (!checkCache('useCAN', useCanChannel())) checkSource()
  ```

### 4. Animate only compositor-friendly properties

```css
/* ✅ GPU-accelerated */
transform: rotate(var(--rpm-deg));
transform: scaleX(var(--clt-gauge-bar));
opacity: var(--highBeam-icon);

/* ❌ triggers layout on every change */
width: calc(var(--bar) * 300px);
left: ...; top: ...; height: ...;
```

Use `will-change` sparingly, only on elements that move continuously (needles, bars, sweeping masks). The README warns that it is computationally expensive.

### 5. Keep the loop light

Do one-time work in `callback()`: derive maxima (`DASH_OPTIONS.rpmM * 1000`), build scales and tick marks, read colors. Inside the loop, only read data, do simple arithmetic and call the setters. Move unavoidable heavy work (sorting, large array transforms, parsing) to a Web Worker.

### 6. Keep the DOM and CSS simple

Few elements, shallow trees, simple selectors (ids/classes, no deep descendant chains). Remove listeners and objects you no longer need.

### 7. Compress assets

- PNG/JPG: [TinyPNG](https://tinypng.com/); SVG: [Vecta Nano](https://vecta.io/nano).
- Video: low resolution, decent quality: `1000×300` or `480×480` @ 30 fps.

### 8. Profile

Use the browser devtools Performance panel while the devkit simulator runs (the README recommends Firefox), and re-test after every significant change.

---

## Review checklist

- [ ] DOM elements cached before the loop; no queries inside it
- [ ] `requestAnimationFrame` loop, no `setInterval`
- [ ] Frequent writes go through `setText` / `setRootCSS` / `etoggle` / `set<Channel>Bar`, with values rounded
- [ ] Every updated element has a unique `id`
- [ ] Animations and gauges use `transform` / `opacity` only
- [ ] `will-change` only on continuously moving elements
- [ ] Images/SVG/video compressed
- [ ] No heavy computation inside the loop
