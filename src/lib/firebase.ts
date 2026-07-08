import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAq7GSTqEzDXn2Hec9UVuPndOreZQpb1TU",
  authDomain: "health-chain-ai.firebaseapp.com",
  databaseURL: "https://health-chain-ai-default-rtdb.firebaseio.com",
  projectId: "health-chain-ai",
  storageBucket: "health-chain-ai.firebasestorage.app",
  messagingSenderId: "468030951894",
  appId: "1:468030951894:web:99956351c18d3a2b485477",
  measurementId: "G-R50PFL1Q4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
