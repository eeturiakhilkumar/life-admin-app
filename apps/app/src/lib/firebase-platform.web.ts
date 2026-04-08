import { serverTimestamp } from "firebase/firestore";

export const getServerTimestamp = () => serverTimestamp();

export const getNativeAuth = () => null;
export const getNativeFirestore = () => null;
