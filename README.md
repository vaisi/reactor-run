# Reactor Run for iPhone and Android

This folder holds the app version of Reactor Run. It is the same game as the web version, wrapped in a native app shell (Capacitor 8). The game runs fully offline: Three.js and both fonts are packed inside the app. The hangar, builder and every menu stay upright; during a run (including its pause and result screens) the screen turns with the phone, so the game can be flown sideways. Back in the hangar it turns upright again. This uses `@capacitor/screen-orientation`; the phone's own rotation lock still applies.

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
   - TestFlight: people on your App Store Connect team (up to 100) can install a build as soon as it has processed, without review. Testers outside the team (up to 10,000, by email or a public link) need Apple's beta review once per version.
   - Each upload needs a new *Build* number (Xcode, App target, *General*).
   - The encryption question is already answered in `Info.plist` (no non-exempt encryption), and `App/PrivacyInfo.xcprivacy` holds the privacy declaration Apple requires for the Filesystem plugin.
   - Purchases in TestFlight are free test purchases, but they only work once the products exist in App Store Connect and the Paid Apps agreement (with banking and tax) is active.

**Without a Mac:** a cloud build service (for example Codemagic, Ionic Appflow or a GitHub Actions macOS runner) can build and upload the iOS app from this folder. It needs an App Store Connect API key from your Apple Developer account.

## Updating the game later

1. Replace `game/reactor-run.html` with the newer version of the game (the same file the web version is published from).
2. Run `npm run sync`. This rebuilds `www/` and copies it into both apps.
3. Raise the version before each store upload:
   - Android: `versionCode` (must go up by at least 1) and `versionName` in `android/app/build.gradle`.
   - iOS: *Version* and *Build* in Xcode under the App target's *General* tab.

To change the icon or launch screen, replace the images in `assets/` (same sizes) and run `npm run assets`.

## Graphics (v2)

The game draws with smoothed edges (4x multisampling) and real-time sun shadows, and sets its own quality: it starts at the top level, and if the frame rate can't hold it first lowers the render size, then turns shadows off, then edge smoothing. After a long smooth stretch it tries the higher level again. The level a phone settled on is remembered for the next launch. There is nothing to configure.

For testing, add `#gfx2` (everything), `#gfx1` (no shadows) or `#gfx0` (the original look) to the web version's address to pin a level.

## In-app purchases (worlds and ship builder)

The game sells two kinds of things through the `@capgo/native-purchases` plugin (StoreKit on iPhone, Google Play Billing on Android): opening every world at once, and the paid parts in the ship builder. Create these 24 products in **both** stores before testing, with exactly these IDs:

| Product ID | What it unlocks | Type | Price |
|---|---|---|---|
| `ro.biotic.reactorrun.allworlds` | All nine worlds at once | **Non-consumable** | €3.99 |
| `ro.biotic.reactorrun.level4` | Speed or handling level 4, for one ship | Consumable | €1.99 |
| `ro.biotic.reactorrun.level5` | Speed or handling level 5, for one ship | Consumable | €3.99 |
| `ro.biotic.reactorrun.boost1` | Boost lasts 2 s longer, for one ship | Consumable | $1 |
| `ro.biotic.reactorrun.boost2` | Boost lasts 5 s longer, for one ship | Consumable | $2 |
| `ro.biotic.reactorrun.boost3` | Boost lasts 10 s longer, for one ship | Consumable | $5 |
| `ro.biotic.reactorrun.paint.<finish>` (8 products) | That special paint, for every ship | **Non-consumable** | €1.99 each |
| `ro.biotic.reactorrun.trim.<finish>` (8 products) | That special trim, for every ship | **Non-consumable** | €0.99 each |
| `ro.biotic.reactorrun.glow.plasma`, `ro.biotic.reactorrun.glow.toxic` | That engine glow, for every ship | **Non-consumable** | €0.99 each |

`<finish>` is each of `silver`, `gold`, `titanium`, `carbon`, `goldcarbon`, `rosso`, `opal`, `diamond` (so `ro.biotic.reactorrun.paint.gold`, `ro.biotic.reactorrun.trim.gold` and so on). The old shared `ro.biotic.reactorrun.paint`, `.trim` and `.glow` products are no longer used; don't create them.

