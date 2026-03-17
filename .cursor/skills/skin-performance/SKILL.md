---
name: skin-performance
description: Applies performance best practices when building Ghost Dashboard skins for the ARM hardware (quad-core 1.44GHz, 512MB RAM). Use when optimizing a skin, reducing CPU/memory usage, improving animation smoothness, or reviewing code for performance issues.
---

# Skin Performance

## Hardware constraints

- Quad-core ARM @ 1.44GHz, 512MB RAM dedicated to UI
- Target: smooth **60fps** rendering
- Canvas: **1280×480px** — scaling is automatic (1x / 1.5x / 2x)

---

## Critical rules

### 1. Always use `requestAnimationFrame` for the update loop

```js
const bindRealtimeData = () => {
  // update UI...
  requestAnimationFrame(bindRealtimeData)  // ✅
}
// ❌ Never use setInterval for the render loop
```

### 2. Cache DOM elements — never query inside the loop

```js
// ✅ Cache once, at callback() start
const speedo = document.getElementById('speedo')
const rpm = document.getElementById('rpm')

// ❌ Never do this inside bindRealtimeData
const speedo = document.getElementById('speedo')
```

### 3. Use built-in methods — they are cache-aware

`setText`, `setRootCSS`, `setGaugeValue`, and all `set__Bar` methods skip DOM writes if the value hasn't changed:

```js
setText(speedo, zeroFixed(canData.vss))   // ✅ skips write if same value
setRootCSS('--rpm-deg', `${deg}deg`)      // ✅ same
```

### 4. Use `checkCache` for custom guards

```js
if (!checkCache('useCAN', useCanChannel())) {
  checkSource()  // only re-runs when CAN state changes
}
```

### 5. Prefer hardware-accelerated CSS properties

```css
/* ✅ GPU-accelerated */
transform: rotate(var(--rpm-deg));
transform: scaleX(var(--bar));
opacity: var(--icon-opacity);

/* ❌ Triggers layout reflow */
width: calc(var(--bar) * 300px);
left: ...;
top: ...;
```

Use `will-change` sparingly — only on elements that animate frequently:
```css
.rpm-needle { will-change: transform; }
```

### 6. Compress all assets

- PNG/JPG → [TinyPNG](https://tinypng.com/)
- SVG → [Vecta Nano](https://vecta.io/nano)
- Keep video resolution low (not quality): `1000×300` or `480×480` @ 30fps

### 7. Avoid heavy JS in the render loop

Move all one-time setup outside `bindRealtimeData`:
```js
const callback = () => {
  // ✅ one-time setup
  const maxRpm = DASH_OPTIONS.rpmM * 1000
  const speedo = document.getElementById('speedo')

  const bindRealtimeData = () => {
    // ✅ lightweight — only reads and writes
    setText(speedo, zeroFixed(canData.vss))
    requestAnimationFrame(bindRealtimeData)
  }
}
```

Move heavy computations (sorting, mapping large arrays, string parsing) to Web Workers if unavoidable.

---

## Quick checklist

- [ ] All DOM elements cached before the loop
- [ ] `requestAnimationFrame` used for the render loop
- [ ] Only `setText`, `setRootCSS`, or `set__Bar` used for frequent updates
- [ ] CSS uses `transform`/`opacity` for animations, not layout properties
- [ ] Images compressed
- [ ] No complex calculations inside `bindRealtimeData`
- [ ] `will-change` used on at most 2–3 elements
