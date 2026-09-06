# lineMorph — V2

Run `npm run dev` and open the local Vite URL. Scroll down to dissolve the bridge details, morph its continuous foreground suspension cable through stippled dots, and reveal the San Francisco skyline. Continue scrolling to morph the skyline into a small waving hand drawing near the bottom. Scroll back up to restore the skyline and bridge.

## Angled bridge study

`src/scenes/bridgeGeometry.ts` generates original SVG geometry with a shared receding projection: paired cables, vertical hangers, portal towers with crossbeams and foundations, and a tapered roadway/truss. The foreground cable remains a single open, left-to-right path so the existing x-aligned skyline morph continues to work. Other strokes are registered automatically for fading in `morphPlan.ts`.

Perspective reference: [Easy Drawing Guides — Golden Gate Bridge](https://easydrawingguides.com/how-to-draw-the-golden-gate-bridge/), especially the converging roadway, paired tower legs, and suspension details. This is a procedural interpretation; no source artwork is embedded or traced.

### Skyline landmark details

`src/scenes/skylineLandmarks.ts` contains original, simplified architectural line studies for the Ferry Building and Palace of Fine Arts. The Ferry Building has a centered circular clock, matching terminal wings, and repeated arched bays. The Palace has a ribbed dome, rotunda arches, paired columns, and flanking colonnades. Transamerica adds a tapered façade grid, a central face ridge, service-wing edges, and triangular lobby braces. Salesforce Tower adds curved floor bands and vertical façade fins. Coit Tower adds crown arches and vertical fluting. The final composition contains only these five landmarks, with equal edge-to-edge gaps and matching outer margins. Each outline and its interior details use one shared placement; the continuous baseline connects their silhouettes for the morph. All interior details draw in together afterward.

References: [Library of Congress Ferry Building photograph](https://www.loc.gov/item/2013630063/), [SAH Archipedia Palace of Fine Arts](https://sah-archipedia.org/buildings/CA-01-075-0036), and [Palace of Fine Arts visitor information](https://palaceoffinearts.com/info/). Tower references: [University of Washington PCAD — Transamerica](https://pcad.lib.washington.edu/building/2499/) and [Pelli Clarke & Partners — Salesforce Tower](https://pcparch.com/work/salesforce-tower). Proportions are adapted to the existing skyline composition, rather than a measured architectural elevation.

### Reaching hands

`src/scenes/wavingHandGeometry.ts` defines the current third artwork: a simple open palm saying hi, with level lines extending from the midpoint of the palm to the viewport edges. The lower palm contour, finger creases, and wave marks draw in after the stippled morph. Reduced-motion mode switches between all three artworks without interpolation. Earlier handshake, Nokia and Michelangelo studies remain in their geometry files for comparison in future edits.

Validation: `npm run build` and `npm run lint`.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
