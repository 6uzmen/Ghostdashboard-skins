---
name: create-skin
description: Scaffolds a new Ghost Dashboard skin from scratch. Use when the user wants to create a new skin, start a new skin project, duplicate the base skin, or set up the folder structure for a Ghost Dashboard skin.
---

# Create a Ghost Dashboard Skin

## Steps

1. **Duplicate the `base/` folder** into `community/<skin-name>/`
   - Use simple, lowercase, hyphenated names: `duck`, `space-drift`, `cookies-n-cream`
   - Verify the name is not already taken in `community/`

2. **Required file structure:**
```
community/<skin-name>/
├── index.html       # Main entry point - imports scripts in order
├── script.js        # Skin logic
├── style.css        # Skin styles
├── README.md        # Skin name, description, inspiration, features
└── screenshot.png   # Screenshot of the skin in action
```

3. **`index.html` script import order is critical:**
```html
<script src="../assets/defaultSettings.js" type="text/javascript"></script>
<script src="../assets/client.js" type="text/javascript"></script>
<script src="./script.js" type="text/javascript"></script>
```

4. **`script.js` minimum skeleton:**
```js
const callback = () => {
  const { cMain, cSec } = COLORS
  const { rpmM } = DASH_OPTIONS
  const container = document.getElementById('container')

  // Set theme colors
  setRootCSS('--main-color', cMain)

  // Load odometer on start
  const kmTotal = document.getElementById('kmTotal')
  const kmTrip = document.getElementById('kmTrip')
  loadOdo(kmTotal, kmTrip, 0)

  const bindRealtimeData = () => {
    // ... read basicData / canData here
    requestAnimationFrame(bindRealtimeData)
  }

  // Delay openConnection until after intro animation
  setTimeout(() => openConnection(bindRealtimeData), 5000)

  container.classList.add('anim-in')
}

window.onload = () => callback()
```

5. **Canvas size:** 1280×480px. Responsive layout is not required, but scalable designs are recommended.

6. **To test in the devkit:** click "Load dev skin" and enter your skin's folder name.

## Notes
- `COLORS` is a shorthand for `DASH_OPTIONS.theme.colors`
- `DASH_OPTIONS` is available globally from `defaultSettings.js`
- All `client.js` methods are available globally after it's imported
- The RPM gauge must support 6 different max scales (6k–10k) — see `community/simple` for an example
