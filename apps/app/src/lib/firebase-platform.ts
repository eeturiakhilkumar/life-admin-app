// This file is only used on native platforms (Android/iOS)
// We use dynamic imports (require) inside functions to ensure native modules
// are not bundled during the static web export process.

export const getServerTimestamp = () => {
  const firestore = require("@react-native-firebase/firestore").default;
  return firestore.FieldValue.serverTimestamp();
};

export const getNativeAuth = () => {
  return require("@react-native-firebase/auth").default;
};

export const getNativeFirestore = () => {
  return require("@react-native-firebase/firestore").default;
};
