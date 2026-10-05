---
name: implement-animations
description: Implements entry and exit animations for Ghost Dashboard skins with the anim-in, anim-out and connected classes on #container. Use when adding intro/outro animations, timing openConnection after the intro, styling the connecting state, or testing with the devkit Animation IN/OUT controls.
---

# Implement Animations

## Classes on `#container`

| Class | Added by | Purpose |
|-------|----------|---------|
| `anim-in` | Your `callback()`, as its last step | Intro: the skin appears |
| `anim-out` | Hardware / devkit (replaces `anim-in`) | Outro: the skin disappears |
| `connected` | `openConnection()`; removed on disconnect | Data is flowing |

`anim-in` and `anim-out` are swapped with `classList.replace`, so only one is present at a time. Write the outro rules under `.anim-out` without relying on `.anim-in` still being there.

---

## Triggering anim-in

```js
const callback = () => {
  const container = document.getElementById('container')

  // ... all setup first (DOM, colors, loadOdo, generated scales) ...

  // Open the connection when the intro has finished
  setTimeout(() => openConnection(bindRealtimeData), 6500)

  container.classList.add('anim-in')   // last step
}

window.onload = () => callback()
```

Choose the `openConnection` delay to match the length of your intro (`base/` and `simple` use 6500 ms, `scale` 5000 ms). The devkit's **Animation IN** reconnects 6500 ms after replaying the intro, so intros longer than ~6.5 s will receive data before they finish.

---

## CSS

```css
/* Hidden before the intro */
#container { opacity: 0; }

#container.anim-in {
  animation: fadeIn 1s ease forwards;
}

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

Animate only `transform` and `opacity` (see `skin-performance`). `base/style.css` animates each block separately (`.anim-in #top-info`, `.anim-in .circle`, ...) with `animation-delay` and `animation-fill-mode: forwards`, and is a good reference.

### Connecting state

Pattern from `base/style.css`: the needles run their intro animation until data arrives, then follow the data:

```css
#container.connected #right-gauge.circle .needle {
  transform: rotate(var(--rpm-deg)) scaleX(-1);
  animation: none;
}
```

---

## Staggered elements

Generated elements can get their own delay (`community/scale/script.js`):

```js
for (let i = items.length - 1; i >= 0; i--) {
  const el = document.createElement('div')
  el.style.animationDelay = `${(i + 15) * 0.2}s`
  el.textContent = items[i]
  holder.appendChild(el)
}
```

---

## Testing in the devkit

- **Animation IN**: replaces `anim-out` with `anim-in` (only does something after an Animation OUT) and reconnects after 6500 ms.
- **Animation OUT**: disconnects (data goes back to zero, `connected` is removed) and replaces `anim-in` with `anim-out`.
- **Toggle Server connection**: turns the data simulator and the `connected` class on/off.

Your `requestAnimationFrame` loop is not stopped by a disconnect; it keeps running and reads zeroed data.

---

## Video intro (optional)

Keep resolution low (quality can stay high): `1000×300` @ 30 fps for a banner, `480×480` @ 30 fps for a gauge overlay (duplicated for twin gauges). Embed with `<video>` and remove or hide it after it ends.
