---
name: implement-animations
description: Implements entry and exit animations for Ghost Dashboard skins using the anim-in and anim-out CSS classes. Use when adding intro/outro animations, wiring up the animation lifecycle, handling the container element's animation classes, or responding to the Animation IN/OUT devkit controls.
---

# Implement Animations

## Animation lifecycle

The skin has two animation phases controlled by CSS classes on the `#container` element:

| Class | When added | Purpose |
|-------|-----------|---------|
| `anim-in` | End of `callback()`, after setup | Intro animation — skin appears |
| `anim-out` | Triggered by hardware/devkit | Outro animation — skin disappears |

---

## Triggering anim-in

Add `anim-in` as the **last step** of `callback()`. This lets you delay the animation until all setup (DOM, colors, odometer) is complete:

```js
const callback = () => {
  const container = document.getElementById('container')

  // ... all setup here (colors, loadOdo, etc.) ...

  setTimeout(() => openConnection(bindRealtimeData), 5000)

  container.classList.add('anim-in')  // triggers intro animation
}

window.onload = () => callback()
```

---

## CSS implementation

```css
/* Initial state — hidden before animation */
#container {
  opacity: 0;
}

/* Intro */
#container.anim-in {
  animation: fadeIn 1s ease forwards;
}

/* Outro */
#container.anim-out {
  animation: fadeOut 0.5s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

---

## Staggered element animations

Animate individual elements with `animation-delay` for richer intros. See `community/scale/script.js` for an example of dynamically building elements with staggered delays:

```js
for (let i = items.length - 1; i >= 0; i--) {
  const el = document.createElement('div')
  el.style.animationDelay = `${(i + 15) * 0.2}s`
  el.textContent = items[i]
  container.appendChild(el)
}
```

---

## Testing animations in the devkit

- **Animation IN** button → adds `anim-in` class to `container`
- **Animation OUT** button → adds `anim-out` class to `container`
- **Toggle Server connection** → adds/removes `connected` class (use to style the "connecting" state)

Use the `connected` class to show a loading state before data arrives:

```css
#container:not(.connected) .data-section {
  opacity: 0.3;
}
```

---

## Video intro (optional)

For video-based intros, use low-resolution, high-quality video files:
- Banner: `1000×300` @ 30fps
- Gauge overlay: `480×480` @ 30fps (duplicated twice for stereo gauges)

Embed with an HTML `<video>` element and remove/hide it after playback.
