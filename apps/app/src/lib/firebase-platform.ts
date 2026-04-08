import firestore from "@react-native-firebase/firestore";

export const getServerTimestamp = () => firestore.FieldValue.serverTimestamp();

export const getNativeAuth = () => require("@react-native-firebase/auth").default;
export const getNativeFirestore = () => require("@react-native-firebase/firestore").default;
