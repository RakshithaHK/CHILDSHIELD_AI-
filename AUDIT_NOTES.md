# ChildShield audit and changes

## Changes in this build
- Removed the random/mock facial age estimator from the age-gate code path and removed its helper export.
- Increased the browser scan from 12 frames × 200 ms to 16 frames × 250 ms to improve sampling stability. This does not eliminate model bias or guarantee better real-world accuracy.
- Added per-frame exception handling and rejects invalid/non-finite model age outputs instead of letting one frame crash the scan.
- Made facial-age conflicts trigger parent review instead of automatic denial when the registered profile age meets the threshold.
- The parent-managed registered age below the content threshold still denies access; a face estimate cannot override it.
- Updated tests and documentation to explain that frame-to-frame consistency is not calibrated confidence and facial age is not proof of age.

## Verification
- `npm test`: PASS — 48 tests, 0 failures.
- `npm run build`: NOT VERIFIED. The project dependencies were not installed, `vite` was unavailable, and `npm install` timed out in this environment.

## Important limitations
- This is still a React/Vite browser prototype. It does not provide Android-wide monitoring or a native Android app.
- The existing `face-api.js` apparent-age model can be wrong by several years, especially for children. More frames reduce some noise but cannot fix systematic model error.
- No real-world accuracy claim is made. Before deployment, evaluate with a consented, representative labelled dataset and report MAE/median absolute error, age-band errors, subgroup errors, and false-allow/false-deny rates.
- For Android, implement a separate native app (e.g. Kotlin + CameraX and a reviewed on-device model), with clear permissions/consent, secure parent controls, and privacy-safe handling. Do not claim legal age verification from facial appearance alone.
