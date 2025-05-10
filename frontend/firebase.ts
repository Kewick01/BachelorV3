// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJRQ0ebhnOBr5Aw-rJ8XXkPWHch-8EYi8",
  authDomain: "bachelor-backend.firebaseapp.com",
  projectId: "bachelor-backend",
  storageBucket: "bachelor-backend.firebasestorage.app",
  messagingSenderId: "1082405204975",
  appId: "1:1082405204975:web:0852c5dd5e493fd41b3c1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

