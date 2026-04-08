# Mobile Setup and Deployment Guide

This guide will help you set up Expo Application Services (EAS) and Firebase to generate development builds for Android and iOS.

## 1. EAS Setup

Since this is a new project, you need to link it to an EAS account.

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```
2.  **Login to EAS**:
    ```bash
    eas login
    ```
3.  **Initialize EAS Project**:
    Inside the root directory, run:
    ```bash
    eas project:init
    ```
    Follow the prompts to create a new project.

## 2. Firebase Configuration

Native mobile apps require specific configuration files from the Firebase Console.

### Android
1.  Go to **Firebase Console** > **Project Settings**.
2.  Under **Your apps**, click **Add app** and select **Android**.
3.  **Package name**: `com.lifeadmin.app`
4.  Download `google-services.json` and place it in the `apps/app/` directory.

### iOS
1.  In **Firebase Console**, click **Add app** and select **iOS**.
2.  **Bundle ID**: `com.lifeadmin.app`
3.  Download `GoogleService-Info.plist` and place it in the `apps/app/` directory.

### Firestore
1.  Enable **Cloud Firestore** in your Firebase project.
2.  Create a database in **Production** or **Test** mode.
3.  Ensure your security rules allow users to write to their own documents:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

### Authentication
1.  Enable **Phone** and **Email/Password** providers in the Firebase Auth tab.
2.  For iOS Phone Auth: Ensure you have a valid APNs Key uploaded to Firebase if you plan to use silent push notifications for verification.

## 3. Generating Development Builds

Development builds are required because we are using native Firebase modules.

### Android
```bash
eas build --platform android --profile development
```

### iOS
```bash
eas build --platform ios --profile development
```
*Note: iOS development builds require an Apple Developer Program membership.*

## 4. Running the App

Once the build is complete, you can install the resulting APK (Android) or install the build on your device via EAS. Then run:

```bash
npx expo start --dev-client
```
