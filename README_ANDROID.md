# TEN Aquarium - Android App Developer Guide 📱

This guide explains how to compile, test, sync, sign, and publish the **TEN Aquarium** Android mobile application using the Capacitor framework. The app utilizes the exact same React/Vite codebase as your web deployment.

---

## 🛠️ Prerequisites
To build and package the Android app, make sure you have:
1. **Node.js** (v18+) and **npm** installed.
2. **Android Studio** (Koala or newer) with Android SDK and Virtual Device/Emulator configured.
3. **Java Development Kit (JDK)** installed and configured in your environment path.

---

## 💻 Local Development Workflow

### 1. Build the React Website
Whenever you make changes to your React source code in `/src`, build the web production assets:
```bash
npm run build
```
This compiles your frontend into the `/dist` directory.

### 2. Synchronize Assets with Android Studio
Sync the built `/dist` assets and Capacitor plugins with the native Android project wrapper:
```bash
npx cap sync
```

### 3. Open the Project in Android Studio
Launch Android Studio with the Android project automatically loaded:
```bash
npx cap open android
```
*(Alternatively, open Android Studio manually and select the `D:\anti_project\frontend\android` directory).*

### 4. Run & Test on Emulator or Device
1. In Android Studio, wait for Gradle to finish syncing.
2. Select your Target Device (Emulator or connected USB debugging device) from the dropdown.
3. Click the green **Run** (Play) button to compile the APK and launch it on your device.

---

## 🛡️ Generating a Signed Release AAB (Android App Bundle)

To publish your app on the Google Play Store, you must generate a signed release **Android App Bundle (AAB)** file.

### Step 1: Generate a Keystore File
If you do not have an existing keystore, generate one using the Java `keytool` utility. Open your terminal and run:
```bash
keytool -genkey -v -keystore TENAquarium-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tenaquarium
```
* **Keystore File Name**: `TENAquarium-release.jks`
* **Alias Name**: `tenaquarium`
* Enter a strong password and complete the prompted certificate fields. Safe-keep this keystore file and password; you will need them for all future app updates.

### Step 2: Build the Release AAB in Android Studio
1. Open the project in Android Studio (`npx cap open android`).
2. From the top menu, go to **Build** > **Generate Signed Bundle / APK...**.
3. Select **Android App Bundle** and click **Next**.
4. Set the path to your generated `TENAquarium-release.jks` file.
5. Enter the Keystore password, Alias name (`tenaquarium`), and Key password.
6. Click **Next**.
7. Choose the build variant: **release** (and check V2/full signature options if prompted).
8. Click **Finish**.
9. Once completed, your signed bundle file (**`app-release.aab`**) will be exported inside the `android/app/release/` folder.

---

## 🚀 Uploading to Google Play Console

### Step 1: Create a Console Account
1. Go to the [Google Play Console](https://play.google.com/console/) and sign in with your developer account.
2. Click **Create app**.

### Step 2: Set App Information
* **App name**: `TEN Aquarium`
* **Default language**: `English`
* **App or Game**: `App`
* **Free or Paid**: `Free`
* Agree to the Developer Program Policies and US Export Laws, then click **Create app**.

### Step 3: Complete App Setup Tasks
Go to the **Dashboard** and complete all initial tasks:
* Set Privacy Policy URL.
* Complete Content Rating Questionnaire.
* Set Target Audience (e.g., ages 18+ or all ages).
* Provide developer contact info.
* Upload store listing assets (app description, screenshots, feature graphic).

### Step 4: Upload the Signed AAB to Production
1. In the left navigation, click **Production** (under *Release* section).
2. Click **Create new release**.
3. Under **App bundles**, upload your signed **`app-release.aab`** file.
4. Set a release name (e.g., `1.0.0`) and enter release notes summarizing your initial release.
5. Click **Save as draft**, then **Review release**.
6. When ready, click **Start rollout to Production** to submit your app to Google's app review team!
