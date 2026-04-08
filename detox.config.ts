import type { DetoxConfig } from "detox";

const config: DetoxConfig = {
  testRunner: {
    args: {
      "$0": "jest",
      config: "e2e/jest.config.js"
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: "apps/app/ios/build/Build/Products/Debug-iphonesimulator/LifeAdmin.app",
      build:
        "cd apps/app/ios && xcodebuild -workspace LifeAdmin.xcworkspace -scheme LifeAdmin -configuration Debug -sdk iphonesimulator -derivedDataPath build"
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "apps/app/android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd apps/app/android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug"
    }
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 16"
      }
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_9_API_35"
      }
    }
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug"
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug"
    }
  }
};

export default config;
