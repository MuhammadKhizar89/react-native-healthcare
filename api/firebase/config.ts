import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - TS doesn't correctly resolve the React Native specific exports
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Replace these with your actual Firebase project configuration

const firebaseConfig = {
  apiKey: "AIzaSyD1HIhSrY4FYZuKkKZvNVPQ-IbUfSvsueM",
  authDomain: "healthcare-app-c3fb5.firebaseapp.com",
  projectId: "healthcare-app-c3fb5",
  storageBucket: "healthcare-app-c3fb5.firebasestorage.app",
  messagingSenderId: "1091663677004",
  appId: "1:1091663677004:web:2ea910dffe2aa2e966d6e9",
  measurementId: "G-LVJ97L43ZQ"
};


let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);

export { app, auth, db };
