# 🛡 ChildShield – AI Child Protection & Content Safety System (React)

Academic prototype built with **React 18 + Vite** (plain JavaScript).
SVIT(Sai Vidya Institute of Technology)

It demonstrates the full protection workflow from the ChildShield project proposal:

```
Child/User → Content Input → Content Protection Engine → Text/Keyword Analysis
→ Content Classification → Age-Based Rule Engine → Risk Assessment
→ ALLOW / WARNING / BLOCK → Parent Alert + Activity Log
```

## Run in VS Code (needs Node.js 18+ → https://nodejs.org)

```bash
cd childshield-react
npm install        # one-time, needs internet
npm run dev        # opens http://localhost:5173
```

Other commands
```bash
npm test           # engine unit tests (node:test, no extra install)
npm run build      # production build → dist/
npm run preview    # serve the production build
```


## Quick start in Chrome (exact commands)
```bash
cd childshield-react
npm install
npm run dev        # starts http://localhost:5173 (fixed port) and opens your browser
npm test           # 47 unit tests, no install needed beyond Node 18+
```
There is **no backend and no API** – everything (account, data) is stored in the browser's localStorage, and
localStorage is separate for every address. Always use **http://localhost:5173** in the **same browser profile**.
Do not open `index.html` as a file, and do not mix `localhost`, `127.0.0.1`, a LAN IP or VS Code's preview.
The age model and its files download from a CDN, so internet is needed the first time. Facial estimates are not proof of age and can be wrong by several years.

## Login, password reset, demo account
- Registration shows a one-time **recovery code**. Forgot password? → email + recovery code → new password (a new code is issued).
- Lost both? "Erase this browser's account" wipes local data so you can register again (no server = no email reset).
- Login checks the password first, then the MetaMask approval (toggle *Approval* in the header).
- Dev-only demo account (button appears only under `npm run dev`, never in a build): `demo@childshield.local` / `demo123456`.
- Why `123456` could fail: wrong address/profile (separate localStorage), case-sensitive email, hash changing between secure/non-secure pages (fixed), or MetaMask approval cancelled (now reported separately).

## Age estimation – limits
Uses face-api.js `ageGenderNet` on-device. Frames are rejected when too dark, backlit, too far or unclear; the result is the
model's own median (never adjusted), shown with its range, and shown as **Uncertain** when readings disagree. Error is typically
several years and varies with lighting, angle, glasses, makeup and skin tone. It is an estimate, not verified age. The app is designed for
children (profile ages 1-17), so an adult tester is outside the model's intended use.

## Demo script (5 minutes)
1. **Register** a parent → **Child Profile** (e.g. Rahul, age 10 → group 7–12) → Save.
2. **Content Check** → click SAFE / WARNING / BLOCKED samples → *Analyze content*. BLOCKED opens the **Content Blocked** screen.
3. **Child Overlay Demo** → launch TikTok / Roblox / Instagram / Discord (blur overlay) or **YouTube** (13+ age gate; camera optional).
   Try the edge-case controls: force-kill daemon, go offline (alerts queue, then deliver on reconnect), revoke accessibility / overlay permission, battery slider, typed-text scanner.
4. **Alerts**, **Activity** and **Dashboard** update live.
5. **Protection Engine** → edit warn/block thresholds per age group or switch categories off → test again.
6. **Privacy** → consent, delete profile / history / alerts / all data, logout.

## Real-time features (Child Overlay Demo)
| Feature | What happens live | Code |
|---|---|---|
| **Video age gate** | Open YouTube → tap a 13+ video → playback pauses and the age-check popup appears by itself (camera estimate uses the browser face model, or the parent-managed registered age). Result is remembered until you leave the app. While a video plays, each caption line is scanned live and the video is blurred + paused if harmful. | `useOverlay.js` (`playVideo`, caption scanner), `ChildOverlay.jsx` |
| **Live text sentiment** | Type in the phone keyboard (any app). Every pause (450 ms) is analysed for sentiment + distress. Self-harm / distress / bullying language → helpline popup (Tele-MANAS 14416, CHILDLINE 1098, 112 for crisis) and an instant parent alert toast. Text is never stored. | `protection/Sentiment.js`, `Helplines.js`, `useOverlay.js` (`liveText`) |
| **Ad blurring** | A simulated ad network pops an ad every ~7 s. A `MutationObserver` scores each new on-screen element (ad markup, data-ad-* attributes, ad-network iframes, "Sponsored" labels, call-to-action text) and blurs it at once. Gambling / adult ads also go through the engine and alert the parent. | `protection/AdDetection.js`, `ChildOverlay.jsx` (`AdLayer`) |
| **Parent toast** | Any new alert pops up on the parent side immediately. | `alerts/AlertToast.jsx` |

Helpline numbers are India defaults in `src/protection/Helplines.js` – verify and change them for your country before real use.

### What is real vs simulated
Real: the timers, the typing watcher, the ad `MutationObserver`, the caption scanner and the alert pipeline all run live in the browser.
Simulated: the phone, the ad network and the videos. Watching other apps on a real phone needs a native Android app (AccessibilityService for text/ad detection, SYSTEM_ALERT_WINDOW overlay for blurring, a TFLite model for age estimation) – a web page cannot see other apps.