**Worlds.** A new player starts with Shaft 7 only. Each world opens when they fly through the one before it in a run (test flights from the builder don't count), and every world stays in the hangar picker so the title screen can still fly them through a locked one. Picking a locked world turns Launch into *Locked*, which opens a sheet with how to open it, **Unlock all** and **Restore purchase**. The all-worlds unlock is a non-consumable, so the stores keep it for the player's account: the game checks it at every start (so a reinstall gets it back on its own) and the Restore button asks the store again. Apple requires that Restore button for non-consumables. Players who installed before the lock keep every world their runs had already reached.

**Finishes** (special paints, trims and engine glows) are bought once and then work on every ship the player builds, now and later. Each one is its own non-consumable, so the store keeps it for the player's account: the game checks them at every start, the unlock sheet has a **Restore purchases** link, and buying one the account already owns (after a reinstall, say) just takes it back from the store. Players who bought a finish for one ship in an earlier version get it for all their ships.

**Speed and handling levels and boost upgrades** belong to the ship they were bought for, so they are consumables that can be bought again for another ship. A boost upgrade adds 2, 5 or 10 seconds to a full boost (normally about 2.4 s); the meter refills just as fast, so a bigger tier also gives more boost overall. Picking a higher tier on a ship that owns a lower one costs that tier's price.

The game shows each store's own local price once the products load. A cart with several unlocks is bought one product at a time, so the player confirms once per item. Anything bought before a cancel is kept.

- **App Store Connect:** *Monetization > In-App Purchases*, add `allworlds` and the 18 finishes as *Non-Consumable*, and `level4`, `level5`, `boost1`, `boost2`, `boost3` as *Consumable*. For the boost prices pick the $1.00, $2.00 and $5.00 price points (the other countries follow from them). In Xcode, add the *In-App Purchase* capability to the App target (*Signing & Capabilities*). Test with a Sandbox tester account (*Users and Access > Sandbox*).
- **Google Play Console:** upload a build to a testing track first (Play only lists products for an app that has a build), then *Monetize > Products > In-app products* (Play has one kind of in-app product; the game tells Play which ones to consume, and never consumes `allworlds` or a finish). Add your Google account under *Settings > License testing* to buy without being charged.
- **Where unlocks live:** builds and their per-ship unlocks are saved on the phone, like best scores. Consumables can't be restored by the stores, so deleting the app loses the levels and boost upgrades (finishes and worlds come back from the store). A cloud save (Game Center / Google Play Games saved games) is the fix before launch.
- **On the web** there is no store, so every speed and handling level, boost upgrade and finish is free to use and keep there. Worlds still open one at a time on the web; the Unlock all sheet there says it is bought in the app.

## Worldwide scores (Firebase)

The Scores button has a **Worldwide** tab: one table for every player on iPhone, Android and the web, best run each, and every entry carries the ship that set it, so anyone can tap a score and look at that ship. It runs on Firebase (Firestore plus anonymous sign-in), which is free at this size. Until you paste a Firebase config into the game, the tab stays hidden and the Scores sheet shows this phone's table only.

1. Create a project at console.firebase.google.com (the free Spark plan is enough to start).
2. *Build > Authentication > Sign-in method*: turn on **Anonymous**.
3. *Build > Firestore Database*: create the database in production mode, in a European location (for example `eur3`).
4. *Firestore > Rules*: paste the contents of `firebase/firestore.rules` and publish. (Or, with the Firebase CLI: `npx firebase-tools deploy --only firestore:rules`.) The rules allow one entry per player, only ever going up, with every field checked.
5. *Project settings > Your apps*: add a **Web app** and copy its `firebaseConfig` object. Paste it into `game/reactor-run.html`, replacing `const FIREBASE_CONFIG = null;` (search for it), then run `npm run sync`. These values are not secret; the rules are what protect the data.
6. **Web version:** `npx firebase-tools deploy --only hosting` publishes `www/` (the same game, with the worldwide table) at `https://<your-project>.web.app`. Web players can use the table there; the claude.ai preview page may not be allowed to reach Firebase.

**Names and reports.** Players get a pilot name like `PILOT-4821` and can change it in the Scores sheet (3 to 12 letters or digits, with a basic bad-word filter). Anyone can tap **Report this name** on another player's entry: that hides it for them and adds a document to the `reports` collection. Check it now and then in the Firestore console and delete any entry under `scores` that should go. Apple and Google both expect this kind of reporting and removal for names other players can see.

**Cheating.** The rules reject anything malformed and cap scores, but a determined player could still post a fake score. Before launch, turn on **App Check** (Play Integrity on Android, App Attest on iPhone, reCAPTCHA on the web) so only the real game can write to the table.

**Usage.** Each time someone opens the Worldwide tab the game reads up to 50 entries (cached for a minute). The free plan allows 50,000 reads a day, which is about a thousand table views; past that, the pay-as-you-go plan costs a few cents per extra 100,000 reads.

**Privacy.** With the table switched on, the app sends a pilot name, scores and the ship behind each score, linked to an anonymous player ID. Update both stores' privacy answers and the privacy policy before releasing that version.

## Sharing ship cards

The **Share** buttons (hangar, result screen, ship viewer) make a 1080 × 1350 picture of the ship with its name, finishes, stats and score, then open the phone's share sheet through `@capacitor/share` and `@capacitor/filesystem`. On iPhone the share sheet's *Save Image* needs the Photos permission text, which is already in `Info.plist` (`NSPhotoLibraryAddUsageDescription`). Once the web version has a public address, put it in `SHARE_URL` in the game file so shares carry the link.

## Before the first upload

- **App ID:** `ro.biotic.reactorrun` can't be changed once the app is published on either store. If it should live under a different name (a personal domain, say), change it before the first upload. It appears in `capacitor.config.json`, `android/app/build.gradle`, the Java package folder under `android/app/src/main/java/` and the Xcode bundle identifier.
- **Store listing:** both stores need screenshots, a description, an age rating questionnaire and a privacy policy link. Apple asks for one even when an app collects no data, and this game collects none: best scores, ship builds and unlocks stay on the phone, and payments are handled by Apple and Google.
- **Tablets:** iOS is iPhone-only for now, so no iPad screenshots are needed. On large Android tablets and foldables, Android 16 may ignore the upright lock in the menus; the menus also have a sideways layout, so they still work.

## Licences

Three.js (MIT) and the fonts Big Shoulders Display and Chakra Petch (SIL Open Font License) are bundled. Their licence files are in `www/vendor/three/` and `www/fonts/`.
