# Pick — Setup Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Xcode (for iOS builds)
- An Expo account

---

## 1. App Setup

```bash
cd pick
npm install
npx expo start
```

Scan the QR code with Expo Go on your iPhone.

---

## 2. Backend Setup

```bash
cd pick/backend
npm install
cp .env.example .env
# Add your OpenAI API key to .env
node server.js
```

Your backend runs on http://localhost:3001.

**For production**, deploy to Railway, Render, or Fly.io.
Then update `API_BASE` in `src/utils/api.js` with your production URL.

---

## 3. Things to fill in before launch

### app.json
- `ios.bundleIdentifier` — e.g. `com.yourname.pick`
- `extra.eas.projectId` — run `eas init` to get this

### eas.json
- `appleId` — your Apple ID email
- `ascAppId` — from App Store Connect
- `appleTeamId` — from developer.apple.com

### src/utils/api.js
- `API_BASE` — your deployed backend URL

### src/screens/SettingsScreen.js
- Privacy policy URL
- Terms URL
- Support email

### src/screens/PaywallScreen.js
- RevenueCat product IDs (after App Store Connect setup)

---

## 4. RevenueCat Setup (subscriptions)

1. Create subscription in App Store Connect → Monetization → Subscriptions
2. Product ID: `pick_starter_monthly`
3. Sign up at revenuecat.com
4. Create project, link your app
5. Add entitlement: `pick_premium`
6. Add offering: `default`
7. Get your RevenueCat API key
8. In `App.js`, initialize: `Purchases.configure({ apiKey: 'YOUR_RC_KEY' })`
9. Uncomment RevenueCat calls in PaywallScreen.js and SettingsScreen.js

---

## 5. App Store submission

```bash
# Build for production
eas build --platform ios --profile production

# Submit
eas submit --platform ios
```

---

## 6. What's still needed before submission

- [ ] Real app icon (1024×1024 PNG, no alpha) → `assets/icon.png`
- [ ] Splash screen image → `assets/splash.png`
- [ ] Privacy policy hosted at a real URL
- [ ] App Store screenshots (use Simulator or real device)
- [ ] RevenueCat wired up
- [ ] Backend deployed to production
- [ ] `API_BASE` updated to production URL

---

## File map

```
pick/
├── App.js                    # Entry point, startup routing
├── AppNavigator.js           # All navigation + custom tab bar
├── app.json                  # Expo config
├── eas.json                  # EAS Build config
├── src/
│   ├── constants/
│   │   └── theme.js          # Colors, fonts, spacing — single source of truth
│   ├── utils/
│   │   ├── storage.js        # All AsyncStorage logic
│   │   └── api.js            # Backend API client
│   ├── components/
│   │   └── index.js          # Shared UI components
│   └── screens/
│       ├── IntroScreen.js
│       ├── OnboardingScreen.js
│       ├── PermissionScreen.js
│       ├── HomeScreen.js
│       ├── QueueScreen.js
│       ├── AnalyzingScreen.js
│       ├── ResultsScreen.js
│       ├── ShareScreen.js
│       ├── HistoryScreen.js
│       ├── SettingsScreen.js
│       └── PaywallScreen.js
└── backend/
    ├── server.js             # Express + OpenAI API
    ├── package.json
    └── .env.example
```