## Innovation: MetaMask + blockchain layer (Blockchain tab)
- **🦊 Connect wallet** (header button or Blockchain tab) opens the MetaMask connection popup for the parent.
- **Parental consent by signature:** when the age gate denies a 13+ video, the child can tap *Ask parent to approve (MetaMask)*. The parent signs a consent message in the MetaMask popup, the video then plays (captions still scanned) and the consent is logged.
- **Tamper-proof evidence log:** every parent alert is hash-chained (SHA-256). *Simulate tampering* shows the chain breaking.
- **On-chain anchoring:** *Anchor on Sepolia* writes only the chain-head hash into a 0-value transaction on the Sepolia test network, giving a public timestamped proof. No child data or text goes on-chain.
- **Age-check buttons** (Use camera, Capture selfie, Use registered age) also open the MetaMask popup first.
- **MetaMask approval on every parent action** (header toggle *Approval: ON/OFF*): Create account / Login, Save child profile, Save rules, enable/disable a category, consent toggle and all Delete buttons open the MetaMask popup (connect the first time, then a signature) before they run. If MetaMask is not installed the action is allowed with a notice (demo fallback).
- Code: `src/wallet/` (`useWallet.js`, `chain.js`, `WalletView.jsx`). Tests: `tests/chain.test.js`.
- Limits: signatures are not verified server-side (there is no server), and hashes are sealed in localStorage the first time the tab is opened. A real product would seal at write time on a backend.

## Age check flow (selfie / live camera)
`Use camera → 🦊 MetaMask → Scan face (8 frames) → Estimated age ~N (range, confidence) → decision`
- **ALLOW**: estimate ≥ required + 2 and the registered age also meets the requirement.
- **DENY**: estimate ≤ required − 2, or the registered profile age is below the requirement.
- **REVIEW**: borderline / unstable estimate → *Ask parent to approve* (MetaMask signature) or Deny.
Code: `src/protection/AgeEstimation.js`, tests in `tests/age.test.js`.

## Project structure
```
childshield-react/
├── index.html
├── vite.config.js · package.json
├── tests/engine.test.js              unit tests for the protection engine
└── src/
    ├── main.jsx · App.jsx            entry, hash router (#/dash …), page shell
    ├── styles/styles.css
    ├── utils/utils.js                age groups + helpers
    ├── database/
    │   ├── db.js                     localStorage persistence (parent, child, checks, alerts, blocked, settings)
    │   └── AppContext.jsx            React context: app state + actions
    ├── auth/                         AuthPage.jsx (register/login), hash.js (salted SHA-256)
    ├── dashboard/Dashboard.jsx
    ├── child/ChildProfile.jsx        profile + age-verification card
    ├── protection/
    │   ├── KeywordDetection.js       NLP-style keyword + URL detection (9 categories)
    │   ├── ContentClassifier.js      category + suggested rating
    │   ├── RiskAssessment.js         risk score + age-based rule engine
    │   ├── AgeVerification.js        registered age + on-device facial-age estimate
    │   ├── ProtectionEngine.js       central pipeline (pure functions)
    │   ├── EngineView.jsx            Protection Engine screen (rules, categories)
    │   ├── CheckView.jsx             demo content check + result card
    │   └── BlockedScreen.jsx         Content Blocked screen
    ├── overlay/                      useOverlay.js (state/actions), ChildOverlay.jsx (simulated child phone)
    ├── alerts/ · activity/ · privacy/ · about/ · components/
```

## Age-based rules
`risk score = strongest detected severity + 1 per extra detection (max 9)`. Default `[warn, block]` thresholds (editable in-app):

| Group | Warn ≥ | Block ≥ |
|---|---|---|
| Under 7 | 1 | 3 |
| 7–12 | 2 | 4 |
| 13–15 | 3 | 5 |
| 16–17 | 4 | 6 |

## Honest limitations (say this in your viva)
- **Not real AI accuracy.** Detection is a rule-based keyword/regex lexicon (NLP concepts), not a trained ML model, and is not validated. English only.
- **Age estimation** now uses a real on-device face model (face-api.js, downloaded from the jsDelivr CDN on first use, so internet is needed). It samples 8 frames, shows the estimated age + range + confidence first, then ALLOW / DENY / parent-approval (borderline or unstable). The registered age stays the source of truth. Typical error is several years (worse for children), there is no liveness check (a photo could fool it), frames are never stored. **Not legally valid age verification.**
- The Android daemon, accessibility, overlay, battery/NNAPI and offline queue in the *Child Overlay Demo* are **browser simulations** of the architecture, not a real Android service.
- Data lives in the browser's localStorage only (no server, no real encryption, no device pairing).
- Future work (from the proposal): trained TensorFlow Lite age model, multilingual NLP, Flask/FastAPI + MySQL/Firebase backend, QR device pairing, federated learning.


## Age-estimation accuracy and Android deployment (important)
- The browser `ageGenderNet` model estimates apparent age; it does not verify a person's real or legal age. Multiple frames reduce random variation but cannot remove systematic model bias.
- The estimate's High/Medium/Low label measures consistency across sampled frames only. It is **not** a calibrated probability that the age is correct.
- A conflicting low facial estimate now routes to parent review instead of automatically denying a profile whose registered age meets the requirement. A registered age below the content requirement remains denied.
- The legacy capture-only mock path has been disabled: a captured photo/random number is never presented as a real AI estimate. Use **Scan face** to run the actual model.
- The current project remains a React browser simulation. It cannot monitor other Android apps. A real Android product needs a native Android app (for example Kotlin with CameraX and a reviewed on-device model), explicit permissions and consent, secure parent controls, and testing on representative age groups and lighting/skin-tone conditions.
- Before any production claim, evaluate against a consented, representative, labelled dataset and report age MAE/median absolute error, error by age band and demographic subgroup, and false-allow/false-deny rates at each threshold. Do not describe the app as legally valid age verification.
