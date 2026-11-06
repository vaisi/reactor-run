# Reactor Run for iPhone and Android

This folder holds the app version of Reactor Run. It is the same game as the web version, wrapped in a native app shell (Capacitor 8). The game runs fully offline: Three.js and both fonts are packed inside the app. The app plays in portrait only.

| | |
|---|---|
| App name | Reactor Run |
| App ID / bundle ID | `ro.biotic.reactorrun` (see "Before the first upload") |
| Android | API 24+ (Android 7.0), targets API 36 |
| iOS | iOS 15+, iPhone only (iPads run it in iPhone mode) |
| Version | 1.0 (build 1) |

## What's inside

```
game/reactor-run.html   the game itself, the same file the web version is published from
scripts/build-web.mjs   turns game/ into www/: bundles Three.js and the fonts, adds the app page header
assets/                 icon and launch screen sources (1024 px icon, 2732 px launch screen)
android/                Android Studio project
ios/                    Xcode project (Swift Package Manager, no CocoaPods needed)
capacitor.config.json   app ID, colours, launch screen and system bar settings
```

Behaviour the app has that the web version doesn't:
- **Leaving the app** (home button, app switcher, a call) pauses a run and silences all sound, including on the hangar screen. Coming back keeps the run paused until you tap Continue.
- **Android back button:** in a run it pauses or resumes. It also closes the result screen and the level list. On the hangar screen it sends the app to the background.
- **iPhone silent switch:** game sound follows the switch and mixes with the player's own music, like most games. To make the game play sound even on silent, change `'ambient'` to `'playback'` in `game/reactor-run.html` (search for `audioSession`).
- **Full screen:** status bar and navigation bar are hidden, and the HUD keeps clear of notches and the gesture bar.
- **Launch screen:** it stays up until the first frame is drawn, so the player never sees a blank screen.

## One-time setup (Windows, Mac or Linux)

1. Install **Node.js 22 or newer** from https://nodejs.org (the LTS installer is fine).
2. Unzip this folder somewhere without spaces in the path, open a terminal in it and run:
   ```
   npm install
   ```

## Android (works on your Windows PC)

1. Install **Android Studio Otter (2025.2.1) or newer** from https://developer.android.com/studio. It brings its own Java and Android SDK; accept the defaults.
2. In the project folder run:
   ```
   npm run android
   ```
   This rebuilds the game, copies it into the Android project and opens Android Studio. The first Gradle sync downloads a few hundred MB; wait for it to finish. If Android Studio doesn't open by itself, start it and use *File → Open* on the `android` folder.
3. **Try it on a phone:** on the phone, enable Developer options (tap *Build number* 7 times in *Settings → About phone*), turn on *USB debugging* and plug it in. Pick it in the device list at the top of Android Studio and press ▶ Run. Or create an emulator in *Device Manager*.
4. **Build for Google Play:** *Build → Generate Signed App Bundle or APK → Android App Bundle*. Create a new upload key when asked. **Store the .jks file and its passwords somewhere safe**, because every future update has to be signed with it. Choose the *release* build. The result is `android/app/release/app-release.aab`.
5. **Publish:** in Google Play Console (one-time $25 fee) create the app and upload the .aab to a **Closed testing** track. New personal accounts must keep at least 12 testers opted in for 14 days before they can apply for production access, so start this early.

## iPhone (needs a Mac, or a cloud Mac)

Apple's build tools only run on macOS. Capacitor 8 needs **Xcode 26 or newer**.

**On a Mac:**
1. Install Xcode from the Mac App Store and Node.js, then `npm install` in this folder.
2. Run `npm run ios`. Xcode opens the project and fetches the Swift packages on the first open.
3. Select the **App** target, then *Signing & Capabilities*, and choose your team (the Apple Developer Program costs $99/year). Plug in an iPhone and press ▶ to try it.
4. **Publish:** in App Store Connect create an app with bundle ID `ro.biotic.reactorrun`. In Xcode: *Product → Archive → Distribute App → App Store Connect*. Test it with TestFlight, then submit it for review.

**Without a Mac:** a cloud build service (for example Codemagic, Ionic Appflow or a GitHub Actions macOS runner) can build and upload the iOS app from this folder. It needs an App Store Connect API key from your Apple Developer account.

## Updating the game later

1. Replace `game/reactor-run.html` with the newer version of the game (the same file the web version is published from).
2. Run `npm run sync`. This rebuilds `www/` and copies it into both apps.
3. Raise the version before each store upload:
   - Android: `versionCode` (must go up by at least 1) and `versionName` in `android/app/build.gradle`.
   - iOS: *Version* and *Build* in Xcode under the App target's *General* tab.

To change the icon or launch screen, replace the images in `assets/` (same sizes) and run `npm run assets`.

## Before the first upload

- **App ID:** `ro.biotic.reactorrun` can't be changed once the app is published on either store. If it should live under a different name (a personal domain, say), change it before the first upload. It appears in `capacitor.config.json`, `android/app/build.gradle`, the Java package folder under `android/app/src/main/java/` and the Xcode bundle identifier.
- **Store listing:** both stores need screenshots, a description, an age rating questionnaire and a privacy policy link. Apple asks for one even when an app collects no data, and this game collects none: best scores stay on the phone.
- **Tablets:** iOS is iPhone-only for now, so no iPad screenshots are needed. On large Android tablets and foldables, Android 16 may ignore the portrait lock; the game still works in landscape.

## Licences

Three.js (MIT) and the fonts Big Shoulders Display and Chakra Petch (SIL Open Font License) are bundled. Their licence files are in `www/vendor/three/` and `www/fonts/`.
