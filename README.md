# ImportNow website recreation

Responsive React + Vite recreation of the ImportNow China-to-India import
services site. The 3D globe and shipment voyage use Three.js with locally
bundled textures; no paid API or backend is required.

## Run locally

```powershell
npm install
npm run dev
```

## Quality checks

```powershell
npm run lint
npm run build
npm run test:e2e
npm run qa:capture
```

`test:e2e` covers desktop, tablet and mobile layouts, navigation, links, FAQ,
quote-message generation, and the animated globe/journey behavior.
`qa:capture` saves home and desktop section screenshots for the local site and
the reference site under `test-results/captures/`. Reference screenshots need
internet access and may be skipped if the reference is unavailable.

The quote form prepares a message locally. WhatsApp opening stays disabled
until a verified number is set in `src/config/contact.js`.
