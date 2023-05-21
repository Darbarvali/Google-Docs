import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBin2eUoqV5FlUrjbQ4OL948dpKJvPm_sY",
  authDomain: "darbarvali-docs.firebaseapp.com",
  projectId: "darbarvali-docs",
  storageBucket: "darbarvali-docs.appspot.com",
  messagingSenderId: "959623147121",
  appId: "1:959623147121:web:4ad2b26d332a3a02f4f5d0",
  measurementId: "G-R6JL0KBE32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();
export {auth,provider};
