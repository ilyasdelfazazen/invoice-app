# iOS Deployment Handoff Prompt
# Copy everything below this line and paste it into Claude Code on your MacBook

---

I have a full-stack app already deployed on a VPS at https://scemanager.online (Angular web + Express backend + MongoDB, all running in Docker). Now I need to build and publish the **iOS mobile app** to the App Store.

## Project structure
The project is an Angular monorepo with Ionic + Capacitor for mobile:
- `frontend/projects/mobile/` — Ionic + Angular mobile app
- `frontend/libs/environments/environment.prod.ts` — already set to `apiUrl: 'https://scemanager.online/api'`
- `frontend/capacitor.config.ts` — appId: `com.coffeepanorama.app`, appName: `SCE Manager`, webDir: `dist/mobile`
- No `server.url` in capacitor config (correct — uses bundled assets in production)

## Tech stack
- Angular 17 + Ionic 7 + Capacitor 5
- NgModules (no standalone components)
- Backend: Express + MongoDB running at https://scemanager.online/api
- PDF generation: jsPDF
- Share: Capacitor Share plugin → WhatsApp

## What needs to be done (in order)

### 1. Build the mobile Angular app for production
```bash
cd frontend
npx ng build mobile --configuration=production
```
Output goes to: `dist/mobile/`

### 2. Sync Capacitor
```bash
npx cap sync ios
```

### 3. Open in Xcode
```bash
npx cap open ios
```

### 4. In Xcode
- Set the correct Bundle ID: `com.coffeepanorama.app`
- Set up signing with Apple Developer account
- Set version number and build number
- Archive → Distribute to App Store Connect

### 5. In App Store Connect
- Create the app listing
- Upload screenshots (required sizes: 6.7", 6.1", 5.5" for iPhone)
- Fill in description, keywords, category
- Submit for review

## Important notes
- The `environment.prod.ts` already points to `https://scemanager.online/api` ✅
- The API uses JWT auth — no changes needed on the backend
- Capacitor plugins used: Share, possibly Camera — check `frontend/package.json` for full list
- The app uses NgModules (not standalone) — keep `--no-standalone` for any new generate commands
- Android APK was already built before (check `frontend/android/` folder)

## Questions to answer before starting
1. Do you have an Apple Developer account active? ($99/year)
2. Has the iOS platform ever been added? (`frontend/ios/` folder exists?)
3. Is this going straight to App Store or TestFlight first?

## If iOS platform not initialized yet
```bash
cd frontend
npx cap add ios
npx cap sync ios
```

Start by checking: `ls frontend/ios` — if the folder exists, iOS is already initialized.
