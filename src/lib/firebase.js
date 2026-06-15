import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAC9T3e9R2tsx1zyvwXzPefHSyTfTaiKGU",
  authDomain: "wandr-af0aa.firebaseapp.com",
  projectId: "wandr-af0aa",
  storageBucket: "wandr-af0aa.firebasestorage.app",
  messagingSenderId: "1010550703514",
  appId: "1:1010550703514:web:5ce1fd652ec22a9f0f6623"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
